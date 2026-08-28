import type { Course, Chapter, Lesson, LessonStatus, TestResult, QnAItem, NoteItem, CourseReviewItem, CourseAnnouncement } from '@/types/course'

const YOUTUBE_LESSON_VIDEOS = [
  'https://www.youtube.com/embed/YykjpeuMNEk',
  'https://www.youtube.com/embed/1k8CQkMmg3g',
  'https://www.youtube.com/embed/jfKfPfyJRdk',
  'https://www.youtube.com/embed/M7lc1UVf-VE',
  'https://www.youtube.com/embed/tgbNymZ7vqY',
  'https://www.youtube.com/embed/3JZ_D3ELwOQ',
]

const makeLesson = (
  id: string,
  chapterId: string,
  order: number,
  title: string,
  status: LessonStatus,
  progress: number,
  duration = 340,
  resourcesCount = 2
): Lesson => {
  const chosenVideo = YOUTUBE_LESSON_VIDEOS[(order - 1) % YOUTUBE_LESSON_VIDEOS.length]
  return {
    id,
    chapterId,
    order,
    title,
    type: 'video',
    duration,
    status,
    progress,
    videoUrl: chosenVideo,
    resources: Array.from({ length: resourcesCount }, (_, i) => ({
      id: `res-${id}-${i + 1}`,
      title: `${title} - Bài giảng slide & bài tập bổ trợ phần ${i + 1}.pdf`,
      type: i % 2 === 0 ? 'pdf' : 'audio',
      url: '#',
      size: `${(1.2 + i * 0.8).toFixed(1)} MB`,
    })),
    content: {
      videoUrl: chosenVideo,
      sections: [
        { id: '1', title: 'Giới thiệu & Mục tiêu bài học', type: 'introduction', content: 'Tổng quan kiến thức và ứng dụng thực tế trong kỳ thi TOEIC.' },
        { id: '2', title: 'Phân tích Từ vựng cốt lõi', type: 'vocabulary', content: 'Cách phát âm chuẩn IPA, họ từ (word family) và cụm cố định (collocations).' },
        { id: '3', title: 'Ngữ pháp & Tư duy bóc tách câu', type: 'grammar', content: 'Quy tắc nhận diện nhanh cấu trúc câu và bẫy đề thi ETS.' },
        { id: '4', title: 'Thực hành giải câu hỏi thực tế', type: 'practice', content: 'Luyện tập trực tiếp với phản hồi giải thích chi tiết từng đáp án.' },
      ],
    },
  }
}

const makeTestResult = (score: number, listening: number, reading: number): TestResult => ({
  testType: 'post-mini',
  score,
  listeningScore: listening,
  readingScore: reading,
  completedAt: new Date().toISOString(),
})

const chapter1: Chapter = {
  id: 'ch-01',
  courseId: 'toeic-foundation',
  order: 1,
  title: 'Section 1: Nền Tảng Tư Duy Logic & Xây Dựng Từ Vựng Cốt Lõi',
  description: 'Tư duy bóc tách câu S-V-O, nguyên tắc phát âm chuẩn IPA và 200 từ vựng xuất hiện nhiều nhất trong TOEIC Part 1 & Part 2.',
  status: 'completed',
  lessons: [
    makeLesson('l-01-01', 'ch-01', 1, '1. Tổng quan lộ trình tư duy bứt phá TOEIC 450+', 'completed', 100, 420),
    makeLesson('l-01-02', 'ch-01', 2, '2. 44 Âm vị IPA & Quy tắc nhận diện ngữ điệu tiếng Anh', 'completed', 100, 580),
    makeLesson('l-01-03', 'ch-01', 3, '3. Chiến thuật nghe tranh tả người Part 1 (Hành động & Bối cảnh)', 'completed', 100, 640),
    makeLesson('l-01-04', 'ch-01', 4, '4. Chiến thuật nghe tranh tả vật Part 1 (Thế bị động & Vị trí)', 'completed', 100, 510),
  ],
  challengeTest: {
    id: 'ct-01',
    chapterId: 'ch-01',
    title: 'Section 01 Challenge Test',
    questionsCount: 15,
    passingScore: 70,
    status: 'completed',
    result: makeTestResult(85, 80, 90),
  },
  exercise: {
    id: 'ex-01',
    chapterId: 'ch-01',
    title: 'Section 01 Practice Quiz',
    questionsCount: 10,
    skills: ['Vocabulary', 'Listening Part 1', 'Pronunciation'],
    status: 'completed',
    result: makeTestResult(90, 88, 92),
  },
  postMiniTest: {
    id: 'pm-01',
    chapterId: 'ch-01',
    title: 'Section 01 Mini Exam Assessment',
    questionsCount: 20,
    skills: ['Listening', 'Reading'],
    difficulty: 'ETS Standard',
    status: 'completed',
    result: makeTestResult(88, 86, 90),
  },
}

