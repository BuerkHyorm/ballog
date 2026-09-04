import { getTeamTheme } from '../data/teamThemes'
import type { SeasonRecapShareCardData, ShareCardData } from '../types/share'
import type { TeamTheme } from '../types/team'

const WIDTH = 1080
const HEIGHT = 1350
const FONT = 'Pretendard, "Noto Sans KR", Inter, sans-serif'

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image); image.onerror = reject; image.src = source
  })
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('이미지 파일을 만들지 못했습니다.')), 'image/png'))
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number, weight = 800, minimumSize = 24) {
  let size = initialSize
  do { context.font = `${weight} ${size}px ${FONT}`; size -= 2 } while (context.measureText(text).width > maxWidth && size > minimumSize)
  return context.measureText(text).width > maxWidth ? `${text.slice(0, Math.max(5, Math.floor(text.length * maxWidth / context.measureText(text).width) - 1))}…` : text
}

function drawBackground(context: CanvasRenderingContext2D, theme: TeamTheme) {
  const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  gradient.addColorStop(0, theme.primaryColor); gradient.addColorStop(0.55, theme.secondaryColor); gradient.addColorStop(1, theme.primaryColor)
  context.fillStyle = gradient; context.fillRect(0, 0, WIDTH, HEIGHT)
  const glow = context.createRadialGradient(870, 180, 10, 870, 180, 520)
  glow.addColorStop(0, `${theme.accentColor}80`); glow.addColorStop(1, `${theme.accentColor}00`)
  context.fillStyle = glow; context.fillRect(350, 0, 730, 720)
  context.fillStyle = 'rgba(3,7,18,0.16)'; context.fillRect(0, 0, WIDTH, HEIGHT)
}

function drawBaseballDecorations(context: CanvasRenderingContext2D) {
  context.save(); context.strokeStyle = 'rgba(255,255,255,0.055)'; context.lineWidth = 5
  context.translate(1035, 720); context.rotate(Math.PI / 4); context.strokeRect(-280, -280, 560, 560); context.restore()
  context.save(); context.strokeStyle = 'rgba(255,255,255,0.045)'; context.lineWidth = 4
  context.beginPath(); context.arc(245, 405, 250, 0, Math.PI * 2); context.stroke()
  context.beginPath(); context.arc(160, 405, 188, -1.15, 1.15); context.stroke()
  context.beginPath(); context.arc(330, 405, 188, 1.99, 4.29); context.stroke()
  for (let index = 0; index < 6; index += 1) {
    const y = 290 + index * 42
    context.beginPath(); context.moveTo(118, y); context.lineTo(145, y + 14); context.moveTo(372, y); context.lineTo(345, y + 14); context.stroke()
  }
  context.restore()
  context.save(); context.strokeStyle = 'rgba(255,255,255,0.035)'; context.lineWidth = 2
  context.beginPath(); context.moveTo(72, 594); context.lineTo(1008, 594); context.stroke()
  for (let x = 72; x <= 1008; x += 117) { context.beginPath(); context.moveTo(x, 582); context.lineTo(x, 606); context.stroke() }
  context.restore()
}

async function drawLogo(context: CanvasRenderingContext2D, theme: TeamTheme, recap = false) {
  try {
    const logo = await loadImage(theme.logoPath)
    if (recap) {
      context.save(); context.globalAlpha = 0.035; context.drawImage(logo, 355, 380, 620, 620); context.restore()
      context.fillStyle = 'rgba(255,255,255,0.94)'; context.beginPath(); context.roundRect(902, 58, 104, 104, 28); context.fill(); context.drawImage(logo, 919, 75, 70, 70)
    } else {
      context.fillStyle = 'rgba(255,255,255,0.94)'; context.beginPath(); context.roundRect(80, 80, 150, 150, 34); context.fill(); context.drawImage(logo, 102, 102, 106, 106)
    }
  } catch { /* The text poster remains exportable if a local placeholder cannot be decoded. */ }
}

function splitTagline(tagline: string) {
  const [lead, ...rest] = tagline.split(',')
  return rest.length ? { lead: `${lead.trim()},`, value: rest.join(',').trim() } : { lead: '이번 시즌을 한 문장으로', value: tagline }
}

function localizedHighlightLabel(label: string) {
  return ({ 'Favorite Stadium': '가장 많이 간 구장', 'Most Seen Opponent': '가장 많이 본 상대', 'Longest Win Streak': '최고 연승', 'Busiest Month': '가장 많이 직관한 달' } as Record<string, string>)[label] ?? label
}

