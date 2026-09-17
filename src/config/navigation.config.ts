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
      { id: 'vocabulary', labelVi: 'Từ vựng (SRS)', labelEn: 'Vocabulary', icon: 'cards', path: '/vocabulary' },
      { id: 'toeic', labelVi: 'Đề thi TOEIC', labelEn: 'TOEIC Exam', icon: 'fileText', path: '/toeic', badge: 'ETS', badgeColor: 'bg-primary' },
    ],
  },
  {
    id: 'practice',
    titleVi: '4 Kỹ năng',
    titleEn: '4 Skills',
    items: [
      { id: 'listening', labelVi: 'Luyện Nghe', labelEn: 'Listening', icon: 'headphones', path: '/listening' },
      { id: 'speaking', labelVi: 'Luyện Nói (Whisper)', labelEn: 'Speaking', icon: 'mic', path: '/speaking', badge: 'AI', badgeColor: 'bg-accent' },
      { id: 'writing', labelVi: 'Luyện Viết (Writing AI)', labelEn: 'Writing', icon: 'pencil', path: '/writing', badge: 'AI', badgeColor: 'bg-accent' },
      { id: 'journal', labelVi: 'Nhật Ký AI', labelEn: 'Daily Journal', icon: 'fileText', path: '/journal', badge: 'Daily', badgeColor: 'bg-primary' },
      { id: 'grammar', labelVi: 'Ngữ pháp', labelEn: 'Grammar', icon: 'bookCheck', path: '/grammar' },
      { id: 'ipa', labelVi: 'Bảng phiên âm IPA', labelEn: 'IPA Chart', icon: 'volume2', path: '/ipa' },
    ],
  },
  {
    id: 'ai-community',
    titleVi: 'AI & Cộng đồng',
    titleEn: 'AI & Community',
    items: [
      { id: 'ai-learning', labelVi: 'Gia sư AI', labelEn: 'AI Tutor', icon: 'sparkles', path: '/ai-learning', badge: 'Groq', badgeColor: 'bg-success' },
      { id: 'translate', labelVi: 'Dịch Thuật AI', labelEn: 'AI Translation', icon: 'volume2', path: '/translate', badge: 'AI', badgeColor: 'bg-accent' },
      { id: 'community', labelVi: 'Cộng đồng', labelEn: 'Community', icon: 'users', path: '/community' },
      { id: 'leaderboard', labelVi: 'Bảng xếp hạng', labelEn: 'Leaderboard', icon: 'trophy', path: '/leaderboard' },
      { id: 'notes', labelVi: 'Sổ tay ghi chú', labelEn: 'Notebook', icon: 'notes', path: '/notes' },
    ],
  },
]
