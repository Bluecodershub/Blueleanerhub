'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Users, Clock, Star, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface LearningPathCardProps {
  id: number
  title: string
  description: string
  domain: string
  difficulty: string
  coursesCount: number
  lessonsCount: number
  duration: number // hours
  enrolledCount: number
  rating: number
  reviewsCount: number
  thumbnail?: string
  progress?: number
  isEnrolled?: boolean
  prerequisites?: string[]
}

export default function LearningPathCard({
  id,
  title,
  description,
  domain,
  difficulty,
  coursesCount,
  duration,
  enrolledCount,
  rating,
  reviewsCount,
  thumbnail,
  progress = 0,
  isEnrolled = false,
  prerequisites = [],
}: LearningPathCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group flex h-full flex-col overflow-hidden border-gray-700 bg-gray-800 transition-all hover:border-sky-500">
        {/* Thumbnail */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-sky-600 to-primary">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-20 w-20 text-white/30" />
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
            <Badge className="border-0 bg-white/90 text-gray-900">{domain}</Badge>
            <div className="flex items-center gap-1 rounded bg-black/60 px-2 py-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-white">{rating}</span>
              <span className="text-xs text-gray-300">({reviewsCount})</span>
            </div>
          </div>

          {/* Progress Indicator (if enrolled) */}
          {isEnrolled && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-white">{progress}% Complete</span>
                <TrendingUp className="h-4 w-4 text-sky-400" />
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col space-y-4 p-6">
          {/* Title & Description */}
          <div className="flex-1">
            <h3 className="mb-2 line-clamp-2 text-xl font-bold text-white transition-colors group-hover:text-sky-400">
              {title}
            </h3>
            <p className="line-clamp-3 text-sm text-gray-400">{description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sky-400" />
              <span>{coursesCount} courses</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-400" />
              <span>{enrolledCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span>{duration}h total</span>
            </div>
            <div>
              <Badge variant="outline" className="text-xs capitalize">
                {difficulty}
              </Badge>
            </div>
          </div>

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div>
              <div className="mb-2 text-xs text-gray-500">Prerequisites:</div>
              <div className="flex flex-wrap gap-1">
                {prerequisites.slice(0, 2).map((prereq, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {prereq}
                  </Badge>
                ))}
                {prerequisites.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{prerequisites.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Link href={`/learn/paths/${id}`} className="w-full">
            <Button className="w-full" variant={isEnrolled ? 'outline' : 'default'}>
              {isEnrolled ? 'Continue Learning' : 'Start Learning'}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}
