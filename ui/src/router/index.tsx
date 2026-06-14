import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import BookListPage from '../features/books/BookListPage'
import AddBookPage from '../features/books/AddBookPage'
import BookDetailPage from '../features/books/BookDetailPage'
import AuthorListPage from '../features/authors/AuthorListPage'
import AuthorFormPage from '../features/authors/AuthorFormPage'
import CategoryListPage from '../features/categories/CategoryListPage'
import CategoryFormPage from '../features/categories/CategoryFormPage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <BookListPage /> },
      { path: 'books/new', element: <AddBookPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'authors', element: <AuthorListPage /> },
      { path: 'authors/new', element: <AuthorFormPage /> },
      { path: 'authors/:id', element: <AuthorFormPage /> },
      { path: 'categories', element: <CategoryListPage /> },
      { path: 'categories/new', element: <CategoryFormPage /> },
      { path: 'categories/:id', element: <CategoryFormPage /> },
    ],
  },
])
