import type { TeamId } from './team'

export interface ProfileRow extends Record<string, unknown> {
  id: string
  nickname: string
  favorite_team: TeamId | null
  created_at: string
  updated_at: string
}

export interface AttendanceRecordRow extends Record<string, unknown> {
  id: string
  user_id: string
  game_id: string | null
  date: string
  home_team: TeamId
  away_team: TeamId
  stadium: string
  start_time: string
  home_score: number
  away_score: number
  seat: string | null
  companion: string | null
  memo: string | null
  rating: number
  created_at: string
  updated_at: string
}

export interface GameRow extends Record<string, unknown> {
  id: string
  external_game_id: string | null
  season: number
  date: string
  start_time: string | null
  home_team: TeamId
  away_team: TeamId
  stadium: string | null
  status: string | null
  home_score: number | null
  away_score: number | null
  source: string
  created_at: string
  updated_at: string
}

export interface AttendanceRecordImageRow extends Record<string, unknown> {
  id: string
  attendance_record_id: string
  user_id: string
  type: 'photo' | 'ticket'
  storage_path: string
  sort_order: number
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>
        Relationships: []
      }
      attendance_records: {
        Row: AttendanceRecordRow
        Insert: Omit<AttendanceRecordRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<AttendanceRecordRow, 'id' | 'user_id' | 'created_at'>>
        Relationships: []
      }
      games: {
        Row: GameRow
        Insert: Omit<GameRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<GameRow, 'id' | 'created_at'>>
        Relationships: []
      }
      attendance_record_images: {
        Row: AttendanceRecordImageRow
        Insert: Omit<AttendanceRecordImageRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Pick<AttendanceRecordImageRow, 'sort_order'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
