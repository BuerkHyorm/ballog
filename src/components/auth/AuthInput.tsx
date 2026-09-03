import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: LucideIcon
}

export function AuthInput({ label, icon: Icon, type = 'text', ...props }: AuthInputProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span><span className="relative block"><Icon className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" /><input type={isPassword && visible ? 'text' : type} className="min-h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" {...props} />{isPassword && <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}</button>}</span></label>
}
