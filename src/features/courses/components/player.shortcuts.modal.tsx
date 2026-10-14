// Modal huong dan phim tat dieu khien video bai hoc.
'use client'

import { Keyboard, X } from 'lucide-react'

interface PlayerShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUT_ITEMS = [
  { key: 'Space / K', desc: 'Phát / Tạm dừng video' },
  { key: '← / J', desc: 'Tua lùi 10 giây' },
  { key: '→ / L', desc: 'Tua tiến 10 giây' },
  { key: '↑', desc: 'Tăng âm lượng 10%' },
  { key: '↓', desc: 'Giảm âm lượng 10%' },
  { key: 'M', desc: 'Tắt / Bật tiếng' },
  { key: 'F', desc: 'Toàn màn hình' },
  { key: 'T', desc: 'Chế độ rạp chiếu' },
  { key: 'P', desc: 'Hình trong hình (PiP)' },
  { key: 'N', desc: 'Tạo ghi chú nhanh' },
]

export function PlayerShortcutsModal({ isOpen, onClose }: PlayerShortcutsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0f0f0f] border border-white/10 p-5 shadow-2xl text-white space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Keyboard className="text-[#ff0000]" size={18} />
            <span>Phím tắt điều khiển Video</span>
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {SHORTCUT_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5"
            >
              <span className="text-zinc-300">{item.desc}</span>
              <span className="font-mono font-bold text-[#ff0000] bg-[#ff0000]/10 px-1.5 py-0.5 rounded text-[11px]">
                {item.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
