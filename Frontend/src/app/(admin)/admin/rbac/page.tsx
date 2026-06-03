import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminRbacPage() {
  return (
    <AdminCollectionPage
      title="Role-Based Access Control"
      description="Review the platform role matrix enforced by protected routes and backend authorization."
      endpoint="/admin/rbac"
      itemKey="roles"
      columns={[
        { key: 'role', label: 'Role' },
        { key: 'access', label: 'Access' },
      ]}
    />
  )
}
