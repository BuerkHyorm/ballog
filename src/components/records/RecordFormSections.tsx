import { Camera, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { teamThemes } from '../../data/teamThemes'
import type { KboGame } from '../../types/game'

const stadiums = ['잠실야구장', '고척스카이돔', '인천 SSG랜더스필드', '수원 KT위즈파크', '대전 한화생명 볼파크', '광주-기아 챔피언스 필드', '대구 삼성라이온즈파크', '사직야구장', '창원 NC파크']

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`form-field ${className}`}><span>{label}</span>{children}</label>
}

function StadiumField() {
  return <Field label="경기장"><select name="stadium" defaultValue="잠실야구장">{stadiums.map((stadium) => <option key={stadium}>{stadium}</option>)}</select></Field>
}

export function RecordGameFields({ manualMode, selectedGame }: { manualMode: boolean; selectedGame: KboGame | null }) {
  return <section className="card p-5 md:p-7"><h2 className="mb-5 font-bold">경기 정보</h2><div className="grid gap-4 sm:grid-cols-2">
    {manualMode ? <>
      <Field label="경기 시작 시간"><input name="startTime" type="time" defaultValue="18:30" required /></Field>
      <StadiumField />
      <Field label="원정팀"><select name="awayTeam" defaultValue="kia">{teamThemes.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select></Field>
      <Field label="홈팀"><select name="homeTeam" defaultValue="doosan">{teamThemes.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select></Field>
    </> : <>
      <div className="sm:col-span-2 rounded-2xl bg-team-soft p-4 text-sm text-slate-600">선택한 경기의 팀, 구장, 시작 시간이 기록에 자동 저장됩니다.</div>
      {!selectedGame?.time && <Field label="경기 시작 시간"><input name="startTime" type="time" required /></Field>}
      {!selectedGame?.stadium && <StadiumField />}
    </>}
    <Field label="원정팀 점수"><input key={`away-${selectedGame?.id ?? 'manual'}`} name="awayScore" type="number" min="0" defaultValue={selectedGame?.awayScore ?? ''} placeholder="0" required /></Field>
    <Field label="홈팀 점수"><input key={`home-${selectedGame?.id ?? 'manual'}`} name="homeScore" type="number" min="0" defaultValue={selectedGame?.homeScore ?? ''} placeholder="0" required /></Field>
  </div></section>
}

export function AttendanceDetailsFields({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) {
  return <section className="card p-5 md:p-7"><h2 className="mb-5 font-bold">나의 관람 정보</h2><div className="grid gap-4 sm:grid-cols-2">
    <Field label="좌석"><input name="seat" placeholder="예: 1루 네이비석 210블록" /></Field>
    <Field label="같이 간 사람"><input name="companion" placeholder="이름을 쉼표로 구분" /></Field>
    <Field label="한줄평" className="sm:col-span-2"><textarea name="memo" rows={3} maxLength={100} placeholder="오늘 경기는 어땠나요?" /></Field>
    <div className="form-field"><span>별점</span><div className="flex min-h-12 items-center gap-1">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => onRatingChange(value)} aria-label={`${value}점`}><Star className={`h-7 w-7 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} /></button>)}</div></div>
    <Field label="사진"><button type="button" disabled className="flex min-h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-400"><Camera className="h-5 w-5" />사진 업로드는 준비 중</button></Field>
  </div></section>
}

export { Field }
