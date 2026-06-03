'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Code2,
  Play,
  CheckCircle,
  ChevronRight,
  Search,
  Clock,
  Users,
  Database,
  Globe,
  Server,
  Cpu,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Mock data
const categories = [
  {
    id: 'python',
    name: 'Python',
    icon: Code2,
    color: 'from-blue-500 to-blue-600',
    courses: 12,
    students: 2450,
    description: 'Learn Python programming from basics to advanced',
    topics: ['Syntax', 'Data Types', 'Functions', 'OOP', 'File I/O', 'Modules'],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: Globe,
    color: 'from-amber-500 to-amber-600',
    courses: 15,
    students: 3200,
    description: 'Master JavaScript for web development',
    topics: ['Variables', 'Functions', 'DOM', 'Async', 'ES6+', 'React'],
  },
  {
    id: 'java',
    name: 'Java',
    icon: Cpu,
    color: 'from-red-500 to-red-600',
    courses: 10,
    students: 1890,
    description: 'Java programming for enterprise applications',
    topics: ['Basics', 'OOP', 'Collections', 'Multithreading', 'Spring', 'Hibernate'],
  },
  {
    id: 'dsa',
    name: 'Data Structures',
    icon: Database,
    color: 'from-emerald-500 to-emerald-600',
    courses: 8,
    students: 2100,
    description: 'Essential data structures and algorithms',
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'DP', 'Greedy'],
  },
  {
    id: 'sql',
    name: 'SQL & Databases',
    icon: Server,
    color: 'from-violet-500 to-violet-600',
    courses: 6,
    students: 1560,
    description: 'Database design and SQL querying',
    topics: ['SELECT', 'JOIN', 'Indexes', 'Transactions', 'Optimization'],
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: Server,
    color: 'from-cyan-500 to-cyan-600',
    courses: 5,
    students: 980,
    description: 'CI/CD, Docker, Kubernetes, and cloud',
    topics: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Monitoring'],
  },
]

const tutorials = [
  {
    id: 'python-intro',
    title: 'Python Introduction',
    category: 'python',
    duration: '2 hours',
    difficulty: 'Beginner',
    completed: true,
    progress: 100,
    description: 'Get started with Python programming',
  },
  {
    id: 'python-syntax',
    title: 'Python Syntax',
    category: 'python',
    duration: '3 hours',
    difficulty: 'Beginner',
    completed: true,
    progress: 100,
    description: 'Learn Python syntax and basic constructs',
  },
  {
    id: 'python-functions',
    title: 'Python Functions',
    category: 'python',
    duration: '4 hours',
    difficulty: 'Intermediate',
    completed: false,
    progress: 60,
    description: 'Define and use functions in Python',
  },
  {
    id: 'python-oop',
    title: 'Object-Oriented Programming',
    category: 'python',
    duration: '5 hours',
    difficulty: 'Intermediate',
    completed: false,
    progress: 0,
    description: 'Classes, objects, inheritance, and polymorphism',
  },
  {
    id: 'js-intro',
    title: 'JavaScript Introduction',
    category: 'javascript',
    duration: '2 hours',
    difficulty: 'Beginner',
    completed: false,
    progress: 30,
    description: 'Introduction to JavaScript programming',
  },
  {
    id: 'dsa-arrays',
    title: 'Arrays and Strings',
    category: 'dsa',
    duration: '4 hours',
    difficulty: 'Intermediate',
    completed: false,
    progress: 0,
    description: 'Master array operations and string manipulation',
  },
]

const recentTutorials = tutorials.filter(t => !t.completed).slice(0, 3)

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredTutorials = tutorials.filter(t => {
    if (selectedCategory && t.category !== selectedCategory) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })


  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Library</h1>
            <p className="text-muted-foreground">Learn with interactive step-by-step tutorials</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </header>

        {/* ── Continue Learning ───────────────────────────────────────────── */}
        {recentTutorials.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Continue Learning</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {recentTutorials.map((tutorial) => {
                const category = categories.find(c => c.id === tutorial.category)
                const Icon = category?.icon || BookOpen
                return (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link
                      href={`/student/library/${tutorial.category}/${tutorial.id}`}
                      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className={cn('rounded-lg bg-gradient-to-br p-2 text-white', category?.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline">{tutorial.difficulty}</Badge>
                      </div>
                      <h3 className="mb-1 font-semibold group-hover:text-primary transition-colors">
                        {tutorial.title}
                      </h3>
                      <p className="mb-3 text-sm text-muted-foreground">{tutorial.description}</p>
                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{tutorial.progress}% complete</span>
                          <span>{tutorial.duration}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${tutorial.progress}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Categories Grid ─────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Browse Categories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category, i) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/student/library/${category.id}`}
                    className="group block rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className={cn('rounded-xl bg-gradient-to-br p-3 text-white', category.color)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">{category.name}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{category.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {category.topics.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{category.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" /> {category.courses} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {category.students.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── All Tutorials ───────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">All Tutorials</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    !selectedCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm transition-colors',
                      selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border">
              {filteredTutorials.map((tutorial) => {
                const category = categories.find(c => c.id === tutorial.category)
                return (
                  <Link
                    key={tutorial.id}
                    href={`/student/library/${tutorial.category}/${tutorial.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-card"
                  >
                    <div className={cn(
                      'rounded-lg bg-gradient-to-br p-2.5 text-white',
                      category?.color
                    )}>
                      {tutorial.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{tutorial.title}</h3>
                        {tutorial.completed && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{tutorial.description}</p>
                    </div>
                    <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {tutorial.duration}
                      </span>
                      <Badge variant="outline">{tutorial.difficulty}</Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
