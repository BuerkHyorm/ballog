import type { LucideIcon } from 'lucide-react'

export function StatCard({ label, value, subtext, icon: Icon, highlight = false }: { label: string; value: string | number; subtext?: string; icon?: LucideIcon; highlight?: boolean }) {
  return (
    <div className={`card relative overflow-hidden p-5 ${highlight ? 'ring-1 ring-team' : ''}`}>
      {highlight && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-team to-accent" />}
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        {Icon && <Icon className="h-5 w-5 text-team" />}
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  )
}
