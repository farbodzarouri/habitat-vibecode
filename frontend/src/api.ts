import type { Admin, StockItem, Order, Customer } from './types'

// Adapter for the Spring Boot API (see BACKEND-TODO.md for the gap list).
// Backend shapes differ from the UI types: camelCase fields, embedded
// customer address, BigDecimal amounts, LocalDateTime order dates, and
// stock has no type/category/code yet.

interface ApiAdmin {
  id: number
  username: string
  password: string
  email: string
  phoneNumber: string
}

interface ApiAddress {
  street: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
}

interface ApiCustomer {
  id: number
  name: string
  address: ApiAddress | null
}

interface ApiStock {
  id: number
  name: string
  description: string | null
  price: number | null
  amount: number
}

interface ApiOrder {
  id: number
  idempotencyKey: string
  customerId: number
  adminId: number
  stockId: number
  amount: number
  orderDate: string // LocalDateTime, e.g. 2026-07-13T00:00:00
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} /api${path} → ${res.status}`)
  return res.json() as Promise<T>
}

/* ---------- backend → frontend mapping ---------- */

const toAdmin = (a: ApiAdmin): Admin => ({
  id: a.id,
  username: a.username,
  password: '', // never keep the password client-side
  email: a.email ?? '',
  phone_number: a.phoneNumber ?? '',
  role: 'Admin', // backend has no role field yet
})

const toCustomer = (c: ApiCustomer): Customer => ({
  id: c.id,
  name: c.name,
  address: c.address
    ? [c.address.street, c.address.city, c.address.state, c.address.postalCode, c.address.country]
        .filter(Boolean)
        .join(', ')
    : '',
})

const toStock = (s: ApiStock): StockItem => ({
  id: s.id,
  name: s.name,
  amount: Number(s.amount ?? 0),
  type: s.description ?? '',
  category_id: 0, // backend has no categories yet
  code: `STK-${String(s.id).padStart(3, '0')}`,
})

const toOrder = (o: ApiOrder): Order => ({
  id: o.id,
  stock_id: o.stockId,
  date: (o.orderDate ?? '').slice(0, 10),
  amount: Number(o.amount ?? 0),
  customer_id: o.customerId,
  admin_id: o.adminId,
})

/* ---------- reads ---------- */

export async function fetchAll() {
  const [apiAdmins, apiCustomers, apiOrders, stockIds] = await Promise.all([
    request<ApiAdmin[]>('/admins/all'),
    request<ApiCustomer[]>('/customers/all'),
    request<ApiOrder[]>('/orders/all'),
    request<number[]>('/stocks/all/ids'),
  ])
  // The stock list endpoint only returns ids; fetch each item
  const apiStock = await Promise.all(stockIds.map((id) => request<ApiStock>(`/stocks/id/${id}`)))
  return {
    admins: apiAdmins.map(toAdmin),
    customers: apiCustomers.map(toCustomer),
    orders: apiOrders.map(toOrder),
    stock: apiStock.map(toStock),
  }
}

/* ---------- auth ---------- */

export async function apiLogin(username: string, password: string): Promise<boolean> {
  const res = await fetch('/api/login/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return res.ok
}

/* ---------- creates (backend has no update/delete endpoints yet) ---------- */

export async function createAdmin(a: Omit<Admin, 'id'>): Promise<Admin> {
  const created = await request<ApiAdmin>('/admins/add', {
    method: 'POST',
    body: JSON.stringify({
      username: a.username,
      password: a.password,
      email: a.email,
      phoneNumber: a.phone_number,
    }),
  })
  return { ...toAdmin(created), role: a.role }
}

export async function createCustomer(c: Omit<Customer, 'id'>): Promise<Customer> {
  const created = await request<ApiCustomer>('/customers/add', {
    method: 'POST',
    body: JSON.stringify({ name: c.name, address: { street: c.address } }),
  })
  return toCustomer(created)
}

export async function createStock(s: Omit<StockItem, 'id'>): Promise<StockItem> {
  const created = await request<ApiStock>('/stocks/add', {
    method: 'POST',
    body: JSON.stringify({ name: s.name, description: s.type, amount: s.amount, price: 0 }),
  })
  // preserve UI-only fields the backend doesn't store yet
  return { ...toStock(created), code: s.code, category_id: s.category_id }
}

export async function createOrder(o: Omit<Order, 'id'>): Promise<Order> {
  const created = await request<ApiOrder>('/orders/add', {
    method: 'POST',
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      customerId: o.customer_id,
      adminId: o.admin_id,
      stockId: o.stock_id,
      amount: o.amount,
      orderDate: `${o.date}T00:00:00`,
    }),
  })
  return toOrder(created)
}

/* ---------- demo seed (until the backend ships its own seed script) ---------- */

export async function seedIfEmpty(mock: {
  admins: Admin[]
  customers: Customer[]
  stock: StockItem[]
  orders: Order[]
}): Promise<boolean> {
  const admins = await request<ApiAdmin[]>('/admins/all')
  if (admins.length > 0) return false
  const idMap = { admins: new Map<number, number>(), customers: new Map<number, number>(), stock: new Map<number, number>() }
  for (const a of mock.admins) {
    const created = await createAdmin(a)
    idMap.admins.set(a.id, created.id)
  }
  for (const c of mock.customers) {
    const created = await createCustomer(c)
    idMap.customers.set(c.id, created.id)
  }
  for (const s of mock.stock) {
    const created = await createStock(s)
    idMap.stock.set(s.id, created.id)
  }
  for (const o of mock.orders) {
    await createOrder({
      ...o,
      admin_id: idMap.admins.get(o.admin_id) ?? o.admin_id,
      customer_id: idMap.customers.get(o.customer_id) ?? o.customer_id,
      stock_id: idMap.stock.get(o.stock_id) ?? o.stock_id,
    })
  }
  return true
}
