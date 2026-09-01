/**
 * @file UserProfileEditModal.tsx
 * @description Component giao diện React UserProfileEditModal cho học viên
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/icons/icon-map'
import { UserAvatar } from '@/components/user/UserStatsHeader'
import type { User, EditProfileForm } from '@/types/user'

interface EditProfileModalProps {
  user: User
  onClose: () => void
  onSave: (data: EditProfileForm) => void
}

export function EditProfileModal({
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [form, setForm] = useState<EditProfileForm>({
    displayName: user.displayName,
    bio: user.bio || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
    address: user.address || '',
    city: user.city || '',
    country: user.country || '',
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Chỉnh sửa hồ sơ</h3>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <UserAvatar src={user.avatar} size="xl" editable />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Tên hiển thị
              </label>
              <Input
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                placeholder="Nhập tên hiển thị"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Giới thiệu
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Viết vài dòng về bạn..."
                className="w-full h-24 px-3 py-2 border border-surface-subtle rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Số điện thoại
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBirth: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Giới tính
                </label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as EditProfileForm['gender'],
                    })
                  }
                  className="w-full px-3 py-2 border border-surface-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Thành phố
                </label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Nhập thành phố"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button onClick={() => onSave(form)} className="flex-1">
              Lưu thay đổi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
