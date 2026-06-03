'use client'

import { useState } from 'react'
import {
  Calculator,
  FileJson,
  Hash,
  Binary,
  Ruler,
  Cpu,
  Zap,
  Clipboard,
  Check,
  RotateCcw,
} from 'lucide-react'

const DOMAIN_TOOLS = [
  {
    id: 'cs',
    name: 'Computer Science',
    icon: <Cpu className="h-5 w-5" />,
    tools: [
      { id: 'json', name: 'JSON Formatter', icon: <FileJson className="h-4 w-4" /> },
      { id: 'base64', name: 'Base64 Tool', icon: <Hash className="h-4 w-4" /> },
      { id: 'binary', name: 'Binary Converter', icon: <Binary className="h-4 w-4" /> },
    ],
  },
  {
    id: 'mech',
    name: 'Mechanical',
    icon: <Zap className="h-5 w-5" />,
    tools: [
      { id: 'unit', name: 'Unit Converter', icon: <Ruler className="h-4 w-4" /> },
      { id: 'stress', name: 'Stress Calculator', icon: <Calculator className="h-4 w-4" /> },
    ],
  },
]

export default function DomainTools() {
  const [activeTab, setActiveTab] = useState('json')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch {
      setOutput('Invalid JSON Input')
    }
  }

  const convertBase64 = (mode: 'encode' | 'decode') => {
    try {
      if (mode === 'encode') setOutput(btoa(input))
      else setOutput(atob(input))
    } catch {
      setOutput('Base64 Conversion Error')
    }
  }

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black tracking-tight text-white/90">
          Domain Engineering Tools
        </h2>
        <p className="text-sm font-medium tracking-wide text-white/40">
          High-precision utilities for active engineering workflows.
        </p>
      </div>

      <div className="flex h-full min-h-0 gap-10">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-6">
          {DOMAIN_TOOLS.map((domain) => (
            <div key={domain.id} className="space-y-2">
              <div className="flex items-center gap-2.5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
                {domain.icon}
                {domain.name}
              </div>
              <div className="space-y-1">
                {domain.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTab(tool.id)
                      setInput('')
                      setOutput('')
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      activeTab === tool.id
                        ? 'scale-[1.02] bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    {tool.icon}
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Workspace */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#111111] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-5">
            <span className="text-xs font-bold uppercase tracking-widest text-white/40">
              {activeTab.replace('-', ' ')} Workspace
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setInput('')
                  setOutput('')
                }}
                className="rounded-lg p-2 text-white/40 transition-all hover:bg-white/5 hover:text-white/80"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase text-white/60 transition-all hover:bg-white/10 hover:text-white"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-foreground/70" />
                ) : (
                  <Clipboard className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-[1px] bg-white/5">
            <div className="flex flex-col gap-4 bg-[#111111] p-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                Input Area
              </span>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Paste your ${activeTab} here...`}
                className="flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed text-white/80 outline-none placeholder:text-white/10"
              />
              <div className="flex justify-end pt-4">
                {activeTab === 'json' && (
                  <button
                    onClick={formatJson}
                    className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 active:scale-95"
                  >
                    Format JSON
                  </button>
                )}
                {activeTab === 'base64' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => convertBase64('encode')}
                      className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:bg-white/10"
                    >
                      Encode
                    </button>
                    <button
                      onClick={() => convertBase64('decode')}
                      className="rounded-xl border border-border bg-primary/10 px-6 py-2.5 text-[11px] font-black uppercase tracking-wider text-foreground/80 transition-all hover:bg-primary/15"
                    >
                      Decode
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 bg-[#0c0c0c] p-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                Output Preview
              </span>
              <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-primary/80">
                {output || <span className="italic text-white/5">Result will appear here...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
