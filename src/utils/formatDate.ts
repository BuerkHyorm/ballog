export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('ko-KR', options ?? { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${date}T00:00:00`))
