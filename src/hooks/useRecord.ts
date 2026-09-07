import { useEffect, useState } from 'react'
import { getRecordById } from '../services/recordService'
import type { AttendanceRecord } from '../types/record'
import type { TeamId } from '../types/team'

export function useRecord(id: string | undefined, userId: string | undefined, favoriteTeam: TeamId) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id || !userId) return
    let active = true
    void getRecordById(id, userId, favoriteTeam)
      .then((data) => { if (active) setRecord(data) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : '기록을 불러오지 못했습니다.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [favoriteTeam, id, userId])

  return { record, isLoading, error }
}
