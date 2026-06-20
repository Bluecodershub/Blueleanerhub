'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Layers,
  RotateCw,
  Maximize2,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

export default function MechanicalLabPage() {
  const [temperature, setTemperature] = useState(25)
  const [isSimulating, setIsSimulating] = useState(false)

  return (
    <div className="-mt-6 flex h-[90vh] flex-col gap-4">
      {/* Simulation Header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-foreground/70" />
            <h2 className="text-sm font-black uppercase italic tracking-widest text-foreground/70 text-white">
              MECH_SIM_CENTER_v1.2
            </h2>
          </div>
          <Badge
            variant="outline"
            className="border-border bg-primary/10 text-[10px] font-black uppercase italic text-foreground/70"
          >
            GPU_ACCELERATION: ACTIVE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-white"
          >
            <Layers className="mr-2 h-3.5 w-3.5" /> Viewport Layers
          </Button>
          <div className="mx-1 h-4 w-px bg-secondary" />
          <Button
            onClick={() => setIsSimulating(!isSimulating)}
            size="sm"
            className={`${isSimulating ? 'bg-red-600 hover:bg-red-500' : 'bg-primary hover:bg-primary'} h-8 rounded-lg px-4 font-bold text-black`}
          >
            {isSimulating ? 'HALT_SIMULATION' : 'START_THERMAL_SIM'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Control & Properties Sidebar */}
        <div className="flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-background/40">
          <div className="border-b border-border bg-slate-900/20 p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              PROPERTIES_PANE
            </h3>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {/* Material Selection */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Active Material
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex h-20 flex-col gap-2 border-border bg-card text-[10px] font-black italic"
                >
                  <div className="h-4 w-4 rounded-full bg-primary/70" /> ALUMINUM_6061
                </Button>
                <Button
                  variant="outline"
                  className="flex h-20 flex-col gap-2 border-border bg-card text-[10px] font-black italic opacity-40"
                >
                  <div className="h-4 w-4 rounded-full bg-slate-500" /> STEEL_A36
                </Button>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
                <span>Ambient Temp</span>
                <span className="text-foreground/70">{temperature}°C</span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(v: number[]) => setTemperature(v[0])}
                max={150}
                step={1}
                className="py-1"
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-card/60 p-3">
              <h4 className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground">
                <Info className="h-3 w-3" /> Live Telemetry
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">Torque</span>
                  <span className="text-white">14.2 Nm</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">Stiffness</span>
                  <span className="text-white">88%</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">Fatigue Life</span>
                  <span className="font-black text-foreground/70">EXCELLENT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Viewport Area */}
        <div className="group relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background/80 p-4">
          {/* Viewport UI Overlays */}
          <div className="absolute left-8 top-8 z-10 flex flex-col gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-xl border-border bg-slate-900/80"
            >
              <RotateCw className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-xl border-border bg-slate-900/80"
            >
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="absolute bottom-8 right-8 z-10 flex gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-slate-900/90 px-4 py-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <span className="text-[10px] font-black uppercase italic tracking-widest text-white">
                STRESS_POINT_ALPHA_7
              </span>
            </div>
          </div>

          {/* Theoretical 3D Model Placeholder */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl">
            <div className="pointer-events-none absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-10">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-slate-500/30" />
              ))}
            </div>

            <motion.div
              animate={{
                rotateY: isSimulating ? 360 : 0,
                scale: isSimulating ? [1, 1.02, 1] : 1,
              }}
              transition={{
                rotateY: { duration: 10, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative flex h-80 w-80 items-center justify-center"
            >
              {/* High-end SVG based Engine Piston Placeholder */}
              <svg
                viewBox="0 0 200 200"
                className={`h-full w-full drop-shadow-[0_0_30px_rgba(251,146,60,0.2)] transition-colors duration-500 ${isSimulating ? 'fill-foreground/80' : 'fill-slate-700'}`}
              >
                <path d="M60,40 h80 v120 h-80 z M70,50 h60 v10 h-60 z M80,70 h40 v40 h-40 z" />
                <circle cx="100" cy="130" r="15" fill="#334155" />
                {isSimulating && (
                  <motion.g
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <circle cx="100" cy="80" r="30" className="fill-red-500/20" />
                    <circle cx="100" cy="80" r="10" className="fill-red-500" />
                  </motion.g>
                )}
              </svg>
            </motion.div>
          </div>

          {/* AI Insights Board */}
          <div className="group/ai mt-4 flex h-24 items-center gap-6 rounded-2xl border border-border bg-card/60 px-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-foreground/70" />
            </div>
            <div className="flex-1">
              <h5 className="mb-1 text-[10px] font-black uppercase italic tracking-widest text-foreground/70">
                Structural Optimizer
              </h5>
              <p className="text-xs font-medium leading-tight text-muted-foreground">
                Increasing wall thickness by 1.2mm in the crown region would reduce maximum stress
                by 18.5%.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-border text-[10px] font-black uppercase italic tracking-widest text-foreground/70 transition-all hover:bg-primary hover:text-black"
            >
              Apply Fix <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
