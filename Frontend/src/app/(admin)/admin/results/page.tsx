import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminResultsPage() {
  return (
    <AdminCollectionPage
      title="Result Management"
      description="Review generated skill reports and result summaries."
      endpoint="/admin/skill-reports"
      itemKey="results"
      columns={[
        { key: 'userId.fullName', label: 'Student' },
        { key: 'domain', label: 'Domain' },
        { key: 'overallLevel', label: 'Level' },
        { key: 'estimatedLevel', label: 'Band' },
        { key: 'strengths', label: 'Strengths' },
        { key: 'weaknesses', label: 'Weaknesses' },
      ]}
    />
  )
}
