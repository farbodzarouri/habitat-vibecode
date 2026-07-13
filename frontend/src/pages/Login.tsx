import { useState } from 'react'
import { useStore } from '../store'
import { Button, Field, TextInput } from '../components/ui'

export function Login() {
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    if (!(await login(username, password))) {
      setError('Incorrect username or password.')
      return
    }
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex h-20 items-center justify-center overflow-hidden">
          <img src="/logo.jpg" alt="Valentein Chocolate" className="w-56 scale-[1.5] mix-blend-multiply" />
        </div>
        <div className="rounded-xl border border-line bg-surface p-6">
          <h1 className="text-base font-semibold text-ink">Sign in</h1>
          <p className="mt-0.5 text-sm text-ink-secondary">Internal employee &amp; inventory management</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <Field label="Username">
              <TextInput value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </Field>
            {error && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full justify-center">Sign in</Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-ink-muted">
          Demo build — sign in with <span className="font-medium">mvandenberg</span> / <span className="font-medium">Truffle!2026</span>
        </p>
      </div>
    </div>
  )
}
