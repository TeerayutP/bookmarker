import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './store'
import { router } from './router'
import { fetchMe } from './features/auth/authSlice'
import './styles/index.scss'

function Bootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      store.dispatch(fetchMe())
    }
  }, [])
  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HeroUIProvider>
        <Bootstrap>
          <RouterProvider router={router} />
        </Bootstrap>
      </HeroUIProvider>
    </Provider>
  </React.StrictMode>,
)
