import { getSupabaseClient } from '../lib/supabase'
import type { AttendanceRecordImageRow } from '../types/database'
import type { PendingRecordImage, RecordImage } from '../types/recordImage'

export const RECORD_IMAGE_BUCKET = 'attendance-record-images'
export const MAX_RECORD_IMAGE_SIZE = 8 * 1024 * 1024
export const MAX_RECORD_IMAGES_PER_TYPE = 12
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
const EXTENSION_BY_TYPE: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' }

export function validateRecordImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return 'JPG, PNG, WebP, HEIC 이미지만 업로드할 수 있습니다.'
  if (file.size > MAX_RECORD_IMAGE_SIZE) return '이미지는 한 장당 8MB 이하여야 합니다.'
  return null
}

const toRecordImage = (row: AttendanceRecordImageRow, signedUrl: string): RecordImage => ({
  id: row.id,
  recordId: row.attendance_record_id,
  userId: row.user_id,
  type: row.type,
  storagePath: row.storage_path,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  signedUrl,
})

export async function getRecordImages(recordId: string, userId: string): Promise<RecordImage[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('attendance_record_images').select('*').eq('attendance_record_id', recordId).eq('user_id', userId).order('type').order('sort_order').order('created_at')
  if (error) throw error
  if (!data.length) return []
  const { data: signed, error: signedError } = await supabase.storage.from(RECORD_IMAGE_BUCKET).createSignedUrls(data.map((row) => row.storage_path), 60 * 60)
  if (signedError) throw signedError
  return data.map((row, index) => toRecordImage(row, signed[index]?.signedUrl ?? ''))
}

export async function getRecordImagesByRecordIds(recordIds: string[], userId: string): Promise<RecordImage[]> {
  if (!recordIds.length) return []
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('attendance_record_images')
    .select('*')
    .eq('user_id', userId)
    .in('attendance_record_id', recordIds)
    .order('created_at', { ascending: false })
  if (error) throw error
  if (!data.length) return []
  const { data: signed, error: signedError } = await supabase.storage
    .from(RECORD_IMAGE_BUCKET)
    .createSignedUrls(data.map((row) => row.storage_path), 60 * 60)
  if (signedError) throw signedError
  return data.map((row, index) => toRecordImage(row, signed[index]?.signedUrl ?? ''))
}

export async function uploadRecordImages(userId: string, recordId: string, images: PendingRecordImage[]) {
  const supabase = getSupabaseClient()
  const uploaded: AttendanceRecordImageRow[] = []
  for (let index = 0; index < images.length; index += 1) {
    const { file, type } = images[index]
    const validationError = validateRecordImage(file)
    if (validationError) throw new Error(validationError)
    const extension = EXTENSION_BY_TYPE[file.type]
    const storagePath = `${userId}/${recordId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from(RECORD_IMAGE_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError
    const { data, error: metadataError } = await supabase.from('attendance_record_images').insert({ attendance_record_id: recordId, user_id: userId, type, storage_path: storagePath, sort_order: index }).select('*').single()
    if (metadataError) {
      await supabase.storage.from(RECORD_IMAGE_BUCKET).remove([storagePath])
      throw metadataError
    }
    uploaded.push(data)
  }
  return uploaded
}

export async function deleteRecordImage(image: RecordImage, userId: string) {
  if (image.userId !== userId || !image.storagePath.startsWith(`${userId}/`)) throw new Error('이미지를 삭제할 권한이 없습니다.')
  const supabase = getSupabaseClient()
  const { error: storageError } = await supabase.storage.from(RECORD_IMAGE_BUCKET).remove([image.storagePath])
  if (storageError) throw storageError
  const { error } = await supabase.from('attendance_record_images').delete().eq('id', image.id).eq('user_id', userId)
  if (error) throw error
}

export async function deleteAllRecordImages(recordId: string, userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('attendance_record_images').select('storage_path').eq('attendance_record_id', recordId).eq('user_id', userId)
  if (error) throw error
  if (!data.length) return
  const { error: storageError } = await supabase.storage.from(RECORD_IMAGE_BUCKET).remove(data.map((image) => image.storage_path))
  if (storageError) throw storageError
}
