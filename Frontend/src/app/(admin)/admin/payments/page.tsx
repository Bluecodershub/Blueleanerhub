import { AdminCollectionPage } from '@/components/admin/AdminCollectionPage'

export default function AdminPaymentsPage() {
  return (
    <AdminCollectionPage
      title="Payment Management"
      description="Review payment transactions and subscription purchase state."
      endpoint="/admin/payments"
      itemKey="payments"
      columns={[
        { key: 'userId.fullName', label: 'User' },
        { key: 'amount', label: 'Amount' },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'provider', label: 'Provider' },
        { key: 'createdAt', label: 'Created' },
      ]}
    />
  )
}
