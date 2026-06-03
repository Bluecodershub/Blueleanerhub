'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, BookmarkPlus, BookmarkCheck, Code, Eye } from 'lucide-react'
import CodePlayground from './CodePlayground'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface LessonViewerProps {
  lesson: {
    id: number
    title: string
    content: string
    codeExamples?: Array<{
      title: string
      code: string
      language: string
      editable?: boolean
    }>
    videoUrl?: string
  }
  previousLesson?: { id: number; title: string }
  nextLesson?: { id: number; title: string }
  onComplete?: () => void
  onBookmark?: () => void
  isBookmarked?: boolean
}

export default function LessonViewer({
  lesson,
  previousLesson,
  nextLesson,
  onComplete,
  onBookmark,
  isBookmarked = false,
}: LessonViewerProps) {
  const [showCodeEditor, setShowCodeEditor] = useState(true)
  const [activeCodeExample, setActiveCodeExample] = useState(0)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel - Content */}
      <div
        className={`${showCodeEditor ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white transition-all dark:bg-gray-900`}
      >
        <div className="p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onBookmark}>
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="mr-1 h-4 w-4" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="mr-1 h-4 w-4" />
                    Bookmark
                  </>
                )}
              </Button>

              <Button
                variant={showCodeEditor ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCodeEditor(!showCodeEditor)}
              >
                <Code className="mr-1 h-4 w-4" />
                {showCodeEditor ? 'Hide' : 'Show'} Editor
              </Button>
            </div>
          </div>

          {/* Video (if available) */}
          {lesson.videoUrl && (
            <div className="mb-8 aspect-video overflow-hidden rounded-lg bg-black">
              <iframe src={lesson.videoUrl} className="h-full w-full" allowFullScreen />
            </div>
          )}

          {/* Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{lesson.content}</ReactMarkdown>
          </article>

          {/* Code Examples with Try It Yourself */}
          {lesson.codeExamples && lesson.codeExamples.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Try It Yourself</h2>

              <Tabs
                value={activeCodeExample.toString()}
                onValueChange={(v) => setActiveCodeExample(parseInt(v))}
              >
                <TabsList>
                  {lesson.codeExamples.map((example, index) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      {example.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {lesson.codeExamples.map((example, index) => (
                  <TabsContent key={index} value={index.toString()}>
                    <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                      <pre className="overflow-x-auto text-sm">
                        <code className={`language-${example.language}`}>{example.code}</code>
                      </pre>

                      {example.editable && (
                        <Button className="mt-4" onClick={() => setShowCodeEditor(true)}>
                          <Eye className="mr-1 h-4 w-4" />
                          Open in Editor
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-800">
            {previousLesson ? (
              <Button variant="outline" asChild>
                <a href={`/tutorials/lesson/${previousLesson.id}`}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous: {previousLesson.title}
                </a>
              </Button>
            ) : (
              <div />
            )}

            <Button onClick={onComplete}>Mark as Complete</Button>

            {nextLesson ? (
              <Button asChild>
                <a href={`/tutorials/lesson/${nextLesson.id}`}>
                  Next: {nextLesson.title}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Code Playground */}
      {showCodeEditor && (
        <div className="w-1/2 border-l border-gray-200 dark:border-gray-800">
          <CodePlayground
            initialCode={lesson.codeExamples?.[activeCodeExample]?.code || ''}
            language={lesson.codeExamples?.[activeCodeExample]?.language || 'javascript'}
          />
        </div>
      )}
    </div>
  )
}
