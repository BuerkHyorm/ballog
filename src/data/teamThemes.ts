import { TEAM_IDS, type TeamId, type TeamTheme } from '../types/team'

export const teamThemes: TeamTheme[] = [
  { id: 'doosan', teamName: '두산 베어스', shortName: '두산', logoPath: '/images/teams/doosan.svg', primaryColor: '#131E29', secondaryColor: '#1A5DAA', accentColor: '#E11D48', textColor: '#FFFFFF' },
  { id: 'lg', teamName: 'LG 트윈스', shortName: 'LG', logoPath: '/images/teams/lg.svg', primaryColor: '#C30452', secondaryColor: '#111111', accentColor: '#E91E63', textColor: '#FFFFFF' },
  { id: 'hanwha', teamName: '한화 이글스', shortName: '한화', logoPath: '/images/teams/hanwha.svg', primaryColor: '#F37321', secondaryColor: '#111111', accentColor: '#FF9E52', textColor: '#FFFFFF' },
  { id: 'kia', teamName: 'KIA 타이거즈', shortName: 'KIA', logoPath: '/images/teams/kia.svg', primaryColor: '#EA0029', secondaryColor: '#1C1C1C', accentColor: '#FF526B', textColor: '#FFFFFF' },
  { id: 'samsung', teamName: '삼성 라이온즈', shortName: '삼성', logoPath: '/images/teams/samsung.svg', primaryColor: '#074CA1', secondaryColor: '#C0C0C0', accentColor: '#4C9AFF', textColor: '#FFFFFF' },
  { id: 'lotte', teamName: '롯데 자이언츠', shortName: '롯데', logoPath: '/images/teams/lotte.svg', primaryColor: '#041E42', secondaryColor: '#D00F31', accentColor: '#EF3340', textColor: '#FFFFFF' },
  { id: 'ssg', teamName: 'SSG 랜더스', shortName: 'SSG', logoPath: '/images/teams/ssg.svg', primaryColor: '#CE0E2D', secondaryColor: '#FFB81C', accentColor: '#FF4D64', textColor: '#FFFFFF' },
  { id: 'nc', teamName: 'NC 다이노스', shortName: 'NC', logoPath: '/images/teams/nc.svg', primaryColor: '#071D49', secondaryColor: '#C8A977', accentColor: '#D4B87E', textColor: '#FFFFFF' },
  { id: 'kt', teamName: 'KT 위즈', shortName: 'KT', logoPath: '/images/teams/kt.svg', primaryColor: '#111111', secondaryColor: '#E60012', accentColor: '#EF3340', textColor: '#FFFFFF' },
  { id: 'kiwoom', teamName: '키움 히어로즈', shortName: '키움', logoPath: '/images/teams/kiwoom.svg', primaryColor: '#820024', secondaryColor: '#C1A875', accentColor: '#B52A54', textColor: '#FFFFFF' },
]

export const getTeamTheme = (id: string) => teamThemes.find((team) => team.id === id) ?? teamThemes[0]

export const isTeamId = (value: string | null): value is TeamId => value !== null && TEAM_IDS.some((teamId) => teamId === value)
