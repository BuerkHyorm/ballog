export type RecordImageType = 'photo' | 'ticket'

export interface RecordImage {
  id: string
  recordId: string
  userId: string
  type: RecordImageType
  storagePath: string
  sortOrder: number
  createdAt: string
  signedUrl: string
}

export interface PendingRecordImage {
  file: File
  type: RecordImageType
}
