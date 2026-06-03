'use client'

import { motion } from 'framer-motion'
import {
  Code2,
  Settings,
  Zap,
  Building2,
  FlaskConical,
  Blocks,
  MousePointer2,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const labCategories = [
  {
    title: 'SOFTWARE_ENGINEERING',
    description:
      'Cloud-based IDE with integrated AI debugging, containers, and real-time collaboration.',
    icon: Code2,
    domain: 'CS / IT',
    status: 'ACTIVE',
    href: '/labs/software',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'MECHANICAL_SIMULATOR',
    description:
      '3D CAD viewer, FEA analysis tools, and thermal fluid dynamics simulation environments.',
    icon: Settings,
    domain: 'MECHANICAL / AUTO',
    status: 'ACTIVE',
    href: '/labs/mechanical',
    color: 'text-foreground/70',
    bg: 'bg-primary/10',
  },
  {
    title: 'ELECTRICAL_CIRCUITS',
    description: 'Virtual breadboards, SPICE simulation, and PCB design verification lab.',
    icon: Zap,
    domain: 'ELECTRICAL / EC',
    status: 'ACTIVE',
    href: '/labs/electrical',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    title: 'CIVIL_DESIGN_HUB',
    description: 'Building Information Modeling (BIM) tools and structural integrity simulators.',
    icon: Building2,
    domain: 'CIVIL / ARCH',
    status: 'BETA',
    href: '/labs/civil',
    color: 'text-foreground/70',
    bg: 'bg-primary/10',
  },
  {
    title: 'BIOMEDICAL_ANALYTICS',
    description: 'Medical imaging processing, prosthetic design, and bioinformatics lab.',
    icon: FlaskConical,
    domain: 'BIO / CHEM',
    status: 'BETA',
    href: '/labs/biomedical',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
]

export default function LabsPage() {
  return (
    <div className="animate-in fade-in space-y-10 pb-20 duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white md:text-5xl">
            VIRTUAL <span className="ai-glow text-primary">SIM_CENTER</span>
          </h1>
          <p className="max-w-xl font-medium text-muted-foreground">
            Interact with industry-standard tools and environments without any hardware limitations.
            Low-latency, high-performance simulations.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl border border-border bg-card/50 px-6 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Active Sessions
            </p>
            <p className="text-xl font-black text-white">02</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {labCategories.map((lab, i) => (
          <motion.div
            key={lab.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group flex h-full cursor-pointer flex-col overflow-hidden border-border bg-slate-900/40 ring-1 ring-white/5 transition-all hover:bg-card/60 hover:ring-primary/20">
              <CardHeader className="relative">
                <div
                  className={`h-12 w-12 rounded-2xl ${lab.bg} mb-4 flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <lab.icon className={`h-6 w-6 ${lab.color}`} />
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {lab.domain}
                  </Badge>
                  {lab.status === 'BETA' && (
                    <Badge className="border-none bg-primary/10 text-[9px] font-black uppercase italic text-foreground/70">
                      BETA_ACCESS
                    </Badge>
                  )}
                </div>
                <CardTitle className="pt-4 text-2xl font-black italic tracking-tight text-white transition-colors group-hover:text-primary">
                  {lab.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {lab.description}
                </p>
              </CardContent>
              <CardFooter className="group/footer flex items-center justify-between border-t border-border bg-background/20 p-6">
                <div className="flex gap-2">
                  <MousePointer2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground">
                    Browser-Based
                  </p>
                </div>
                <Button
                  size="sm"
                  asChild
                  className="bg-white font-black italic tracking-widest text-black hover:bg-white/90 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <Link href={lab.href}>
                    ENTER_LAB{' '}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/footer:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {/* Custom Project Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="h-full"
        >
          <div className="group group flex h-full cursor-pointer flex-col items-center justify-center space-y-6 rounded-3xl border border-dashed border-border bg-background/40 p-8 text-center transition-all hover:border-primary/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card transition-colors group-hover:bg-primary/5">
              <Blocks className="h-10 w-10 text-slate-700 transition-colors group-hover:text-primary" />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase italic tracking-tighter text-foreground/80 group-hover:text-white">
                CREATE_SANDBOX
              </h4>
              <p className="mt-2 max-w-[200px] text-xs font-medium text-muted-foreground">
                Setup a custom multi-domain environment for your team's specific project.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className="border-none bg-card text-[8px] font-black uppercase text-muted-foreground"
              >
                MULTI_MODAL
              </Badge>
              <Badge
                variant="secondary"
                className="border-none bg-card text-[8px] font-black uppercase text-muted-foreground"
              >
                AI_ASSISTED
              </Badge>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
