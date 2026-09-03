import { useEffect, useState } from 'react'
import { getUpcomingGames } from '../services/gameService'
import type { KboGame } from '../types/game'
import type { TeamId } from '../types/team'

export function useUpcomingGames(team: TeamId) {
  const [games, setGames] = useState<KboGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void getUpcomingGames(team).then((data) => { if (active) setGames(data) }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : '예정 경기를 불러오지 못했습니다.') }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [team])

  return { games, isLoading, error }
}
