import { Image, LoaderCircle, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { RecordImage } from '../../types/recordImage'

export function RecordImageGallery({ images, isLoading, error, onDelete }: { images: RecordImage[]; isLoading: boolean; error: string; onDelete: (image: RecordImage) => Promise<void> }) {
  const [active, setActive] = useState<RecordImage | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const remove = async (image: RecordImage) => {
    if (!window.confirm('이 이미지를 삭제할까요?')) return
    setDeletingId(image.id); setDeleteError('')
    try { await onDelete(image); if (active?.id === image.id) setActive(null) }
    catch (caught) { setDeleteError(caught instanceof Error ? caught.message : '이미지를 삭제하지 못했습니다.') }
    finally { setDeletingId(null) }
  }
  if (isLoading) return <section className="card mt-5 flex items-center justify-center gap-2 p-6 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />이미지를 불러오는 중...</section>
  if (error) return <section className="card mt-5 p-5 text-sm font-semibold text-red-600">{error}</section>
  if (!images.length) return null
  return <section className="card mt-5 p-5 md:p-7"><h2 className="mb-4 flex items-center gap-2 font-black"><Image className="h-5 w-5 text-team" />사진과 티켓</h2>{deleteError && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{deleteError}</p>}{(['photo', 'ticket'] as const).map((type) => {
    const typedImages = images.filter((image) => image.type === type)
    if (!typedImages.length) return null
    return <div key={type} className="mb-5 last:mb-0"><h3 className="mb-2 text-xs font-bold text-slate-400">{type === 'photo' ? '직관 사진' : '티켓'}</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{typedImages.map((image) => <div key={image.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"><button type="button" onClick={() => setActive(image)} className="h-full w-full"><img src={image.signedUrl} alt={type === 'photo' ? '직관 사진' : '티켓 이미지'} className="h-full w-full object-cover" /></button><button type="button" disabled={deletingId === image.id} onClick={() => void remove(image)} aria-label="이미지 삭제" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>)}</div></div>
  })}{active && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={() => setActive(null)}><button aria-label="닫기" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white"><X /></button><img onClick={(event) => event.stopPropagation()} src={active.signedUrl} alt="확대 이미지" className="max-h-[88vh] max-w-full rounded-2xl object-contain" /></div>}</section>
}
