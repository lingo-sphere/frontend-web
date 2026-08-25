// Updated: 2026-08-20
// Mock data cho Practice hub:
// - practiceCategories: danh sách categories và items
// - publicDecks: danh sách bộ từ vựng public

export interface PracticeItem {
  id: string
  label: string
  labelVi?: string
  description: string
  descriptionVi?: string
  icon: string // icon name từ icon-map
  color: string
  bgColor: string
}

export interface PracticeCategory {
  title: string
  titleVi?: string
  items: PracticeItem[]
}

export interface PublicDeck {
  id: string
  title: string
  author: string
  authorAvatar: string // avatar color
  wordCount: number
  topic: string
  views: number
  saves: number
  isSaved?: boolean
}

export const practiceCategories: PracticeCategory[] = [
  {
    title: 'Knowledge',
    titleVi: 'Kiến thức',
    items: [
      { id: 'grammar', label: 'Grammar', labelVi: 'Ngữ pháp', description: 'English Grammar', descriptionVi: 'Ngữ pháp tiếng Anh', icon: 'book', color: 'text-text-primary', bgColor: 'bg-surface-subtle' },
      { id: 'ipa', label: 'IPA', labelVi: 'IPA', description: 'International Phonetic Alphabet', descriptionVi: 'Bảng phiên âm quốc tế', icon: 'languages', color: 'text-info', bgColor: 'bg-info-soft' },
    ],
  },
  {
    title: 'Skills',
    titleVi: 'Kỹ năng',
    items: [
      { id: 'listening', label: 'Listening', labelVi: 'Nghe', description: 'Practice listening skills', descriptionVi: 'Luyện kỹ năng nghe', icon: 'headphones', color: 'text-info', bgColor: 'bg-info-soft' },
      { id: 'speaking', label: 'Speaking', labelVi: 'Nói', description: 'Practice speaking skills', descriptionVi: 'Luyện kỹ năng nói', icon: 'microphone', color: 'text-primary', bgColor: 'bg-primary-soft' },
      { id: 'writing', label: 'Writing', labelVi: 'Viết', description: 'Practice writing skills', descriptionVi: 'Luyện kỹ năng viết', icon: 'pencil', color: 'text-ai', bgColor: 'bg-ai-soft' },
    ],
  },
  {
    title: 'Exam',
    titleVi: 'Bài thi',
    items: [
      { id: 'toeic', label: 'TOEIC', labelVi: 'TOEIC', description: 'Practice for TOEIC test', descriptionVi: 'Luyện thi TOEIC', icon: 'trophy', color: 'text-warning', bgColor: 'bg-warning-soft' },
    ],
  },
]

export const publicDecks: PublicDeck[] = [
  { id: 'deck-1', title: 'Business TOEIC 450', author: 'Minh Anh', authorAvatar: '#e74c3c', wordCount: 120, topic: 'Business', views: 12450, saves: 234 },
  { id: 'deck-2', title: 'Travel English Essential', author: 'Thu Hà', authorAvatar: '#3498db', wordCount: 85, topic: 'Travel', views: 9820, saves: 189 },
  { id: 'deck-3', title: 'Daily Conversation 100', author: 'Hoàng Bảo', authorAvatar: '#2ecc71', wordCount: 100, topic: 'Conversation', views: 8650, saves: 156 },
  { id: 'deck-4', title: 'IELTS Speaking Topics', author: 'Phương Linh', authorAvatar: '#9b59b6', wordCount: 50, topic: 'IELTS', views: 15230, saves: 312 },
  { id: 'deck-5', title: 'Medical English', author: 'Đức Tuấn', authorAvatar: '#f39c12', wordCount: 200, topic: 'Medical', views: 4560, saves: 98 },
  { id: 'deck-6', title: 'Tech Vocabulary', author: 'Mai Khánh', authorAvatar: '#1abc9c', wordCount: 150, topic: 'Technology', views: 7230, saves: 145 },
  { id: 'deck-7', title: 'Hotel & Restaurant', author: 'Lan Chi', authorAvatar: '#e67e22', wordCount: 90, topic: 'Hospitality', views: 3890, saves: 67 },
  { id: 'deck-8', title: 'Academic Writing', author: 'Quang Minh', authorAvatar: '#34495e', wordCount: 180, topic: 'Academic', views: 5210, saves: 112 },
  { id: 'deck-9', title: 'Marketing English', author: 'Hồng Nhung', authorAvatar: '#e91e63', wordCount: 110, topic: 'Marketing', views: 2980, saves: 54 },
  { id: 'deck-10', title: 'Finance & Banking', author: 'Anh Tuấn', authorAvatar: '#607d8b', wordCount: 160, topic: 'Finance', views: 4120, saves: 89 },
  { id: 'deck-11', title: 'Aviation English', author: 'Văn Đức', authorAvatar: '#00bcd4', wordCount: 140, topic: 'Aviation', views: 2340, saves: 41 },
  { id: 'deck-12', title: 'Legal English', author: 'Thanh Hà', authorAvatar: '#795548', wordCount: 175, topic: 'Legal', views: 1890, saves: 36 },
]

// Get top 6 most viewed decks
export const topPublicDecks: PublicDeck[] = [...publicDecks].sort((a, b) => b.views - a.views).slice(0, 6)
