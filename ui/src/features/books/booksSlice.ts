import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../lib/apiClient'

export type BookStatus = 'reading' | 'completed' | 'on_hold' | 'dropped'

export interface Book {
  id: number
  title: string
  author: string
  total_chapters: number | null
  current_chapter: number
  status: BookStatus
  cover_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BookCreate {
  title: string
  author: string
  total_chapters?: number | null
  current_chapter?: number
  status?: BookStatus
  cover_url?: string | null
  notes?: string | null
}

export interface BookUpdate extends Partial<BookCreate> {}

interface BooksState {
  items: Book[]
  loading: boolean
  error: string | null
  filter: BookStatus | 'all'
}

const initialState: BooksState = {
  items: [],
  loading: false,
  error: null,
  filter: 'all',
}

export const fetchBooks = createAsyncThunk('books/fetchAll', async (status?: BookStatus) => {
  const params = status ? { status } : {}
  const res = await api.get<Book[]>('/books', { params })
  return res.data
})

export const createBook = createAsyncThunk('books/create', async (data: BookCreate) => {
  const res = await api.post<Book>('/books', data)
  return res.data
})

export const updateBook = createAsyncThunk(
  'books/update',
  async ({ id, data }: { id: number; data: BookUpdate }) => {
    const res = await api.put<Book>(`/books/${id}`, data)
    return res.data
  },
)

export const patchChapter = createAsyncThunk(
  'books/patchChapter',
  async ({ id, chapter }: { id: number; chapter: number }) => {
    const res = await api.patch<Book>(`/books/${id}/chapter`, { current_chapter: chapter })
    return res.data
  },
)

export const deleteBook = createAsyncThunk('books/delete', async (id: number) => {
  await api.delete(`/books/${id}`)
  return id
})

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<BooksState['filter']>) {
      state.filter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchBooks.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchBooks.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed' })
      .addCase(createBook.fulfilled, (state, action) => { state.items.unshift(action.payload) })
      .addCase(updateBook.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(patchChapter.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b.id !== action.payload)
      })
  },
})

export const { setFilter } = booksSlice.actions
export default booksSlice.reducer
