import { useCallback, useEffect, useState } from 'react'
import { getRecords } from '../services/recordService'
import type { AttendanceRecord } from '../types/record'
import { useAuth } from './useAuth'
import { useTheme } from './useTheme'

export function useRecords() {
  const { user } = useAuth()
  const { favoriteTeam } = useTheme()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRecords = useCallback(async () => {
    if (!user) { setRecords([]); setIsLoading(false); return }
    setIsLoading(true); setError('')
    try { setRecords(await getRecords(user.id, favoriteTeam)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : '직관 기록을 불러오지 못했습니다.') }
    finally { setIsLoading(false) }
  }, [favoriteTeam, user])

  useEffect(() => {
    if (!user) return
    let active = true
    void getRecords(user.id, favoriteTeam)
      .then((data) => { if (active) setRecords(data) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : '직관 기록을 불러오지 못했습니다.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [favoriteTeam, user])

  return { records, isLoading, error, refetch: loadRecords }
}
