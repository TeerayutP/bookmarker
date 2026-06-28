import { configureStore } from '@reduxjs/toolkit'
import booksReducer from '../features/books/booksSlice'
import authorsReducer from '../features/authors/authorsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import reviewsReducer from '../features/reviews/reviewsSlice'
import authReducer from '../features/auth/authSlice'
import statsReducer from '../features/stats/statsSlice'
import libraryReducer from '../features/library/librarySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    library: libraryReducer,
    authors: authorsReducer,
    categories: categoriesReducer,
    reviews: reviewsReducer,
    stats: statsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
