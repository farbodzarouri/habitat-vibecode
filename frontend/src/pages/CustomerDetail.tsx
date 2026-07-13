import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store'
import type { Order } from '../types'
import { EmptyState } from '../components/ui'
import { DataTable, type Column } from '../components/DataTable'

export function CustomerDetail() {
  const { id } = useParams()
  const { customers, orders, stock, admins } = useStore()

  const customer = customers.find((c) => c.id === Number(id))
  const customerOrders = orders
    .filter((o) => o.customer_id === Number(id))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)

  const stockItem = (sid: number) => stock.find((s) => s.id === sid)
  const adminName = (aid: number) => admins.find((a) => a.id === aid)?.username ?? '—'

  if (!customer) {
    return (
      <div>
        <Link to="/customers" className="text-sm font-medium text-cocoa-600 hover:underline">← Back to customers</Link>
        <div className="mt-4">
          <EmptyState message="This customer no longer exists." />
        </div>
      </div>
    )
  }

  const columns: Column<Order>[] = [
    { key: 'date', header: 'Date', sortValue: (o) => o.date, render: (o) => <span className="tabular-nums">{o.date}</span> },
    {
      key: 'item',
      header: 'Stock item',
      sortValue: (o) => stockItem(o.stock_id)?.name ?? '',
      render: (o) => {
        const s = stockItem(o.stock_id)
        return s ? (
          <span>
            {s.name} <span className="text-xs text-ink-muted">({s.code})</span>
          </span>
        ) : '—'
      },
    },
    { key: 'amount', header: 'Amount', numeric: true, sortValue: (o) => o.amount, render: (o) => o.amount.toLocaleString('en-US') },
    { key: 'admin', header: 'Processed by', sortValue: (o) => adminName(o.admin_id), render: (o) => <span className="text-ink-secondary">{adminName(o.admin_id)}</span> },
  ]

  return (
    <div>
      <Link to="/customers" className="text-sm font-medium text-cocoa-600 hover:underline">← Back to customers</Link>
      <div className="mb-5 mt-3">
        <h1 className="text-xl font-semibold text-ink">{customer.name}</h1>
        <p className="mt-0.5 text-sm text-ink-secondary">{customer.address}</p>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-ink">
        Order history <span className="font-normal text-ink-muted">({customerOrders.length})</span>
      </h2>
      <DataTable
        columns={columns}
        rows={customerOrders}
        emptyMessage="No orders for this customer yet."
      />
    </div>
  )
}
