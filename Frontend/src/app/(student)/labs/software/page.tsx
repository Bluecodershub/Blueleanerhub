'use client'

import { useState } from 'react'
import { FileCode, Files, Terminal, Play, Save, Bug, Layout, ChevronDown, Search, Cpu, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SoftwareLabPage() {
  const [activeFile, setActiveFile] = useState('main.py')
  const [terminalOutput] = useState([
    '$ python main.py',
    'Initializing environment...',
    'Syncing with BlueCloud...',
    'Ready.',
  ])

  const files = [
    { name: 'main.py', icon: FileCode, color: 'text-blue-400' },
    { name: 'utils.py', icon: FileCode, color: 'text-blue-400' },
    { name: 'requirements.txt', icon: Files, color: 'text-muted-foreground' },
  ]

  return (
    <div className="-mt-6 flex h-[90vh] flex-col gap-4">
      {/* IDE Header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black uppercase italic tracking-widest text-white">
              SOFTWARE_LAB_v2.0
            </h2>
          </div>
          <Badge
            variant="outline"
            className="border-border bg-primary/10 text-[10px] font-black uppercase italic text-foreground/70"
          >
            Connected: BlueNode-Mumbai-01
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-white"
          >
            <Save className="mr-2 h-3.5 w-3.5" /> Save
          </Button>
          <div className="mx-1 h-4 w-px bg-secondary" />
          <Button
            size="sm"
            className="h-8 rounded-lg bg-primary/90 px-4 font-bold text-white hover:bg-primary"
          >
            <Play className="mr-2 h-3.5 w-3.5 fill-current" /> RUN_PROJECT
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg border-primary/20 bg-primary/5 px-4 font-bold text-primary"
          >
            <Bug className="mr-2 h-3.5 w-3.5" /> AI_DEBUG
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="flex w-64 flex-col overflow-hidden rounded-xl border border-border bg-background/40">
          <div className="border-b border-border bg-slate-900/20 p-4">
            <h3 className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              PROJECT_EXPLORER <Search className="h-3 w-3" />
            </h3>
          </div>
          <div className="flex-1 space-y-1 p-2">
            <div className="flex cursor-default items-center gap-2 p-2 text-xs font-bold text-muted-foreground">
              <ChevronDown className="h-3 w-3" /> <Layout className="mr-1 h-3.5 w-3.5" /> SRC
            </div>
            {files.map((file) => (
              <div
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs font-medium transition-colors ${activeFile === file.name ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'}`}
              >
                <div className="h-3 w-3 shrink-0" />
                <file.icon className={`h-3.5 w-3.5 ${file.color}`} />
                {file.name}
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-slate-900/40 p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <p className="text-[9px] font-bold uppercase text-muted-foreground">
                Synced with GitHub
              </p>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="group relative flex-1 overflow-hidden rounded-xl border border-border bg-background/80">
            <div className="absolute left-0 top-0 flex h-8 w-full items-center justify-between border-b border-border bg-card/60 px-4">
              <div className="flex items-center gap-2">
                <FileCode className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-bold uppercase text-foreground/80">{activeFile}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                  UTF-8
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                  Python 3.11
                </Badge>
              </div>
            </div>
            <div className="scrollbar-hide mt-8 h-full overflow-y-auto p-6 font-mono text-sm leading-relaxed text-foreground/80">
              <div className="flex gap-4">
                <div className="w-8 select-none border-r border-border pr-4 text-right text-slate-700">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="flex-1">
                  <pre className="text-blue-200">
                    <span className="text-purple-400">import</span> tensorflow{' '}
                    <span className="text-purple-400">as</span> tf
                  </pre>
                  <pre className="text-blue-200">
                    <span className="text-purple-400">import</span> numpy{' '}
                    <span className="text-purple-400">as</span> np
                  </pre>
                  <pre className="mt-2 italic text-muted-foreground">
                    # Bluelearner-AI specialized agent initialization
                  </pre>
                  <pre className="text-blue-200">model = tf.keras.Sequential([</pre>
                  <pre className="text-blue-200">
                    {' '}
                    tf.keras.layers.Dense(<span className="text-yellow-400">128</span>, activation=
                    <span className="text-foreground/70">'relu'</span>),
                  </pre>
                  <pre className="text-blue-200">
                    {' '}
                    tf.keras.layers.Dropout(<span className="text-yellow-400">0.2</span>),
                  </pre>
                  <pre className="text-blue-200">
                    {' '}
                    tf.keras.layers.Dense(<span className="text-yellow-400">10</span>)
                  </pre>
                  <pre className="text-blue-200">])</pre>
                  <pre className="mt-4 text-blue-200">
                    <span className="text-purple-400">def</span>{' '}
                    <span className="text-yellow-400">train_cycle</span>(data):
                  </pre>
                  <pre className="text-blue-200">
                    {' '}
                    <span className="text-muted-foreground">...</span>
                  </pre>
                </div>
              </div>
            </div>

            {/* AI Assistant Overlay */}
            <div className="absolute bottom-4 right-4 w-64 rounded-2xl border border-primary/20 bg-slate-900/90 p-4 opacity-0 shadow-2xl backdrop-blur-xl transition-opacity group-hover:opacity-100">
              <div className="mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <h4 className="text-[10px] font-black uppercase italic text-white">
                  AI_AUTO_PILOT
                </h4>
              </div>
              <p className="text-[10px] leading-tight text-muted-foreground">
                I noticed a potential optimization in your model layers. Should I refactor?
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 border-primary/20 bg-primary/10 text-[9px] font-black text-primary"
                >
                  REFACTOR
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-[9px] font-bold text-muted-foreground"
                >
                  DISMISS
                </Button>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex h-48 flex-col overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border bg-slate-900/40 p-2">
              <div className="ml-2 flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  TERMINAL_01
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
                <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
                <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-muted-foreground">
              {terminalOutput.map((line, i) => (
                <div key={i} className="mb-1 leading-relaxed">
                  <span className="mr-2 text-foreground/80">➜</span>
                  {line}
                </div>
              ))}
              <div className="mt-1 flex">
                <span className="mr-2 text-foreground/80">➜</span>
                <input
                  className="flex-1 border-none bg-transparent text-foreground outline-none"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
