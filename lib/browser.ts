export function openExternal(url: string) {
  if (typeof window === 'undefined') {
    console.warn('[browser] openExternal called on server for', url)
    return
  }

  try {
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (err) {
    console.error('[browser] Failed to open external URL', err)
  }
}
