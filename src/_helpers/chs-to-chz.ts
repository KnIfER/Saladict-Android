export function chsToChz (text: string): string {
  return text;//text.replace(/[\u4e00-\u9fa5]/g, m => charMap[m] || m)
}

export default chsToChz
