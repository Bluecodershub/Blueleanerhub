import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminAssessmentsPage() {
  return (
    <AdminCollectionPage
      title="Assessment Management"
      description="Monitor assessment attempts, completion status, and scores."
      endpoint="/admin/assessments"
      itemKey="assessments"
      columns={[
        { key: 'userId.fullName', label: 'Student' },
        { key: 'userId.email', label: 'Email' },
        { key: 'domain', label: 'Domain' },
        { key: 'status', label: 'Status' },
        { key: 'overallScore', label: 'Score' },
        { key: 'completedAt', label: 'Completed' },
      ]}
    />
  )
}
