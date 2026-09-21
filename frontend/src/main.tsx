import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import App from './App.tsx'
import CatalogPage from './routes/CatalogPage'
import HotelDetailPage from './routes/HotelDetailPage'
import LoginPage from './routes/LoginPage'
import RegisterPage from './routes/RegisterPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'hotels/:id', element: <HotelDetailPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)