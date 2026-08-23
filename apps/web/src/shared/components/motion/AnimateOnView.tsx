import { useEffect, useRef, type ReactNode } from 'react'

interface AnimateOnViewProps {
  children: ReactNode
  triggerOnce?: boolean
  threshold?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
}

export function AnimateOnView({
  children,
  triggerOnce = true,
  threshold = 0.15,
  className = '',
  as: Tag = 'div',
}: AnimateOnViewProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      el.classList.add('motion-visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('motion-visible')
          if (triggerOnce) observer.unobserve(el)
        } else if (!triggerOnce) {
          el.classList.remove('motion-visible')
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [triggerOnce, threshold])

  return (
    <Tag ref={ref} className={`motion-on-view ${className}`}>
      {children}
    </Tag>
  )
}
