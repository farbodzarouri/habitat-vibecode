import { useEffect, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'

/* ---------- Buttons ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-cocoa-800 text-cream hover:bg-cocoa-700',
    secondary: 'bg-tan-100 text-ink border border-line-strong hover:bg-tan-200',
    danger: 'bg-danger text-white hover:opacity-90',
    ghost: 'text-ink-secondary hover:bg-tan-50 hover:text-ink',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

/* ---------- Form fields ---------- */

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
}

const inputClass = (error?: boolean) =>
  `w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-cocoa-600 focus:ring-1 focus:ring-cocoa-600 ${
    error ? 'border-danger' : 'border-line-strong'
  }`

export function TextInput({ error, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={`${inputClass(error)} ${className}`} {...props} />
}

export function Select({ error, className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select className={`${inputClass(error)} ${className}`} {...props}>
      {children}
    </select>
  )
}

/* ---------- Status badge ---------- */

export type Status = 'ok' | 'warn' | 'danger' | 'neutral'

const statusStyles: Record<Status, string> = {
  ok: 'bg-ok-bg text-ok',
  warn: 'bg-warn-bg text-warn',
  danger: 'bg-danger-bg text-danger',
  neutral: 'bg-neutral-status-bg text-neutral-status',
}

const statusIcons: Record<Status, string> = {
  ok: '●',
  warn: '▲',
  danger: '■',
  neutral: '○',
}

export function StatusBadge({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      <span aria-hidden className="text-[8px] leading-none">{statusIcons[status]}</span>
      {children}
    </span>
  )
}

/* ---------- Side panel (add / edit) ---------- */

export function SidePanel({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-cocoa-900/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close panel" className="rounded-md p-1 text-ink-muted hover:bg-tan-50 hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Confirm dialog ---------- */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-cocoa-900/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl border border-line bg-surface p-6 shadow-xl">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-secondary">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Empty state ---------- */

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <p className="text-sm text-ink-secondary">{message}</p>
      {action}
    </div>
  )
}

/* ---------- Page header ---------- */

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
