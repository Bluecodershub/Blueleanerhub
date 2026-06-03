import NotebooksPage from '@/components/notebooks/NotebooksPage'

export const metadata = {
  title: 'Study Notebooks | BlueLearnerHub',
  description: 'AI-powered study notebooks. Upload your materials and chat with them.',
}

export default function Page() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_42%)] px-2 py-4 md:px-4">
      <NotebooksPage />
    </div>
  )
}
