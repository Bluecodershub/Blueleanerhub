/**
 * QuestionCardSkeleton — loading placeholder matching QuestionCard's layout.
 */
export default function QuestionCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
      {/* Stats column */}
      <div className="flex w-20 flex-shrink-0 flex-col items-end gap-3">
        <div className="h-10 w-14 rounded-lg bg-gray-800" />
        <div className="h-10 w-14 rounded-lg bg-gray-800" />
        <div className="h-8 w-14 rounded-lg bg-gray-800" />
      </div>

      {/* Content column */}
      <div className="min-w-0 flex-1 space-y-3">
        {/* Title */}
        <div className="h-5 w-4/5 rounded bg-gray-800" />
        <div className="h-4 w-3/5 rounded bg-gray-800" />

        {/* Tags */}
        <div className="mt-2 flex gap-1.5">
          <div className="h-5 w-16 rounded-md bg-gray-800" />
          <div className="h-5 w-20 rounded-md bg-gray-800" />
          <div className="h-5 w-14 rounded-md bg-gray-800" />
        </div>

        {/* Meta */}
        <div className="mt-1 flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-800" />
          <div className="h-3 w-1 rounded bg-gray-800" />
          <div className="h-4 w-4 rounded-full bg-gray-800" />
          <div className="h-4 w-20 rounded bg-gray-800" />
          <div className="h-3 w-1 rounded bg-gray-800" />
          <div className="h-4 w-24 rounded bg-gray-800" />
        </div>
      </div>
    </div>
  )
}
