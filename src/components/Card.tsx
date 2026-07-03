import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`app-card-box ${className}`}>
      {children}
    </section>
  )
}

export default Card