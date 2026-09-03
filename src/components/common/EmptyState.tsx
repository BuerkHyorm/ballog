import { ClipboardList } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="card grid min-h-56 place-items-center p-8 text-center"><div><ClipboardList className="mx-auto mb-3 h-8 w-8 text-team" /><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div></div>
}
