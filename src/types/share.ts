import type { TeamId } from './team'

interface BaseShareCardData {
  fileName: string
  eyebrow: string
  title: string
  headline: string
  details: string[]
  footer?: string
  teamId: TeamId
}

export interface RecordShareCardData extends BaseShareCardData {
  kind?: 'record'
}

export interface RecapHighlight {
  label: string
  value: string
}

export interface SeasonSharePhoto {
  id: string
  url: string
}

export interface SeasonRecapShareCardData extends BaseShareCardData {
  kind: 'season-recap'
  recap: {
    season: string
    total: number
    wins: number
    draws: number
    losses: number
    winRate: number
    highlights: RecapHighlight[]
    firstDate: string
    lastDate: string
    tagline?: string
    photos?: SeasonSharePhoto[]
  }
}

export type ShareCardData = RecordShareCardData | SeasonRecapShareCardData
