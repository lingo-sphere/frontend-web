// Định nghĩa cấu trúc kiểu dữ liệu bài viết kiến thức và cẩm nang luyện thi TOEIC
export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  category: 'Lộ trình học' | 'Kỹ năng Listening' | 'Kỹ năng Reading' | 'Từ vựng & Ngữ pháp'
  author: string
  publishedAt: string
  updatedAt: string
  readTime: string
  coverImage: string
  tags: string[]
  relatedCourseId?: string
  relatedExamId?: string
}
