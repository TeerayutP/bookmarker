import { useRef, useState } from 'react'
import apiClient from './apiClient'

export function useCoverUpload(onSuccess: (url: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const open = () => inputRef.current?.click()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await apiClient.post<{ cover_url: string }>('/books/covers/upload', form)
      onSuccess(res.data.cover_url)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const Input = () => (
    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
  )

  const [fetching, setFetching] = useState(false)

  const fetchFromUrl = async (url: string) => {
    setFetching(true)
    try {
      const res = await apiClient.post<{ cover_url: string }>('/books/covers/fetch', { url })
      onSuccess(res.data.cover_url)
    } finally {
      setFetching(false)
    }
  }

  return { open, uploading, fetching, fetchFromUrl, Input }
}
