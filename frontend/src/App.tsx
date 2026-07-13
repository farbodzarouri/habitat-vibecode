import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider, useStore } from './store'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Employees } from './pages/Employees'
import { Stock } from './pages/Stock'
import { Orders } from './pages/Orders'
import { Customers } from './pages/Customers'
import { CustomerDetail } from './pages/CustomerDetail'

function AppRoutes() {
  const { currentUser } = useStore()
  if (!currentUser) return <Login />
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppRoutes />
      </StoreProvider>
    </ErrorBoundary>
  )
}
