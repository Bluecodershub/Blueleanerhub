import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { LAST_UPDATED, POLICY_VERSION, legalNav, type LegalDoc } from '@/data/legal'

/**
 * Shared renderer for every legal/compliance document. Keeps typography,
 * the lawyer-review notice, and cross-document navigation consistent across
 * all policy pages. `children` lets a page inject extra interactive content
 * (e.g. the grievance form) below the document body.
 */
export default function LegalDocument({ doc, children }: { doc: LegalDoc; children?: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-foreground">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Legal &amp; Compliance</p>
      <h1 className="mb-3 font-serif text-4xl font-medium text-white sm:text-5xl">{doc.title}</h1>
      <p className="mb-2 max-w-2xl leading-relaxed text-muted-foreground">{doc.summary}</p>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED} · Policy version {POLICY_VERSION}
      </p>

      {/* Mandated review notice */}
      <div className="mb-12 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This document is provided for transparency and <strong>requires review by a qualified Indian lawyer
          before publication</strong>. Placeholders shown in square brackets must be completed with the
          registered business entity’s details.
        </p>
      </div>

      <article className="space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-xl font-bold text-white">{section.heading}</h2>

            {section.paragraphs?.map((p, i) => (
              <p key={i} className="mb-3 leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}

            {section.bullets && (
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                {section.bullets.map((b, i) => (
                  <li key={i} className="leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {section.table && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      {section.table.headers.map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {section.table.rows.map((row, ri) => (
                      <tr key={ri} className="align-top">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-3 text-muted-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </article>

      {children}

      {/* Cross-document navigation */}
      <nav className="mt-16 border-t border-border pt-8">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">All Legal Documents</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {legalNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm transition-colors hover:text-primary ${
                  link.href === doc.href ? 'font-semibold text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
