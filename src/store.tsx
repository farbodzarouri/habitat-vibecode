import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Admin, Category, StockItem, Order, Customer } from './types'
import { mockAdmins, mockCategories, mockStock, mockOrders, mockCustomers } from './data/mock'

interface Store {
  admins: Admin[]
  categories: Category[]
  stock: StockItem[]
  orders: Order[]
  customers: Customer[]
  currentUser: Admin | null
  login: (username: string, password: string) => boolean
  logout: () => void
  addAdmin: (a: Omit<Admin, 'id'>) => void
  updateAdmin: (a: Admin) => void
  deleteAdmin: (id: number) => void
  addStock: (s: Omit<StockItem, 'id'>) => void
  updateStock: (s: StockItem) => void
  deleteStock: (id: number) => void
  addOrder: (o: Omit<Order, 'id'>) => void
  updateOrder: (o: Order) => void
  deleteOrder: (id: number) => void
  addCustomer: (c: Omit<Customer, 'id'>) => void
  updateCustomer: (c: Customer) => void
  deleteCustomer: (id: number) => void
}

const StoreContext = createContext<Store | null>(null)

const nextId = (rows: { id: number }[]) =>
  rows.reduce((max, r) => Math.max(max, r.id), 0) + 1

export function StoreProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState(mockAdmins)
  const [stock, setStock] = useState(mockStock)
  const [orders, setOrders] = useState(mockOrders)
  const [customers, setCustomers] = useState(mockCustomers)
  const [currentUser, setCurrentUser] = useState<Admin | null>(null)

  const store: Store = {
    admins,
    categories: mockCategories,
    stock,
    orders,
    customers,
    currentUser,
    login: (username, password) => {
      const user = admins.find(
        (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password,
      )
      if (!user) return false
      setCurrentUser(user)
      return true
    },
    logout: () => setCurrentUser(null),
    addAdmin: (a) => setAdmins((rows) => [...rows, { ...a, id: nextId(rows) }]),
    updateAdmin: (a) => setAdmins((rows) => rows.map((r) => (r.id === a.id ? a : r))),
    deleteAdmin: (id) => setAdmins((rows) => rows.filter((r) => r.id !== id)),
    addStock: (s) => setStock((rows) => [...rows, { ...s, id: nextId(rows) }]),
    updateStock: (s) => setStock((rows) => rows.map((r) => (r.id === s.id ? s : r))),
    deleteStock: (id) => setStock((rows) => rows.filter((r) => r.id !== id)),
    addOrder: (o) => setOrders((rows) => [...rows, { ...o, id: nextId(rows) }]),
    updateOrder: (o) => setOrders((rows) => rows.map((r) => (r.id === o.id ? o : r))),
    deleteOrder: (id) => setOrders((rows) => rows.filter((r) => r.id !== id)),
    addCustomer: (c) => setCustomers((rows) => [...rows, { ...c, id: nextId(rows) }]),
    updateCustomer: (c) => setCustomers((rows) => rows.map((r) => (r.id === c.id ? c : r))),
    deleteCustomer: (id) => setCustomers((rows) => rows.filter((r) => r.id !== id)),
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
