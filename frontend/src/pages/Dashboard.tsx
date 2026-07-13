import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { LOW_STOCK_THRESHOLD } from '../types'
import { StatusBadge } from '../components/ui'

function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-5 py-4">
      <div className="text-sm text-ink-secondary">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-ink">{value.toLocaleString('en-US')}</div>
      {hint && <div className="mt-1 text-xs text-ink-muted">{hint}</div>}
    </div>
  )
}

export function Dashboard() {
  const { admins, stock, orders, customers } = useStore()

  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = today.slice(0, 7)
  const ordersToday = orders.filter((o) => o.date === today)
  const ordersThisMonth = orders.filter((o) => o.date.startsWith(thisMonth))
  const lowStock = stock
    .filter((s) => s.amount < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.amount - b.amount)
  const recent = [...orders].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 8)

  const stockName = (id: number) => stock.find((s) => s.id === id)?.name ?? '—'
  const customerName = (id: number) => customers.find((c) => c.id === id)?.name ?? '—'
  const adminName = (id: number) => admins.find((a) => a.id === id)?.username ?? '—'

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold text-ink">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Active employees" value={admins.length} />
        <StatTile label="Low stock items" value={lowStock.length} hint={`below ${LOW_STOCK_THRESHOLD} units`} />
        <StatTile label="Orders today" value={ordersToday.length} />
        <StatTile label="Orders this month" value={ordersThisMonth.length} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
            <Link to="/orders" className="text-xs font-medium text-cocoa-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-line bg-tan-50/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Item</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5">Processed by</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-b-0 hover:bg-tan-50/30">
                    <td className="px-4 py-2.5 tabular-nums">{o.date}</td>
                    <td className="px-4 py-2.5">{customerName(o.customer_id)}</td>
                    <td className="px-4 py-2.5">{stockName(o.stock_id)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{o.amount.toLocaleString('en-US')}</td>
                    <td className="px-4 py-2.5 text-ink-secondary">{adminName(o.admin_id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">Low stock alerts</h2>
            <Link to="/stock" className="text-xs font-medium text-cocoa-600 hover:underline">Go to stock</Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface px-5 py-8 text-center text-sm text-ink-secondary">
              All items are above the low-stock threshold.
            </div>
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {lowStock.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-ink">{s.name}</div>
                    <div className="text-xs text-ink-muted">{s.code}</div>
                  </div>
                  <StatusBadge status={s.amount === 0 ? 'danger' : 'warn'}>
                    {s.amount === 0 ? 'Out of stock' : `${s.amount} left`}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
