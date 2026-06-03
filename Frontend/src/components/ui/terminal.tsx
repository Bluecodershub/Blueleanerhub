'use client'

import React from 'react'

interface TerminalProps {
  commands?: string[]
  output?: string[]
  height?: string
  className?: string
}

const Terminal: React.FC<TerminalProps> = ({
  commands = [],
  output = [],
  height,
  className = '',
}) => {
  const lines = output.length > 0 ? output : commands

  return (
    <div
      className={`overflow-hidden rounded-lg bg-gray-900 font-mono text-sm shadow-lg ${className}`}
      style={{ height }}
    >
      <div className="flex items-center gap-2 bg-gray-800 px-4 py-2">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-blue-500" />
        </div>
        <span className="ml-2 text-xs text-gray-400">terminal</span>
      </div>
      <div
        className="space-y-2 overflow-auto p-4 text-blue-400"
        style={{ maxHeight: height ? `calc(${height} - 40px)` : undefined }}
      >
        {lines.map((cmd, idx) => (
          <div key={idx}>
            <span className="text-blue-400">$</span> {cmd}
          </div>
        ))}
        {lines.length === 0 && (
          <div>
            <span className="text-blue-400">$</span> <span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Terminal
