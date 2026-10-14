// Cấu hình danh mục điều hướng chính cho ứng dụng frontend-web.

export interface NavItem {
  id: string
  labelVi: string
  labelEn: string
  icon: string
  path: string
  badge?: string
  badgeColor?: string
  children?: NavItem[]
}

export interface NavGroup {
  id: string
  titleVi: string
  titleEn: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'main',
    titleVi: 'Học tập',
    titleEn: 'Learning',
    items: [
      { id: 'home', labelVi: 'Tổng quan', labelEn: 'Dashboard', icon: 'home', path: '/home' },
      {
        id: 'courses',
        labelVi: 'Khóa học',
        labelEn: 'Courses',
        icon: 'book',
        path: '/courses',
        children: [
          { id: 'courses-all', labelVi: 'Tất cả khóa học', labelEn: 'All courses', icon: 'grid', path: '/courses?tab=all' },
          { id: 'courses-my', labelVi: 'Khóa học của tôi', labelEn: 'My courses', icon: 'graduation', path: '/courses?tab=my-courses' },
          { id: 'courses-liked', labelVi: 'Khóa học yêu thích', labelEn: 'Liked courses', icon: 'heart', path: '/courses?tab=wishlist' },
        ],
      },
      { id: 'vocabulary', labelVi: 'Từ vựng', labelEn: 'Vocabulary', icon: 'cards', path: '/vocabulary' },
      { id: 'mistakes', labelVi: 'Sổ tay lỗi sai', labelEn: 'Mistake Vault', icon: 'bookmarkCheck', path: '/practice/mistakes' },
      { id: 'toeic', labelVi: 'Đề thi TOEIC', labelEn: 'TOEIC Exam', icon: 'fileText', path: '/toeic' },
    ],
  },
  {
    id: 'practice',
    titleVi: '4 Kỹ năng',
    titleEn: '4 Skills',
    items: [
      { id: 'listening', labelVi: 'Luyện Nghe', labelEn: 'Listening', icon: 'headphones', path: '/listening' },
      { id: 'speaking', labelVi: 'Luyện Nói', labelEn: 'Speaking', icon: 'mic', path: '/speaking' },
      { id: 'reading', labelVi: 'Luyện Đọc', labelEn: 'Reading', icon: 'book', path: '/reading' },
      { id: 'writing', labelVi: 'Luyện Viết', labelEn: 'Writing', icon: 'pencil', path: '/writing' },
      { id: 'grammar', labelVi: 'Ngữ pháp', labelEn: 'Grammar', icon: 'bookCheck', path: '/grammar' },
      { id: 'ipa', labelVi: 'Bảng phiên âm IPA', labelEn: 'IPA Chart', icon: 'volume2', path: '/ipa' },
    ],
  },
  {
    id: 'ai-tools',
    titleVi: 'AI & Tiện ích',
    titleEn: 'AI & Tools',
    items: [
      { id: 'translate', labelVi: 'Dịch Thuật AI', labelEn: 'AI Translation', icon: 'volume2', path: '/translate' },
      { id: 'leaderboard', labelVi: 'Bảng xếp hạng', labelEn: 'Leaderboard', icon: 'trophy', path: '/leaderboard' },
    ],
  },
]
