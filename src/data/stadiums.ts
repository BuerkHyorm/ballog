export interface StadiumDefinition {
  id: string
  name: string
  city: string
  aliases: string[]
}

export const stadiums: StadiumDefinition[] = [
  { id: 'jamsil', name: '잠실야구장', city: '서울', aliases: ['잠실', '잠실야구장', '서울종합운동장야구장'] },
  { id: 'gocheok', name: '고척스카이돔', city: '서울', aliases: ['고척', '고척스카이돔'] },
  { id: 'incheon', name: '인천 SSG 랜더스필드', city: '인천', aliases: ['문학', '인천ssg랜더스필드', 'ssg랜더스필드', '인천문학야구장'] },
  { id: 'suwon', name: '수원 KT위즈파크', city: '수원', aliases: ['수원', '수원kt위즈파크', 'kt위즈파크'] },
  { id: 'daejeon', name: '대전 한화생명 볼파크', city: '대전', aliases: ['대전', '대전한화생명볼파크', '한화생명볼파크'] },
  { id: 'gwangju', name: '광주-기아 챔피언스 필드', city: '광주', aliases: ['광주', '광주기아챔피언스필드', '기아챔피언스필드'] },
  { id: 'daegu', name: '대구 삼성 라이온즈 파크', city: '대구', aliases: ['대구', '대구삼성라이온즈파크', '삼성라이온즈파크'] },
  { id: 'changwon', name: '창원 NC 파크', city: '창원', aliases: ['창원', '창원nc파크', 'nc파크'] },
  { id: 'sajik', name: '사직야구장', city: '부산', aliases: ['사직', '사직야구장', '부산사직야구장'] },
]

export const normalizeStadiumName = (value: string) => value.toLowerCase().replace(/[\s\-_()]/g, '')

export function findStadium(value: string) {
  const normalized = normalizeStadiumName(value)
  return stadiums.find((stadium) => stadium.aliases.some((alias) => normalizeStadiumName(alias) === normalized)) ?? null
}
