// Hằng số và hàm tiện ích cho bộ cài đặt lịch học tập hàng ngày

export const DAYS_OF_WEEK = [
  { id: 'T2', shortVi: 'T2', shortEn: 'Mon', labelVi: 'Thứ 2', labelEn: 'Monday' },
  { id: 'T3', shortVi: 'T3', shortEn: 'Tue', labelVi: 'Thứ 3', labelEn: 'Tuesday' },
  { id: 'T4', shortVi: 'T4', shortEn: 'Wed', labelVi: 'Thứ 4', labelEn: 'Wednesday' },
  { id: 'T5', shortVi: 'T5', shortEn: 'Thu', labelVi: 'Thứ 5', labelEn: 'Thursday' },
  { id: 'T6', shortVi: 'T6', shortEn: 'Fri', labelVi: 'Thứ 6', labelEn: 'Friday' },
  { id: 'T7', shortVi: 'T7', shortEn: 'Sat', labelVi: 'Thứ 7', labelEn: 'Saturday' },
  { id: 'CN', shortVi: 'CN', shortEn: 'Sun', labelVi: 'Chủ nhật', labelEn: 'Sunday' },
]

export const TIME_PRESETS = [
  { time: '07:00', labelVi: '07:00 (Sáng)', labelEn: '07:00 AM (Morning)' },
  { time: '12:30', labelVi: '12:30 (Trưa)', labelEn: '12:30 PM (Noon)' },
  { time: '20:00', labelVi: '20:00 (Tối)', labelEn: '08:00 PM (Evening)' },
  { time: '21:30', labelVi: '21:30 (Đêm)', labelEn: '09:30 PM (Night)' },
]

export const HOURS_LIST = Array.from({ length: 24 }, (_, i) => (i < 10 ? `0${i}` : `${i}`))
export const MINUTES_LIST = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

export function formatTimeDisplay(timeStr: string, isVi: boolean) {
  const [hStr, mStr] = (timeStr || '20:00').split(':')
  const h = parseInt(hStr || '20', 10)
  const m = parseInt(mStr || '00', 10)
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const time24 = `${pad(h)}:${pad(m)}`
  const h12 = h % 12 === 0 ? 12 : h % 12
  const isPM = h >= 12
  const period12 = isVi ? (isPM ? 'CH' : 'SA') : (isPM ? 'PM' : 'AM')

  let periodDesc = ''
  let periodIcon: 'moon' | 'sunrise' | 'sun' | 'sunset' = 'sunrise'
  if (h >= 0 && h < 5) {
    periodDesc = isVi ? 'Đêm muộn' : 'Late night'
    periodIcon = 'moon'
  } else if (h >= 5 && h < 11) {
    periodDesc = isVi ? 'Buổi sáng' : 'Morning'
    periodIcon = 'sunrise'
  } else if (h >= 11 && h < 14) {
    periodDesc = isVi ? 'Buổi trưa' : 'Noon'
    periodIcon = 'sun'
  } else if (h >= 14 && h < 18) {
    periodDesc = isVi ? 'Buổi chiều' : 'Afternoon'
    periodIcon = 'sun'
  } else if (h >= 18 && h < 22) {
    periodDesc = isVi ? 'Buổi tối' : 'Evening'
    periodIcon = 'sunset'
  } else {
    periodDesc = isVi ? 'Ban đêm' : 'Night'
    periodIcon = 'moon'
  }

  return {
    time24,
    time12: `${pad(h12)}:${pad(m)} ${period12}`,
    periodDesc,
    periodIcon,
    h,
    m,
    label: isVi
      ? `${time24} • ${pad(h12)}:${pad(m)} ${period12} (${periodDesc})`
      : `${pad(h12)}:${pad(m)} ${period12} • ${time24} (${periodDesc})`,
  }
}
