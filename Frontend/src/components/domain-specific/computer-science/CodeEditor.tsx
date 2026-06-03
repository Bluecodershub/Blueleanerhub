'use client'

import { useRef, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import type { IRange } from 'monaco-editor'
import { Play, Save, Download, Maximize2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CodeEditorProps {
  initialCode?: string
  language?: string
  theme?: 'vs-dark' | 'vs-light' | 'hc-black'
  height?: string
  readOnly?: boolean
  onRun?: (code: string, language: string) => Promise<void>
  onSave?: (code: string) => void
  showToolbar?: boolean
  showLineNumbers?: boolean
  minimap?: boolean
}

export default function CodeEditor({
  initialCode = '// Start coding here...',
  language: initialLanguage = 'javascript',
  theme: initialTheme = 'vs-dark',
  height = '600px',
  readOnly = false,
  onRun,
  onSave,
  showToolbar = true,
  showLineNumbers = true,
  minimap = true,
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [theme, setTheme] = useState(initialTheme)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off')

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun()
    })

    // Auto-completion enhancement
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range: IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        const suggestions = [
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'console.log(${1:value});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log to console',
            range,
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Function declaration',
            range,
          },
        ]
        return { suggestions }
      },
    })
  }

  const handleRun = async () => {
    if (!onRun) return

    setIsRunning(true)
    try {
      await onRun(code, language)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSave = () => {
    if (!onSave) return

    setIsSaving(true)
    onSave(code)
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      typescript: 'ts',
      go: 'go',
      rust: 'rs',
    }

    const ext = extensions[language] || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFullscreen = () => {
    const element = editorRef.current?.getDomNode()
    if (element?.requestFullscreen) {
      element.requestFullscreen()
    }
  }

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
  ]

  const themeOptions = [
    { value: 'vs-dark', label: 'Dark' },
    { value: 'vs-light', label: 'Light' },
    { value: 'hc-black', label: 'High Contrast' },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40 border-gray-600 bg-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Theme Selector */}
            <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
              <SelectTrigger className="w-32 border-gray-600 bg-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Font Size */}
            <Select
              value={fontSize.toString()}
              onValueChange={(v: string) => setFontSize(parseInt(v))}
            >
              <SelectTrigger className="w-20 border-gray-600 bg-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[12, 14, 16, 18, 20].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* Run Button */}
            {onRun && (
              <Button
                onClick={handleRun}
                disabled={isRunning || readOnly}
                className="bg-primary hover:bg-primary/90"
                size="sm"
              >
                <Play className="mr-1 h-4 w-4" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
            )}

            {/* Save Button */}
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={isSaving || readOnly}
                variant="outline"
                size="sm"
              >
                <Save className="mr-1 h-4 w-4" />
                {isSaving ? 'Saved!' : 'Save'}
              </Button>
            )}

            {/* Copy Button */}
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? (
                <Check className="h-4 w-4 text-primary/80" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {/* Download Button */}
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>

            {/* Fullscreen Button */}
            <Button onClick={handleFullscreen} variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1" style={{ height }}>
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            readOnly,
            fontSize,
            wordWrap,
            lineNumbers: showLineNumbers ? 'on' : 'off',
            minimap: { enabled: minimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            contextmenu: true,
            mouseWheelZoom: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-gray-700 bg-gray-800 px-4 py-1 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span className="capitalize">{language}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Spaces: 2</span>
          <button
            onClick={() => setWordWrap(wordWrap === 'on' ? 'off' : 'on')}
            className="transition-colors hover:text-white"
          >
            Word Wrap: {wordWrap}
          </button>
        </div>
      </div>
    </div>
  )
}
