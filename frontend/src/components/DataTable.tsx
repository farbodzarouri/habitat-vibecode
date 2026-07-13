import { useMemo, useState, type ReactNode } from 'react'
import { EmptyState } from './ui'

export interface Column<T> {
  key: string
  header: string
  sortValue?: (row: T) => string | number
  render: (row: T) => ReactNode
  numeric?: boolean
}

export function DataTable<T extends { id: number }>({
  columns,
  rows,
  emptyMessage,
  emptyAction,
  onRowClick,
  rowActions,
}: {
  columns: Column<T>[]
  rows: T[]
  emptyMessage: string
  emptyAction?: ReactNode
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => ReactNode
}) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return rows
    const val = col.sortValue
    return [...rows].sort((a, b) => {
      const va = val(a)
      const vb = val(b)
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, columns, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (rows.length === 0) return <EmptyState message={emptyMessage} action={emptyAction} />

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-line bg-tan-50/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-secondary ${col.numeric ? 'text-right' : 'text-left'}`}
              >
                {col.sortValue ? (
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-ink"
                    aria-label={`Sort by ${col.header}`}
                  >
                    {col.header}
                    <span className="text-[10px] text-ink-muted" aria-hidden>
                      {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
            {rowActions && <th className="px-4 py-2.5" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-line last:border-b-0 ${onRowClick ? 'cursor-pointer hover:bg-tan-50/50' : 'hover:bg-tan-50/30'}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-2.5 ${col.numeric ? 'text-right tabular-nums' : ''}`}>
                  {col.render(row)}
                </td>
              ))}
              {rowActions && (
                <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">{rowActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RowActionButton({ label, danger, onClick }: { label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs font-medium ${
        danger ? 'text-danger hover:bg-danger-bg' : 'text-ink-secondary hover:bg-tan-50 hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}
