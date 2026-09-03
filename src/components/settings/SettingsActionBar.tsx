'use client'

/**
 * @file SettingsActionBar.tsx
 * @description Component thanh điều khiển lưu thay đổi và khôi phục mặc định ở chân trang Settings
 */

import { RotateCcw, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SettingsActionBarProps {
  onReset: () => void
  onSave: () => void
  isSaving: boolean
  isVi: boolean
}

export function SettingsActionBar({
  onReset,
  onSave,
  isSaving,
  isVi,
}: SettingsActionBarProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
      <Button
        variant="ghost"
        onClick={onReset}
        className="w-full sm:w-auto text-xs text-text-secondary hover:text-text-primary rounded-xl cursor-pointer"
      >
        <RotateCcw size={14} className="mr-1.5" />
        <span>{isVi ? 'Khôi phục mặc định' : 'Reset to Default'}</span>
      </Button>

      <Button
        onClick={onSave}
        disabled={isSaving}
        className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold px-6 h-11 transition-all shadow-md shadow-primary/20 cursor-pointer"
      >
        {isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            <span>{isVi ? 'Đang lưu cài đặt...' : 'Saving...'}</span>
          </>
        ) : (
          <>
            <Save size={16} className="mr-2" />
            <span>{isVi ? 'Lưu mọi thay đổi' : 'Save Changes'}</span>
          </>
        )}
      </Button>
    </div>
  )
}
