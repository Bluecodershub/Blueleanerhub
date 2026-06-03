"""
Notebook Service — NotebookLM-style AI Research Assistant
==========================================================

Handles:
1. Document ingestion  — Chunk text, generate embeddings, store in pgvector
2. RAG chat            — Retrieve relevant chunks, answer questions with citations
3. Content generation  — Produce study guides, FAQs, flashcards, quizzes, summaries
"""

from __future__ import annotations

import logging
import ipaddress
import re
import socket
import textwrap
from urllib.parse import urlparse
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.core.database import SessionLocal
from app.services.ai_orchestrator import LLMClient, EmbeddingClient

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CHUNK_SIZE    = 500   # target words per chunk
CHUNK_OVERLAP = 50    # words overlapping between adjacent chunks
TOP_K         = 6     # chunks retrieved per RAG query
EMBED_DIM     = 384   # sentence-transformers/all-MiniLM-L6-v2


# ---------------------------------------------------------------------------
# Chunking helpers
# ---------------------------------------------------------------------------

def _split_into_chunks(text_content: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split a block of text into overlapping word-level chunks."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        overlap = max(0, min(overlap, chunk_size - 1))

    words = text_content.split()
    if not words:
        return []

    chunks: List[str] = []
    start = 0
    step = max(1, chunk_size - overlap)
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start += step

    return chunks


def _count_words(text_content: str) -> int:
    return len(text_content.split())


# ---------------------------------------------------------------------------
# URL text extraction (minimal; no heavy dependency required)
# ---------------------------------------------------------------------------

def _is_public_ip(ip_str: str) -> bool:
    ip_obj = ipaddress.ip_address(ip_str)
    return not (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_multicast
        or ip_obj.is_reserved
        or ip_obj.is_unspecified
    )


def _validate_public_url(url: str) -> Tuple[str, str, List[str]]:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Only http and https URLs are allowed")
    if not parsed.hostname:
        raise ValueError("URL hostname is required")

    try:
        resolved = socket.getaddrinfo(parsed.hostname, None)
    except socket.gaierror as exc:
        raise ValueError("Unable to resolve URL hostname") from exc

    if not resolved:
        raise ValueError("Unable to resolve URL hostname")

    pinned_ips: List[str] = []
    for addr_info in resolved:
        ip_str = addr_info[4][0]
        if not _is_public_ip(ip_str):
            raise ValueError("URL resolves to a non-public address")
        if ip_str not in pinned_ips:
            pinned_ips.append(ip_str)

    return url, parsed.hostname, pinned_ips


def _extract_url_text(url: str) -> str:
    """
    Best-effort text extraction from a URL.
    Uses only the standard library + requests — no Playwright/Selenium required.
    For heavy JS-rendered pages, consider adding a headless browser separately.
    """
    try:
        import requests
        from html.parser import HTMLParser

        class _TextExtractor(HTMLParser):
            def __init__(self):
                super().__init__()
                self.skip_tags = {"script", "style", "head", "meta", "noscript"}
                self._current_skip = 0
                self.parts: List[str] = []

            def handle_starttag(self, tag, attrs):
                if tag.lower() in self.skip_tags:
                    self._current_skip += 1

            def handle_endtag(self, tag):
                if tag.lower() in self.skip_tags and self._current_skip:
                    self._current_skip -= 1

            def handle_data(self, data):
                if self._current_skip == 0:
                    stripped = data.strip()
                    if stripped:
                        self.parts.append(stripped)

        safe_url, hostname, pinned_ips = _validate_public_url(url)
        resp = requests.get(
            safe_url,
            timeout=10,
            allow_redirects=False,
            stream=True,
            headers={"User-Agent": "BlueLearnerHub/1.0", "Host": hostname},
        )
        resp.raise_for_status()

        peer_ip: Optional[str] = None
        try:
            sock = getattr(getattr(resp.raw, "_connection", None), "sock", None)
            if sock:
                peer_ip = sock.getpeername()[0]
        except Exception:
            peer_ip = None

        if peer_ip:
            if not _is_public_ip(peer_ip):
                raise ValueError("Resolved peer IP is non-public")
            if peer_ip not in pinned_ips:
                raise ValueError("Peer IP mismatch detected")

        parser = _TextExtractor()
        parser.feed(resp.text)
        return " ".join(parser.parts)[:50_000]  # cap at 50k chars
    except Exception as exc:
        logger.warning(f"[NotebookService] URL extraction failed for {url}: {exc}")
        return ""


def _extract_pdf_text(file_path: str) -> str:
    """Extract text from a PDF file path using pypdf (fallback-safe)."""
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except Exception as exc:
            logger.warning(f"[NotebookService] No PDF parser available: {exc}")
            return ""

    try:
        reader = PdfReader(file_path)
        pages: List[str] = []
        for p in reader.pages:
            text = p.extract_text() or ""
            if text.strip():
                pages.append(text)
        return "\n\n".join(pages)[:250_000]
    except Exception as exc:
        logger.warning(f"[NotebookService] PDF extraction failed for {file_path}: {exc}")
        return ""


# ---------------------------------------------------------------------------
# Core service object
# ---------------------------------------------------------------------------

class NotebookService:
    """Singleton service — shared embedder and LLM across all requests."""

    _instance: Optional["NotebookService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        self.embedder = EmbeddingClient()
        self.llm      = LLMClient()
        logger.info("[NotebookService] ready")

    # ── Ingestion ────────────────────────────────────────────────────────────

    def ingest_source(
        self,
        source_id: int,
        notebook_id: int,
        source_type: str,
        content: Optional[str],
        url: Optional[str],
        file_path: Optional[str],
        title: str,
    ) -> Dict[str, Any]:
        """
        1. Obtain raw text (provided directly or fetched from URL).
        2. Chunk it.
        3. Embed each chunk.
        4. Store chunks + embeddings in notebook_chunks.
        Returns { chunk_count, word_count, extracted_text }.
        """
        raw_text = content or ""

        if source_type == "url" and url and not raw_text:
            raw_text = _extract_url_text(url)
        if source_type == "pdf" and file_path and not raw_text:
            raw_text = _extract_pdf_text(file_path)

        if not raw_text.strip():
            logger.warning(f"[NotebookService] Source {source_id} has no text to ingest")
            return {"chunk_count": 0, "word_count": 0, "extracted_text": ""}

        chunks     = _split_into_chunks(raw_text)
        word_count = _count_words(raw_text)

        if not chunks:
            return {"chunk_count": 0, "word_count": word_count, "extracted_text": raw_text[:50000]}

        # Generate embeddings in one batch call
        embeddings: List[List[float]] = self.embedder.embed_batch(chunks)

        with SessionLocal() as db:
            try:
                # Remove any existing chunks for this source (re-ingestion)
                db.execute(
                    text("DELETE FROM notebook_chunks WHERE source_id = :sid"),
                    {"sid": source_id},
                )

                for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
                    vec_str = "[" + ",".join(f"{v:.6f}" for v in embedding) + "]"
                    db.execute(
                        text(
                            """
                            INSERT INTO notebook_chunks (source_id, notebook_id, chunk_index, content, embedding)
                            VALUES (:sid, :nid, :idx, :content, :emb::vector)
                            """
                        ),
                        {
                            "sid":     source_id,
                            "nid":     notebook_id,
                            "idx":     idx,
                            "content": chunk_text,
                            "emb":     vec_str,
                        },
                    )
                db.commit()
            except Exception:
                db.rollback()
                raise

        logger.info(f"[NotebookService] Ingested source {source_id}: {len(chunks)} chunks, {word_count} words")
        return {"chunk_count": len(chunks), "word_count": word_count, "extracted_text": raw_text[:50000]}

    def delete_source_chunks(self, source_id: int) -> None:
        with SessionLocal() as db:
            db.execute(text("DELETE FROM notebook_chunks WHERE source_id = :sid"), {"sid": source_id})
            db.commit()

    # ── RAG retrieval ─────────────────────────────────────────────────────────

    def _retrieve_chunks(self, notebook_id: int, query: str, top_k: int = TOP_K) -> List[Dict]:
        """Return the top-k most semantically similar chunks for a notebook."""
        query_emb = self.embedder.embed(query)
        vec_str   = "[" + ",".join(f"{v:.6f}" for v in query_emb) + "]"

        with SessionLocal() as db:
            rows = db.execute(
                text(
                    """
                    SELECT
                        nc.id,
                        nc.chunk_index,
                        nc.content,
                        ns.title AS source_title,
                        ns.id    AS source_id,
                        1 - (nc.embedding <=> :qvec::vector) AS similarity
                    FROM   notebook_chunks nc
                    JOIN   notebook_sources ns ON ns.id = nc.source_id
                    WHERE  nc.notebook_id = :nid
                    ORDER  BY nc.embedding <=> :qvec::vector
                    LIMIT  :k
                    """
                ),
                {"qvec": vec_str, "nid": notebook_id, "k": top_k},
            ).fetchall()

        return [
            {
                "id":           row[0],
                "chunk_index":  row[1],
                "content":      row[2],
                "source_title": row[3],
                "source_id":    row[4],
                "similarity":   float(row[5]),
            }
            for row in rows
        ]

    # ── Chat ──────────────────────────────────────────────────────────────────

    def chat(
        self,
        notebook_id: int,
        message: str,
        history: List[Dict],
    ) -> Dict[str, Any]:
        """
        Retrieve relevant chunks, build a grounded prompt, call the LLM,
        return answer + cited sources.
        """
        chunks = self._retrieve_chunks(notebook_id, message)

        if not chunks:
            return {
                "answer":  "I couldn't find any relevant content in your notebook sources. Please add some documents first.",
                "sources": [],
            }

        # Build context block with source references
        context_parts: List[str] = []
        seen_sources: Dict[int, str] = {}
        for i, c in enumerate(chunks, 1):
            sid = c["source_id"]
            seen_sources[sid] = c["source_title"]
            context_parts.append(f"[Source {i}: {c['source_title']}]\n{c['content']}")

        context = "\n\n---\n\n".join(context_parts)

        # Build conversation history string
        history_str = ""
        for turn in history[-6:]:  # last 3 conversation turns
            role = "User" if turn.get("role") == "user" else "Assistant"
            history_str += f"{role}: {turn.get('content', '')}\n"

        prompt = textwrap.dedent(f"""
            You are an expert AI study assistant. Answer the user's question using ONLY
            the provided source excerpts below. Always cite which source your information
            comes from using [Source N] notation. If the answer is not in the sources,
            say so honestly.

            SOURCES:
            {context}

            CONVERSATION HISTORY:
            {history_str}

            USER QUESTION: {message}

            ANSWER (cite sources inline, e.g. "According to [Source 1]..."):
        """).strip()

        answer = self.llm.generate(prompt, model="flash", temperature=0.3, max_tokens=1024)

        # Build citation list (sources actually mentioned in the answer)
        cited: List[Dict] = []
        for i, c in enumerate(chunks, 1):
            if f"[Source {i}]" in answer or f"Source {i}" in answer:
                cited.append({
                    "source_id": c["source_id"],
                    "title": c["source_title"],
                    "snippet": c["content"][:280],
                    "chunk_index": c["chunk_index"],
                    "similarity": round(c["similarity"], 4),
                })

        if not cited:
            # Include all retrieved sources as a fallback citation list
            for c in chunks:
                cited.append({
                    "source_id": c["source_id"],
                    "title": c["source_title"],
                    "snippet": c["content"][:280],
                    "chunk_index": c["chunk_index"],
                    "similarity": round(c["similarity"], 4),
                })

        return {"answer": answer, "sources": cited}

    # ── Generation ───────────────────────────────────────────────────────────

    def generate(self, notebook_id: int, gen_type: str) -> Dict[str, Any]:
        """
        Produce a study artefact from all notebook content.
        gen_type: summary | study_guide | faq | flashcards | quiz
        """
        # Retrieve a broad sample of chunks (more than for chat)
        with SessionLocal() as db:
            rows = db.execute(
                text(
                    """
                    SELECT nc.content, ns.title
                    FROM   notebook_chunks nc
                    JOIN   notebook_sources ns ON ns.id = nc.source_id
                    WHERE  nc.notebook_id = :nid
                    ORDER  BY ns.id, nc.chunk_index
                    LIMIT  40
                    """
                ),
                {"nid": notebook_id},
            ).fetchall()

        if not rows:
            error_msg = "No content found. Please add sources before generating."
            return {"title": "Error", "content": error_msg}

        corpus = "\n\n".join(f"[{r[1]}] {r[0]}" for r in rows)[:12_000]  # stay within token limits

        prompts = {
            "summary": f"""
Summarise the following study materials into a concise but comprehensive overview (300–500 words).
Use clear headings and bullet points. Include the key ideas, concepts, and takeaways.

MATERIALS:
{corpus}

SUMMARY:""",

            "study_guide": f"""
Create a detailed study guide from the following materials.
Structure it as:
1. **Key Concepts** — define each important term/concept
2. **Core Principles** — list the main ideas with brief explanations
3. **Important Details** — notable facts, formulas, or examples
4. **Review Questions** — 5 questions to test understanding (no answers)

MATERIALS:
{corpus}

STUDY GUIDE:""",

            "notebook_guide": f"""
Create a Notebook Guide from the materials below. This should feel like a premium research brief.
Output in Markdown with these exact sections:
1. ## Big Picture
2. ## Core Concepts
3. ## Important Facts and Evidence
4. ## Glossary
5. ## Likely Exam/Interview Questions
6. ## What To Review Next

MATERIALS:
{corpus}

NOTEBOOK GUIDE:""",

            "faq": f"""
Generate a Frequently Asked Questions (FAQ) document from the following materials.
Create 8–12 questions that a student would likely ask, with clear, accurate answers.
Format: **Q: ...** followed by **A: ...**

MATERIALS:
{corpus}

FAQ:""",

            "flashcards": f"""
Create 15 flashcard pairs from the following study materials.
Each flashcard has a FRONT (short question or term) and BACK (concise answer or definition).
Return as JSON array: [{{"front": "...", "back": "..."}}]

MATERIALS:
{corpus}

FLASHCARDS (JSON):""",

            "quiz": f"""
Generate a 10-question multiple-choice quiz from the following study materials.
Each question must have 4 options (A, B, C, D) and a correct answer.
Return as JSON array:
[{{"question":"...","options":{{"A":"...","B":"...","C":"...","D":"..."}},"answer":"A"}}]

MATERIALS:
{corpus}

QUIZ (JSON):""",

        "audio_overview": f"""
Create an engaging two-host podcast-style script based on these materials.
Requirements:
- Speakers: Host A and Host B
- 5-8 minutes spoken length
- Explain concepts with examples and occasional analogies
- Keep it accurate to the source material only
- End with a short recap and 3 quick review questions

Return plain text script in this format:
Host A: ...
Host B: ...

MATERIALS:
{corpus}

AUDIO OVERVIEW SCRIPT:""",

        "compare_sources": f"""
Compare the provided materials across different sources.
Return a structured Markdown report with these sections:
1. ## Shared Agreements
2. ## Key Differences
3. ## Contradictions or Tensions
4. ## Missing Angles (what one source covers but others do not)
5. ## Synthesis (best reconciled understanding)

Rules:
- Cite source names explicitly in each point.
- Do not invent claims not present in materials.
- If there are no contradictions, explicitly say so.

MATERIALS:
{corpus}

SOURCE COMPARISON REPORT:""",
        }

        titles = {
            "summary":     "Summary",
            "study_guide": "Study Guide",
            "notebook_guide": "Notebook Guide",
            "faq":         "FAQ",
            "flashcards":  "Flashcards",
            "quiz":        "Practice Quiz",
            "audio_overview": "Audio Overview",
            "compare_sources": "Source Comparison",
        }

        prompt  = textwrap.dedent(prompts.get(gen_type, prompts["summary"])).strip()
        content = self.llm.generate(prompt, model="pro", temperature=0.4, max_tokens=3000)

        return {"title": titles.get(gen_type, gen_type.replace("_", " ").title()), "content": content}


# Singleton accessor
_service: Optional[NotebookService] = None


def get_notebook_service() -> NotebookService:
    global _service
    if _service is None:
        _service = NotebookService()
    return _service
