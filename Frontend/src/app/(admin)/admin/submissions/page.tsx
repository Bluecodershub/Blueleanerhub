import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminSubmissionsPage() {
  return (
    <AdminCollectionPage
      title="Submission Management"
      description="Review capstone and hackathon submissions from one queue."
      endpoint="/admin/submissions"
      itemKey="submissions"
      columns={[
        { key: 'type', label: 'Type' },
        { key: 'userId.fullName', label: 'Student' },
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'score', label: 'Score' },
        { key: 'submittedAt', label: 'Submitted' },
      ]}
    />
  )
}
