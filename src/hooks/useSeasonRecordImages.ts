import { useEffect, useMemo, useState } from 'react'
import { getRecordImagesByRecordIds } from '../services/recordImageService'
import type { AttendanceRecord } from '../types/record'
import type { RecordImage } from '../types/recordImage'

export function useSeasonRecordImages(records: AttendanceRecord[], userId: string | undefined) {
  const recordIds = useMemo(() => records.map((record) => record.id), [records])
  const recordIdsKey = recordIds.join(',')
  const [images, setImages] = useState<RecordImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId || !recordIds.length) return
    let active = true
    void Promise.resolve()
      .then(() => { if (active) { setIsLoading(true); setError('') } })
      .then(() => getRecordImagesByRecordIds(recordIds, userId))
      .then((result) => { if (active) setImages(result) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : '시즌 사진을 불러오지 못했습니다.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  // The stable key prevents a new request when only the records array identity changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordIdsKey, userId])

  return { images, isLoading, error }
}