function drawCoverImage(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const sourceRatio = image.naturalWidth / image.naturalHeight
  const targetRatio = width / height
  let sourceWidth = image.naturalWidth; let sourceHeight = image.naturalHeight; let sourceX = 0; let sourceY = 0
  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio
    sourceX = (image.naturalWidth - sourceWidth) / 2
  } else {
    sourceHeight = image.naturalWidth / targetRatio
    sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * 0.42)
  }
  context.save(); context.beginPath(); context.roundRect(x, y, width, height, 22); context.clip()
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
  const overlay = context.createLinearGradient(x, y, x, y + height)
  overlay.addColorStop(0, 'rgba(3,7,18,0.02)'); overlay.addColorStop(1, 'rgba(3,7,18,0.28)')
  context.fillStyle = overlay; context.fillRect(x, y, width, height); context.restore()
  context.strokeStyle = 'rgba(255,255,255,0.32)'; context.lineWidth = 2; context.beginPath(); context.roundRect(x, y, width, height, 22); context.stroke()
}

function drawSeasonPhotos(context: CanvasRenderingContext2D, images: HTMLImageElement[], theme: TeamTheme) {
  if (!images.length) return
  context.save(); context.shadowColor = 'rgba(0,0,0,0.22)'; context.shadowBlur = 28; context.shadowOffsetY = 12
  if (images.length === 1) drawCoverImage(context, images[0], 72, 520, 936, 286)
  if (images.length === 2) {
    drawCoverImage(context, images[0], 72, 520, 742, 286)
    context.save(); context.translate(868, 665); context.rotate(-0.035); drawCoverImage(context, images[1], -140, -112, 280, 224); context.restore()
  }
  if (images.length >= 3) {
    drawCoverImage(context, images[0], 72, 520, 646, 286)
    drawCoverImage(context, images[1], 742, 520, 266, 132)
    drawCoverImage(context, images[2], 742, 674, 266, 132)
  }
  context.restore()
  context.fillStyle = theme.accentColor; context.fillRect(72, 806, images.length === 1 ? 132 : 86, 5)
}

async function drawRecordCard(context: CanvasRenderingContext2D, data: ShareCardData, theme: TeamTheme) {
  const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  gradient.addColorStop(0, theme.primaryColor); gradient.addColorStop(1, theme.secondaryColor)
  context.fillStyle = gradient; context.fillRect(0, 0, WIDTH, HEIGHT)
  context.fillStyle = 'rgba(255,255,255,0.08)'; context.beginPath(); context.arc(980, 80, 300, 0, Math.PI * 2); context.fill()
  await drawLogo(context, theme)
  context.fillStyle = 'rgba(255,255,255,0.65)'; context.font = '700 28px sans-serif'; context.fillText('BALLOG', 80, 300)
  context.fillStyle = '#fff'; context.font = '800 58px sans-serif'; context.fillText(data.eyebrow, 80, 380)
  context.font = '900 86px sans-serif'; context.fillText(data.title, 80, 520)
  context.fillStyle = 'rgba(255,255,255,0.9)'; context.font = '800 48px sans-serif'; context.fillText(data.headline, 80, 625)
  context.fillStyle = 'rgba(255,255,255,0.14)'; context.beginPath(); context.roundRect(70, 710, 940, 420, 42); context.fill()
  context.fillStyle = '#fff'; context.font = '700 38px sans-serif'
  data.details.slice(0, 5).forEach((line, index) => context.fillText(line, 120, 800 + index * 70))
  if (data.footer) { context.fillStyle = 'rgba(255,255,255,0.68)'; context.font = '600 30px sans-serif'; context.fillText(data.footer.slice(0, 48), 80, 1245) }
}

