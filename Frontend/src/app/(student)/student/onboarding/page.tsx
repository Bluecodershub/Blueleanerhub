'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  GraduationCap,
  Building,
  Calendar,
  Compass,
  Zap,
  Target,
  FileText,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
  Bookmark
} from 'lucide-react'
import { Github, Linkedin } from '@/components/ui/BrandIcons'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function OnboardingPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Onboarding Form States
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [educationLevel, setEducationLevel] = useState('Bachelor of Technology')
  const [graduationYear, setGraduationYear] = useState('2028')
  const [domain, setDomain] = useState('cs')
  const [skillLevel, setSkillLevel] = useState('beginner')
  const [careerGoal, setCareerGoal] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login/student')
    } else if (user) {
      setFullName(user.fullName || user.name || '')
      setCollegeName(user.collegeName || '')
      if (user.graduationYear) setGraduationYear(user.graduationYear.toString())
      if (user.linkedinUrl) setLinkedinUrl(user.linkedinUrl)
      if (user.githubUrl) setGithubUrl(user.githubUrl)
      if (user.portfolioUrl) setPortfolioUrl(user.portfolioUrl)
    }
  }, [user, isAuthenticated, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Handle URL valid checks
  const isValidUrl = (urlStr: string) => {
    if (!urlStr) return true // optional
    try {
      const url = new URL(urlStr)
      return url.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Handle step transitions and validators
  const handleNext = () => {
    setValidationError(null)
    if (step === 1) {
      if (!fullName.trim()) {
        setValidationError('Full Name is required')
        return
      }
      if (!phone.trim() || !/^\+?[0-9\s-]{10,15}$/.test(phone)) {
        setValidationError('Please enter a valid 10-15 digit phone number')
        return
      }
      if (!collegeName.trim()) {
        setValidationError('College/Institution name is required')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!careerGoal.trim()) {
        setValidationError('Please share a brief career goal')
        return
      }
      setStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Final validators
    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      setValidationError('LinkedIn URL must be a valid HTTPS link')
      return
    }
    if (githubUrl && !isValidUrl(githubUrl)) {
      setValidationError('GitHub URL must be a valid HTTPS link')
      return
    }
    if (portfolioUrl && !isValidUrl(portfolioUrl)) {
      setValidationError('Portfolio URL must be a valid HTTPS link')
      return
    }

    setSubmitting(true)
    try {
      const profileData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        collegeName: collegeName.trim(),
        educationLevel,
        graduationYear: parseInt(graduationYear, 10),
        domain,
        preferences: { skillLevel },
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        bio: careerGoal.trim(),
      }

      await api.put('/auth/profile', profileData)
      await refreshUser(true)
      
      toast.success('Welcome to Bluelearnerhub! Your profile is configured.')
      router.replace('/student/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to complete profile onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      {/* Visual Dot-Grid fixed Background Treatment */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background radial-dot-grid" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[550px] space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
              Profile Onboarding wizard · Step {step} of 3
            </span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-foreground uppercase tracking-tight">
            Complete Your Setup
          </h1>
          <p className="text-xs text-muted-foreground font-mono max-w-sm mx-auto">
            Let\'s configure your track so AI systems can optimize your quizzes and corporate routes.
          </p>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-mono"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            {validationError}
          </motion.div>
        )}

        {/* Wizard Panel Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm glass">
          
          {/* Steps Progress Visuals */}
          <div className="mb-6 flex items-center justify-between px-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-300',
                    step >= num
                      ? 'bg-primary text-black border-primary shadow-sm'
                      : 'bg-secondary text-muted-foreground border border-border'
                  )}
                >
                  {num}
                </div>
                {num < 3 && <div className={cn('h-[2px] w-20 sm:w-28 bg-border', step > num && 'bg-primary')} />}
              </div>
            ))}
          </div>

          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Step 1: Personal & Institutional */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-bold font-mono uppercase tracking-wide">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold font-mono uppercase tracking-wide">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-xs font-bold font-mono uppercase tracking-wide">College / Institution</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="college"
                        type="text"
                        placeholder="Indian Institute of Technology"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="pl-10 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-xs font-bold font-mono uppercase tracking-wide">Degree</Label>
                      <div className="relative">
                        <select
                          id="education"
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="Bachelor of Technology">B.Tech / B.E.</option>
                          <option value="Master of Technology">M.Tech / M.E.</option>
                          <option value="Bachelor of Science">B.Sc / BCA</option>
                          <option value="Master of Business Administration">MBA</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gradYear" className="text-xs font-bold font-mono uppercase tracking-wide">Graduation Year</Label>
                      <div className="relative">
                        <select
                          id="gradYear"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="2029">2029</option>
                          <option value="2030">2030</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Step 2: Domain & Level */}
                  <div className="space-y-2">
                    <Label htmlFor="domain" className="text-xs font-bold font-mono uppercase tracking-wide">Primary Domain of Interest</Label>
                    <div className="relative">
                      <select
                        id="domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="cs">Computer Science & Programming</option>
                        <option value="mechanical">Mechanical Engineering</option>
                        <option value="electrical">Electrical & Electronics</option>
                        <option value="management">Management / MBA</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill" className="text-xs font-bold font-mono uppercase tracking-wide">Current Skill Level</Label>
                    <div className="relative">
                      <select
                        id="skill"
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="beginner">Beginner (No prior coding / industrial knowledge)</option>
                        <option value="intermediate">Intermediate (Academic experience, basic projects)</option>
                        <option value="advanced">Advanced (Industrial familiarity, solid developer)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="career" className="text-xs font-bold font-mono uppercase tracking-wide">Brief Career Goal</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <textarea
                        id="career"
                        rows={3}
                        placeholder="e.g. Aspiring full-stack software engineer with a focus on React, Node.js, and cloud systems."
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        className="w-full rounded-lg border border-input bg-card pl-10 pr-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {/* Step 3: Links & Resume */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-xs font-bold font-mono uppercase tracking-wide">LinkedIn Profile URL</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="pl-10 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github" className="text-xs font-bold font-mono uppercase tracking-wide">GitHub Profile URL</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="github"
                        type="url"
                        placeholder="https://github.com/username"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="pl-10 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio" className="text-xs font-bold font-mono uppercase tracking-wide">Portfolio Link</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="portfolio"
                        type="url"
                        placeholder="https://myportfolio.com"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="pl-10 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-xs font-bold font-mono uppercase tracking-wide">Resume Upload</Label>
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/40 p-4 transition-colors hover:bg-card/75">
                      <div className="text-center space-y-1">
                        <FileText className="mx-auto h-7 w-7 text-muted-foreground opacity-60" />
                        <div className="flex text-xs text-muted-foreground font-mono">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-bold text-primary hover:underline"
                          >
                            <span>Select a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="sr-only"
                              onChange={(e) => {
                                const files = e.target.files
                                if (files && files.length > 0) {
                                  setResumeFile(files[0])
                                }
                              }}
                            />
                          </label>
                          <span className="pl-1">or drag and drop</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">PDF, DOC, DOCX up to 10MB</p>
                        {resumeFile && (
                          <div className="mt-2 text-xs font-mono font-bold text-amber-500 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {resumeFile.name} (upload coming soon)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Handles */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="font-mono text-xs gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="font-mono text-xs gap-1.5"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="font-mono text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  {submitting ? 'Finishing setup...' : 'Complete Profile'}
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  )
}
