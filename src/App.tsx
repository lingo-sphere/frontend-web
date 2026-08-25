
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
