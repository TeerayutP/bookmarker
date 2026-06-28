import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../lib/apiClient'

interface User {
  id: number
  username: string
  email: string
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,
}

export const register = createAsyncThunk(
  'auth/register',
  async (data: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/auth/register', data)
      return res.data as User
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? 'Registration failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (data: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/auth/login', { username: data.username, password: data.password })
      const token: string = res.data.access_token
      localStorage.setItem('access_token', token)
      const me = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return { token, user: me.data as User }
    } catch (err: any) {
      const status = err.response?.status
      if (status === 401 || status === 400) return rejectWithValue('Incorrect username or password')
      return rejectWithValue('Login failed. Please try again.')
    }
  }
)

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/auth/me')
    return res.data as User
  } catch {
    return rejectWithValue(null)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('access_token')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null })
      .addCase(register.fulfilled, (state) => { state.loading = false })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
        state.token = null
        localStorage.removeItem('access_token')
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
