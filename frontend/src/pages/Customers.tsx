import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import type { Customer } from '../types'
import { Button, Field, TextInput, SidePanel, ConfirmDialog, PageHeader } from '../components/ui'
import { DataTable, RowActionButton, type Column } from '../components/DataTable'

const emptyForm = { name: '', address: '' }
type FormState = typeof emptyForm
type Errors = Partial<Record<keyof FormState, string>>

export function Customers() {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [deleting, setDeleting] = useState<Customer | null>(null)

  const orderCount = (id: number) => orders.filter((o) => o.customer_id === id).length

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
  })

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setPanelOpen(true)
  }

  const openEdit = (c: Customer) => {
    setEditing(c)
    setForm({ name: c.name, address: c.address })
    setErrors({})
    setPanelOpen(true)
  }

  const validate = (): Errors => {
    const errs: Errors = {}
    if (!form.name.trim()) errs.name = 'Name is required.'
    if (!form.address.trim()) errs.address = 'Address is required.'
    return errs
  }

  const submit = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const data = { name: form.name.trim(), address: form.address.trim() }
    if (editing) updateCustomer({ ...editing, ...data })
    else addCustomer(data)
    setPanelOpen(false)
  }

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Name', sortValue: (c) => c.name, render: (c) => <span className="font-medium text-ink">{c.name}</span> },
    { key: 'address', header: 'Address', sortValue: (c) => c.address, render: (c) => <span className="text-ink-secondary">{c.address}</span> },
    { key: 'orders', header: 'Orders', numeric: true, sortValue: (c) => orderCount(c.id), render: (c) => orderCount(c.id) },
  ]

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Click a customer to see their order history"
        action={<Button onClick={openAdd}>+ Add customer</Button>}
      />

      <div className="mb-4 max-w-xs">
        <TextInput placeholder="Search by name or address…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        emptyMessage={search ? 'No customers match your search.' : 'No customers yet — add your first one.'}
        emptyAction={!search ? <Button onClick={openAdd}>+ Add customer</Button> : undefined}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        rowActions={(c) => (
          <>
            <RowActionButton label="Edit" onClick={() => openEdit(c)} />
            <RowActionButton label="Delete" danger onClick={() => setDeleting(c)} />
          </>
        )}
      />

      <SidePanel open={panelOpen} title={editing ? `Edit ${editing.name}` : 'Add customer'} onClose={() => setPanelOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Field label="Name" error={errors.name}>
            <TextInput value={form.name} error={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </Field>
          <Field label="Address" error={errors.address}>
            <TextInput value={form.address} error={!!errors.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPanelOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save changes' : 'Add customer'}</Button>
          </div>
        </form>
      </SidePanel>

      <ConfirmDialog
        open={!!deleting}
        title="Delete customer"
        message={`Delete "${deleting?.name}"?${deleting && orderCount(deleting.id) > 0 ? ` They have ${orderCount(deleting.id)} orders on record.` : ''} This cannot be undone.`}
        onConfirm={() => {
          if (deleting) deleteCustomer(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
