import NotebookWorkspace from '@/components/notebooks/NotebookWorkspace'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Notebook | BlueLearnerHub',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const notebookId = Number.parseInt(id, 10)
  if (!Number.isFinite(notebookId) || notebookId <= 0) {
    notFound()
  }
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_45%)] px-2 py-3 md:px-4">
      <NotebookWorkspace notebookId={notebookId} />
    </div>
  )
}