const chapter2: Chapter = {
  id: 'ch-02',
  courseId: 'toeic-foundation',
  order: 2,
  title: 'Section 2: Cấu Trúc Câu & Ngữ Pháp Trọng Điểm TOEIC Part 5',
  description: 'Nhận diện nhanh từ loại (Noun, Verb, Adj, Adv), hòa hợp chủ vị, các thì động từ và mệnh đề quan hệ rút gọn.',
  status: 'in-progress',
  lessons: [
    makeLesson('l-02-01', 'ch-02', 1, '5. Tư duy định vị từ loại không cần dịch nghĩa cả câu', 'completed', 100, 540),
    makeLesson('l-02-02', 'ch-02', 2, '6. 12 Thì tiếng Anh ứng dụng trực diện trong Part 5 & Part 6', 'completed', 100, 720),
    makeLesson('l-02-03', 'ch-02', 3, '7. Động từ khiếm khuyết (Modal Verbs) & Thể bị động nâng cao', 'available', 60, 480),
    makeLesson('l-02-04', 'ch-02', 4, '8. Mệnh đề quan hệ & Kỹ thuật rút gọn V-ing / V-ed', 'available', 0, 610),
  ],
  challengeTest: {
    id: 'ct-02',
    chapterId: 'ch-02',
    title: 'Section 02 Challenge Test',
    questionsCount: 15,
    passingScore: 70,
    status: 'available',
  },
  exercise: {
    id: 'ex-02',
    chapterId: 'ch-02',
    title: 'Section 02 Grammar Exercise',
    questionsCount: 12,
    skills: ['Part 5 Grammar', 'Sentence Structure'],
    status: 'available',
  },
  postMiniTest: {
    id: 'pm-02',
    chapterId: 'ch-02',
    title: 'Section 02 Mini Assessment',
    questionsCount: 25,
    skills: ['Reading Part 5 & 6'],
    difficulty: 'ETS Standard',
    status: 'locked',
  },
}

const chapter3: Chapter = {
  id: 'ch-03',
  courseId: 'toeic-foundation',
  order: 3,
  title: 'Section 3: Chiến Thuật Xử Lý Hỏi - Đáp Part 2 (Question - Response)',
  description: 'Phản xạ với câu hỏi Wh-questions, Yes/No questions, câu hỏi lựa chọn và câu trả lời gián tiếp né bẫy âm thanh.',
  status: 'available',
  lessons: [
    makeLesson('l-03-01', 'ch-03', 1, '9. Xử lý câu hỏi Who, Where, When - Bắt key tức thì', 'available', 0, 450),
    makeLesson('l-03-02', 'ch-03', 2, '10. Xử lý câu hỏi Why, How & Câu hỏi đề nghị Suggestion', 'locked', 0, 520),
    makeLesson('l-03-03', 'ch-03', 3, '11. Kỹ thuật né bẫy lặp từ, từ đồng âm và từ mang nghĩa đối lập', 'locked', 0, 490),
    makeLesson('l-03-04', 'ch-03', 4, '12. Câu trả lời gián tiếp & Phản xạ tình huống giao tiếp', 'locked', 0, 560),
  ],
  challengeTest: {
    id: 'ct-03',
    chapterId: 'ch-03',
    title: 'Section 03 Challenge Test',
    questionsCount: 20,
    passingScore: 75,
    status: 'locked',
  },
  exercise: {
    id: 'ex-03',
    chapterId: 'ch-03',
    title: 'Section 03 Listening Dictation',
    questionsCount: 15,
    skills: ['Listening Part 2', 'Acoustic Discrimination'],
    status: 'locked',
  },
  postMiniTest: {
    id: 'pm-03',
    chapterId: 'ch-03',
    title: 'Section 03 Assessment',
    questionsCount: 25,
    skills: ['Listening Part 2'],
    difficulty: 'ETS Standard',
    status: 'locked',
  },
}

