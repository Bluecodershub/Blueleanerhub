'use client'

/**
 * CodePlayground — Live code editor with execution
 * =================================================
 * Monaco editor + Judge0 execution via the backend proxy.
 * Supports 20+ programming languages.
 */

import { useState, useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { Play, RotateCcw, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExecutionResult {
  stdout: string
  stderr: string
  success: boolean
}

interface CodePlaygroundProps {
  starterCode: string
  language: string
  onRun: (code: string, language: string) => Promise<ExecutionResult>
  readOnly?: boolean
  height?: string
}

const LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  rust: 'rust',
  go: 'go',
  sql: 'sql',
  bash: 'shell',
  markdown: 'markdown',
}

export default function CodePlayground({
  starterCode,
  language,
  onRun,
  readOnly = false,
  height = '300px',
}: CodePlaygroundProps) {
  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState<ExecutionResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const editorRef = useRef<any>(null)

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setOutput(null)
    try {
      const result = await onRun(code, language)
      setOutput(result)
    } catch {
      setOutput({ stdout: '', stderr: 'Execution failed. Please try again.', success: false })
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(starterCode)
    setOutput(null)
    editorRef.current?.setValue(starterCode)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-border dark:bg-background-secondary">
        <span className="font-mono text-xs font-medium uppercase tracking-wide text-gray-500">
          {language}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {copied ? (
              <Check className="h-3 w-3 text-foreground/80" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || readOnly}
            className={cn(
              'flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-all',
              isRunning
                ? 'cursor-wait bg-sky-400 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
            )}
          >
            <Play className={cn('h-3 w-3', isRunning && 'animate-pulse')} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1" style={{ minHeight: height }}>
        <Editor
          height={height}
          language={LANGUAGE_MAP[language] ?? language}
          value={code}
          onChange={(v) => setCode(v ?? '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            folding: false,
            readOnly,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            smoothScrolling: true,
          }}
        />
      </div>

      {/* Output panel */}
      {output && (
        <div
          className={cn(
            'border-t border-gray-200 dark:border-border',
            'max-h-48 overflow-y-auto bg-gray-950 px-4 py-3 font-mono text-xs'
          )}
        >
          <div className="mb-1 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                output.success ? 'bg-muted text-foreground/60' : 'bg-red-900 text-red-300'
              )}
            >
              {output.success ? 'SUCCESS' : 'ERROR'}
            </span>
          </div>
          {output.stdout && (
            <pre className="whitespace-pre-wrap text-foreground/60">{output.stdout}</pre>
          )}
          {output.stderr && <pre className="whitespace-pre-wrap text-red-400">{output.stderr}</pre>}
        </div>
      )}
    </div>
  )
}
