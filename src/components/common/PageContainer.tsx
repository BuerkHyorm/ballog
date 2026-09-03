import type { ReactNode } from 'react'

export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-5 pb-28 pt-6 md:px-8 md:pb-10 ${className}`}>{children}</div>
}