const chapter4: Chapter = {
  id: 'ch-04',
  courseId: 'toeic-foundation',
  order: 4,
  title: 'Section 4: Kỹ Thuật Đọc Hiểu Part 7 Đơn Đoạn & Đa Đoạn',
  description: 'Skimming & Scanning định vị thông tin, suy luận từ vựng theo ngữ cảnh và quản lý thời gian làm bài thi đọc.',
  status: 'locked',
  lessons: [
    makeLesson('l-04-01', 'ch-04', 1, '13. Đọc hiểu Email, Memo và Thư từ thương mại', 'locked', 0, 480),
    makeLesson('l-04-02', 'ch-04', 2, '14. Xử lý thông báo (Notice), quảng cáo (Advertisement) & Bài báo (Article)', 'locked', 0, 530),
    makeLesson('l-04-03', 'ch-04', 3, '15. Kỹ thuật nối thông tin đa đoạn (Double & Triple Passages)', 'locked', 0, 620),
  ],
  challengeTest: {
    id: 'ct-04',
    chapterId: 'ch-04',
    title: 'Section 04 Challenge Test',
    questionsCount: 20,
    passingScore: 75,
    status: 'locked',
  },
  exercise: {
    id: 'ex-04',
    chapterId: 'ch-04',
    title: 'Section 04 Reading Speed Drill',
    questionsCount: 15,
    skills: ['Reading Part 7'],
    status: 'locked',
  },
  postMiniTest: {
    id: 'pm-04',
    chapterId: 'ch-04',
    title: 'Section 04 Assessment',
    questionsCount: 30,
    skills: ['Reading Part 7'],
    difficulty: 'ETS Standard',
    status: 'locked',
  },
}

export const demoQnA: QnAItem[] = [
  {
    id: 'qna-1',
    lessonId: 'l-01-02',
    lessonTitle: '2. 44 Âm vị IPA & Quy tắc nhận diện ngữ điệu tiếng Anh',
    author: 'Trần Minh Hoàng',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop',
    title: 'Làm sao để phân biệt âm /i:/ và /ɪ/ khi người bản xứ nói nhanh trong Part 3?',
    body: 'Em hay bị nhầm lẫn giữa hai âm này khi nghe ở tốc độ 1x trong đề thi thử ETS. Thầy cô có mẹo nào để bắt key chính xác không ạ?',
    createdAt: '2 ngày trước',
    upvotes: 14,
    answersCount: 2,
    isAnswered: true,
    answers: [
      {
        id: 'ans-1',
        author: 'LingoSphere AI Tutor',
        authorRole: 'Gia sư AI',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
        body: 'Chào bạn! Điểm cốt lõi không chỉ là độ dài của âm mà là khẩu hình và độ căng cơ môi: âm /i:/ cơ môi căng bè sang hai bên như đang cười (tense vowel), còn /ɪ/ cơ môi thả lỏng tự nhiên (lax vowel). Trong bài nói nhanh, hãy dựa vào ngữ cảnh câu và trọng âm câu (content words mang âm /i:/ thường được nhấn rõ hơn).',
        createdAt: '1 ngày trước',
        upvotes: 9,
      },
    ],
  },
  {
    id: 'qna-2',
    lessonId: 'l-02-01',
    lessonTitle: '5. Tư duy định vị từ loại không cần dịch nghĩa cả câu',
    author: 'Nguyễn Thuỳ Linh',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop',
    title: 'Quy tắc xác định vị trí của Trạng từ (Adverb) trong câu bị động có ngoại lệ không?',
    body: 'Trong video bài giảng thầy có nhắc cấu trúc S + be + ADV + V3/ed. Có trường hợp nào trạng từ đứng trước cả to be không ạ?',
    createdAt: '3 ngày trước',
    upvotes: 8,
    answersCount: 1,
    isAnswered: true,
    answers: [
      {
        id: 'ans-2',
        author: 'Dr. Michael Chen',
        authorRole: 'Giảng viên chính',
        body: 'Có một số trạng từ chỉ tần suất (always, never, rarely) hoặc trạng từ nhấn mạnh (certainly, definitely) có thể đứng trước trợ động từ hoặc to be khi người nói muốn nhấn mạnh ý khẳng định: e.g. "He definitely was informed."',
        createdAt: '2 ngày trước',
        upvotes: 6,
      },
    ],
  },
]

