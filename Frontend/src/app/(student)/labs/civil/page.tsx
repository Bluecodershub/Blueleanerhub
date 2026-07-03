'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Box,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CivilLabPage() {
  const [load, setLoad] = useState(500)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <div className="-mt-6 flex h-[90vh] flex-col gap-4">
      {/* Simulation Header */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-foreground/70" />
            <h2 className="text-sm font-black uppercase italic tracking-widest text-foreground/70 text-white">
              STRUCTURE_LAB_v0.5
            </h2>
          </div>
          <Badge
            variant="outline"
            className="border-border bg-primary/10 text-[10px] font-black uppercase italic text-foreground/70"
          >
            BIM_SYNC: ESTABLISHED
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-white"
          >
            Environment Wind: 12 km/h
          </Button>
          <div className="mx-1 h-4 w-px bg-secondary" />
          <Button
            onClick={() => setIsAnalyzing(!isAnalyzing)}
            size="sm"
            className={`${isAnalyzing ? 'bg-primary/90 text-primary-foreground hover:bg-primary' : 'bg-secondary text-foreground hover:bg-muted'} h-8 rounded-lg px-4 font-bold transition-all`}
          >
            {isAnalyzing ? 'LIVE_ANALYSIS_ON' : 'RUN_STRUCTURAL_LOAD'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* BIM Data Sidebar */}
        <div className="flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-background/40">
          <div className="border-b border-border bg-slate-900/20 p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              BIM_DATA_STACK
            </h3>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Structural Members
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Box className="h-4 w-4 text-foreground/80" />
                    <span className="text-[10px] font-bold text-white">REINFORCED_CONCRETE_P1</span>
                  </div>
                  <Badge className="border-none bg-primary/10 text-[8px] font-black text-foreground/70">
                    PASS
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <Box className="h-4 w-4 text-foreground/80" />
                    <span className="text-[10px] font-bold text-white">STEEL_BEAM_W12x65</span>
                  </div>
                  <Badge className="border-none bg-primary/10 text-[8px] font-black text-foreground/70">
                    PASS
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[9px] font-black uppercase text-muted-foreground">
                  Live Load (kN)
                </h4>
                <span className="text-xl font-black text-white">{load}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                value={load}
                onChange={(e) => setLoad(parseInt(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-slate-800/50 bg-slate-900/40 p-3">
              <h5 className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                Telemetry Report
              </h5>
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Deflection</span>
                <span className="text-white">4.2 mm</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Soil Condition</span>
                <span className="text-foreground/70">STABLE</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Structural Viewport */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background/80 p-6">
          <div className="group relative flex flex-1 flex-col items-center justify-center rounded-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.5)_1px,transparent_1px)] opacity-20 [background-size:100px_100px]" />

            {/* Theoretical Structure */}
            <motion.div
              animate={isAnalyzing ? { scale: [1, 1.01, 1], y: [0, 1, 0] } : {}}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="relative z-10 flex h-[500px] w-96 flex-col justify-between border-4 border-border"
            >
              <div className="h-4 w-full bg-secondary" />
              <div className="flex flex-1 justify-evenly">
                <div
                  className={`h-full w-8 transition-colors duration-500 ${load > 1500 ? 'border-red-500 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-border bg-card'} border-x-4`}
                />
                <div
                  className={`h-full w-8 transition-colors duration-500 ${load > 1500 ? 'border-red-500 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-border bg-card'} border-x-4`}
                />
                <div
                  className={`h-full w-8 transition-colors duration-500 ${load > 1500 ? 'border-red-500 bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-border bg-card'} border-x-4`}
                />
              </div>
              <div className="h-8 w-full border-t-4 border-border bg-background" />

              {/* Stress Points UI */}
              {isAnalyzing && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-8">
                  <div className="mx-auto h-2 w-2 animate-ping rounded-full bg-red-500" />
                  <div className="h-3 w-3 animate-pulse rounded-full border-2 border-red-200 bg-red-500" />
                  <div className="mx-auto h-2 w-2 animate-ping rounded-full bg-primary" />
                </div>
              )}
            </motion.div>

            {/* AI Engineering Insights */}
            <div
              className={`absolute bottom-8 right-8 w-80 rounded-2xl border border-border bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 ${isAnalyzing ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 shrink-0 text-foreground/70" />
                <h4 className="text-[10px] font-black uppercase italic tracking-widest text-white">
                  Structural_Alert_System
                </h4>
              </div>
              <p className="text-xs font-bold leading-relaxed text-muted-foreground">
                Column stability under <span className="text-foreground/70">{load}kN</span> load is
                within the 1.5x safety factor margin.{' '}
                <span className="font-black text-foreground/70">CLEAR_TO_PROCEED</span>.
              </p>
              <Button
                variant="ghost"
                className="mt-4 h-9 w-full border border-border text-[10px] font-black uppercase text-foreground/70 hover:bg-primary/10"
              >
                Export Load Case <ChevronRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
