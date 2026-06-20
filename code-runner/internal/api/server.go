// Package api exposes the code-runner HTTP endpoints consumed by the
// Bluelearnerhub backend.
package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/bluelearnerhub/code-runner/internal/executor"
	"github.com/bluelearnerhub/code-runner/internal/store"
)

type Server struct {
	store        *store.Store
	exec         *executor.Executor
	apiKey       string
	maxCodeBytes int
}

func NewServer(st *store.Store, ex *executor.Executor, apiKey string, maxCodeBytes int) *Server {
	return &Server{store: st, exec: ex, apiKey: apiKey, maxCodeBytes: maxCodeBytes}
}

// Handler builds the routed, middleware-wrapped HTTP handler.
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", s.handleHealth)
	mux.HandleFunc("GET /languages", s.requireKey(s.handleLanguages))
	mux.HandleFunc("POST /execute", s.requireKey(s.handleExecute))
	mux.HandleFunc("GET /submissions/{id}", s.requireKey(s.handleGetSubmission))
	return logRequests(mux)
}

// requireKey enforces the shared secret when one is configured.
func (s *Server) requireKey(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if s.apiKey != "" && r.Header.Get("X-Runner-Key") != s.apiKey {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid runner key"})
			return
		}
		next(w, r)
	}
}

func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":         "ok",
		"executionReady": s.exec.Ready(),
		"persistence":    s.store.Enabled(),
		"languages":      len(executor.Languages),
	})
}

func (s *Server) handleLanguages(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"data": executor.List()})
}

type executeRequest struct {
	Language string `json:"language"`
	Source   string `json:"source"`
	Stdin    string `json:"stdin"`
	UserID   string `json:"userId"`
}

func (s *Server) handleExecute(w http.ResponseWriter, r *http.Request) {
	var req executeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	if req.Source == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "source is required"})
		return
	}
	if len(req.Source) > s.maxCodeBytes {
		writeJSON(w, http.StatusRequestEntityTooLarge, map[string]string{"error": "source exceeds size limit"})
		return
	}
	if _, ok := executor.Languages[req.Language]; !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "unsupported language: " + req.Language})
		return
	}

	ctx := r.Context()

	// Persist the submission up front in a "running" state.
	sub := &store.Submission{
		Language:  req.Language,
		Source:    req.Source,
		Stdin:     req.Stdin,
		Status:    "running",
		UserID:    req.UserID,
		CreatedAt: time.Now().UTC(),
	}
	id, err := s.store.Create(ctx, sub)
	if err != nil {
		log.Printf("[execute] persist create failed: %v", err)
	}

	result := s.exec.Execute(ctx, executor.Request{
		Language: req.Language,
		Source:   req.Source,
		Stdin:    req.Stdin,
	})

	// Write the terminal result back (best-effort).
	sub.Status = result.Status
	sub.Stdout = result.Stdout
	sub.Stderr = result.Stderr
	sub.ExitCode = result.ExitCode
	sub.TimeMs = result.TimeMs
	if uerr := s.store.Update(ctx, id, sub); uerr != nil {
		log.Printf("[execute] persist update failed: %v", uerr)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":       id.Hex(),
		"language": req.Language,
		"status":   result.Status,
		"stdout":   result.Stdout,
		"stderr":   result.Stderr,
		"exitCode": result.ExitCode,
		"timeMs":   result.TimeMs,
		"message":  result.Message,
	})
}

func (s *Server) handleGetSubmission(w http.ResponseWriter, r *http.Request) {
	id, err := primitive.ObjectIDFromHex(r.PathValue("id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid submission id"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	sub, err := s.store.FindByID(ctx, id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "lookup failed"})
		return
	}
	if sub == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "submission not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": sub})
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
