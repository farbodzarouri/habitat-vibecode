import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { LOW_STOCK_THRESHOLD, type StockItem } from '../types'
import { Button, Field, TextInput, Select, SidePanel, ConfirmDialog, PageHeader, StatusBadge } from '../components/ui'
import { DataTable, RowActionButton, type Column } from '../components/DataTable'

const emptyForm = { name: '', amount: '', type: '', category_id: '', code: '' }
type FormState = typeof emptyForm
type Errors = Partial<Record<keyof FormState, string>>

export function Stock() {
  const { stock, categories, addStock, updateStock, deleteStock } = useStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<StockItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [deleting, setDeleting] = useState<StockItem | null>(null)

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? '—'
  const types = useMemo(() => [...new Set(stock.map((s) => s.type))].sort(), [stock])

  const filtered = stock.filter((s) => {
    const q = search.toLowerCase()
    if (q && !s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false
    if (categoryFilter && s.category_id !== Number(categoryFilter)) return false
    if (typeFilter && s.type !== typeFilter) return false
    return true
  })

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setPanelOpen(true)
  }

  const openEdit = (s: StockItem) => {
    setEditing(s)
    setForm({ name: s.name, amount: String(s.amount), type: s.type, category_id: String(s.category_id), code: s.code })
    setErrors({})
    setPanelOpen(true)
  }

  const validate = (): Errors => {
    const errs: Errors = {}
    if (!form.code.trim()) errs.code = 'Code is required.'
    else if (stock.some((s) => s.code.toLowerCase() === form.code.trim().toLowerCase() && s.id !== editing?.id))
      errs.code = 'This code is already in use.'
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.type.trim()) errs.type = 'Type is required.'
    if (!form.category_id) errs.category_id = 'Select a category.'
    const amount = Number(form.amount)
    if (form.amount === '' || !Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount))
      errs.amount = 'Enter a whole number of 0 or more.'
    return errs
  }

  const submit = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data = {
      name: form.name.trim(),
      amount: Number(form.amount),
      type: form.type.trim(),
      category_id: Number(form.category_id),
      code: form.code.trim().toUpperCase(),
    }
    if (editing) updateStock({ ...editing, ...data })
    else addStock(data)
    setPanelOpen(false)
  }

  const columns: Column<StockItem>[] = [
    { key: 'code', header: 'Code', sortValue: (s) => s.code, render: (s) => <span className="font-medium tabular-nums text-ink">{s.code}</span> },
    { key: 'name', header: 'Name', sortValue: (s) => s.name, render: (s) => s.name },
    { key: 'category', header: 'Category', sortValue: (s) => categoryName(s.category_id), render: (s) => categoryName(s.category_id) },
    { key: 'type', header: 'Type', sortValue: (s) => s.type, render: (s) => <span className="text-ink-secondary">{s.type}</span> },
    {
      key: 'amount',
      header: 'Amount',
      numeric: true,
      sortValue: (s) => s.amount,
      render: (s) =>
        s.amount < LOW_STOCK_THRESHOLD ? (
          <StatusBadge status={s.amount === 0 ? 'danger' : 'warn'}>
            {s.amount.toLocaleString('en-US')} — {s.amount === 0 ? 'out of stock' : 'low'}
          </StatusBadge>
        ) : (
          <span>{s.amount.toLocaleString('en-US')}</span>
        ),
    },
  ]

  const hasFilters = !!(search || categoryFilter || typeFilter)

  return (
    <div>
      <PageHeader
        title="Stock"
        subtitle={`Inventory across ${categories.length} categories · low-stock threshold ${LOW_STOCK_THRESHOLD}`}
        action={<Button onClick={openAdd}>+ Add stock item</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="w-64">
          <TextInput placeholder="Search by name or code…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-48">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={() => { setSearch(''); setCategoryFilter(''); setTypeFilter('') }}>
            Clear filters
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        emptyMessage={hasFilters ? 'No stock items match your filters.' : 'No stock items yet — add your first one.'}
        emptyAction={!hasFilters ? <Button onClick={openAdd}>+ Add stock item</Button> : undefined}
        rowActions={(s) => (
          <>
            <RowActionButton label="Edit" onClick={() => openEdit(s)} />
            <RowActionButton label="Delete" danger onClick={() => setDeleting(s)} />
          </>
        )}
      />

      <SidePanel open={panelOpen} title={editing ? `Edit ${editing.code}` : 'Add stock item'} onClose={() => setPanelOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Field label="Code" error={errors.code}>
            <TextInput value={form.code} error={!!errors.code} placeholder="e.g. BAR-072" onChange={(e) => setForm({ ...form, code: e.target.value })} autoFocus />
          </Field>
          <Field label="Name" error={errors.name}>
            <TextInput value={form.name} error={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category" error={errors.category_id}>
            <Select value={form.category_id} error={!!errors.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Type" error={errors.type}>
            <TextInput value={form.type} error={!!errors.type} placeholder="e.g. Unit, Box, Bulk (kg)" onChange={(e) => setForm({ ...form, type: e.target.value })} />
          </Field>
          <Field label="Amount" error={errors.amount}>
            <TextInput type="number" min={0} value={form.amount} error={!!errors.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPanelOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save changes' : 'Add item'}</Button>
          </div>
        </form>
      </SidePanel>

      <ConfirmDialog
        open={!!deleting}
        title="Delete stock item"
        message={`Delete "${deleting?.name}" (${deleting?.code})? This cannot be undone.`}
        onConfirm={() => {
          if (deleting) deleteStock(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
