import { ImagePlus, Ticket, X } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { MAX_RECORD_IMAGES_PER_TYPE, validateRecordImage } from '../../services/recordImageService'
import type { PendingRecordImage, RecordImageType } from '../../types/recordImage'

function Picker({ type, label, files, onChange }: { type: RecordImageType; label: string; files: File[]; onChange: (files: File[]) => void }) {
  const [error, setError] = useState('')
  const Icon = type === 'photo' ? ImagePlus : Ticket
  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = [...(event.target.files ?? [])]
    const invalid = selected.map(validateRecordImage).find(Boolean)
    if (invalid) { setError(invalid); event.target.value = ''; return }
    if (files.length + selected.length > MAX_RECORD_IMAGES_PER_TYPE) { setError(`종류별 최대 ${MAX_RECORD_IMAGES_PER_TYPE}장까지 첨부할 수 있습니다.`); event.target.value = ''; return }
    setError(''); onChange([...files, ...selected]); event.target.value = ''
  }
  return <div><label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500 hover:border-team hover:bg-team-soft"><Icon className="h-6 w-6 text-team" />{label}<span className="text-[11px] font-normal text-slate-400">JPG · PNG · WebP · HEIC, 장당 최대 8MB</span><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="sr-only" onChange={selectFiles} /></label>{files.length > 0 && <ul className="mt-2 space-y-1">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"><span className="min-w-0 truncate text-slate-600">{file.name}</span><button type="button" aria-label={`${file.name} 제거`} onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))} className="ml-2 text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button></li>)}</ul>}{error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}</div>
}

export function RecordImagePicker({ images, onChange }: { images: PendingRecordImage[]; onChange: (images: PendingRecordImage[]) => void }) {
  const filesOf = (type: RecordImageType) => images.filter((image) => image.type === type).map((image) => image.file)
  const replace = (type: RecordImageType, files: File[]) => onChange([...images.filter((image) => image.type !== type), ...files.map((file) => ({ file, type }))])
  return <section className="card p-5 md:p-7"><h2 className="font-bold">사진과 티켓</h2><p className="mb-5 mt-1 text-xs text-slate-400">기록이 먼저 저장된 뒤 private Storage에 업로드됩니다.</p><div className="grid gap-4 sm:grid-cols-2"><Picker type="photo" label="직관 사진 선택" files={filesOf('photo')} onChange={(files) => replace('photo', files)} /><Picker type="ticket" label="티켓 이미지 선택" files={filesOf('ticket')} onChange={(files) => replace('ticket', files)} /></div></section>
}
