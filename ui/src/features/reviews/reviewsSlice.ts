import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/apiClient'

export interface Review {
  id: number
  book_id: number
  rating: number
  body: string | null
  created_at: string
}

export interface ReviewCreate {
  book_id: number
  rating: number
  body?: string | null
}

export interface ReviewUpdate {
  rating?: number
  body?: string | null
}

interface ReviewsState {
  items: Review[]
  loading: boolean
  error: string | null
}

const initialState: ReviewsState = { items: [], loading: false, error: null }

export const fetchReviews = createAsyncThunk('reviews/fetchAll', async (bookId?: number) => {
  const params = bookId ? { book_id: bookId } : {}
  const res = await api.get<Review[]>('/reviews', { params })
  return res.data
})

export const createReview = createAsyncThunk('reviews/create', async (data: ReviewCreate) => {
  const res = await api.post<Review>('/reviews', data)
  return res.data
})

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, data }: { id: number; data: ReviewUpdate }) => {
    const res = await api.put<Review>(`/reviews/${id}`, data)
    return res.data
  },
)

export const deleteReview = createAsyncThunk('reviews/delete', async (id: number) => {
  await api.delete(`/reviews/${id}`)
  return id
})

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchReviews.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchReviews.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed' })
      .addCase(createReview.fulfilled, (state, action) => { state.items.unshift(action.payload) })
      .addCase(updateReview.fulfilled, (state, action) => {
        const idx = state.items.findIndex(r => r.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.items = state.items.filter(r => r.id !== action.payload)
      })
  },
})

export default reviewsSlice.reducer
