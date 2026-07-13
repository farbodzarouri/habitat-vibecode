import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Admin, Category, StockItem, Order, Customer } from './types'
import { mockAdmins, mockCategories, mockStock, mockOrders, mockCustomers } from './data/mock'
import * as api from './api'

interface Store {
  admins: Admin[]
  categories: Category[]
  stock: StockItem[]
  orders: Order[]
  customers: Customer[]
  currentUser: Admin | null
  /** true = talking to the Spring Boot API; false = in-memory mock fallback */
  apiConnected: boolean
  login: (username: string, password: string) => Promise<boolean>
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

// Module-level so React StrictMode's double-mounted effect can't seed twice.
let bootstrapStarted = false

export function StoreProvider({ children }: { children: ReactNode }) {
  const [admins, setAdmins] = useState(mockAdmins)
  const [stock, setStock] = useState(mockStock)
  const [orders, setOrders] = useState(mockOrders)
  const [customers, setCustomers] = useState(mockCustomers)
  const [currentUser, setCurrentUser] = useState<Admin | null>(null)
  const [apiConnected, setApiConnected] = useState(false)

  useEffect(() => {
    // Module-level guard (not a cleanup flag): StrictMode re-runs this effect
    // on the same mounted instance, and a second run must not re-seed.
    if (bootstrapStarted) return
    bootstrapStarted = true
    ;(async () => {
      try {
        // Seed the (in-memory H2) backend with demo data on first connect,
        // otherwise nobody can log in. Remove once the backend seeds itself.
        await api.seedIfEmpty({ admins: mockAdmins, customers: mockCustomers, stock: mockStock, orders: mockOrders })
        const data = await api.fetchAll()
        setAdmins(data.admins)
        setCustomers(data.customers)
        setStock(data.stock)
        setOrders(data.orders)
        setApiConnected(true)
      } catch {
        // Backend not running — stay on mock data so the UI remains usable.
        setApiConnected(false)
      }
    })()
  }, [])

  const store: Store = {
    admins,
    categories: mockCategories,
    stock,
    orders,
    customers,
    currentUser,
    apiConnected,
    login: async (username, password) => {
      if (apiConnected) {
        const ok = await api.apiLogin(username, password)
        if (!ok) return false
        const user = admins.find((a) => a.username.toLowerCase() === username.trim().toLowerCase())
        if (!user) return false
        setCurrentUser(user)
        return true
      }
      const user = admins.find(
        (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password,
      )
      if (!user) return false
      setCurrentUser(user)
      return true
    },
    logout: () => setCurrentUser(null),
    addAdmin: (a) => {
      if (apiConnected) {
        api.createAdmin(a).then((created) => setAdmins((rows) => [...rows, created]))
      } else {
        setAdmins((rows) => [...rows, { ...a, id: nextId(rows) }])
      }
    },
    // Update/delete are local-only for now: the backend has no PUT/DELETE
    // endpoints yet (tracked in BACKEND-TODO.md).
    updateAdmin: (a) => setAdmins((rows) => rows.map((r) => (r.id === a.id ? a : r))),
    deleteAdmin: (id) => setAdmins((rows) => rows.filter((r) => r.id !== id)),
    addStock: (s) => {
      if (apiConnected) {
        api.createStock(s).then((created) => setStock((rows) => [...rows, created]))
      } else {
        setStock((rows) => [...rows, { ...s, id: nextId(rows) }])
      }
    },
    updateStock: (s) => setStock((rows) => rows.map((r) => (r.id === s.id ? s : r))),
    deleteStock: (id) => setStock((rows) => rows.filter((r) => r.id !== id)),
    addOrder: (o) => {
      if (apiConnected) {
        api.createOrder(o).then((created) => setOrders((rows) => [...rows, created]))
      } else {
        setOrders((rows) => [...rows, { ...o, id: nextId(rows) }])
      }
    },
    updateOrder: (o) => setOrders((rows) => rows.map((r) => (r.id === o.id ? o : r))),
    deleteOrder: (id) => setOrders((rows) => rows.filter((r) => r.id !== id)),
    addCustomer: (c) => {
      if (apiConnected) {
        api.createCustomer(c).then((created) => setCustomers((rows) => [...rows, created]))
      } else {
        setCustomers((rows) => [...rows, { ...c, id: nextId(rows) }])
      }
    },
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
