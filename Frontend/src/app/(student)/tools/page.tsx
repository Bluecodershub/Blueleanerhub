'use client'

import DomainTools from '@/components/tools/DomainTools'
import { Settings2, Sparkles } from 'lucide-react'

export default function ToolsPage() {
  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <Settings2 className="h-4 w-4" />
            Engineering Utilities
          </div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight">
            Domain-Specific Tools
            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              Pro Suite
            </span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Essential tools for modern engineers. From signal processing to data formatting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-4 py-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold">New Tools Added Weekly</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <DomainTools />
      </div>
    </div>
  )
}
