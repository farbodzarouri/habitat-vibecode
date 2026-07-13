export interface Admin {
  id: number
  username: string
  password: string
  email: string
  phone_number: string
  role: 'Admin' | 'Manager' | 'Operator'
}

export interface Category {
  id: number
  name: string
}

export interface StockItem {
  id: number
  name: string
  amount: number
  type: string
  category_id: number
  code: string
}

export interface Order {
  id: number
  stock_id: number
  date: string // ISO yyyy-mm-dd
  amount: number
  customer_id: number
  admin_id: number
}

export interface Customer {
  id: number
  name: string
  address: string
}

export const LOW_STOCK_THRESHOLD = 25
