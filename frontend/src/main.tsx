import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './lib/i18n'
import { RequireManagement, RequireSession } from './lib/routes'
import BookPage from './routes/BookPage'
import BookingsPage from './routes/BookingsPage'
import CatalogPage from './routes/CatalogPage'
import HotelDetailPage from './routes/HotelDetailPage'
import LandingPage from './routes/LandingPage'
import LoginPage from './routes/LoginPage'
import ManagedBookingsPage from './routes/ManagedBookingsPage'
import ManagementPage from './routes/ManagementPage'
import NotFoundPage from './routes/NotFoundPage'
import ProfilePage from './routes/ProfilePage'
import RegisterPage from './routes/RegisterPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'hotels', element: <CatalogPage /> },
      { path: 'hotels/:id', element: <HotelDetailPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        element: <RequireSession />,
        children: [
          { path: 'book', element: <BookPage /> },
          { path: 'bookings', element: <BookingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
      {
        element: <RequireManagement />,
        children: [
          { path: 'management', element: <ManagementPage /> },
          { path: 'management/bookings', element: <ManagedBookingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  </StrictMode>,
)
