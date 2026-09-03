import { LockKeyhole, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthBrand } from '../../components/auth/AuthBrand'
import { AuthInput } from '../../components/auth/AuthInput'
import { useAuth } from '../../hooks/useAuth'

export function LoginPage() {
  const { signIn } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [remember, setRemember] = useState(true); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState('')
  const submit = async (event: FormEvent) => { event.preventDefault(); setSubmitting(true); setError(''); try { await signIn({ email, password, remember }); const from = (location.state as { from?: string } | null)?.from; navigate(from ?? '/', { replace: true }) } catch (caught) { setError(caught instanceof Error ? caught.message : '로그인에 실패했습니다.') } finally { setSubmitting(false) } }
  return <div className="w-full max-w-md"><AuthBrand /><section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"><div className="mb-7"><h2 className="text-xl font-black">다시 만나 반가워요!</h2><p className="mt-1 text-sm text-slate-500">직관 기록을 계속 이어가세요.</p></div><form onSubmit={submit} className="space-y-5"><AuthInput label="이메일" icon={Mail} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" required /><AuthInput label="비밀번호" icon={LockKeyhole} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="비밀번호를 입력하세요" autoComplete="current-password" required /><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-slate-900" />로그인 유지</label>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}<button disabled={submitting} className="min-h-13 w-full rounded-2xl bg-slate-950 font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60">{submitting ? '로그인 중...' : '로그인'}</button></form><p className="mt-6 text-center text-sm text-slate-500">아직 계정이 없나요? <Link to="/signup" className="font-bold text-slate-950 underline underline-offset-4">회원가입</Link></p></section></div>
}
