'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Award, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface TutorialCardProps {
  id: number
  title: string
  description: string
  domain: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  duration: number // in minutes
  lessonsCount: number
  enrolledCount: number
  thumbnail?: string
  progress?: number // 0-100
  isEnrolled?: boolean
  tags?: string[]
}

export default function TutorialCard({
  id,
  title,
  description,
  domain,
  difficulty,
  duration,
  lessonsCount,
  enrolledCount,
  thumbnail,
  progress = 0,
  isEnrolled = false,
  tags = [],
}: TutorialCardProps) {
  const difficultyColors = {
    easy: 'bg-blue-500/10 text-primary/80 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    hard: 'bg-primary/10 text-foreground/80 border-border',
    expert: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  const domainColors: Record<string, string> = {
    'computer-science': 'bg-primary',
    mechanical: 'bg-primary',
    electrical: 'bg-yellow-500',
    civil: 'bg-blue-500',
    chemical: 'bg-purple-500',
    management: 'bg-violet-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/tutorials/${id}`}>
        <Card className="group h-full cursor-pointer overflow-hidden border-gray-700 bg-gray-800 transition-all hover:border-blue-500">
          {/* Thumbnail */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-600" />
              </div>
            )}

            {/* Domain Badge */}
            <div className="absolute left-3 top-3">
              <Badge className={`${domainColors[domain] || 'bg-gray-600'} border-0 text-white`}>
                {domain
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </Badge>
            </div>

            {/* Difficulty Badge */}
            <div className="absolute right-3 top-3">
              <Badge className={`${difficultyColors[difficulty]} border`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <Play className="ml-1 h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 p-5">
            {/* Title */}
            <h3 className="line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
              {title}
            </h3>

            {/* Description */}
            <p className="line-clamp-2 text-sm text-gray-400">{description}</p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-gray-600 bg-gray-900 text-xs text-gray-400"
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="border-gray-600 bg-gray-900 text-xs text-gray-400"
                  >
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{lessonsCount} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{duration}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{enrolledCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Progress Bar (if enrolled) */}
            {isEnrolled && (
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span className="font-semibold text-blue-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
