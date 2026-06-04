'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, Code, Trophy, Briefcase, GraduationCap, Clock, TrendingUp } from 'lucide-react'
import { cn, getStorageItem, setStorageItem, removeStorageItem } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from './input'
import { Badge } from './badge'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'tutorial' | 'course' | 'problem' | 'hackathon' | 'opening' | 'academy' | 'question'
  url: string
  domain?: string
  tags?: string[]
}

export default function UniversalSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load recent searches from localStorage
    setRecentSearches(getStorageItem<string[]>('recentSearches', []))
  }, [])

  useEffect(() => {
    // Debounced search
    if (query.length > 2) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        performSearch(query)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    try {
      // Mock search - replace with actual API call
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Introduction to Python Programming',
          description: 'Learn Python basics with hands-on examples',
          type: 'tutorial',
          url: '/tutorials/computer-science/python-basics',
          domain: 'Computer Science',
          tags: ['Python', 'Beginner'],
        },
        {
          id: '3',
          title: 'Two Sum Problem',
          description: 'Find two numbers that add up to a target',
          type: 'problem',
          url: '/practice/two-sum',
          domain: 'Computer Science',
          tags: ['Array', 'Hash Table'],
        },
        {
          id: '4',
          title: 'Winter Code Challenge 2024',
          description: '48-hour coding marathon with prizes',
          type: 'hackathon',
          url: '/hackathons/winter-2024',
          domain: 'Computer Science',
          tags: ['Coding', 'Competition'],
        },
      ]

      // Filter based on query
      const filtered = mockResults.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )

      setResults(filtered)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    const updated = [result.title, ...recentSearches.filter((s) => s !== result.title)].slice(0, 5)
    setRecentSearches(updated)
    setStorageItem('recentSearches', updated)

    // Navigate
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    removeStorageItem('recentSearches')
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    const icons = {
      tutorial: BookOpen,
      course: BookOpen,
      problem: Code,
      hackathon: Trophy,
      opening: Briefcase,
      academy: GraduationCap,
      question: Search,
    }
    const Icon = icons[type]
    return <Icon className="h-4 w-4" />
  }

  const getTypeColor = (type: SearchResult['type']) => {
    const colors = {
      tutorial: 'bg-blue-500/10 text-primary/80',
      course: 'bg-purple-500/10 text-purple-500',
      problem: 'bg-blue-500/10 text-primary/80',
      hackathon: 'bg-primary/10 text-foreground/80',
      opening: 'bg-primary/10 text-foreground/80',
      academy: 'bg-primary/10 text-foreground/70',
      question: 'bg-yellow-500/10 text-yellow-500',
    }
    return colors[type]
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          type="search"
          placeholder="Search tutorials, courses, problems, hackathons..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={cn(
            'w-full border-gray-700 bg-gray-800 pl-10 pr-10 text-white placeholder:text-gray-500',
            isOpen && 'ring-2 ring-blue-500'
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-xl"
          >
            {/* Loading */}
            {isLoading && (
              <div className="p-4 text-center text-gray-400">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length > 2 && results.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No results found for &quot;{query}&quot;</p>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="p-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('rounded-lg p-2', getTypeColor(result.type))}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium text-white">{result.title}</h4>
                        <p className="line-clamp-2 text-sm text-gray-400">{result.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          {result.domain && (
                            <Badge variant="secondary" className="text-xs">
                              {result.domain}
                            </Badge>
                          )}
                          {result.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="border-gray-600 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="border-t border-gray-700 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Recent</span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="block w-full rounded p-2 text-left text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular/Trending */}
            {!query && (
              <div className="border-t border-gray-700 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'React Hooks',
                    'Python',
                    'Data Structures',
                    'System Design',
                    'Machine Learning',
                  ].map((trend) => (
                    <button
                      key={trend}
                      onClick={() => setQuery(trend)}
                      className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300 hover:bg-gray-600"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
