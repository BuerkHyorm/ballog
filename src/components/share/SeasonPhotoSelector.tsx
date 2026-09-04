import { Check, ImageIcon, LoaderCircle } from 'lucide-react'
import type { RecordImage } from '../../types/recordImage'

interface SeasonPhotoSelectorProps {
  images: RecordImage[]
  selectedIds: string[]
  isLoading: boolean
  error: string
  onToggle: (id: string) => void
}

export function SeasonPhotoSelector({ images, selectedIds, isLoading, error, onToggle }: SeasonPhotoSelectorProps) {
  const photos = images.filter((image) => image.type === 'photo' && image.signedUrl)
  return <section className="mb-4 rounded-3xl bg-white p-4 text-slate-900">
    <div className="flex items-center justify-between gap-3"><div><h3 className="font-black">시즌 사진 선택</h3><p className="mt-0.5 text-xs text-slate-500">포스터에 넣을 직관 사진을 최대 3장 골라주세요.</p></div><span className="shrink-0 text-sm font-black text-team">{selectedIds.length}/3</span></div>
    {isLoading ? <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />사진 불러오는 중</div>
      : error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</p>
      : photos.length === 0 ? <div className="mt-3 flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-slate-50 text-sm text-slate-500"><ImageIcon className="h-4 w-4" />이 시즌에 업로드한 직관 사진이 없어요.</div>
      : <div className="mt-3 grid grid-cols-4 gap-2">{photos.map((photo) => {
        const selected = selectedIds.includes(photo.id)
        return <button key={photo.id} type="button" aria-pressed={selected} aria-label={selected ? '사진 선택 해제' : '사진 선택'} onClick={() => onToggle(photo.id)} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${selected ? 'border-team' : 'border-transparent'}`}><img src={photo.signedUrl} alt="시즌 직관" className="h-full w-full object-cover" />{selected && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-team text-white"><Check className="h-3 w-3" /></span>}</button>
      })}</div>}
    <p className="mt-3 text-[11px] text-slate-400">선택하지 않으면 기존 사진 없는 포스터로 생성됩니다.</p>
  </section>
}
