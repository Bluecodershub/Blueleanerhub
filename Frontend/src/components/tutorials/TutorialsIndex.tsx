'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Code2, 
  Database, 
  FileCode, 
  Palette, 
  Terminal, 
  Brain, 
  Cpu,
  ChevronRight,
  Search,
  CheckCircle2,
  Star
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Tutorial {
  id: string
  title: string
  description: string
  icon: React.ElementType
  lessons: number
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  color: string
  bgColor: string
  topics: string[]
}

const tutorials: Tutorial[] = [
  {
    id: 'python',
    title: 'Python Tutorial',
    description: 'Learn Python, one of the most popular programming languages. Perfect for beginners and professionals alike.',
    icon: Terminal,
    lessons: 45,
    level: 'Beginner',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    topics: ['Syntax', 'Variables', 'Functions', 'OOP', 'File Handling']
  },
  {
    id: 'javascript',
    title: 'JavaScript Tutorial',
    description: 'Master JavaScript, the language of the web. Build interactive websites and applications.',
    icon: Code2,
    lessons: 52,
    level: 'Beginner',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    topics: ['DOM', 'Events', 'AJAX', 'ES6+', 'Async']
  },
  {
    id: 'html',
    title: 'HTML Tutorial',
    description: 'Learn HTML5 from scratch. The building blocks of every web page.',
    icon: FileCode,
    lessons: 28,
    level: 'Beginner',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    topics: ['Elements', 'Forms', 'Semantics', 'Media', 'APIs']
  },
  {
    id: 'css',
    title: 'CSS Tutorial',
    description: 'Master CSS for styling web pages. Create beautiful, responsive designs.',
    icon: Palette,
    lessons: 38,
    level: 'Beginner',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    topics: ['Selectors', 'Box Model', 'Flexbox', 'Grid', 'Animations']
  },
  {
    id: 'sql',
    title: 'SQL Tutorial',
    description: 'Learn SQL for database management. Essential for any data-driven application.',
    icon: Database,
    lessons: 32,
    level: 'Intermediate',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    topics: ['SELECT', 'WHERE', 'JOIN', 'GROUP BY', 'Subqueries']
  },
  {
    id: 'react',
    title: 'React Tutorial',
    description: 'Build modern web apps with React. The most popular JavaScript library.',
    icon: Brain,
    lessons: 48,
    level: 'Intermediate',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    topics: ['Components', 'Hooks', 'State', 'Props', 'Router']
  },
  {
    id: 'nodejs',
    title: 'Node.js Tutorial',
    description: 'Server-side JavaScript with Node.js. Build scalable network applications.',
    icon: Cpu,
    lessons: 35,
    level: 'Advanced',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    topics: ['Express', 'NPM', 'Async', 'REST APIs', 'Authentication']
  },
  {
    id: 'dsa',
    title: 'DSA in Python',
    description: 'Data Structures and Algorithms. Essential for coding interviews and problem solving.',
    icon: BookOpen,
    lessons: 65,
    level: 'Advanced',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming']
  },
]

const levelColors = {
  Beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Advanced: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  Expert: 'bg-red-500/10 text-red-600 border-red-500/20',
}

export function TutorialsIndex() {
  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(search.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(search.toLowerCase()) ||
      tutorial.topics.some(topic => topic.toLowerCase().includes(search.toLowerCase()))
    const matchesLevel = !selectedLevel || tutorial.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  return (
    <div className="space-y-12">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tutorials, topics..."
            className="h-12 pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[null, 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
            <button
              key={level || 'all'}
              onClick={() => setSelectedLevel(level)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                selectedLevel === level
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:bg-secondary'
              )}
            >
              {level || 'All Levels'}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Tutorials */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Most Popular</h2>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Star className="mr-1 h-3 w-3 fill-current" />
            Trending
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tutorials.slice(0, 4).map((tutorial, i) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/tutorials/${tutorial.id}/basics`}
                className="group block"
              >
                <div className={cn(
                  'rounded-2xl border p-6 transition-all hover:shadow-xl hover:-translate-y-1',
                  tutorial.bgColor,
                  'hover:border-primary/30'
                )}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className={cn('rounded-xl p-3', tutorial.bgColor)}>
                      <tutorial.icon className={cn('h-6 w-6', tutorial.color)} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{tutorial.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {tutorial.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{tutorial.lessons} lessons</span>
                    <Badge variant="outline" className={cn('text-xs', levelColors[tutorial.level])}>
                      {tutorial.level}
                    </Badge>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Tutorials */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">All Tutorials</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {filteredTutorials.map((tutorial, i) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/tutorials/${tutorial.id}/basics`}
                  className="group flex items-start gap-6 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className={cn(
                    'shrink-0 rounded-2xl p-4',
                    tutorial.bgColor
                  )}>
                    <tutorial.icon className={cn('h-8 w-8', tutorial.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{tutorial.title}</h3>
                      <Badge variant="outline" className={cn('text-xs', levelColors[tutorial.level])}>
                        {tutorial.level}
                      </Badge>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {tutorial.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tutorial.topics.slice(0, 4).map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-secondary/50 px-2 py-1 text-xs text-muted-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                      {tutorial.topics.length > 4 && (
                        <span className="text-xs text-muted-foreground">
                          +{tutorial.topics.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-2 text-sm font-medium text-primary group-hover:flex">
                    Start <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTutorials.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No tutorials found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </section>

      {/* Quick Reference */}
      <section className="rounded-3xl bg-gradient-to-br from-primary/5 to-violet-600/5 p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Guided Learning</h2>
            <p className="text-sm text-muted-foreground">Interactive examples with every topic</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-xl bg-card p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
            <div>
              <h4 className="font-semibold">Try It Yourself</h4>
              <p className="text-sm text-muted-foreground">Edit code examples directly in browser</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-card p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
            <div>
              <h4 className="font-semibold">Instant Feedback</h4>
              <p className="text-sm text-muted-foreground">Run code and see results immediately</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-card p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
            <div>
              <h4 className="font-semibold">Track Progress</h4>
              <p className="text-sm text-muted-foreground">Complete lessons and earn XP</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
