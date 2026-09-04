import { useCallback, useEffect, useState } from 'react'
import { deleteRecordImage, getRecordImages } from '../services/recordImageService'
import type { RecordImage } from '../types/recordImage'

export function useRecordImages(recordId: string | undefined, userId: string | undefined) {
  const [images, setImages] = useState<RecordImage[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(recordId && userId))
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    if (!recordId || !userId) return
    setIsLoading(true); setError('')
    try { setImages(await getRecordImages(recordId, userId)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : '이미지를 불러오지 못했습니다.') }
    finally { setIsLoading(false) }
  }, [recordId, userId])
  useEffect(() => {
    if (!recordId || !userId) return
    let active = true
    void getRecordImages(recordId, userId)
      .then((data) => { if (active) setImages(data) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : '이미지를 불러오지 못했습니다.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [recordId, userId])
  const remove = async (image: RecordImage) => {
    if (!userId) return
    await deleteRecordImage(image, userId)
    setImages((current) => current.filter((item) => item.id !== image.id))
  }
  return { images, isLoading, error, refetch: load, remove }
}
