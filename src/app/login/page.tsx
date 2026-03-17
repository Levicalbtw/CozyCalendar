'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = isSignUp ? await signup(formData) : await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-texture flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--terracotta)] flex items-center justify-center shadow-paper mx-auto mb-4">
            <span className="text-white text-3xl">☁️</span>
          </div>
          <h1 className="font-hand text-4xl text-[var(--ink)]">Cozy Calendar</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-2">
            {isSignUp ? 'Create your cozy space' : 'Welcome back to your cozy space'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface-raised)] rounded-2xl p-7 shadow-paper border border-[var(--border-soft)]">
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-[var(--paper-warm)] rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] outline-none focus:border-[var(--blush)] transition-colors"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full bg-[var(--paper-warm)] rounded-xl border border-[var(--border-soft)] px-4 py-3 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] outline-none focus:border-[var(--blush)] transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="text-xs text-[var(--terracotta)] bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--terracotta)] hover:bg-[var(--honey)] text-white font-medium py-3 rounded-xl shadow-paper transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
              className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
