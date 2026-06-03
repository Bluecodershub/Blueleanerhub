'use client'

import { useState, useRef, useEffect } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import {
  Play,
  Settings,
  Terminal,
  RotateCcw,
  ChevronDown,
  Monitor,
  Cpu,
  Shield,
  Zap,
} from 'lucide-react'
import { codeAPI, getSandboxSessionId, setSandboxSessionId } from '@/lib/api-civilization'

const LANGUAGES = [
  { id: 'python', name: 'Python 3', version: '3.10.0', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', version: '18.15.0', icon: 'JS' },
  { id: 'java', name: 'Java', version: '15.0.2', icon: '☕' },
  { id: 'cpp', name: 'C++', version: '10.2.0', icon: 'C++' },
]

interface CodeEditorProps {
  value?: string;
  onChange?: (val: string) => void;
  language?: string;
  theme?: 'vs-dark' | 'light';
  isStandalone?: boolean;
}

export default function CodeEditor({
  value = '',
  onChange,
  language = 'python',
  theme = 'vs-dark',
  isStandalone = true,
}: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(value)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const editorRef = useRef<any>(null)

  // Sync prop changes to local state
  useEffect(() => {
    if (value !== localCode) {
      setLocalCode(value)
    }
  }, [value, localCode])

  useEffect(() => {
    setSessionId(getSandboxSessionId())
  }, [])

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.focus()
  }

  const handleEditorChange = (val?: string) => {
    const updated = val ?? ''
    setLocalCode(updated)
    if (onChange) {
      onChange(updated)
    }
  }

  const activeLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0]

  const runCode = async () => {
    setIsRunning(true)
    setOutput('Running...\n')

    try {
      const response = await codeAPI.execute(
        editorRef.current?.getValue() || localCode,
        activeLang.id,
        undefined,
        sessionId || undefined,
        { sandboxType: 'hackathon', persistSession: true }
      )

      const envelope = response.data as any
      const result = envelope?.data ?? envelope

      if (result?.sessionId) {
        setSessionId(result.sessionId)
        setSandboxSessionId(result.sessionId)
      }

      if (response.error) {
        setOutput(`Error:\n${response.error}`)
      } else if (result?.stderr || result?.compile_output) {
        setOutput(`Error:\n${result.stderr || result.compile_output}`)
      } else {
        setOutput(result?.stdout || result?.output || 'Program executed successfully with no output.')
      }
    } catch {
      setOutput('Failed to execute code. Please verify that the BluelearnerHub backend sandbox is running.')
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    const confirm = window.confirm('Are you sure you want to reset the editor?')
    if (confirm) {
      handleEditorChange('')
    }
  }

  // Raw Editor viewport for embedded usages (e.g. inside our advanced dashboard sandbox)
  if (!isStandalone) {
    return (
      <div className="h-full w-full bg-[#1e1e1e] overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={localCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            padding: { top: 16 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            lineHeight: 1.6,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
            },
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-2xl">
      {/* Utility Bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#252526] px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80">
            <span className="text-lg">{activeLang.icon}</span>
            {activeLang.name}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
          <div className="mx-2 h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
              <Cpu className="h-3.5 w-3.5" />
              <span>Compiler v{activeLang.version}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/40">
              <Shield className="h-3.5 w-3.5" />
              <span>Sandbox Secure</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetCode}
            className="rounded-lg p-2 text-white/40 transition-all hover:bg-white/5 hover:text-white/80"
            title="Reset Editor"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
          <button className="rounded-lg p-2 text-white/40 transition-all hover:bg-white/5 hover:text-white/80">
            <Settings className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all ${
              isRunning
                ? 'cursor-not-allowed bg-primary/15 text-foreground/80'
                : 'bg-primary text-white hover:bg-primary/70 hover:shadow-lg hover:shadow-primary/15 active:scale-95'
            }`}
          >
            {isRunning ? (
              <Zap className="h-4 w-4 animate-pulse" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Main IDE Area */}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <Editor
            height="100%"
            language={language}
            theme={theme}
            value={localCode}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              padding: { top: 20 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              lineHeight: 1.6,
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
              },
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>

        {/* Output Console */}
        <div className="flex w-1/3 flex-col border-l border-white/5 bg-[#1a1a1a]">
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            <Terminal className="h-4 w-4" />
            Console Output
          </div>
          <div className="text-foreground/70/90 flex-1 overflow-y-auto whitespace-pre-wrap p-6 font-mono text-[13px] leading-relaxed">
            {output || 'Run your code to see the result...'}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-white/5 bg-[#1a1a1a] px-6 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/20">
            <Monitor className="h-3 w-3" />
            <span>Ready to debug</span>
          </div>
        </div>
        <span className="text-[10px] font-medium text-white/10">
          Built by Bluelearnerhub for Elite Engineers
        </span>
      </div>
    </div>
  )
}
