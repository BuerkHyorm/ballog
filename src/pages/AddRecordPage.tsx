import { PencilLine, Save } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '../components/common/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { PrimaryButton } from '../components/common/PrimaryButton'
import { GameSelectionCard } from '../components/records/GameSelectionCard'
import { AttendanceDetailsFields, Field, RecordGameFields } from '../components/records/RecordFormSections'
import { useAuth } from '../hooks/useAuth'
import { getGamesByDate } from '../services/gameService'
import { createRecord } from '../services/recordService'
import type { KboGame } from '../types/game'
import type { TeamId } from '../types/team'
import { RecordImagePicker } from '../components/photos/RecordImagePicker'
import type { PendingRecordImage } from '../types/recordImage'
import { uploadRecordImages } from '../services/recordImageService'

export function AddRecordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const requestId = useRef(0)
  const [date, setDate] = useState('')
  const [games, setGames] = useState<KboGame[]>([])
  const [selectedGame, setSelectedGame] = useState<KboGame | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [loadingGames, setLoadingGames] = useState(false)
  const [gameError, setGameError] = useState('')
  const [rating, setRating] = useState(5)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<PendingRecordImage[]>([])

  const changeDate = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextDate = event.target.value
    const currentRequest = ++requestId.current
    setDate(nextDate); setGames([]); setSelectedGame(null); setManualMode(false); setGameError('')
    if (!nextDate) { setLoadingGames(false); return }
    setLoadingGames(true)
    try {
      const nextGames = await getGamesByDate(nextDate)
      if (currentRequest === requestId.current) setGames(nextGames)
    } catch (caught) {
      if (currentRequest === requestId.current) setGameError(caught instanceof Error ? caught.message : '경기 정보를 불러오지 못했습니다.')
    } finally {
      if (currentRequest === requestId.current) setLoadingGames(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || (!selectedGame && !manualMode)) return
    const form = new FormData(event.currentTarget)
    const homeTeam = selectedGame?.homeTeam ?? form.get('homeTeam') as TeamId
    const awayTeam = selectedGame?.awayTeam ?? form.get('awayTeam') as TeamId
    if (homeTeam === awayTeam) { setError('홈팀과 원정팀은 달라야 합니다.'); return }
    setSaving(true); setError('')
    try {
      const id = await createRecord(user.id, {
        gameId: selectedGame?.id ?? null,
        date,
        startTime: selectedGame?.time ?? String(form.get('startTime') || ''),
        homeTeam,
        awayTeam,
        stadium: selectedGame?.stadium ?? String(form.get('stadium') || ''),
        homeScore: Number(form.get('homeScore')),
        awayScore: Number(form.get('awayScore')),
        seat: String(form.get('seat')),
        companion: String(form.get('companion')),
        memo: String(form.get('memo')),
        rating,
      })
      let uploadWarning = ''
      if (images.length) {
        try { await uploadRecordImages(user.id, id, images) }
        catch { uploadWarning = '기록은 저장됐지만 일부 이미지를 업로드하지 못했습니다.' }
      }
      navigate(`/records/${id}`, { replace: true, state: uploadWarning ? { uploadWarning } : undefined })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '기록 저장에 실패했습니다.')
      setSaving(false)
    }
  }

  return <PageContainer><PageHeader eyebrow="New memory" title="직관 기록 추가" description="날짜를 선택하고 실제 KBO 경기에서 골라보세요." />
    <form onSubmit={submit} className="space-y-5"><section className="card p-5 md:p-7"><div className="mb-5"><h2 className="font-bold">경기 선택</h2><p className="mt-1 text-xs text-slate-400">수집된 경기가 없다면 직접 입력할 수 있습니다.</p></div><Field label="경기 날짜"><input name="date" type="date" value={date} onChange={(event) => void changeDate(event)} required /></Field>
      {loadingGames && <p className="mt-4 animate-pulse rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">해당 날짜의 경기를 찾는 중...</p>}
      {!loadingGames && date && games.length > 0 && <div className="mt-5 grid gap-3 md:grid-cols-2">{games.map((game) => <GameSelectionCard key={game.id} game={game} selected={selectedGame?.id === game.id} onSelect={() => { setSelectedGame(game); setManualMode(false) }} />)}</div>}
      {!loadingGames && date && games.length === 0 && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">이 날짜의 경기 정보를 찾지 못했어요.</p>}
      {gameError && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{gameError}</p>}
      {date && !loadingGames && games.length === 0 && <button type="button" onClick={() => { setManualMode(true); setSelectedGame(null) }} className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"><PencilLine className="h-4 w-4" />경기 정보를 찾을 수 없어 직접 입력하기</button>}
    </section>

      {(selectedGame || manualMode) && <RecordGameFields manualMode={manualMode} selectedGame={selectedGame} />}

      {(selectedGame || manualMode) && <AttendanceDetailsFields rating={rating} onRatingChange={setRating} />}
      {(selectedGame || manualMode) && <RecordImagePicker images={images} onChange={setImages} />}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
      <PrimaryButton type="submit" disabled={saving || (!selectedGame && !manualMode)} className="w-full sm:w-auto"><Save className="h-4 w-4" />{saving ? images.length ? '기록 저장 및 이미지 업로드 중...' : '저장 중...' : '기록 저장하기'}</PrimaryButton></form>
  </PageContainer>
}
