import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminQuizzesPage() {
  return (
    <AdminCollectionPage
      title="Quiz Management"
      description="Review quiz catalog entries and publication state."
      endpoint="/admin/quizzes"
      itemKey="quizzes"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'domain', label: 'Domain' },
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'questionCount', label: 'Questions' },
        { key: 'isPublished', label: 'Published' },
      ]}
    />
  )
}
