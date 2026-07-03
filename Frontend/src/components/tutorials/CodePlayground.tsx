'use client'

import { useState } from 'react'
import CodeEditor from '@/components/domain-specific/computer-science/CodeEditor'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, RotateCcw, Download } from 'lucide-react'
import { codeAPI } from '@/lib/api-civilization'
import { CodeExecutionResponse } from '@/types'

interface CodePlaygroundProps {
  initialCode?: string
  language?: string
  height?: string
}

export default function CodePlayground({
  initialCode = '// Start coding here...',
  language: initialLanguage = 'javascript',
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    setOutput(['Running...'])

    try {
      const data = await codeAPI.execute(code, initialLanguage) as CodeExecutionResponse
      const result = data?.data ?? data
      const lines: string[] = []
      if (result?.stdout) lines.push(...result.stdout.split('\n').filter(Boolean))
      if (result?.stderr) lines.push(`Error: ${result.stderr}`)
      if (result?.compile_output) lines.push(`Compile error: ${result.compile_output}`)
      setOutput(lines.length > 0 ? lines : ['(no output)'])
    } catch (error: any) {
      setOutput([`Execution failed: ${error?.message ?? 'unknown error'}`])
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    setOutput([])
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${initialLanguage}`
    a.click()
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2">
        <span className="text-sm font-semibold text-foreground">Code Playground</span>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Play className="mr-1 h-4 w-4" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor & Output */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Tabs defaultValue="editor" className="flex flex-1 flex-col">
          <TabsList className="w-full justify-start rounded-none border-b border-border">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="m-0 flex-1">
            <CodeEditor
              initialCode={code}
              language={initialLanguage}
              onSave={setCode}
              showToolbar={false}
              height="100%"
            />
          </TabsContent>

          <TabsContent
            value="output"
            className="m-0 flex-1 overflow-auto bg-sky-50 p-4 font-mono text-sm text-sky-800"
          >
            {output.length > 0 ? (
              <div className="space-y-2">
                {output.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">Click "Run" to see output...</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
