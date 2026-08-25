
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  onConfirm,
}: ConfirmDeleteModalProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const defaultConfirmText = isVietnamese ? 'Xác nhận' : 'Confirm'
  const defaultCancelText = isVietnamese ? 'Hủy' : 'Cancel'

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-primary hover:bg-primary-hover',
    },
  }

  const styles = variantStyles[variant]

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelText || defaultCancelText}
          </Button>
          <Button className={styles.button} onClick={onConfirm}>
            {confirmText || defaultConfirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[14px] text-text-primary">{message}</p>
        </div>
      </div>
    </Modal>
  )
}
