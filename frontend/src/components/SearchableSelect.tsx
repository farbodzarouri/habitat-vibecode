import { useEffect, useRef, useState } from 'react'

export interface SelectOption {
  value: number
  label: string
  sublabel?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  error,
}: {
  options: SelectOption[]
  value: number | null
  onChange: (value: number) => void
  placeholder: string
  error?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const selected = options.find((o) => o.value === value)
  const q = query.toLowerCase()
  const filtered = options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
  )

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setQuery('')
        }}
        className={`flex w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-left text-sm outline-none focus:border-cocoa-600 focus:ring-1 focus:ring-cocoa-600 ${
          error ? 'border-danger' : 'border-line-strong'
        } ${selected ? 'text-ink' : 'text-ink-muted'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-ink-muted" aria-hidden>
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-surface shadow-lg">
          <div className="border-b border-line p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="w-full rounded-md border border-line-strong px-2.5 py-1.5 text-sm outline-none focus:border-cocoa-600"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-ink-muted">No matches.</li>}
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-tan-50 ${
                    o.value === value ? 'bg-tan-50 font-medium' : ''
                  }`}
                >
                  <span>{o.label}</span>
                  {o.sublabel && <span className="text-xs text-ink-muted">{o.sublabel}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
