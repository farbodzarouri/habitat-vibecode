import { useState } from 'react'
import { useStore } from '../store'
import type { Order } from '../types'
import { Button, Field, TextInput, Select, SidePanel, ConfirmDialog, PageHeader } from '../components/ui'
import { DataTable, RowActionButton, type Column } from '../components/DataTable'
import { SearchableSelect } from '../components/SearchableSelect'

interface FormState {
  stock_id: number | null
  customer_id: number | null
  date: string
  amount: string
}
type Errors = Partial<Record<keyof FormState, string>>

const today = () => new Date().toISOString().slice(0, 10)

export function Orders() {
  const { orders, stock, customers, admins, currentUser, addOrder, updateOrder, deleteOrder } = useStore()
  const [customerFilter, setCustomerFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<Order | null>(null)
  const [form, setForm] = useState<FormState>({ stock_id: null, customer_id: null, date: today(), amount: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [deleting, setDeleting] = useState<Order | null>(null)

  const stockItem = (id: number) => stock.find((s) => s.id === id)

  // Routes only render when signed in (see AppRoutes), so this never shows.
  if (!currentUser) return null
  const customerName = (id: number) => customers.find((c) => c.id === id)?.name ?? '—'
  const adminName = (id: number) => admins.find((a) => a.id === id)?.username ?? '—'

  const filtered = orders
    .filter((o) => {
      if (customerFilter && o.customer_id !== Number(customerFilter)) return false
      if (dateFrom && o.date < dateFrom) return false
      if (dateTo && o.date > dateTo) return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)

  const openAdd = () => {
    setEditing(null)
    setForm({ stock_id: null, customer_id: null, date: today(), amount: '' })
    setErrors({})
    setPanelOpen(true)
  }

  const openEdit = (o: Order) => {
    setEditing(o)
    setForm({ stock_id: o.stock_id, customer_id: o.customer_id, date: o.date, amount: String(o.amount) })
    setErrors({})
    setPanelOpen(true)
  }

  const validate = (): Errors => {
    const errs: Errors = {}
    if (!form.stock_id) errs.stock_id = 'Select a stock item.'
    if (!form.customer_id) errs.customer_id = 'Select a customer.'
    if (!form.date) errs.date = 'Date is required.'
    const amount = Number(form.amount)
    if (form.amount === '' || !Number.isInteger(amount) || amount <= 0) errs.amount = 'Enter a whole number greater than 0.'
    return errs
  }

  const submit = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data = {
      stock_id: form.stock_id!,
      customer_id: form.customer_id!,
      date: form.date,
      amount: Number(form.amount),
    }
    if (editing) updateOrder({ ...editing, ...data })
    else addOrder({ ...data, admin_id: currentUser.id })
    setPanelOpen(false)
  }

  const columns: Column<Order>[] = [
    { key: 'date', header: 'Date', sortValue: (o) => o.date, render: (o) => <span className="tabular-nums">{o.date}</span> },
    { key: 'customer', header: 'Customer', sortValue: (o) => customerName(o.customer_id), render: (o) => <span className="font-medium text-ink">{customerName(o.customer_id)}</span> },
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

  const hasFilters = !!(customerFilter || dateFrom || dateTo)

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders on record`}
        action={<Button onClick={openAdd}>+ Add order</Button>}
      />

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="w-52">
          <Select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} aria-label="Filter by customer">
            <option value="">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <label className="text-sm text-ink-secondary">
          <span className="mb-1 block text-xs font-medium">From</span>
          <TextInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </label>
        <label className="text-sm text-ink-secondary">
          <span className="mb-1 block text-xs font-medium">To</span>
          <TextInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </label>
        {hasFilters && (
          <Button variant="ghost" onClick={() => { setCustomerFilter(''); setDateFrom(''); setDateTo('') }}>
            Clear filters
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        emptyMessage={hasFilters ? 'No orders match your filters.' : 'No orders yet — add your first one.'}
        emptyAction={!hasFilters ? <Button onClick={openAdd}>+ Add order</Button> : undefined}
        rowActions={(o) => (
          <>
            <RowActionButton label="Edit" onClick={() => openEdit(o)} />
            <RowActionButton label="Delete" danger onClick={() => setDeleting(o)} />
          </>
        )}
      />

      <SidePanel open={panelOpen} title={editing ? `Edit order #${editing.id}` : 'Add order'} onClose={() => setPanelOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Field label="Stock item" error={errors.stock_id}>
            <SearchableSelect
              options={stock.map((s) => ({ value: s.id, label: s.name, sublabel: `${s.code} · ${s.amount.toLocaleString('en-US')} in stock` }))}
              value={form.stock_id}
              onChange={(v) => setForm({ ...form, stock_id: v })}
              placeholder="Search stock items…"
              error={!!errors.stock_id}
            />
          </Field>
          <Field label="Customer" error={errors.customer_id}>
            <SearchableSelect
              options={customers.map((c) => ({ value: c.id, label: c.name, sublabel: c.address }))}
              value={form.customer_id}
              onChange={(v) => setForm({ ...form, customer_id: v })}
              placeholder="Search customers…"
              error={!!errors.customer_id}
            />
          </Field>
          <Field label="Date" error={errors.date}>
            <TextInput type="date" value={form.date} error={!!errors.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Amount" error={errors.amount}>
            <TextInput type="number" min={1} value={form.amount} error={!!errors.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Processed by">
            <TextInput value={editing ? adminName(editing.admin_id) : `${currentUser.username} (you)`} disabled className="bg-tan-50 text-ink-secondary" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPanelOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save changes' : 'Add order'}</Button>
          </div>
        </form>
      </SidePanel>

      <ConfirmDialog
        open={!!deleting}
        title="Delete order"
        message={`Delete order #${deleting?.id} for "${deleting ? customerName(deleting.customer_id) : ''}"? This cannot be undone.`}
        onConfirm={() => {
          if (deleting) deleteOrder(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
