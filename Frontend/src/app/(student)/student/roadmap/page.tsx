'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Lock,
  Unlock,
  CheckCircle,
  Sparkles,
  Clock,
  Bot,
  Play,
  ArrowLeft,
  Trophy,
  BookOpen,
  Code2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  coreSkills: string[];
  recommendedProjects: {
    title: string;
    description: string;
    complexity: string;
  }[];
  matchingHackathons: string[];
}

function normalizeRoadmapNode(node: any): RoadmapNode {
  return {
    id: node.id ?? node.nodeId,
    title: node.title,
    description: node.description,
    estimatedMinutes: node.estimatedMinutes ?? (node.estimatedWeeks ? node.estimatedWeeks * 5 * 60 : 60),
    status: node.status === 'UNLOCKED' ? 'IN_PROGRESS' : node.status,
    difficulty: node.difficulty ?? node.category ?? 'BEGINNER',
    coreSkills: node.coreSkills ?? node.skillsRequired ?? node.skillsUnlocked ?? [],
    recommendedProjects: (node.recommendedProjects ?? []).map((project: any) => ({
      title: project.title,
      description: project.description ?? '',
      complexity: project.complexity ?? project.difficulty ?? 'Medium',
    })),
    matchingHackathons: (node.matchingHackathons ?? node.recommendedHackathons ?? []).map((hackathon: any) =>
      typeof hackathon === 'string' ? hackathon : hackathon.title
    ),
  }
}

