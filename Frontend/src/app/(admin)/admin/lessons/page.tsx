import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminLessonsPage() {
  return (
    <AdminCollectionPage
      title="Lesson Management"
      description="Review public tutorials and lesson catalog status."
      endpoint="/admin/lessons"
      itemKey="lessons"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'category', label: 'Category' },
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'isPublished', label: 'Published' },
        { key: 'viewCount', label: 'Views' },
      ]}
    />
  )
}
