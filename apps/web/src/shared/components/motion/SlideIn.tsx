import { type ReactNode } from 'react'

type SlideDirection = 'up' | 'down' | 'left' | 'right'

interface SlideInProps {
  children: ReactNode
  from?: SlideDirection
  delay?: number
  duration?: number
  distance?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

const getTransform = (from: SlideDirection, distance: number): string => {
  const map: Record<SlideDirection, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  }
  return map[from]
}

export function SlideIn({
  children,
  from = 'up',
  delay = 0,
  duration = 450,
  distance = 20,
  className = '',
  as: Tag = 'div',
}: SlideInProps) {
  return (
    <Tag
      className={`motion-slide-in ${className}`}
      style={{
        '--motion-delay': `${delay}ms`,
        '--motion-duration': `${duration}ms`,
        '--motion-transform': getTransform(from, distance),
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
