'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, CheckCircle2, Play, BookOpen, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn, setStorageItem } from '@/lib/utils'

interface OnboardingTourProps {
  onComplete: () => void
  isFirstTime: boolean
}

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to BlueLearnerHub! 🎉',
    description: "You're about to start an amazing learning journey. Let us show you around.",
    icon: Play,
    action: 'Next',
  },
  {
    id: 'daily-quiz',
    title: 'Daily AI Quiz',
    description: 'Every day, we generate a personalized quiz just for you based on your skill level. Complete it to earn XP and maintain your streak!',
    icon: Target,
    action: 'Start Quiz',
    href: '/daily-quiz',
  },
  {
    id: 'learning-tracks',
    title: 'Structured Learning Tracks',
    description: 'Follow expert-designed learning paths from beginner to advanced. Each track is packed with hands-on exercises and real projects.',
    icon: BookOpen,
    action: 'Explore Tracks',
    href: '/learning-tracks',
  },
  {
    id: 'hackathons',
    title: 'Weekly Hackathons',
    description: 'Compete with other learners in AI-generated challenges. Win prizes, earn badges, and climb the global leaderboard!',
    icon: Trophy,
    action: 'View Hackathons',
    href: '/hackathons',
  },
  {
    id: 'complete',
    title: "You're All Set! 🚀",
    description: "That's everything you need to know. Start learning now, and don't forget to maintain your daily streak!",
    icon: CheckCircle2,
    action: "Let's Go!",
  },
]

export function OnboardingTour({ onComplete, isFirstTime: _isFirstTime }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const handleComplete = useCallback(() => {
    setIsVisible(false)
    setStorageItem('onboarding_completed', 'true')
    setTimeout(onComplete, 300)
  }, [onComplete])

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, handleComplete])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    handleComplete()
  }, [handleComplete])

  if (!isVisible) return null

  const currentStepData = tourSteps[currentStep]
  const Icon = currentStepData.icon
  const isLastStep = currentStep === tourSteps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
                <button
                  onClick={handleSkip}
                  className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Progress indicators */}
                <div className="mb-6 flex items-center justify-center gap-2">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        index === currentStep
                          ? 'w-8 bg-primary'
                          : index < currentStep
                          ? 'w-2 bg-primary/50'
                          : 'w-2 bg-secondary'
                      )}
                    />
                  ))}
                </div>

                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <Icon className="h-12 w-12 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h2 className="mb-3 text-2xl font-bold text-foreground">{currentStepData.title}</h2>
                  <p className="text-muted-foreground">{currentStepData.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-4 border-t border-border/50 p-6">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex gap-3">
                  {isLastStep ? (
                    <Button onClick={handleComplete} className="gap-2">
                      {currentStepData.action}
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  ) : currentStepData.href ? (
                    <Link href={currentStepData.href}>
                      <Button onClick={handleComplete} className="gap-2">
                        {currentStepData.action}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={handleNext} className="gap-2">
                      {currentStepData.action}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed')
    if (!completed) {
      setIsFirstTime(true)
      setShowTour(true)
    }
  }, [])

  const completeTour = useCallback(() => {
    setShowTour(false)
  }, [])

  const resetTour = useCallback(() => {
    localStorage.removeItem('onboarding_completed')
    setIsFirstTime(true)
    setShowTour(true)
  }, [])

  return {
    isFirstTime,
    showTour,
    completeTour,
    resetTour,
  }
}
