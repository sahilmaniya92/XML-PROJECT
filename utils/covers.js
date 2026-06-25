export const COVER_GRADIENTS = [
  { id: 'sunset', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)' },
  { id: 'ocean', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'forest', css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'dusk', css: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)' },
  { id: 'warm', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'sky', css: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { id: 'earth', css: 'linear-gradient(135deg, #c79081 0%, #dfa579 100%)' },
  { id: 'night', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'none', css: 'none' },
]

export function getCoverCss(coverId) {
  const cover = COVER_GRADIENTS.find((c) => c.id === coverId)
  return cover?.css ?? COVER_GRADIENTS[1].css
}
