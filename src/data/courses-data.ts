export interface CourseCardData {
  id: string
  title: string
  instructor: string
  instructorAvatar?: string
  thumbnail: string
  category: 'toeic' | 'speaking' | 'vocabulary' | 'grammar' | 'business'
  level: string
  description: string
  duration: string
  totalLessons: number
  chapters: number
  students: number
  rating: number
  ratingCount: number
  progress: number
  badge?: 'Bestseller' | 'Hot & New' | 'Highest Rated'
  isFavorite?: boolean
  isArchived?: boolean
  hasCertificate?: boolean
  lastAccessed?: string
}

export const allCourses: CourseCardData[] = [
  {
    id: 'toeic-foundation',
    title: 'TOEIC Foundation 450+ - Tư Duy Nghe Đọc Chuẩn ETS',
    instructor: 'LingoSphere Academic Team',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    category: 'toeic',
    level: 'A2 → B1 (450+)',
    description: 'Xây dựng nền tảng tư duy ngữ pháp, từ vựng cốt lõi và chiến thuật xử lý Part 1 đến Part 7 trong kỳ thi TOEIC.',
    duration: '45.5 giờ',
    totalLessons: 48,
    chapters: 6,
    students: 12850,
    rating: 4.8,
    ratingCount: 1420,
    progress: 100,
    badge: 'Bestseller',
    hasCertificate: true,
    lastAccessed: 'Hôm nay',
  },
  {
    id: 'toeic-intensive',
    title: 'TOEIC Intensive 750+ - Bứt Phá Điểm Số Cùng Tư Duy Logic',
    instructor: 'Dr. Michael Chen & ETS Masters',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop',
    category: 'toeic',
    level: 'B1 → B2 (750+)',
    description: 'Chiến thuật giải đề tốc độ cao, bẫy từ vựng nâng cao và kỹ thuật đọc quét văn bản đa đoạn Part 7.',
    duration: '62.0 giờ',
    totalLessons: 64,
    chapters: 8,
    students: 8940,
    rating: 4.9,
    ratingCount: 980,
    progress: 42,
    badge: 'Highest Rated',
    hasCertificate: true,
    lastAccessed: 'Hôm qua',
  },
  {
    id: 'whisper-speaking-mastery',
    title: 'Luyện Phát Âm & Giao Tiếp Chuẩn Bản Xứ Cùng Whisper AI',
    instructor: 'Sarah Jenkins (MA Applied Linguistics)',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    category: 'speaking',
    level: 'Mọi trình độ (All levels)',
    description: 'Chuẩn hóa toàn bộ 44 âm vị IPA, nối âm, nuốt âm và ngữ điệu tự nhiên được chấm điểm từng miligiây bởi AI Whisper.',
    duration: '28.5 giờ',
    totalLessons: 36,
    chapters: 5,
    students: 15400,
    rating: 4.85,
    ratingCount: 2150,
    progress: 0,
    badge: 'Hot & New',
    hasCertificate: false,
  },
  {
    id: 'srs-vocabulary-masterclass',
    title: 'Siêu Trí Nhớ 3000 Từ Vựng TOEIC Cùng Khoa Học Não Bộ SRS',
    instructor: 'LingoSphere Cognitive AI Lab',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
    category: 'vocabulary',
    level: 'Căn bản đến Nâng cao',
    description: 'Phương pháp lặp lại ngắt quãng SuperMemo SM-2 tự động nhắc nhớ đúng điểm rơi trí nhớ, ghi nhớ từ vựng vĩnh viễn.',
    duration: '32.0 giờ',
    totalLessons: 40,
    chapters: 5,
    students: 21300,
    rating: 4.95,
    ratingCount: 3840,
    progress: 0,
    badge: 'Bestseller',
    hasCertificate: false,
  },
  {
    id: 'grammar-logic-system',
    title: 'Giải Mã Ngữ Pháp Tiếng Anh Bằng Tư Duy Đơn Giản Hóa',
    instructor: 'Thầy Hoàng Nam & Ban Sư Phạm LingoSphere',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
    category: 'grammar',
    level: 'Mất gốc → Trung cấp',
    description: 'Học ngữ pháp bằng bản đồ tư duy Logic, không ghi nhớ công thức máy móc, hiểu sâu bản chất các thì và mệnh đề.',
    duration: '38.0 giờ',
    totalLessons: 44,
    chapters: 6,
    students: 11200,
    rating: 4.75,
    ratingCount: 1290,
    progress: 0,
    hasCertificate: false,
  },
  {
    id: 'business-english-communication',
    title: 'Tiếng Anh Doanh Nghiệp & Đàm Phán Thương Mại Quốc Tế',
    instructor: 'David Nguyen (Senior Corporate Trainer)',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
    category: 'business',
    level: 'B1 → C1',
    description: 'Viết email chuyên nghiệp, thuyết trình dự án và đàm phán hợp đồng tự tin với đối tác đa quốc gia.',
    duration: '30.0 giờ',
    totalLessons: 32,
    chapters: 4,
    students: 6700,
    rating: 4.88,
    ratingCount: 750,
    progress: 0,
    hasCertificate: true,
  },
]
