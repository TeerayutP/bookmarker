const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function resolveImg(url: string | null | undefined): string | null {
  if (!url) return null
  return url.startsWith('/') ? `${API_BASE}${url}` : url
}
