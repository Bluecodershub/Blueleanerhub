'use client'

import { useState } from 'react'
import CodeEditor from './CodeEditor'
import Terminal from './Terminal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'

interface CompilerProps {
  initialCode?: string
  language?: string
  problemId?: number
}

export default function Compiler({
  initialCode,
  language: initialLanguage = 'python',
  problemId,
}: CompilerProps) {
  const [code, setCode] = useState(initialCode || getDefaultCode(initialLanguage))
  const [output, setOutput] = useState<string[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [_isRunning, setIsRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [memoryUsed, setMemoryUsed] = useState<number | null>(null)

  const handleRun = async (code: string, language: string) => {
    setIsRunning(true)
    setOutput(['Running...'])

    try {
      // Call backend API to run code
      const response = await axios.post('/api/code/run', {
        code,
        language,
        input: '', // Can be customized
      })

      const { stdout, stderr, executionTime, memoryUsed, error } = response.data

      if (error) {
        setOutput([`Error: ${error}`])
      } else if (stderr) {
        setOutput([stderr])
      } else {
        setOutput([stdout || 'Program executed successfully with no output'])
      }

      setExecutionTime(executionTime)
      setMemoryUsed(memoryUsed)
    } catch (error: any) {
      setOutput([`Execution failed: ${error.message}`])
    } finally {
      setIsRunning(false)
    }
  }

  const _handleSubmit = async () => {
    if (!problemId) return

    setIsRunning(true)

    try {
      // Call backend to run against test cases
      const response = await axios.post('/api/code/submit', {
        problemId,
        code,
        language: initialLanguage,
      })

      setTestResults(response.data.testResults)
      setOutput([`Submission completed!`, `Passed: ${response.data.passed}/${response.data.total}`])
    } catch (error: any) {
      setOutput([`Submission failed: ${error.message}`])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="grid h-screen grid-cols-1 gap-4 p-4 lg:grid-cols-2">
      {/* Left Panel - Editor */}
      <div className="flex flex-col">
        <CodeEditor
          initialCode={code}
          language={initialLanguage}
          onRun={handleRun}
          onSave={setCode}
          height="calc(100vh - 8rem)"
        />
      </div>

      {/* Right Panel - Output & Results */}
      <div className="flex flex-col">
        <Tabs defaultValue="output" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="output" className="flex-1">
            <Terminal output={output} height="calc(100vh - 12rem)" showHeader={false} />

            {/* Execution Stats */}
            {executionTime !== null && (
              <div className="mt-4 flex gap-4">
                <Card className="p-3">
                  <div className="text-xs text-gray-500">Execution Time</div>
                  <div className="text-lg font-semibold">{executionTime}ms</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-gray-500">Memory Used</div>
                  <div className="text-lg font-semibold">{memoryUsed}KB</div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-2">
            {testResults.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No test results yet. Click Submit to run test cases.
              </div>
            ) : (
              testResults.map((result, i) => (
                <Card key={i} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">Test Case {i + 1}</span>
                    <Badge variant={result.passed ? 'default' : 'destructive'}>
                      {result.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>

                  {!result.passed && (
                    <div className="mt-2 text-sm">
                      <div className="text-gray-600">Expected: {result.expected}</div>
                      <div className="text-red-600">Got: {result.actual}</div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function getDefaultCode(language: string): string {
  const templates: Record<string, string> = {
    python: `def main():
    # Your code here
    print("Hello, World!")

if __name__ == "__main__":
    main()`,

    javascript: `function main() {
    // Your code here
    console.log("Hello, World!");
}

main();`,

    java: `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`,

    cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  }

  return templates[language] || '// Start coding...'
}
