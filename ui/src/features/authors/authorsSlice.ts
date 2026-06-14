import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/apiClient'

export interface Author {
  id: number
  name: string
  bio: string | null
  created_at: string
}

export interface AuthorCreate {
  name: string
  bio?: string | null
}

export interface AuthorUpdate extends Partial<AuthorCreate> {}

interface AuthorsState {
  items: Author[]
  loading: boolean
  error: string | null
}

const initialState: AuthorsState = { items: [], loading: false, error: null }

export const fetchAuthors = createAsyncThunk('authors/fetchAll', async () => {
  const res = await api.get<Author[]>('/authors')
  return res.data
})

export const createAuthor = createAsyncThunk('authors/create', async (data: AuthorCreate) => {
  const res = await api.post<Author>('/authors', data)
  return res.data
})

export const updateAuthor = createAsyncThunk(
  'authors/update',
  async ({ id, data }: { id: number; data: AuthorUpdate }) => {
    const res = await api.put<Author>(`/authors/${id}`, data)
    return res.data
  },
)

export const deleteAuthor = createAsyncThunk('authors/delete', async (id: number) => {
  await api.delete(`/authors/${id}`)
  return id
})

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAuthors.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchAuthors.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed' })
      .addCase(createAuthor.fulfilled, (state, action) => { state.items.push(action.payload) })
      .addCase(updateAuthor.fulfilled, (state, action) => {
        const idx = state.items.findIndex(a => a.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteAuthor.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload)
      })
  },
})

export default authorsSlice.reducer
