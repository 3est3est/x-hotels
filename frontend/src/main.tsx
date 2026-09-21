import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import App from './App.tsx'
import { RequireSession } from './lib/routes'
import BookingsPage from './routes/BookingsPage'
import CatalogPage from './routes/CatalogPage'
import HotelDetailPage from './routes/HotelDetailPage'
import LoginPage from './routes/LoginPage'
import NotFoundPage from './routes/NotFoundPage'
import RegisterPage from './routes/RegisterPage'
import VerifyPage from './routes/VerifyPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'hotels/:id', element: <HotelDetailPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        element: <RequireSession />,
        children: [
          { path: 'verify', element: <VerifyPage /> },
          { path: 'bookings', element: <BookingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)