import { configureStore } from '@reduxjs/toolkit'
import booksReducer from '../features/books/booksSlice'
import authorsReducer from '../features/authors/authorsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import reviewsReducer from '../features/reviews/reviewsSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    authors: authorsReducer,
    categories: categoriesReducer,
    reviews: reviewsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
