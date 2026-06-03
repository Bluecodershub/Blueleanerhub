import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminCoursesPage() {
  return (
    <AdminCollectionPage
      title="Course Management"
      description="Review published and draft courses, enrollment counts, and catalog metadata."
      endpoint="/admin/courses"
      itemKey="courses"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'specializationId.name', label: 'Specialization' },
        { key: 'isPublished', label: 'Published' },
        { key: 'enrollmentCount', label: 'Enrollments' },
      ]}
    />
  )
}
