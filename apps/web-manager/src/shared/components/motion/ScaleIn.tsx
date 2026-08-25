import { type ReactNode } from 'react'

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  scale?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 350,
  scale = 0.95,
  className = '',
  as: Tag = 'div',
}: ScaleInProps) {
  return (
    <Tag
      className={`motion-scale-in ${className}`}
      style={{
        '--motion-delay': `${delay}ms`,
        '--motion-duration': `${duration}ms`,
        '--motion-scale': scale,
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