async function drawSeasonRecap(context: CanvasRenderingContext2D, data: SeasonRecapShareCardData, theme: TeamTheme) {
  const recap = data.recap
  const photos = (await Promise.allSettled((recap.photos ?? []).slice(0, 3).map((photo) => loadImage(photo.url))))
    .flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
  drawBackground(context, theme)
  if (!photos.length) drawBaseballDecorations(context)
  await drawLogo(context, theme, true)
  context.fillStyle = '#fff'; context.font = `900 38px ${FONT}`; context.fillText('BALLOG', 72, 92)
  context.fillStyle = 'rgba(255,255,255,0.64)'; context.font = `800 21px ${FONT}`; context.fillText('SEASON RECAP', 72, 132)
  context.textAlign = 'right'; context.fillStyle = 'rgba(255,255,255,0.16)'; context.font = `900 126px ${FONT}`; context.fillText(recap.season, 870, 153); context.textAlign = 'left'
  context.fillStyle = theme.accentColor; context.fillRect(72, 157, 72, 6)

  context.fillStyle = 'rgba(255,255,255,0.58)'; context.font = `800 23px ${FONT}`; context.fillText('TOTAL GAMES', 76, 242)
  context.fillStyle = '#fff'; const total = fitText(context, String(recap.total), 520, 270, 900, 190); context.fillText(total, 62, 478)
  const totalWidth = context.measureText(total).width
  context.fillStyle = 'rgba(255,255,255,0.7)'; context.font = `850 33px ${FONT}`; context.fillText('GAMES', Math.min(620, 72 + totalWidth), 456)
  context.fillStyle = '#fff'; context.fillText(fitText(context, `${recap.wins}W  ·  ${recap.draws}D  ·  ${recap.losses}L`, 390, 52, 900, 34), 628, 365)
  context.fillStyle = 'rgba(255,255,255,0.6)'; context.font = `800 22px ${FONT}`; context.fillText('WIN RATE', 632, 423)
  context.fillStyle = theme.accentColor; context.font = `900 58px ${FONT}`; context.fillText(`${recap.winRate}%`, 780, 438)

  drawSeasonPhotos(context, photos, theme)
  const hasPhotos = photos.length > 0
  const editorialTop = hasPhotos ? (recap.tagline ? 950 : 866) : (recap.tagline ? 755 : 648)
  if (recap.tagline) {
    const highlight = splitTagline(recap.tagline)
    const taglineLeadY = hasPhotos ? 850 : 650; const taglineValueY = hasPhotos ? 914 : 725
    context.fillStyle = 'rgba(255,255,255,0.65)'; context.font = `750 25px ${FONT}`; context.fillText(highlight.lead, 76, taglineLeadY)
    context.fillStyle = '#fff'; context.fillText(fitText(context, highlight.value, 930, hasPhotos ? 58 : 74, 900, 38), 72, taglineValueY)
  }
  const highlights = recap.highlights.slice(0, 4)
  const [primary, ...secondary] = highlights
  if (primary) {
    context.fillStyle = '#fff'; context.fillText(fitText(context, primary.value, 930, 58, 900, 35), 74, editorialTop)
    context.fillStyle = 'rgba(255,255,255,0.5)'; context.font = `750 19px ${FONT}`; context.fillText(localizedHighlightLabel(primary.label), 76, editorialTop + 34)
    context.strokeStyle = 'rgba(255,255,255,0.2)'; context.lineWidth = 2; context.beginPath(); context.moveTo(74, editorialTop + 68); context.lineTo(1006, editorialTop + 68); context.stroke()
  }
  const secondaryTop = primary ? editorialTop + (hasPhotos ? 112 : 137) : editorialTop
  const columnWidth = 300
  secondary.forEach((highlight, index) => {
    const x = 74 + index * 320
    context.fillStyle = '#fff'; context.fillText(fitText(context, highlight.value, columnWidth, hasPhotos ? 32 : 39, 880, 23), x, secondaryTop)
    context.fillStyle = 'rgba(255,255,255,0.5)'; context.font = `700 17px ${FONT}`; context.fillText(localizedHighlightLabel(highlight.label), x, secondaryTop + 31)
    if (index < secondary.length - 1) { context.strokeStyle = 'rgba(255,255,255,0.16)'; context.lineWidth = 2; context.beginPath(); context.moveTo(x + 299, secondaryTop - 42); context.lineTo(x + 299, secondaryTop + 39); context.stroke() }
  })

  const timelineY = hasPhotos ? 1180 : 1138
  context.strokeStyle = 'rgba(255,255,255,0.35)'; context.lineWidth = 3; context.beginPath(); context.moveTo(112, timelineY); context.lineTo(968, timelineY); context.stroke()
  context.fillStyle = theme.accentColor
  for (const x of [112, 968]) { context.beginPath(); context.arc(x, timelineY, 10, 0, Math.PI * 2); context.fill() }
  context.fillStyle = '#fff'; context.font = `850 29px ${FONT}`; context.textAlign = 'left'; context.fillText(recap.firstDate, 96, timelineY - 36); context.textAlign = 'right'; context.fillText(recap.lastDate, 984, timelineY - 36)
  context.fillStyle = 'rgba(255,255,255,0.55)'; context.font = `700 17px ${FONT}`; context.textAlign = 'left'; context.fillText('시즌 첫 직관', 96, timelineY + 43); context.textAlign = 'right'; context.fillText('시즌 마지막 직관', 984, timelineY + 43)
  context.textAlign = 'left'; context.fillStyle = 'rgba(255,255,255,0.68)'; context.font = `750 20px ${FONT}`; context.fillText('BALLOG  ·  야구장의 순간을 기록하다.', 74, 1294)
}

export async function exportShareCard(data: ShareCardData) {
  const theme = getTeamTheme(data.teamId)
  const canvas = document.createElement('canvas'); canvas.width = WIDTH; canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('이 브라우저에서는 이미지 저장을 지원하지 않습니다.')
  if (data.kind === 'season-recap') await drawSeasonRecap(context, data, theme)
  else await drawRecordCard(context, data, theme)
  const blob = await canvasBlob(canvas)
  const file = new File([blob], `${data.fileName}.png`, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: data.title }); return }
    catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return }
  }
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
