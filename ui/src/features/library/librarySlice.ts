import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/apiClient'

export interface LibraryBook {
  id: number
  title: string
  author: string
  total_chapters: number | null
  cover_url: string | null
  synopsis: string | null
  category_id: number | null
  added_by_user_id: number | null
  created_at: string
  updated_at: string
}

export interface LibraryBookCreate {
  title: string
  author: string
  total_chapters?: number | null
  cover_url?: string | null
  synopsis?: string | null
  category_id?: number | null
  category_name?: string | null
}

interface LibraryState {
  items: LibraryBook[]
  loading: boolean
  error: string | null
}

const initialState: LibraryState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchLibrary = createAsyncThunk(
  'library/fetchAll',
  async (params?: { search?: string; category_id?: number; skip?: number; limit?: number }) => {
    const res = await api.get<LibraryBook[]>('/library', { params })
    return res.data
  },
)

export const fetchLibraryBook = createAsyncThunk('library/fetchOne', async (id: number) => {
  const res = await api.get<LibraryBook>(`/library/${id}`)
  return res.data
})

export const addToLibrary = createAsyncThunk(
  'library/add',
  async (data: LibraryBookCreate) => {
    const res = await api.post<LibraryBook>('/library', data)
    return res.data
  },
)

export const updateLibraryBook = createAsyncThunk(
  'library/update',
  async ({ id, data }: { id: number; data: LibraryBookCreate }) => {
    const res = await api.put<LibraryBook>(`/library/${id}`, data)
    return res.data
  },
)

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibrary.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchLibrary.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchLibrary.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed' })
      .addCase(fetchLibraryBook.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
        else state.items.push(action.payload)
      })
      .addCase(addToLibrary.fulfilled, (state, action) => { state.items.unshift(action.payload) })
      .addCase(updateLibraryBook.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
  },
})

export default librarySlice.reducer
