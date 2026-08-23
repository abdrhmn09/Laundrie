import { type ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

interface FadeInProps {
  children: ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

const transformMap: Record<Direction, string> = {
  up: 'translateY(12px)',
  down: 'translateY(-12px)',
  left: 'translateX(12px)',
  right: 'translateX(-12px)',
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 400,
  className = '',
  as: Tag = 'div',
}: FadeInProps) {
  return (
    <Tag
      className={`motion-fade-in ${className}`}
      style={{
        '--motion-delay': `${delay}ms`,
        '--motion-duration': `${duration}ms`,
        '--motion-transform': transformMap[direction],
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
