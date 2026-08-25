// Updated: 2026-08-17
// Root component:
// - Wrap với AppProvider để truyền context xuống các route con
// - Render Outlet từ react-router-dom

import { Outlet } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/contexts/AppContext'

export function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </AppProvider>
  )
}
