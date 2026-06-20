'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Cpu,
  Plus,
  Eraser,
  Activity,
  Waves,
  MousePointer2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function ElectricalLabPage() {
  const [isPowerOn, setIsPowerOn] = useState(false)

  const components = [
    { name: 'RESISTOR_10K', icon: Plus, color: 'text-foreground/70' },
    { name: 'CAPACITOR_100uF', icon: Plus, color: 'text-sky-400' },
    { name: 'NPN_TRANSISTOR', icon: Plus, color: 'text-muted-foreground' },
    { name: 'MCU_BLUE_X1', icon: Cpu, color: 'text-primary' },
  ]

  return (
    <div className="-mt-6 flex h-[90vh] flex-col gap-4">
      {/* Circuit Header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h2 className="text-sm font-black uppercase italic tracking-widest text-white text-yellow-400">
              CIRCUIT_DESIGN_v0.8
            </h2>
          </div>
          <Badge
            variant="outline"
            className="border-yellow-500/20 bg-yellow-500/10 text-[10px] font-black uppercase italic text-yellow-400"
          >
            POWER_RAIL: {isPowerOn ? 'STABLE' : 'HIGH_Z'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-white"
          >
            <Eraser className="mr-2 h-3.5 w-3.5" /> Clear Canvas
          </Button>
          <div className="mx-1 h-4 w-px bg-secondary" />
          <Button
            onClick={() => setIsPowerOn(!isPowerOn)}
            size="sm"
            className={`${isPowerOn ? 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-500' : 'bg-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:bg-yellow-500'} h-8 rounded-lg px-4 font-bold text-white transition-all`}
          >
            {isPowerOn ? 'HALT_VCC' : 'ENABLE_PWR'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Component Toolbox */}
        <div className="flex w-64 flex-col overflow-hidden rounded-xl border border-border bg-background/40">
          <div className="border-b border-border bg-slate-900/20 p-4">
            <h3 className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              COMPONENT_LIB <Plus className="h-3 w-3" />
            </h3>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {components.map((comp) => (
              <div
                key={comp.name}
                className="group flex cursor-grab items-center gap-3 rounded-xl border border-border bg-card/60 p-3 transition-all hover:border-yellow-500/30 active:cursor-grabbing"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-black`}
                >
                  <comp.icon className={`h-4 w-4 ${comp.color}`} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-[9px] font-black uppercase leading-none text-foreground/80">
                    {comp.name}
                  </p>
                  <p className="mt-1 text-[7px] font-bold uppercase text-muted-foreground">
                    SMD_ACTIVE
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schematic Canvas */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="group relative flex-1 overflow-hidden rounded-xl border border-border bg-background/80">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--secondary))_1px,transparent_1px)] opacity-30 [background-size:20px_20px]" />

            <div className="absolute right-4 top-4 z-10 flex gap-2">
              <Badge className="border-border bg-slate-900/90 px-2 py-1 font-mono text-[9px] text-muted-foreground">
                X: 124 Y: 88
              </Badge>
            </div>

            {/* Theoretical Circuit Sketch */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 600 400"
                className="h-full w-full fill-none stroke-slate-700 stroke-[1.5] opacity-40"
              >
                <path d="M100,200 h100 v-50 h50 v100 h-50 M300,200 h100 v50 h50 v-100 h-50" />
                <circle cx="100" cy="200" r="4" className="fill-slate-700" />
                <circle cx="300" cy="200" r="4" className="fill-slate-700" />
                <circle cx="500" cy="200" r="4" className="fill-slate-700" />
              </svg>
              {isPowerOn && (
                <motion.div
                  animate={{ x: [100, 500], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#fbbf24] blur-[2px]"
                />
              )}
            </div>

            {/* Pro Floating Toolbar */}
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-slate-900/90 p-1 shadow-2xl backdrop-blur-xl">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-secondary hover:text-white"
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-secondary hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-secondary hover:text-white"
              >
                <Activity className="h-4 w-4" />
              </Button>
              <div className="mx-1 h-6 w-px bg-secondary" />
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl text-yellow-400 hover:bg-yellow-400/10"
              >
                <Zap className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>

          {/* Oscilloscope / Analyzer */}
          <div className="flex h-56 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border bg-slate-900/40 p-2">
              <div className="ml-2 flex items-center gap-2">
                <Waves className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  DIGITAL_OSCILLOSCOPE_CH1
                </span>
              </div>
              <div className="flex items-center gap-3 pr-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-[9px] text-foreground/80">5.02V</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span className="font-mono text-[9px] text-primary/80">120 Hz</span>
                </div>
              </div>
            </div>
            <div className="relative flex flex-1 overflow-hidden p-0">
              {/* Scope Grid */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(10,minmax(0,1fr))] grid-rows-[repeat(6,minmax(0,1fr))] opacity-10">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-primary/40" />
                ))}
              </div>

              {/* Waveform Visualization */}
              <div className="flex flex-1 items-center justify-center p-4">
                <svg viewBox="0 0 600 100" className="h-full w-full overflow-visible">
                  <motion.path
                    d="M0,50 Q15,10 30,50 T60,50 T90,50 T120,50 T150,50 T180,50 T210,50 T240,50 T270,50 T300,50 T330,50 T360,50 T390,50 T420,50 T450,50 T480,50 T510,50 T540,50 T570,50 T600,50"
                    className={`fill-none stroke-foreground/70 stroke-[2] drop-shadow-[0_0_8px_rgba(59,130,246,0.35)] transition-all ${isPowerOn ? 'opacity-100' : 'opacity-20'}`}
                    animate={
                      isPowerOn
                        ? {
                            d: [
                              'M0,50 Q15,10 30,50 T60,50 T90,50 T120,50 T150,50 T180,50 T210,50 T240,50 T270,50 T300,50 T330,50 T360,50 T390,50 T420,50 T450,50 T480,50 T510,50 T540,50 T570,50 T600,50',
                              'M0,50 Q15,90 30,50 T60,50 T90,50 T120,50 T150,50 T180,50 T210,50 T240,50 T270,50 T300,50 T330,50 T360,50 T390,50 T420,50 T450,50 T480,50 T510,50 T540,50 T570,50 T600,50',
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 0.1, repeat: Infinity, ease: 'linear' }}
                  />
                </svg>
              </div>

              {/* Scope Controls Sidebar */}
              <div className="w-48 space-y-4 border-l border-border bg-card/60 p-4">
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                    Timebase
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-full border-border bg-background text-[9px] font-black italic"
                    >
                      10ms
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-full border-none bg-yellow-500 text-[9px] font-black italic text-black shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                    >
                      1ms
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground">
                    <span>Trigger</span>
                    <span className="text-foreground/70">AUTO</span>
                  </div>
                  <Progress value={65} className="h-1 bg-background" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
