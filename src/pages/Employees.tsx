import { useState } from 'react'
import { useStore } from '../store'
import type { Admin } from '../types'
import { Button, Field, TextInput, Select, SidePanel, ConfirmDialog, PageHeader, StatusBadge } from '../components/ui'
import { DataTable, RowActionButton, type Column } from '../components/DataTable'

const emptyForm = { username: '', password: '', email: '', phone_number: '', role: 'Operator' as Admin['role'] }
type FormState = typeof emptyForm
type Errors = Partial<Record<keyof FormState, string>>

function passwordStrength(pw: string): { label: string; status: 'ok' | 'warn' | 'danger' } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score >= 4) return { label: 'Strong', status: 'ok' }
  if (score >= 2) return { label: 'Medium', status: 'warn' }
  return { label: 'Weak', status: 'danger' }
}

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!#$%&*+'
  const all = upper + lower + digits + symbols
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)]
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  for (let i = 0; i < 8; i++) chars.push(pick(all))
  return chars.sort(() => Math.random() - 0.5).join('')
}

export function Employees() {
  const { admins, addAdmin, updateAdmin, deleteAdmin } = useStore()
  const [search, setSearch] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<Admin | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [deleting, setDeleting] = useState<Admin | null>(null)

  const filtered = admins.filter((a) => {
    const q = search.toLowerCase()
    return a.username.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.phone_number.includes(q)
  })

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setShowPassword(false)
    setPanelOpen(true)
  }

  const openEdit = (a: Admin) => {
    setEditing(a)
    setForm({ username: a.username, password: '', email: a.email, phone_number: a.phone_number, role: a.role })
    setErrors({})
    setShowPassword(false)
    setPanelOpen(true)
  }

  const validate = (): Errors => {
    const errs: Errors = {}
    if (!form.username.trim()) errs.username = 'Username is required.'
    else if (admins.some((a) => a.username.toLowerCase() === form.username.trim().toLowerCase() && a.id !== editing?.id))
      errs.username = 'This username is already taken.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    else if (admins.some((a) => a.email.toLowerCase() === form.email.trim().toLowerCase() && a.id !== editing?.id))
      errs.email = 'This email is already in use.'
    if (!form.phone_number.trim()) errs.phone_number = 'Phone number is required.'
    if (!editing && !form.password) errs.password = 'Password is required for new users.'
    else if (form.password && passwordStrength(form.password).status === 'danger')
      errs.password = 'Password is too weak — use 8+ characters with mixed case, a number, and a symbol.'
    return errs
  }

  const submit = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const base = {
      username: form.username.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
      role: form.role,
    }
    if (editing) {
      updateAdmin({ ...editing, ...base, password: form.password || editing.password })
    } else {
      addAdmin({ ...base, password: form.password })
    }
    setPanelOpen(false)
  }

  const strength = form.password ? passwordStrength(form.password) : null

  const columns: Column<Admin>[] = [
    { key: 'username', header: 'Username', sortValue: (a) => a.username, render: (a) => <span className="font-medium text-ink">{a.username}</span> },
    { key: 'email', header: 'Email', sortValue: (a) => a.email, render: (a) => a.email },
    { key: 'phone', header: 'Phone', render: (a) => <span className="tabular-nums">{a.phone_number}</span> },
    { key: 'role', header: 'Role', sortValue: (a) => a.role, render: (a) => <StatusBadge status={a.role === 'Admin' ? 'ok' : 'neutral'}>{a.role}</StatusBadge> },
  ]

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Admin and staff accounts for the internal system"
        action={<Button onClick={openAdd}>+ Add employee</Button>}
      />

      <div className="mb-4 max-w-xs">
        <TextInput placeholder="Search by username, email, or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        emptyMessage={search ? 'No employees match your search.' : 'No employees yet — add your first one.'}
        emptyAction={!search ? <Button onClick={openAdd}>+ Add employee</Button> : undefined}
        rowActions={(a) => (
          <>
            <RowActionButton label="Edit" onClick={() => openEdit(a)} />
            <RowActionButton label="Delete" danger onClick={() => setDeleting(a)} />
          </>
        )}
      />

      <SidePanel open={panelOpen} title={editing ? `Edit ${editing.username}` : 'Add employee'} onClose={() => setPanelOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Field label="Username" error={errors.username}>
            <TextInput
              value={form.username}
              error={!!errors.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoFocus
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <TextInput type="email" value={form.email} error={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone number" error={errors.phone_number}>
            <TextInput value={form.phone_number} error={!!errors.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Admin['role'] })}>
              <option>Admin</option>
              <option>Manager</option>
              <option>Operator</option>
            </Select>
          </Field>
          <Field label={editing ? 'New password (leave blank to keep current)' : 'Password'} error={errors.password}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  error={!!errors.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 text-xs font-medium text-ink-secondary hover:text-ink"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setForm((f) => ({ ...f, password: generateTempPassword() }))
                  setShowPassword(true)
                }}
              >
                Generate
              </Button>
            </div>
            {strength && (
              <span className="mt-1.5 inline-block">
                <StatusBadge status={strength.status}>{strength.label} password</StatusBadge>
              </span>
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPanelOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save changes' : 'Add employee'}</Button>
          </div>
        </form>
      </SidePanel>

      <ConfirmDialog
        open={!!deleting}
        title="Delete employee"
        message={`Delete "${deleting?.username}"? This cannot be undone.`}
        onConfirm={() => {
          if (deleting) deleteAdmin(deleting.id)
          setDeleting(null)
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
