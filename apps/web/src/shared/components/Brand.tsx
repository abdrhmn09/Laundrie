import { Link } from 'react-router-dom'

export function Brand({ size = 'md', to = '/' }: { size?: 'sm' | 'md' | 'lg'; to?: string }) {
  const sizes = {
    sm: 'h-9 w-9 rounded-[--radius-sm]',
    md: 'h-11 w-11 rounded-[--radius-md]',
    lg: 'h-14 w-14 rounded-[--radius-md]',
  } as const

  return (
    <Link to={to} className="inline-flex items-center gap-2.5">
      <span
        className={`${sizes[size]} inline-flex items-center justify-center bg-primary text-on-primary shadow-[0px_2px_8px_rgba(14,116,144,0.35)]`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}
        >
          <path d="M4 4h16v16H4z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      </span>
      <span
        className={
          size === 'lg'
            ? 'font-display text-2xl font-extrabold tracking-tight text-on-surface'
            : size === 'sm'
              ? 'font-display text-base font-bold text-on-surface'
              : 'font-display text-xl font-extrabold tracking-tight text-on-surface'
        }
      >
        Laundrie
      </span>
    </Link>
  )
}

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight ${dark ? 'text-on-primary' : 'text-on-surface'}`}
    >
      Laundrie
    </span>
  )
}