export interface PracticeItem {
  id: string
  label: string
  labelVi: string
  description: string
  descriptionVi: string
  icon: string
  color: string
  bgColor?: string
  badge?: string
}

export interface PracticeCategory {
  title: string
  titleVi: string
  items: PracticeItem[]
}

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    title: 'Foundational Knowledge',
    titleVi: 'Kiến thức nền tảng',
    items: [
      {
        id: 'ipa',
        label: 'IPA Chart',
        labelVi: 'Bảng ngữ âm IPA',
        description: 'Master English sounds & pronunciation',
        descriptionVi: '44 âm chuẩn quốc tế kèm audio phát âm chuẩn',
        icon: 'volume2',
        color: 'text-primary',
      },
      {
        id: 'grammar',
        label: 'Grammar',
        labelVi: 'Ngữ pháp',
        description: 'Essential grammar rules & structures',
        descriptionVi: 'Hệ thống thì, mệnh đề và cấu trúc câu thông dụng',
        icon: 'bookCheck',
        color: 'text-info',
      },
    ],
  },
  {
    title: 'Core Skills Practice',
    titleVi: 'Luyện tập 4 kỹ năng',
    items: [
      {
        id: 'listening',
        label: 'Listening',
        labelVi: 'Luyện Nghe',
        description: 'Audio exercises with transcripts & quizzes',
        descriptionVi: 'Luyện nghe phản xạ với transcript và câu hỏi',
        icon: 'headphones',
        color: 'text-info',
      },
      {
        id: 'speaking',
        label: 'Speaking (Whisper AI)',
        labelVi: 'Luyện Nói (Whisper AI)',
        description: 'Pronunciation & fluency analysis',
        descriptionVi: 'Bóc tách độ chính xác từng từ bằng Whisper.cpp',
        icon: 'mic',
        color: 'text-accent',
        badge: 'Whisper STT',
      },
      {
        id: 'writing',
        label: 'Writing (AI Engine)',
        labelVi: 'Luyện Viết (Writing AI)',
        description: 'Essay feedback & grammar correction',
        descriptionVi: 'Chấm điểm và gợi ý sửa lỗi bài luận bằng Groq & Gemini',
        icon: 'pencil',
        color: 'text-warning',
        badge: 'Cloud AI',
      },
    ],
  },
  {
    title: 'Exam Preparation',
    titleVi: 'Luyện thi chứng chỉ',
    items: [
      {
        id: 'toeic',
        label: 'TOEIC Full Test',
        labelVi: 'Thi thử TOEIC ETS',
        description: 'Full 200 questions mock exam with ETS scoring',
        descriptionVi: 'Bộ đề thi chuẩn ETS 200 câu chấm điểm tự động',
        icon: 'fileText',
        color: 'text-primary',
        badge: 'ETS Standard',
      },
    ],
  },
]
