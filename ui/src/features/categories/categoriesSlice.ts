import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/apiClient'

export interface Category {
  id: number
  name: string
  slug: string
}

export interface CategoryCreate {
  name: string
  slug: string
}

export interface CategoryUpdate extends Partial<CategoryCreate> {}

interface CategoriesState {
  items: Category[]
  loading: boolean
  error: string | null
}

const initialState: CategoriesState = { items: [], loading: false, error: null }

export const fetchCategories = createAsyncThunk('categories/fetchAll', async () => {
  const res = await api.get<Category[]>('/categories')
  return res.data
})

export const createCategory = createAsyncThunk('categories/create', async (data: CategoryCreate) => {
  const res = await api.post<Category>('/categories', data)
  return res.data
})

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: number; data: CategoryUpdate }) => {
    const res = await api.put<Category>(`/categories/${id}`, data)
    return res.data
  },
)

export const deleteCategory = createAsyncThunk('categories/delete', async (id: number) => {
  await api.delete(`/categories/${id}`)
  return id
})

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed' })
      .addCase(createCategory.fulfilled, (state, action) => { state.items.push(action.payload) })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload)
      })
  },
})

export default categoriesSlice.reducer
