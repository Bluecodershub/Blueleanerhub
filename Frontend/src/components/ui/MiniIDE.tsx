'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, CheckCircle2, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEFAULT_CODE = `# Welcome to Bluelearnerhub!
# This is a mini-demonstration of our IDE.

def greet(name):
    return f"Hello, {name}! Ready to master engineering?"

print(greet("Future Engineer"))
`

export function MiniIDE() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const handleRun = () => {
    setIsRunning(true)
    setShowOutput(true)
    
    // Simulate execution delay
    setTimeout(() => {
      setOutput('Hello, Future Engineer! Ready to master engineering?')
      setIsRunning(false)
    }, 800)
  }

  const handleReset = () => {
    setCode(DEFAULT_CODE)
    setOutput('')
    setShowOutput(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-border bg-[#1e1e1e] shadow-2xl"
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-[#333] bg-[#252526] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 text-xs font-medium text-gray-400">demo.py</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button 
            size="sm" 
            onClick={handleRun}
            disabled={isRunning}
            className="h-7 gap-1.5 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-500"
          >
            <Play className={cn("h-3 w-3", isRunning && "animate-pulse")} />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-[200px] flex-col">
        {/* Editor Area */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-[#d4d4d4] outline-none"
        />

        {/* Output Panel */}
        <AnimatePresence>
          {showOutput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#333] bg-[#1e1e1e]"
            >
              <div className="flex items-center gap-2 border-b border-[#333] bg-[#252526] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <Terminal className="h-3 w-3" />
                Console Output
              </div>
              <div className="p-4 font-mono text-xs">
                {isRunning ? (
                  <span className="animate-pulse text-gray-500">Executing code...</span>
                ) : (
                  <div className="flex items-start gap-2 text-emerald-400">
                    <span className="text-gray-600">&gt;</span>
                    {output}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Indicator */}
        {!isRunning && output && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-500 backdrop-blur-md"
          >
            <CheckCircle2 className="h-3 w-3" />
            VIBRANT EXECUTION
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
