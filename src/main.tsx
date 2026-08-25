// Updated: 2026-08-17
// Entry point của app:
// - Tạo React root
// - Import router từ routes/router.tsx
// - Import i18n configuration
// - Import global CSS styles

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from '@/routes/router'
import '@/i18n' // i18n configuration
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
