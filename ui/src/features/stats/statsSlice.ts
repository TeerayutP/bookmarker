import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/apiClient'

export interface StatsData {
  total: number
  by_status: { reading: number; completed: number; on_hold: number; dropped: number }
  books_per_month: { month: string; count: number }[]
  avg_chapters: number | null
  top_categories: { name: string; count: number }[]
  completed_this_year: number
}

interface StatsState {
  data: StatsData | null
  loading: boolean
  error: string | null
}

const initialState: StatsState = {
  data: null,
  loading: false,
  error: null,
}

export const fetchStats = createAsyncThunk('stats/fetch', async () => {
  const res = await api.get<StatsData>('/stats')
  return res.data
})

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchStats.fulfilled, (state, action) => { state.loading = false; state.data = action.payload })
      .addCase(fetchStats.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed to load stats' })
  },
})

export default statsSlice.reducer