export const demoNotes: NoteItem[] = [
  {
    id: 'note-1',
    lessonId: 'l-01-02',
    lessonTitle: '2. 44 Âm vị IPA & Quy tắc nhận diện ngữ điệu tiếng Anh',
    timestamp: 145,
    formattedTime: '02:25',
    content: 'Quy tắc nối âm Consonant + Vowel: "an apple" -> /əˈnæp.əl/. Cực kỳ quan trọng trong các câu hỏi Part 2.',
    createdAt: 'Hôm qua, 14:30',
  },
  {
    id: 'note-2',
    lessonId: 'l-02-01',
    lessonTitle: '5. Tư duy định vị từ loại không cần dịch nghĩa cả câu',
    timestamp: 320,
    formattedTime: '05:20',
    content: 'Đứng giữa "The/A/An" và Danh từ chính luôn là Tính từ hoặc Bổ ngữ danh từ (Noun adjunct).',
    createdAt: '3 ngày trước',
  },
]

export const demoReviews: CourseReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Lê Văn An',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
    rating: 5,
    date: '1 tuần trước',
    content: 'Khóa học thiết kế quá bài bản, phương pháp tư duy đơn giản hóa giúp mình từ 350 tăng lên 580 điểm chỉ sau 6 tuần!',
  },
  {
    id: 'rev-2',
    author: 'Phạm Minh Trang',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120&auto=format&fit=crop',
    rating: 5,
    date: '2 tuần trước',
    content: 'Video bài giảng ngắn gọn, tập trung thẳng vào trọng tâm, có sẵn slide PDF và bài tập thực hành ngay dưới video.',
  },
]

export const demoAnnouncements: CourseAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Cập nhật bộ đề dự đoán TOEIC ETS 2026 trong Section 4',
    date: '24 Th8, 2026',
    author: 'LingoSphere Academic Team',
    content: 'Chào các bạn học viên, ban sư phạm đã bổ sung thêm 3 bộ đề dự đoán mới nhất kèm giải thích chi tiết trong phần Tài liệu bài học.',
  },
]

export const demoCourse: Course = {
  id: 'toeic-foundation',
  title: 'TOEIC Foundation 450+ - Tư Duy Nghe Đọc Chuẩn ETS',
  level: 'A2 → B1 (450+)',
  description: 'Xây dựng nền tảng tư duy ngữ pháp, từ vựng cốt lõi và chiến thuật xử lý Part 1 đến Part 7 trong kỳ thi TOEIC bằng phương pháp khoa học não bộ.',
  duration: '45.5 giờ',
  totalChapters: 4,
  totalLessons: 15,
  totalHours: 45.5,
  rating: 4.8,
  ratingCount: 1420,
  studentsCount: 12850,
  badge: 'Bestseller',
  updatedAt: '08/2026',
  language: 'Tiếng Việt & Tiếng Anh',
  instructor: {
    name: 'LingoSphere Academic Team',
    title: 'Đội ngũ chuyên gia TOEIC 990 & Thạc sĩ Ngôn ngữ ứng dụng',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=160&auto=format&fit=crop',
    rating: 4.9,
    studentsCount: 38400,
    coursesCount: 8,
    bio: 'Ban sư phạm LingoSphere quy tụ các giảng viên đạt 990 TOEIC, cựu chuyên gia khảo thí và chuyên gia AI sư phạm quốc tế.',
  },
  whatYouWillLearn: [
    'Nắm vững toàn bộ 44 âm vị IPA và quy tắc phát âm tự nhiên trong bài thi Nghe Part 1 - 4.',
    'Bóc tách cấu trúc câu Part 5 & Part 6 trong 15 giây mà không cần dịch từng từ.',
    'Xử lý phản xạ câu hỏi gián tiếp và câu bẫy trong Part 2.',
    'Kỹ thuật Skimming & Scanning định vị đáp án Part 7 đạt độ chính xác trên 85%.',
    'Tự tin đạt mốc 450 - 650+ điểm TOEIC trong lần thi đầu tiên.',
  ],
  progress: {
    courseId: 'toeic-foundation',
    startedAt: '2026-08-01',
    completedLessons: 6,
    totalLessons: 15,
    completedChapters: 1,
    totalChapters: 4,
    baselineScore: null,
    currentChapterIndex: 1,
    currentLessonId: 'l-02-03',
    currentProgress: 42,
  },
  chapters: [chapter1, chapter2, chapter3, chapter4],
  thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
  thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
  price: 0,
  qna: demoQnA,
  notes: demoNotes,
  reviews: demoReviews,
  announcements: demoAnnouncements,
  preTest: {
    status: 'completed',
    result: makeTestResult(70, 68, 72),
  },
  finalTest: {
    status: 'locked',
  },
}
