import { CircleAlert } from 'lucide-react'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="card grid min-h-56 place-items-center p-8 text-center"><div><CircleAlert className="mx-auto mb-3 h-8 w-8 text-red-500" /><h3 className="font-bold">불러오지 못했어요</h3><p className="mt-1 text-sm text-slate-500">{message}</p>{onRetry && <button onClick={onRetry} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">다시 시도</button>}</div></div>
}
