'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  UserPlus,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Send,
  Info,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { hackathonsAPI } from '@/lib/api-civilization'

export default function HackathonTeamPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>
}) {
  const router = useRouter()
  const { hackathonId } = use(params)
  const [view, setView] = useState<'selection' | 'create' | 'join'>('selection')
  const [teamName, setTeamName] = useState('')
  const [teamCode, setTeamCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdTeam, setCreatedTeam] = useState<{ id: number; teamCode: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name')
      return
    }

    setLoading(true)
    try {
      const result = await hackathonsAPI.createTeam(Number(hackathonId), teamName)
      if (result.error) {
        throw new Error(result.error || 'Failed to create team')
      }
      const response = result.data as any
      const teamCodeValue = response?.team_code || response?.teamCode || 'N/A'
      setCreatedTeam({ id: response.id || Date.now(), teamCode: teamCodeValue })
      toast.success('Team created successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) {
      toast.error('Please enter a team code')
      return
    }

    setLoading(true)
    try {
      const result = await hackathonsAPI.joinTeam(Number(hackathonId), teamCode)
      if (result.error) {
        throw new Error(result.error || 'Failed to join team')
      }
      toast.success('Joined team successfully!')
      router.push(`/hackathons/${hackathonId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to join team')
    } finally {
      setLoading(false)
    }
  }

  const copyTeamCode = () => {
    if (createdTeam?.teamCode) {
      navigator.clipboard.writeText(createdTeam.teamCode)
      setCopied(true)
      toast.success('Team code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const potentialMatches = [
    {
      name: 'Elena Rodriguez',
      domain: 'Mechanical Engineering',
      skills: ['CAD', 'Robotics', 'FEA'],
      matchScore: 94,
      role: 'Hardware Lead',
    },
    {
      name: 'Karan Singh',
      domain: 'Finance / MBA',
      skills: ['Market Analysis', 'Pitching', 'Valuation'],
      matchScore: 88,
      role: 'Business Strategist',
    },
  ]

  return (
    <div className="animate-in fade-in mx-auto max-w-4xl space-y-8 pb-20 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black italic tracking-tighter text-foreground">
          TEAM <span className="ai-glow text-primary">FORMATION</span>
        </h1>
        <p className="font-medium text-muted-foreground">
          Hackathon ID: #{hackathonId} • Build your dream squad.
        </p>
      </div>

      {/* Created Team Success */}
      {createdTeam && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Team Created! 🎉</h3>
                <p className="mt-1 text-sm text-emerald-400">Share this code with your teammates:</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="rounded bg-black/30 px-3 py-1 text-xl font-mono font-bold text-foreground">
                    {createdTeam.teamCode}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyTeamCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={() => router.push(`/hackathons/${hackathonId}`)}>
                Go to Hackathon
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          onClick={() => setView('create')}
          className={`cursor-pointer border-border transition-all ${view === 'create' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-card hover:bg-card/80'}`}
        >
          <CardHeader>
            <Plus
              className={`mb-2 h-8 w-8 ${view === 'create' ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <CardTitle className="text-lg font-bold text-foreground">CREATE_TEAM</CardTitle>
            <CardDescription className="text-xs">Start a new squad from scratch.</CardDescription>
          </CardHeader>
        </Card>

        <Card
          onClick={() => setView('selection')}
          className={`cursor-pointer border-border transition-all ${view === 'selection' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-card hover:bg-card/80'}`}
        >
          <CardHeader>
            <UserPlus
              className={`mb-2 h-8 w-8 ${view === 'selection' ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <CardTitle className="text-lg font-bold text-foreground">JOIN_TEAM</CardTitle>
            <CardDescription className="text-xs">Enter a secret invite code.</CardDescription>
          </CardHeader>
        </Card>

        <Card
          onClick={() => setView('selection')}
          className={`cursor-pointer border-border transition-all ${view === 'selection' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-card hover:bg-card/80'}`}
        >
          <CardHeader className="relative">
            <Sparkles
              className={`mb-2 h-8 w-8 ${view === 'selection' ? 'text-primary' : 'text-muted-foreground'} animate-pulse`}
            />
            <CardTitle className="text-lg font-bold text-foreground">AI_MATCHMAKER</CardTitle>
            <CardDescription className="text-xs font-bold text-primary">
              Recommended for you.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <AnimatePresence mode="wait">
        {view === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-border bg-background">
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase italic italic">
                  Launch Squad
                </CardTitle>
                <CardDescription>
                  Once created, you'll get a unique invite code for your teammates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    SQUAD_NAME
                  </label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter a legendary team name..."
                    className="h-12 border-border bg-card text-foreground"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCreateTeam}
                  disabled={loading}
                  className="h-12 bg-primary px-10 font-black italic text-primary-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? 'CREATING...' : 'INITIALIZE_TEAM'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {view === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-border bg-background">
              <CardHeader>
                <CardTitle className="text-xl font-black uppercase italic italic">
                  Enter Invite Code
                </CardTitle>
                <CardDescription>Join an existing team organized by your peers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    TEAM CODE
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                      placeholder="E.g. ABC123XYZ"
                      className="h-12 border-border bg-card font-mono uppercase text-foreground"
                    />
                    <Button 
                      onClick={handleJoinTeam}
                      disabled={loading}
                      className="h-12 bg-white px-8 font-black text-black hover:bg-white/90"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'JOIN'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {view === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <Sparkles className="h-6 w-6 shrink-0 text-primary" />
              <div>
                <h4 className="text-sm font-bold uppercase italic text-foreground">
                  AI Matchmaker Active
                </h4>
                <p className="text-xs text-muted-foreground">
                  Scanning for cross-disciplinary partners based on your{' '}
                  <span className="font-bold text-primary">Computer Science</span> profile.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 p-2 opacity-5">
                <ShieldCheck className="h-20 w-20 text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {potentialMatches.map((match, i) => (
                <Card
                  key={i}
                  className="group relative overflow-hidden border-border bg-card transition-all hover:bg-card/80"
                >
                  <div className="absolute right-0 top-0 p-4">
                    <Badge className="border-none bg-primary/20 text-[10px] font-black italic text-primary">
                      {match.matchScore}% MATCH
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="mb-2 h-12 w-12 rounded-full border border-border bg-secondary" />
                    <CardTitle className="text-lg font-bold text-foreground">{match.name}</CardTitle>
                    <CardDescription className="text-xs font-black uppercase text-muted-foreground">
                      {match.domain}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {match.skills.map((s) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="border-none bg-background text-[9px] font-black uppercase text-muted-foreground"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                      <p className="mb-1 text-[10px] font-black uppercase text-muted-foreground">
                        Proposed Role
                      </p>
                      <p className="text-sm font-bold italic text-foreground">
                        {match.role}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border bg-background/20 p-4">
                    <Button
                      variant="ghost"
                      className="w-full text-xs font-black uppercase italic tracking-widest text-muted-foreground hover:text-primary group-hover:bg-primary/5"
                    >
                      SEND_INVITATION <Send className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button
                variant="link"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                <Info className="mr-2 h-4 w-4" /> How are match scores calculated?
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
