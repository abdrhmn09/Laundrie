import { Children, type ReactNode, isValidElement } from 'react'

interface StaggerProps {
  children: ReactNode
  delay?: number
  stagger?: number
  className?: string
  as?: 'div' | 'ul' | 'ol' | 'nav'
}

export function Stagger({
  children,
  delay = 0,
  stagger = 80,
  className = '',
  as: Tag = 'div',
}: StaggerProps) {
  return (
    <Tag className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child
        return (
          <div
            className="motion-fade-in"
            style={{
              '--motion-delay': `${delay + i * stagger}ms`,
              '--motion-duration': '400ms',
              '--motion-transform': 'translateY(10px)',
            } as React.CSSProperties}
          >
            {child}
          </div>
        )
      })}
    </Tag>
  )
}
