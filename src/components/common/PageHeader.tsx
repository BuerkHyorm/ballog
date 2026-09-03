import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="mb-7 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-team">{eyebrow}</p>}
        <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </header>
  )
}
