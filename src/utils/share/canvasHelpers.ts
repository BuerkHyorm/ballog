export const SHARE_CARD_WIDTH = 1080
export const SHARE_CARD_HEIGHT = 1350
export const SHARE_CARD_FONT = 'Pretendard, "Noto Sans KR", Inter, sans-serif'

export function loadCanvasImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

export function createCanvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('이미지 파일을 만들지 못했습니다.')), 'image/png')
  })
}

export function fitCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number, weight = 800, minimumSize = 24) {
  let size = initialSize
  do { context.font = `${weight} ${size}px ${SHARE_CARD_FONT}`; size -= 2 } while (context.measureText(text).width > maxWidth && size > minimumSize)
  return context.measureText(text).width > maxWidth ? `${text.slice(0, Math.max(5, Math.floor(text.length * maxWidth / context.measureText(text).width) - 1))}…` : text
}
