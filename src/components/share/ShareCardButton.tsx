import { Download, LoaderCircle, Share2, X } from 'lucide-react'
import { useState } from 'react'
import { getTeamTheme } from '../../data/teamThemes'
import type { ShareCardData } from '../../types/share'
import type { RecordImage } from '../../types/recordImage'
import { exportShareCard } from '../../utils/exportShareCard'
import { TeamLogo } from '../common/TeamLogo'
import { SeasonPhotoSelector } from './SeasonPhotoSelector'

function RecordCardPreview({ data }: { data: ShareCardData }) {
  const theme = getTeamTheme(data.teamId)
  return <div className="aspect-[4/5] overflow-hidden rounded-[32px] p-7 text-white shadow-2xl" style={{ background: `linear-gradient(145deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}><div className="flex h-full flex-col"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/90 p-2"><TeamLogo teamId={data.teamId} className="h-full w-full" /></div><p className="mt-6 text-xs font-bold text-white/60">BALLOG · {data.eyebrow}</p><h2 className="mt-2 text-3xl font-black">{data.title}</h2><p className="mt-3 text-lg font-bold text-white/85">{data.headline}</p><div className="mt-7 space-y-3 rounded-3xl bg-white/10 p-5">{data.details.map((detail) => <p key={detail} className="font-bold">{detail}</p>)}</div>{data.footer && <p className="mt-auto text-sm text-white/65">{data.footer}</p>}</div></div>
}

function SeasonRecapPreview({ data }: { data: Extract<ShareCardData, { kind: 'season-recap' }> }) {
  const theme = getTeamTheme(data.teamId); const recap = data.recap; const photos = recap.photos ?? []
  return <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] p-6 text-white shadow-2xl" style={{ background: `linear-gradient(145deg, ${theme.primaryColor}, ${theme.secondaryColor} 58%, ${theme.primaryColor})` }}><div className="absolute left-1/3 top-1/3 h-64 w-64 opacity-[0.04]"><TeamLogo teamId={data.teamId} className="h-full w-full" /></div><div className="relative flex h-full flex-col"><div className="flex items-start justify-between"><div><p className="text-lg font-black">BALLOG</p><p className="text-[9px] font-bold tracking-widest text-white/55">SEASON RECAP</p></div><div className="flex items-center gap-2"><b className="text-4xl font-black text-white/15">{recap.season}</b><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/90 p-1.5"><TeamLogo teamId={data.teamId} className="h-full w-full" /></span></div></div><div className={`${photos.length ? 'mt-3' : 'mt-6'} grid grid-cols-[1fr_auto] items-end gap-4`}><div><p className="text-[9px] font-bold text-white/50">TOTAL GAMES</p><strong className={`${photos.length ? 'text-6xl' : 'text-8xl'} font-black leading-none`}>{recap.total}</strong><span className="ml-2 text-sm font-black text-white/60">GAMES</span></div><div className="pb-2 text-right"><p className="text-xl font-black">{recap.wins}W · {recap.draws}D · {recap.losses}L</p><p className="mt-2 text-xs font-bold text-white/60">WIN RATE <b className="ml-1 text-lg" style={{ color: theme.accentColor }}>{recap.winRate}%</b></p></div></div>{photos.length > 0 && <div className="mt-3 grid h-28 grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden rounded-xl"><img src={photos[0].url} alt="선택한 시즌 직관" className={`${photos.length === 1 ? 'col-span-3 row-span-2' : 'col-span-2 row-span-2'} h-full w-full object-cover`}/>{photos.slice(1, 3).map((photo) => <img key={photo.id} src={photo.url} alt="선택한 시즌 직관" className="h-full w-full object-cover" />)}</div>}{recap.tagline && <div className={photos.length ? 'mt-3' : 'mt-7'}><p className="text-[9px] font-bold text-white/55">SEASON HIGHLIGHT</p><p className="mt-0.5 truncate text-xl font-black">{recap.tagline}</p></div>}<div className={`${photos.length ? 'mt-3 pt-3' : 'mt-7 pt-5'} border-t border-white/20`}>{recap.highlights[0] && <div><p className={`${photos.length ? 'text-lg' : 'text-2xl'} truncate font-black`}>{recap.highlights[0].value}</p><p className="text-[9px] font-bold text-white/50">{recap.highlights[0].label}</p></div>}<div className={`${photos.length ? 'mt-2' : 'mt-5'} grid grid-cols-3 gap-3`}>{recap.highlights.slice(1).map((item) => <div key={item.label} className="min-w-0 border-l border-white/15 pl-2 first:border-0 first:pl-0"><p className="truncate text-sm font-black">{item.value}</p><p className="mt-1 truncate text-[8px] font-bold text-white/50">{item.label}</p></div>)}</div></div><div className="mt-auto"><div className="flex justify-between text-[10px] font-black"><span>{recap.firstDate}</span><span>{recap.lastDate}</span></div><div className="mt-2 flex items-center"><span className="h-2 w-2 rounded-full bg-white" /><span className="h-px flex-1 bg-white/35" /><span className="h-2 w-2 rounded-full bg-white" /></div><div className="mt-2 flex justify-between text-[8px] font-bold text-white/55"><span>시즌 첫 직관</span><span>시즌 마지막 직관</span></div><p className="mt-3 text-[10px] font-bold text-white/65">BALLOG · 야구장의 순간을 기록하다.</p></div></div></div>
}

function CardPreview({ data }: { data: ShareCardData }) {
  return data.kind === 'season-recap' ? <SeasonRecapPreview data={data} /> : <RecordCardPreview data={data} />
}

interface ShareCardButtonProps {
  data: ShareCardData
  label?: string
  seasonImages?: RecordImage[]
  seasonImagesLoading?: boolean
  seasonImagesError?: string
}

export function ShareCardButton({ data, label = '공유 카드 만들기', seasonImages = [], seasonImagesLoading = false, seasonImagesError = '' }: ShareCardButtonProps) {
  const [open, setOpen] = useState(false); const [exporting, setExporting] = useState(false); const [error, setError] = useState('')
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const selectedPhotos = seasonImages.filter((image) => selectedPhotoIds.includes(image.id)).slice(0, 3)
  const exportData: ShareCardData = data.kind === 'season-recap' ? { ...data, recap: { ...data.recap, photos: selectedPhotos.map((photo) => ({ id: photo.id, url: photo.signedUrl })) } } : data
  const togglePhoto = (id: string) => setSelectedPhotoIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current)
  const save = async () => { setExporting(true); setError(''); try { await exportShareCard(exportData) } catch (caught) { if (caught instanceof DOMException && caught.name === 'AbortError') return; setError(caught instanceof Error ? caught.message : '이미지를 저장하지 못했습니다.') } finally { setExporting(false) } }
  return <><button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-team px-5 text-sm font-bold text-white shadow-team"><Share2 className="h-4 w-4" />{label}</button>{open && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"><div className="mx-auto flex min-h-full max-w-md items-center py-4"><div className="w-full"><div className="mb-3 flex justify-end"><button aria-label="닫기" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white"><X /></button></div>{data.kind === 'season-recap' && <SeasonPhotoSelector images={seasonImages} selectedIds={selectedPhotoIds} isLoading={seasonImagesLoading} error={seasonImagesError} onToggle={togglePhoto} />}<CardPreview data={exportData} />{error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}<button type="button" disabled={exporting} onClick={() => void save()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white font-bold text-slate-900 disabled:opacity-60">{exporting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}{exporting ? '이미지 만드는 중...' : '이미지 만들기'}</button></div></div></div>}</>
}
