'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Zap,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  Code2,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Monaco Editor - lazy loaded
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

// Mock challenge data
const challenges: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Two Sum',
    difficulty: 'easy',
    xp: 50,
    type: 'coding',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: '',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: '',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      python: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    pass

# Test your solution
print(two_sum([2, 7, 11, 15], 9))  # Expected: [0, 1]`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};

// Test your solution
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
    },
    testCases: [
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6', expected: '[1,2]' },
      { input: '[3,3], 6', expected: '[0,1]' },
    ],
    tags: ['Array', 'Hash Table'],
    acceptance: 49,
    solves: 1250,
  },
  '3': {
    id: '3',
    title: 'Reverse Linked List',
    difficulty: 'medium',
    xp: 100,
    type: 'coding',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

**Example:**
- Input: head = [1,2,3,4,5]
- Output: [5,4,3,2,1]`,
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: '',
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]',
        explanation: '',
      },
      {
        input: 'head = []',
        output: '[]',
        explanation: '',
      },
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    starterCode: {
      python: `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverseList(head):
    # Your code here
    pass`,
      javascript: `// Definition for singly-linked list.
// function ListNode(val, next) {
//     this.val = (val===undefined ? 0 : val)
//     this.next = (next===undefined ? null : next)
// }

var reverseList = function(head) {
    // Your code here
};`,
    },
    tags: ['Linked List', 'Recursion'],
    acceptance: 72,
    solves: 620,
  },
}

const difficultyConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  hard: { label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/20' },
}

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
]

function CodeEditorSkeleton() {
  return (
    <div className="h-full animate-pulse bg-[#1e1e1e]">
      <div className="h-10 border-b border-[#333] bg-[#252526]" />
      <div className="p-4">
        <div className="h-4 w-32 rounded bg-[#333] mb-4" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-[#333]" />
          <div className="h-3 w-3/4 rounded bg-[#333]" />
          <div className="h-3 w-1/2 rounded bg-[#333]" />
        </div>
      </div>
    </div>
  )
}

export default function ChallengeDetailPage() {
  const params = useParams()
  const challengeId = params.id as string
  const challenge = challenges[challengeId]

  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [output, setOutput] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [running, setRunning] = useState(false)
  const [_passedTests, setPassedTests] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    if (challenge) {
      setCode(challenge.starterCode[language as keyof typeof challenge.starterCode] || '')
    }
  }, [challenge, language])

  if (!challenge) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Challenge not found</h2>
          <Link href="/student/spaces" className="mt-4 text-primary hover:underline">
            Back to Spaces
          </Link>
        </div>
      </div>
    )
  }

  const handleRunCode = async () => {
    setRunning(true)
    setOutput(null)
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate passing 2/3 test cases
    const passed = Math.floor(Math.random() * 3) + 1
    setPassedTests(passed)
    
    if (passed === challenge.testCases.length) {
      setOutput({ type: 'success', message: `All ${passed} test cases passed! 🎉` })
    } else {
      setOutput({ 
        type: 'error', 
        message: `${passed}/${challenge.testCases.length} test cases passed. Check your logic and try again.` 
      })
    }
    
    setRunning(false)
  }

  const handleSubmit = async () => {
    setRunning(true)
    await handleRunCode()
    // Could add to leaderboard, award XP, etc.
  }

  const handleReset = () => {
    setCode(challenge.starterCode[language as keyof typeof challenge.starterCode] || '')
    setOutput(null)
    setPassedTests(0)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/student/spaces"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-6 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{challenge.title}</h1>
              <Badge variant="outline" className={cn('text-xs', difficultyConfig[challenge.difficulty].bgColor)}>
                <span className={difficultyConfig[challenge.difficulty].color}>
                  {difficultyConfig[challenge.difficulty].label}
                </span>
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-amber-500" /> +{challenge.xp} XP
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {challenge.solves.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Target className="h-4 w-4" /> {challenge.acceptance}%
          </span>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Description */}
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border bg-card px-4">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Description
                </TabsTrigger>
                <TabsTrigger value="solutions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Solutions
                </TabsTrigger>
                <TabsTrigger value="submissions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Submissions
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="description" className="mt-0">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{challenge.description}</div>

                  {/* Examples */}
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold">Examples</h3>
                    {challenge.examples.map((ex: any, i: number) => (
                      <div key={i} className="mb-3 rounded-lg border border-border bg-card p-4">
                        <div className="mb-2 text-xs text-muted-foreground">Input:</div>
                        <code className="block text-sm">{ex.input}</code>
                        <div className="mb-2 mt-3 text-xs text-muted-foreground">Output:</div>
                        <code className="block text-sm">{ex.output}</code>
                        {ex.explanation && (
                          <>
                            <div className="mb-2 mt-3 text-xs text-muted-foreground">Explanation:</div>
                            <p className="text-sm text-muted-foreground">{ex.explanation}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold">Constraints</h3>
                    <ul className="space-y-1">
                      {challenge.constraints?.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">•</span>
                          <code>{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                      className="gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                      {showHint ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4"
                      >
                        <p className="text-sm">
                          Consider using a hash map to store the complement of each number as you iterate through the array. This allows O(1) lookup time.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="solutions" className="mt-0">
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-1 font-semibold">No solutions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete this challenge to share your solution
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="mt-0">
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <Code2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-1 font-semibold">No submissions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Run your code to see submission results
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Panel - Editor */}
        <div className="flex w-1/2 flex-col">
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
            <div className="flex items-center gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={cn(
                    'rounded-md px-3 py-1 text-sm transition-colors',
                    language === lang.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Suspense fallback={<CodeEditorSkeleton />}>
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(value: string | undefined) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </Suspense>
          </div>

          {/* Output Panel */}
          <div className="border-t border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h3 className="text-sm font-medium">Output</h3>
              {output && (
                <div className={cn(
                  'flex items-center gap-1.5 text-sm',
                  output.type === 'success' ? 'text-emerald-500' : output.type === 'error' ? 'text-red-500' : 'text-muted-foreground'
                )}>
                  {output.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : output.type === 'error' ? (
                    <XCircle className="h-4 w-4" />
                  ) : null}
                  {output.message}
                </div>
              )}
            </div>
            <div className="flex gap-2 p-4">
              <Button variant="outline" onClick={handleRunCode} disabled={running} className="flex-1 gap-2">
                <Play className="h-4 w-4" />
                {running ? 'Running...' : 'Run Code'}
              </Button>
              <Button onClick={handleSubmit} disabled={running} className="flex-1 gap-2">
                <CheckCircle className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
