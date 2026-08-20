import { type ReactNode } from 'react'

interface FieldProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && (
        <span role="alert" className="field-error">
          {error}
        </span>
      )}
    </div>
  )
}