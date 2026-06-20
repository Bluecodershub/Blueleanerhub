'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Brain,
  Wrench,
  BookOpen,
  Send,
  Loader2,
  CheckCircle,
  Award,
  ChevronRight,
  Gauge,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface OnboardingBackground {
  domain: string;
  goals: string[];
  educationLevel: string;
  currentExperience: string;
  preferredLearningStyle: string;
  availableHoursPerDay: number;
  confidenceLevel: number;
  preferredLanguage: string;
  careerSwitchInfo?: string;
  hackathonInterest: boolean;
  toolFamiliarity: string[];
}

function normalizeAssessmentDomain(value: string | null): string {
  const normalized = value?.toLowerCase().trim()
  if (!normalized) return 'Software Engineering'
  if (normalized.includes('mechanical')) return 'Mechanical Engineering'
  if (normalized.includes('electrical') || normalized.includes('electronics')) return 'Electronics Engineering'
  if (normalized.includes('civil')) return 'Civil Engineering'
  if (normalized.includes('robot')) return 'Robotics Engineering'
  return 'Software Engineering'
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()
  const requestedDomain = normalizeAssessmentDomain(searchParams.get('domain'))

  // State coordination
  const [step, setStep] = useState<'welcome' | 'background' | 'quiz' | 'analyzing' | 'completed'>('welcome')
  const [loading, setLoading] = useState(false)
  const [domain, setDomain] = useState<string>(requestedDomain)

  // Part 1: Background details
  const [background, setBackground] = useState<OnboardingBackground>({
    domain: requestedDomain,
    goals: [],
    educationLevel: 'Undergraduate Student',
    currentExperience: 'Beginner',
    preferredLearningStyle: 'Practical Projects',
    availableHoursPerDay: 2,
    confidenceLevel: 5,
    preferredLanguage: 'English',
    careerSwitchInfo: '',
    hackathonInterest: true,
    toolFamiliarity: []
  })

  // Part 2: Quiz details
  const [assessmentId, setAssessmentId] = useState<string>('')
  const [quizStep, setQuizStep] = useState<number>(0)
  const [totalQuizSteps, setTotalQuizSteps] = useState<number>(5)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [openAnswer, setOpenAnswer] = useState<string>('')
  const [confidenceRating, setConfidenceRating] = useState<number>(5)
  const [timeLeft, setTimeLeft] = useState<number>(90) // 90 seconds per question

  // Part 3: Result details
  const [levelResults, setLevelResults] = useState<any>(null)

  useEffect(() => {
    handleDomainSelect(requestedDomain)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedDomain])

  // Redirect onboarded users
  useEffect(() => {
    if (user?.domain && step === 'welcome') {
      router.push('/student/dashboard')
    }
  }, [user, router, step])

  // Reset timer when question changes
  useEffect(() => {
    if (step === 'quiz') setTimeLeft(90)
  }, [quizStep, step])

  // Countdown timer — auto-submits with empty answer when it hits 0
  useEffect(() => {
    if (step !== 'quiz' || loading) return
    if (timeLeft <= 0) {
      // Auto-submit with whatever answer is currently selected (or blank)
      const answer = currentQuestion?.options ? (selectedOption || '0') : (openAnswer || 'No answer provided — time expired')
      api.post('/adaptive-learning/assessment/answer', {
        assessmentId,
        userAnswer: answer,
        confidenceRating: 1
      }).then(res => {
        const data = res.data.data
        if (data.status === 'COMPLETED') {
          setStep('analyzing')
          handleFinalizeQuiz()
        } else {
          setQuizStep(data.currentStep)
          setCurrentQuestion(data.question)
          setSelectedOption('')
          setOpenAnswer('')
          setConfidenceRating(5)
        }
      }).catch((err) => {
        console.error('Timer auto-submit failed', err)
        toast.error('Connection error — please answer manually')
      })
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, step])

  const handleStartOnboarding = () => {
    setStep('background')
  }

  const handleDomainSelect = (selectedDomain: string) => {
    setDomain(selectedDomain)
    setBackground(prev => ({
      ...prev,
      domain: selectedDomain,
      toolFamiliarity: [] // Reset tools
    }))
  }

  const toggleGoal = (goal: string) => {
    setBackground(prev => {
      const hasGoal = prev.goals.includes(goal)
      return {
        ...prev,
        goals: hasGoal ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal]
      }
    })
  }

  const toggleTool = (tool: string) => {
    setBackground(prev => {
      const hasTool = prev.toolFamiliarity.includes(tool)
      return {
        ...prev,
        toolFamiliarity: hasTool ? prev.toolFamiliarity.filter(t => t !== tool) : [...prev.toolFamiliarity, tool]
      }
    })
  }

  // Submits background and initializes Quiz
  const handleSubmitBackground = async () => {
    if (background.goals.length === 0) {
      toast.error('Please select at least one learning goal')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/adaptive-learning/onboarding', background)
      const data = response.data.data
      setAssessmentId(data.assessmentId)
      setQuizStep(data.currentStep)
      setTotalQuizSteps(data.totalQuestions)
      setCurrentQuestion(data.question)
      setStep('quiz')
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit background details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Submit single quiz answer
  const handleSubmitAnswer = async () => {
    const answer = currentQuestion.options ? selectedOption : openAnswer
    if (!answer && answer !== '0') {
      toast.error('Please provide an answer to continue')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/adaptive-learning/assessment/answer', {
        assessmentId,
        userAnswer: answer,
        confidenceRating
      })

      const data = response.data.data

      // Check if completed
      if (data.status === 'COMPLETED') {
        setStep('analyzing')
        await handleFinalizeQuiz()
      } else {
        setQuizStep(data.currentStep)
        setCurrentQuestion(data.question)
        setSelectedOption('')
        setOpenAnswer('')
        setConfidenceRating(5)
        toast.success('Answer recorded adaptively!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit answer')
    } finally {
      setLoading(false)
    }
  }

  // Runs AI Analyzer and sets results
  const handleFinalizeQuiz = async () => {
    try {
      const response = await api.post('/adaptive-learning/assessment/finalize', { domain })
      setLevelResults(response.data.data)

      // Run the 3.5 s animation and the refreshUser call concurrently.
      // Both must finish before we advance to the completed step, so the
      // displayed level/rank always reflects the updated user profile.
      await Promise.all([
        refreshUser(),
        new Promise<void>(resolve => setTimeout(resolve, 3500)),
      ])

      setStep('completed')
    } catch (err) {
      console.error(err)
      toast.error('Failed to analyze quiz results')
      setStep('quiz')
    }
  }

  // Available Tools per Domain
  const getToolsByDomain = (dom: string) => {
    switch (dom) {
      case 'Software Engineering':
        return ['React/Next.js', 'Node.js/Express', 'Git & GitHub', 'Docker/Containers', 'PostgreSQL/MongoDB', 'Python/FastAPI'];
      case 'Robotics Engineering':
        return ['ROS/ROS2', 'Gazebo Simulator', 'OpenCV/Vision', 'Arduino/ESP32', 'Raspberry Pi', 'LiDAR & IMUs'];
      case 'Mechanical Engineering':
        return ['SolidWorks', 'AutoCAD', 'Ansys FEA', 'MATLAB/Simulink', '3D Printing/Slicers', 'CNC Programming'];
      case 'Electronics Engineering':
        return ['KiCad/Altium Designer', 'Multisim/LTSpice', 'Verilog/VHDL', 'STM32 microcontrollers', 'Oscilloscopes', 'I2C/SPI protocols'];
      case 'Civil Engineering':
        return ['Revit/BIM', 'SAP2000', 'STAAD Pro', 'GIS Systems', 'AutoCAD Civil 3D', 'Concrete Mix calculators'];
      default:
        return ['Agile methodologies', 'Framer / UX prototyping', 'Visual analytics', 'API integrations'];
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl text-center space-y-8 z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">
              <Sparkles className="h-4 w-4 animate-pulse" />
              AI Adaptive Learning Layer
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-sky-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              Welcome to BlueLearnerHub
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
              Our engineering learning system adaptively evaluates your starting skills, defines custom conceptual placement, and drafts a fully personalized roadmap for success.
            </p>
            <div className="flex justify-center pt-4">
              <button
                onClick={handleStartOnboarding}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-500 hover:to-sky-500 text-white font-semibold rounded-xl transition duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] focus:outline-none"
              >
                Start Onboarding
                <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition duration-200" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1 & 2: Background Form */}
        {step === 'background' && (
          <motion.div
            key="background"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl z-10 space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Onboarding Background Quiz</h2>
                <p className="text-slate-400 text-sm">Tell us about your learning goals and tech domain.</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Brain className="h-5 w-5" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Domain Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300">Engineering Domain</label>
                <div className="grid grid-cols-1 gap-2">
                  {['Software Engineering', 'Robotics Engineering', 'Mechanical Engineering', 'Electronics Engineering', 'Civil Engineering'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDomainSelect(d)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition duration-200 ${
                        domain === d
                          ? 'bg-sky-600/15 border-sky-500 text-sky-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Goals */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300">Learning Goals</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Learn Core Concepts',
                      'Build Portfolio Projects',
                      'Win Hackathons',
                      'Career Switch',
                      'Interview Prep',
                      'Research & Dev'
                    ].map(goal => {
                      const isSelected = background.goals.includes(goal)
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition duration-200 ${
                            isSelected
                              ? 'bg-sky-600/20 border-sky-500 text-sky-300'
                              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          {goal}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Experience & Study Info */}
                <div className="space-y-3 pt-4">
                  <label className="text-sm font-semibold text-slate-300">Education & Work Experience</label>
                  <select
                    value={background.educationLevel}
                    onChange={e => setBackground(prev => ({ ...prev, educationLevel: e.target.value }))}
                    className="w-full bg-slate-950/40 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-sky-500 transition duration-200"
                  >
                    <option value="Undergraduate Student">Undergraduate Student</option>
                    <option value="Graduate/Master Student">Graduate/Master Student</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Self-Taught Builder">Self-Taught Builder</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tool Familiarity & Study Hours */}
            <div className="space-y-5 border-t border-slate-800/80 pt-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300">Familiar Tools & Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {getToolsByDomain(domain).map(tool => {
                    const isSelected = background.toolFamiliarity.includes(tool)
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleTool(tool)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition duration-200 ${
                          isSelected
                            ? 'bg-emerald-600/15 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <Wrench className="h-3 w-3" />
                        {tool}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Available Hours */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-300">Available study hours per day</span>
                    <span className="text-sky-400 font-bold">{background.availableHoursPerDay} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={background.availableHoursPerDay}
                    onChange={e => setBackground(prev => ({ ...prev, availableHoursPerDay: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Self Confidence */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-300">Self-rated domain confidence</span>
                    <span className="text-sky-400 font-bold">{background.confidenceLevel} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={background.confidenceLevel}
                    onChange={e => setBackground(prev => ({ ...prev, confidenceLevel: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleSubmitBackground}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-500 hover:to-sky-500 text-white font-bold rounded-xl transition duration-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Proceed to Technical Assessment'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Adaptive Technical Quiz */}
        {step === 'quiz' && currentQuestion && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl z-10 space-y-8"
          >
            {/* Header / Steps Indicator */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-850">
                    <Gauge className="h-3 w-3 text-sky-400" />
                    Question {quizStep + 1} / {totalQuizSteps}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    currentQuestion.type === 'MCQ' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                    currentQuestion.type === 'DEBUG' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    currentQuestion.type === 'LOGIC' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  }`}>
                    {currentQuestion.type || 'MCQ'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    currentQuestion.difficulty === 'EXPERT' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    currentQuestion.difficulty === 'HARD' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    currentQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  {/* Countdown Timer */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border font-bold text-xs tabular-nums transition-colors ${
                    timeLeft <= 15 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' :
                    timeLeft <= 30 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                    'bg-slate-950/60 border-slate-850 text-slate-300'
                  }`}>
                    ⏱ {Math.floor(timeLeft / 60).toString().padStart(2,'0')}:{(timeLeft % 60).toString().padStart(2,'0')}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-500 transition-all duration-300"
                  style={{ width: `${((quizStep + 1) / totalQuizSteps) * 100}%` }}
                />
              </div>
              {/* Timer bar */}
              <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${timeLeft <= 15 ? 'bg-red-500' : timeLeft <= 30 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  style={{ width: `${(timeLeft / 90) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold leading-snug">{currentQuestion.question}</h3>

              {/* Coding Starter Block */}
              {currentQuestion.starterCode && (
                <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 font-mono text-xs text-sky-300 leading-relaxed overflow-x-auto">
                  <pre>{currentQuestion.starterCode}</pre>
                </div>
              )}
            </div>

            {/* Answers Choice / Input */}
            <div className="space-y-3">
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                // Multiple Choice Answers
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.options.map((opt: string, index: number) => {
                    const strIndex = String(index)
                    const isSelected = selectedOption === strIndex
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedOption(strIndex)}
                        className={`text-left px-5 py-4 rounded-xl border text-sm font-semibold transition duration-200 flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-600/15 border-sky-500 text-sky-300 shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle className="h-5 w-5 text-sky-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              ) : (
                // Open Technical Question
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Explain your analysis or code correction</label>
                  <textarea
                    rows={4}
                    value={openAnswer}
                    onChange={e => setOpenAnswer(e.target.value)}
                    placeholder="Provide your explain answer or bug corrections in short here..."
                    className="w-full bg-slate-950/40 border border-slate-850 hover:border-slate-800 text-slate-200 px-4 py-3 rounded-xl text-sm font-mono focus:outline-none focus:border-sky-500 transition duration-200 placeholder:text-slate-650"
                  />
                </div>
              )}
            </div>

            {/* Confidence Slider */}
            <div className="space-y-3 bg-slate-950/20 border border-slate-850 rounded-xl p-4">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Self-assessed confidence level for this topic:</span>
                <span className="text-sky-400 font-bold">{confidenceRating} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={confidenceRating}
                onChange={e => setConfidenceRating(Number(e.target.value))}
                className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Action */}
            <div className="flex justify-end pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-500 hover:to-sky-500 text-white font-bold rounded-xl transition duration-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  quizStep + 1 === totalQuizSteps ? 'Submit and Analyze Skills' : 'Next Question'
                )}
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading / AI Analyzer Screen */}
        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8 z-10 flex flex-col items-center"
          >
            {/* Spinning Brain Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 border-r-sky-500 border-b-purple-500 border-l-slate-800 animate-spin" />
              <Brain className="h-12 w-12 text-sky-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 via-sky-400 to-purple-400 bg-clip-text text-transparent leading-none">
                AI Architect Skill Analysis...
              </h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto animate-pulse">
                Evaluating answers, evaluating complexity factors, placing skill scores and conceptual roadmap nodes...
              </p>
            </div>
          </motion.div>
        )}

        {/* Finalized / Success Placement Cards */}
        {step === 'completed' && levelResults && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl z-10 text-center space-y-8"
          >
            {/* Confetti / Sparkles */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Award className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight leading-none">Placement Completed!</h2>
              <p className="text-slate-400 text-sm">Our AI analyzer has formulated your placement level.</p>
            </div>

            {/* Main Level score display */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-6 flex items-center justify-around">
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Placement Level</span>
                <span className="text-5xl font-extrabold bg-gradient-to-r from-sky-400 to-sky-400 bg-clip-text text-transparent block mt-1">
                  Level {levelResults.scores?.overallLevel || 1}
                </span>
              </div>
              <div className="h-12 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Estimated Rank</span>
                <span className="text-xl font-bold text-sky-300 block mt-3">
                  {levelResults.scores?.estimatedLevel || 'BEGINNER'}
                </span>
              </div>
            </div>

            {/* Strengths & Skill Gaps Preview */}
            <div className="grid grid-cols-1 gap-4 text-left">
              {levelResults.scores?.strengths?.length > 0 && (
                <div className="space-y-2 bg-slate-950/20 border border-slate-850 p-4 rounded-xl">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">AI Detected Strengths</span>
                  <ul className="text-slate-300 text-xs space-y-1.5">
                    {levelResults.scores.strengths.slice(0, 2).map((str: string) => (
                      <li key={str} className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {levelResults.scores?.skillGaps?.length > 0 && (
                <div className="space-y-2 bg-slate-950/20 border border-slate-850 p-4 rounded-xl">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">Next Targeted Concepts</span>
                  <ul className="text-slate-300 text-xs space-y-1.5">
                    {levelResults.scores.skillGaps.slice(0, 2).map((gap: string) => (
                      <li key={gap} className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-sky-450" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Call to action — go straight to the personalised roadmap (the recommendation output) */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/student/roadmap')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-500 hover:to-sky-500 text-white font-bold rounded-xl transition duration-200"
              >
                View My Personalised Roadmap
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/student/dashboard')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/60"
              >
                Go to dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <OnboardingContent />
    </React.Suspense>
  )
}