export default function StudentRoadmapPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [nodes, setNodes] = useState<RoadmapNode[]>([])
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null)
  const [percentCompleted, setPercentCompleted] = useState<number>(0)

  const fetchRoadmap = useCallback(async (domain: string) => {
    setLoading(true)
    try {
      const response = await api.get('/adaptive-learning/roadmap', { params: { domain } })
      const data = response.data.data

      if (data?.roadmap?.nodes?.length) {
        const roadmapNodes = data.roadmap.nodes.map(normalizeRoadmapNode)
        setNodes(roadmapNodes)
        calculateStats(roadmapNodes)
      } else {
        setNodes([])
        calculateStats([])
      }
    } catch (err) {
      console.warn('Roadmap API unavailable', err)
      setNodes([])
      calculateStats([])
      toast.error('Could not load your personalized roadmap', { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user !== undefined) {
      fetchRoadmap(user?.domain || 'Software Engineering')
    }
  }, [user, fetchRoadmap])

  const calculateStats = (nodeList: RoadmapNode[]) => {
    const completed = nodeList.filter(n => n.status === 'COMPLETED').length
    setPercentCompleted(nodeList.length > 0 ? Math.round((completed / nodeList.length) * 100) : 0)
  }

  const handleStartNode = (node: RoadmapNode) => {
    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'IN_PROGRESS' } : n))
    const domain = user?.domain || 'Software Engineering'
    router.push(`/learn/${node.id}?domain=${encodeURIComponent(domain)}&title=${encodeURIComponent(node.title)}`)
  }

  const handleChatWithMentorAboutNode = (node: RoadmapNode) => {
    // Redirect to AI tutor/mentors and pass node context
    router.push(`/ai-companion?topic=${encodeURIComponent(node.title)}`)
  }

  const handleStartPracticeInSandbox = (node: RoadmapNode) => {
    router.push(`/ide?lesson=${encodeURIComponent(node.title)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="relative w-20 h-20 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-blue-500 border-b-purple-500 border-l-slate-800 animate-spin" />
          <Brain className="h-8 w-8 text-indigo-400 animate-pulse" />
        </div>
        <p className="text-sm text-slate-400 font-semibold animate-pulse">Assembling customized roadmap...</p>
      </div>
    )
  }

  if (nodes.length === 0) {
    const domain = user?.domain || 'Software Engineering'
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto min-h-[70vh] flex flex-col justify-center">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="mb-6 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          <div className="rounded-3xl border border-slate-850 bg-slate-900/60 p-8 backdrop-blur-md">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
              <Brain className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">No roadmap generated yet</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Complete the adaptive assessment for {domain}. Your roadmap will be generated from your skill report,
              including strengths, gaps, projects, and recommended hackathons.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.push(`/assessment/onboarding?domain=${encodeURIComponent(domain)}`)}>
                Start Assessment
              </Button>
              <Button variant="outline" onClick={() => router.push('/student/skill-report')}>
                View Skill Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-12 relative overflow-hidden select-none">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 z-10 relative">
        <div className="space-y-2">
          <button
            onClick={() => router.push('/student/dashboard')}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Adaptive Node Roadmap
            </h1>
            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
              AI Personalized
            </Badge>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            A dynamic custom-built conceptual curriculum. Click any node to access projects, sandbox tools, and chat with your domain AI mentor.
          </p>
        </div>

        {/* Status Circle Progress */}
        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
          <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-500"
                strokeWidth="3.2"
                strokeDasharray={`${percentCompleted}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-extrabold">{percentCompleted}%</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-450 block uppercase tracking-wider">Overall Progress</span>
            <span className="text-sm font-bold text-slate-200 block">
              {nodes.filter(n => n.status === 'COMPLETED').length} of {nodes.length} Nodes Mastered
            </span>
          </div>
        </div>
      </div>

      {/* Main Roadmap Area */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-start">
        
        {/* Node Graph Column (Left + Middle) */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden min-h-[500px]">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

          {/* SVG Dependency Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '500px' }}>
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* Draw curve lines connecting nodes vertically */}
            {nodes.map((node, i) => {
              if (i === nodes.length - 1) return null
              // Compute dynamic line positions based on indexing
              const startY = 80 + i * 120 + 28
              const endY = 80 + (i + 1) * 120 - 28
              return (
                <path
                  key={`line-${i}`}
                  d={`M 150 ${startY} C 180 ${(startY + endY) / 2}, 120 ${(startY + endY) / 2}, 150 ${endY}`}
                  fill="none"
                  stroke="url(#gradient-line)"
                  strokeWidth="3.5"
                  strokeDasharray={node.status === 'LOCKED' ? '5,5' : '0'}
                  className="transition duration-350"
                />
              )
            })}
          </svg>

          {/* Interactive Nodes Flow */}
          <div className="relative flex flex-col items-center gap-16 py-10 z-10">
            {nodes.map((node, index) => {
              const isCompleted = node.status === 'COMPLETED'
              const isInProgress = node.status === 'IN_PROGRESS'
              const isLocked = node.status === 'LOCKED'

              return (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: isLocked ? 1 : 1.05 }}
                  whileTap={{ scale: isLocked ? 1 : 0.98 }}
                  onClick={() => !isLocked && setSelectedNode(node)}
                  className={`relative w-72 p-4 rounded-2xl border backdrop-blur-lg flex items-center gap-4 transition duration-300 ${
                    isLocked ? 'cursor-not-allowed bg-slate-900/30 border-slate-850 opacity-45' : 'cursor-pointer bg-slate-950/80 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  } ${
                    isCompleted ? 'border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.05)]' :
                    isInProgress ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse' :
                    'border-slate-800'
                  }`}
                >
                  {/* Status Indicator circle */}
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    isInProgress ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' :
                    'bg-slate-950/40 border-slate-800 text-slate-550'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> :
                     isInProgress ? <Unlock className="h-5 w-5 animate-bounce" /> :
                     <Lock className="h-4 w-4" />}
                  </div>

                  {/* Text details */}
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Node {index + 1}</span>
                    <h3 className="font-bold text-sm truncate text-slate-100">{node.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{node.description}</p>
                  </div>

                  {/* Level tag */}
                  <span className="absolute -top-2.5 right-4 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-450">
                    {node.difficulty}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Detail Sidebar / Selected Node view (Right) */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key="detail-active"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl backdrop-blur-md space-y-6 shadow-xl"
              >
                {/* Node info header */}
                <div className="space-y-2 border-b border-slate-850 pb-5">
                  <div className="flex justify-between items-center text-xs font-semibold text-indigo-400">
                    <span>CONCEPT BREAKDOWN</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      selectedNode.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedNode.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-slate-850 text-slate-400'
                    }`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold leading-tight">{selectedNode.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedNode.description}</p>
                </div>

                {/* Sub-skills */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Targeted Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.coreSkills.map(sk => (
                      <span key={sk} className="text-[10px] font-semibold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850 text-slate-350">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Project */}
                {selectedNode.recommendedProjects?.length > 0 && (
                  <div className="space-y-3 bg-slate-950/40 border border-slate-850/80 p-4 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Recommended Project</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{selectedNode.recommendedProjects[0].title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        {selectedNode.recommendedProjects[0].description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ~{selectedNode.estimatedMinutes} mins
                      </span>
                      <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                        {selectedNode.recommendedProjects[0].complexity}
                      </span>
                    </div>
                  </div>
                )}

                {/* Matching Hackathons */}
                {selectedNode.matchingHackathons?.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/10 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                      <Trophy className="h-3.5 w-3.5 animate-pulse" />
                      <span>Matching Live Hackathons</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Build your project and submit it to <strong className="text-slate-300">{selectedNode.matchingHackathons[0]}</strong> to win developer points!
                    </p>
                  </div>
                )}

                {/* CTA actions */}
                <div className="space-y-2 pt-2 border-t border-slate-850">
                  {selectedNode.status === 'LOCKED' ? (
                    <Button disabled className="w-full bg-slate-800 cursor-not-allowed">
                      <Lock className="mr-2 h-4 w-4" /> Locked
                    </Button>
                  ) : (
                    <>
                      {/* Read AI-generated lesson */}
                      <Button
                        onClick={() => handleStartNode(selectedNode)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        {selectedNode.status === 'COMPLETED' ? 'Re-read Lesson' : selectedNode.status === 'IN_PROGRESS' ? 'Continue Lesson' : 'Start AI Lesson'}
                      </Button>

                      <Button
                        onClick={() => handleStartPracticeInSandbox(selectedNode)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold"
                      >
                        <Code2 className="mr-2 h-4 w-4" /> Practice in IDE Sandbox
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleChatWithMentorAboutNode(selectedNode)}
                        className="w-full border-slate-800 hover:bg-slate-850"
                      >
                        <Bot className="mr-2 h-4 w-4 text-indigo-400" /> Ask AI Mentor
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/40 border border-slate-850 p-8 rounded-3xl backdrop-blur-md text-center space-y-4"
              >
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-200">Select a Roadmap Node</h3>
                <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                  Click on any unlocked node to unlock recommended projects, active sandbox, and mentor chat links.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick AI Advisor */}
          <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Bot className="h-4 w-4 animate-bounce" />
              <span>AI Advisor Note</span>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed font-medium">
              We adjust question generators automatically based on active nodes. Complete sandbox challenges to speed up your level unlocks!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
