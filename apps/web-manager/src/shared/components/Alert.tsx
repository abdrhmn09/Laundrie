import { type ReactNode } from 'react'

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' }) {
  const styles =
    tone === 'error'
      ? 'bg-error-container text-on-error-container'
      : 'bg-status-success-container text-status-success'

  return (
    <div role="alert" className={`rounded-[--radius-md] px-4 py-3 text-sm font-medium ${styles}`}>
      {children}
    </div>
  )
}