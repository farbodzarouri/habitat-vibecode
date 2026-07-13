import type { Admin, Category, StockItem, Order, Customer } from '../types'

export const mockAdmins: Admin[] = [
  { id: 1, username: 'mvandenberg', password: 'Truffle!2026', email: 'm.vandenberg@valentein.local', phone_number: '+31 20 555 0101', role: 'Admin' },
  { id: 2, username: 'sokafor', password: 'Ganache#88', email: 's.okafor@valentein.local', phone_number: '+31 20 555 0102', role: 'Manager' },
  { id: 3, username: 'lpetit', password: 'Praline$41', email: 'l.petit@valentein.local', phone_number: '+31 20 555 0103', role: 'Operator' },
  { id: 4, username: 'dkowalski', password: 'Nougat!73', email: 'd.kowalski@valentein.local', phone_number: '+31 20 555 0104', role: 'Operator' },
  { id: 5, username: 'ryamada', password: 'Couvert@19', email: 'r.yamada@valentein.local', phone_number: '+31 20 555 0105', role: 'Manager' },
]

export const mockCategories: Category[] = [
  { id: 1, name: 'Raw ingredients' },
  { id: 2, name: 'Finished bars' },
  { id: 3, name: 'Pralines & truffles' },
  { id: 4, name: 'Packaging' },
  { id: 5, name: 'Seasonal' },
]

export const mockStock: StockItem[] = [
  { id: 1, name: 'Cocoa mass, Ghana 100%', amount: 420, type: 'Bulk (kg)', category_id: 1, code: 'RAW-001' },
  { id: 2, name: 'Cocoa butter, deodorized', amount: 18, type: 'Bulk (kg)', category_id: 1, code: 'RAW-002' },
  { id: 3, name: 'Cane sugar, fine', amount: 260, type: 'Bulk (kg)', category_id: 1, code: 'RAW-003' },
  { id: 4, name: 'Whole milk powder', amount: 95, type: 'Bulk (kg)', category_id: 1, code: 'RAW-004' },
  { id: 5, name: 'Hazelnuts, Piedmont', amount: 12, type: 'Bulk (kg)', category_id: 1, code: 'RAW-005' },
  { id: 6, name: 'Dark 72% bar 100g', amount: 1840, type: 'Unit', category_id: 2, code: 'BAR-072' },
  { id: 7, name: 'Milk 40% bar 100g', amount: 2310, type: 'Unit', category_id: 2, code: 'BAR-040' },
  { id: 8, name: 'White vanilla bar 90g', amount: 640, type: 'Unit', category_id: 2, code: 'BAR-090' },
  { id: 9, name: 'Sea salt caramel bar 100g', amount: 22, type: 'Unit', category_id: 2, code: 'BAR-101' },
  { id: 10, name: 'Champagne truffle, box of 9', amount: 155, type: 'Box', category_id: 3, code: 'TRF-009' },
  { id: 11, name: 'Hazelnut praline, box of 12', amount: 8, type: 'Box', category_id: 3, code: 'PRL-012' },
  { id: 12, name: 'Espresso truffle, box of 6', amount: 210, type: 'Box', category_id: 3, code: 'TRF-006' },
  { id: 13, name: 'Gift box sleeve, kraft', amount: 3400, type: 'Unit', category_id: 4, code: 'PKG-201' },
  { id: 14, name: 'Foil wrap roll, gold', amount: 14, type: 'Roll', category_id: 4, code: 'PKG-115' },
  { id: 15, name: 'Advent calendar 2026', amount: 480, type: 'Unit', category_id: 5, code: 'SEA-026' },
  { id: 16, name: 'Easter egg assortment 250g', amount: 0, type: 'Unit', category_id: 5, code: 'SEA-014' },
]

export const mockCustomers: Customer[] = [
  { id: 1, name: 'De Ruijter Delicatessen', address: 'Prinsengracht 214, 1016 HD Amsterdam' },
  { id: 2, name: 'Café Bruin', address: 'Oudegracht 88, 3511 AV Utrecht' },
  { id: 3, name: 'Hotel Meridiaan', address: 'Stationsplein 3, 3013 AJ Rotterdam' },
  { id: 4, name: 'Van Dijk Retail Group', address: 'Winkelcentrum Zuidplein 40, 3083 BB Rotterdam' },
  { id: 5, name: 'Boutique Cacao', address: 'Kleine Berg 17, 5611 JS Eindhoven' },
  { id: 6, name: 'Luchthaven Duty-Free BV', address: 'Evert v/d Beekstraat 202, 1118 CP Schiphol' },
  { id: 7, name: 'Bakkerij Smit & Zonen', address: 'Hoofdstraat 51, 9711 GD Groningen' },
]

export const mockOrders: Order[] = [
  { id: 1, stock_id: 7, date: '2026-07-13', amount: 240, customer_id: 4, admin_id: 2 },
  { id: 2, stock_id: 10, date: '2026-07-13', amount: 36, customer_id: 3, admin_id: 3 },
  { id: 3, stock_id: 6, date: '2026-07-13', amount: 120, customer_id: 1, admin_id: 1 },
  { id: 4, stock_id: 12, date: '2026-07-12', amount: 48, customer_id: 5, admin_id: 3 },
  { id: 5, stock_id: 9, date: '2026-07-12', amount: 60, customer_id: 6, admin_id: 2 },
  { id: 6, stock_id: 7, date: '2026-07-11', amount: 500, customer_id: 6, admin_id: 5 },
  { id: 7, stock_id: 8, date: '2026-07-10', amount: 80, customer_id: 2, admin_id: 4 },
  { id: 8, stock_id: 11, date: '2026-07-09', amount: 24, customer_id: 5, admin_id: 3 },
  { id: 9, stock_id: 6, date: '2026-07-08', amount: 300, customer_id: 4, admin_id: 2 },
  { id: 10, stock_id: 15, date: '2026-07-07', amount: 150, customer_id: 4, admin_id: 1 },
  { id: 11, stock_id: 10, date: '2026-07-04', amount: 20, customer_id: 1, admin_id: 4 },
  { id: 12, stock_id: 12, date: '2026-07-02', amount: 90, customer_id: 3, admin_id: 5 },
  { id: 13, stock_id: 7, date: '2026-06-30', amount: 400, customer_id: 6, admin_id: 2 },
  { id: 14, stock_id: 8, date: '2026-06-27', amount: 55, customer_id: 7, admin_id: 3 },
  { id: 15, stock_id: 6, date: '2026-06-24', amount: 180, customer_id: 2, admin_id: 1 },
]
