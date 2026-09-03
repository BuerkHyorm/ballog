export function LoadingState({ label = '데이터를 불러오는 중...' }: { label?: string }) {
  return <div className="card grid min-h-56 place-items-center p-8 text-sm font-semibold text-slate-500"><span className="animate-pulse">{label}</span></div>
}
