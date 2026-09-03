import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

const styles = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-team px-5 text-sm font-bold text-white shadow-lg shadow-team transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:opacity-50'

export function PrimaryButton({ children, to, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; to?: string }) {
  if (to) return <Link className={`${styles} ${className}`} to={to}>{children}</Link>
  return <button className={`${styles} ${className}`} {...props}>{children}</button>
}
