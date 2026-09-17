// Chuyển đổi dữ liệu thô từ backend thành cấu trúc dữ liệu không gian học tập chuẩn xác.

import type {
  Course,
  Chapter,
  Lesson,
  NoteItem,
  QnAItem,
  CourseReviewItem,
  CourseProgressDetailInfo,
  LessonResource,
  LessonContent,
} from '@/features/courses/types/course'

interface RawOptionInput {
  text?: string
  key?: string
}

interface RawQuestionInput {
  _id?: string
  id?: string
  question_text?: string
  prompt?: string
  options?: Array<string | RawOptionInput>
  correct_answer?: string
  correct_option?: string
  explanation?: string | null
  media_url?: string | null
  audio_url?: string | null
  image_url?: string | null
}

interface RawLessonInput {
  _id?: string
  id?: string
  order_index?: number
  title?: string
  duration_seconds?: number
  lesson_type?: string
  status?: string
  progress?: number
  video_url?: string
  is_free_preview?: boolean
  resources?: LessonResource[]
  content?: LessonContent
  theory_file_url?: string
  theory_file_name?: string
  questions?: RawQuestionInput[]
  practice_questions?: RawQuestionInput[]
}

interface RawModuleInput {
  _id?: string
  id?: string
  title?: string
  order_index?: number
  description?: string
  lessons?: RawLessonInput[]
  theory_file_url?: string
  theory_file_name?: string
  challenge_questions?: Array<Record<string, unknown>>
  challenge_duration_minutes?: number
  challenge_passing_score?: number
  speaking_prompt?: string
  speaking_file_url?: string
  writing_prompt?: string
  writing_file_url?: string
}

export interface RawCourseInput {
  _id?: string
  id?: string
  title?: string
  level?: string
  description?: string
  modules?: RawModuleInput[]
  curriculum?: RawModuleInput[]
  chapters?: RawModuleInput[]
  document_url?: string
  document_name?: string
  rating?: number
  rating_count?: number
  students_count?: number
  what_you_will_learn?: string[]
  author_name?: string
  author_avatar?: string
  author_bio?: string
  final_test_questions?: Array<Record<string, unknown>>
  final_test_duration_minutes?: number
  final_test_audio_url?: string
  final_test_speaking_prompt?: string
  final_test_speaking_file_url?: string
  final_test_writing_prompt?: string
  final_test_writing_file_url?: string
  category?: string
  skills?: string[]
  target_score?: number
  price?: number
  discount_price?: number
  thumbnail_url?: string
  thumbnail?: string
}

export interface RawReviewInput {
  _id?: string
  id?: string
  author_name?: string
  author?: string
  author_avatar?: string
  rating?: number
  created_at?: string
  content?: string
}

export interface RawReviewsResponse {
  rating?: number
  rating_count?: number
  reviews?: RawReviewInput[]
}

export interface RawNoteInput {
  _id?: string
  id?: string
  lesson_id?: string
  lesson_title?: string
  timestamp?: number
  formatted_time?: string
  content?: string
  created_at?: string
}

export interface RawQnAAnswerInput {
  _id?: string
  id?: string
  author_name?: string
  author_role?: string
  is_tutor?: boolean
  author_avatar?: string
  body?: string
  created_at?: string
  upvotes?: number
}

export interface RawQnAInput {
  _id?: string
  id?: string
  lesson_title?: string
  user_id?: string
  is_anonymous?: boolean
  author_name?: string
  author_avatar?: string
  title?: string
  body?: string
  created_at?: string
  upvotes?: number
  answers?: RawQnAAnswerInput[]
}

export function formatExactDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 phút'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} giờ ${m > 0 ? `${m} phút` : ''}`.trim()
  return `${m} phút`
}

export function mapCourseDataToWorkspace(
  courseId: string,
  courseObj: RawCourseInput,
  userIsEnrolled: boolean,
  progressDetail: CourseProgressDetailInfo | null,
  reviewsRes: RawReviewsResponse | null,
  notesRes: RawNoteInput[] | null,
  qnaRes: RawQnAInput[] | null
): Course {
  const rawModules = courseObj.modules || courseObj.curriculum || courseObj.chapters || []
  const modulesArr = Array.isArray(rawModules) ? rawModules : []

  const completedLessonIdSet = new Set<string>()
  const compLessonIds = progressDetail?.completed_lesson_ids
  if (userIsEnrolled && Array.isArray(compLessonIds)) {
    compLessonIds.forEach((id: string) => completedLessonIdSet.add(id))
  }

  const mappedChapters: Chapter[] = modulesArr.map((mod: RawModuleInput, cIdx: number) => {
    const rawLessons = mod.lessons || []
    const lessonsArr = Array.isArray(rawLessons) ? rawLessons : []
    const modId = String(mod._id || mod.id)

    const modProgress = progressDetail?.modules_progress?.find(
      (m) => m.module_id === modId
    )

    let chapterStatus: Chapter['status'] = 'in-progress'
    if (modProgress) {
      if (modProgress.status === 'COMPLETED' || modProgress.status === 'SKIPPED_BY_CHALLENGE') {
        chapterStatus = 'completed'
      } else if (modProgress.status === 'LOCKED') {
        chapterStatus = 'locked'
      }
    }

    const mappedLessons: Lesson[] = lessonsArr.map((l: RawLessonInput, lIdx: number) => {
      const lesId = String(l._id || l.id)
      const isCompleted = l.status === 'completed' || completedLessonIdSet.has(lesId)
      return {
        id: lesId,
        chapterId: modId,
        order: l.order_index ?? (lIdx + 1),
        title: String(l.title || `Bài ${lIdx + 1}`),
        duration: typeof l.duration_seconds === 'number' ? l.duration_seconds : 600,
        type: (l.lesson_type === 'audio' || l.lesson_type === 'reading' || l.lesson_type === 'mixed' ? l.lesson_type : 'video') as Lesson['type'],
        status: isCompleted ? 'completed' : (l.status as Lesson['status']) || 'available',
        progress: isCompleted ? 100 : l.progress || 0,
        videoUrl: l.video_url || '',
        is_free_preview: Boolean(l.is_free_preview),
        is_preview: Boolean(l.is_free_preview),
        resources: Array.isArray(l.resources) ? l.resources : [],
        content: typeof l.content === 'object' && l.content !== null ? l.content : { sections: [] },
        theory_file_url: l.theory_file_url || '',
        theory_file_name: l.theory_file_name || '',
        questions: (Array.isArray(l.questions) ? l.questions : Array.isArray(l.practice_questions) ? l.practice_questions : []).map((q: RawQuestionInput, qIdx: number) => {
          let opts: string[] = []
          if (Array.isArray(q.options)) {
            opts = q.options.map((o: string | RawOptionInput) => (typeof o === 'string' ? o : String(o?.text || o?.key || '')))
          }
          return {
            _id: String(q._id || q.id || `lq_${lesId}_${qIdx}`),
            id: String(q._id || q.id || `lq_${lesId}_${qIdx}`),
            question_text: String(q.question_text || q.prompt || `Câu hỏi ${qIdx + 1}`),
            options: opts,
            correct_answer: String(q.correct_answer || q.correct_option || 'A'),
            explanation: q.explanation || '',
            media_url: q.audio_url || q.media_url || '',
            audio_url: q.audio_url || q.media_url || '',
            image_url: q.image_url || '',
          }
        }),
      }
    })

    return {
      id: modId,
      courseId: String(courseId),
      title: String(mod.title || `Chương ${cIdx + 1}`),
      order: mod.order_index ?? (cIdx + 1),
      description: mod.description || '',
      status: chapterStatus,
      lessons: mappedLessons,
      theory_file_url: mod.theory_file_url || '',
      theory_file_name: mod.theory_file_name || '',
      challenge_questions: mod.challenge_questions || [],
      challenge_duration_minutes: mod.challenge_duration_minutes || 15,
      challenge_passing_score: mod.challenge_passing_score || 80,
      speaking_prompt: mod.speaking_prompt,
      speaking_file_url: mod.speaking_file_url,
      writing_prompt: mod.writing_prompt,
      writing_file_url: mod.writing_file_url,
    }
  })

  const totalLes = mappedChapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const totalDurationSec = mappedChapters.reduce(
    (acc, ch) => acc + ch.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0),
    0
  )

  const mappedReviews: CourseReviewItem[] = (reviewsRes?.reviews || []).map((r: RawReviewInput) => ({
    id: String(r._id || r.id),
    author: String(r.author_name || r.author || 'Học viên'),
    avatar: r.author_avatar || '',
    rating: Number(r.rating) || 5,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
    content: String(r.content || ''),
  }))

  const mappedNotes: NoteItem[] = (Array.isArray(notesRes) ? notesRes : []).map((n: RawNoteInput) => ({
    id: String(n._id || n.id),
    lessonId: String(n.lesson_id),
    lessonTitle: String(n.lesson_title || 'Bài học'),
    timestamp: Number(n.timestamp) || 0,
    formattedTime: String(n.formatted_time || '0:00'),
    content: String(n.content || ''),
    createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
  }))

  const mappedQnA: QnAItem[] = (Array.isArray(qnaRes) ? qnaRes : []).map((q: RawQnAInput) => ({
    id: String(q._id || q.id),
    lessonTitle: String(q.lesson_title || 'Bài học'),
    userId: q.user_id ? String(q.user_id) : undefined,
    isAnonymous: Boolean(q.is_anonymous),
    author: String(q.author_name || (q.is_anonymous ? 'Học viên ẩn danh' : 'Học viên')),
    authorAvatar: q.author_avatar || undefined,
    title: String(q.title || ''),
    body: String(q.body || ''),
    createdAt: q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
    upvotes: Number(q.upvotes) || 0,
    answersCount: Array.isArray(q.answers) ? q.answers.length : 0,
    isAnswered: Array.isArray(q.answers) && q.answers.length > 0,
    answers: (q.answers || []).map((a: RawQnAAnswerInput) => ({
      id: String(a._id || a.id),
      author: String(a.author_name || 'Học viên'),
      authorRole: a.author_role || (a.is_tutor ? 'Gia sư AI' : 'Học viên'),
      authorAvatar: a.author_avatar || undefined,
      body: String(a.body || ''),
      createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
      upvotes: Number(a.upvotes) || 0,
    })),
  }))

  return {
    id: String(courseObj._id || courseObj.id || courseId),
    title: String(courseObj.title || 'Khóa học LingoSphere'),
    description: String(courseObj.description || ''),
    duration: formatExactDuration(totalDurationSec),
    totalChapters: mappedChapters.length,
    totalLessons: totalLes,
    document_url: courseObj.document_url || '',
    document_name: courseObj.document_name || '',
    rating: typeof reviewsRes?.rating === 'number' && typeof reviewsRes.rating_count === 'number' && reviewsRes.rating_count > 0
      ? reviewsRes.rating
      : (typeof courseObj.rating === 'number' ? courseObj.rating : 5.0),
    ratingCount: typeof reviewsRes?.rating_count === 'number'
      ? reviewsRes.rating_count
      : Number(courseObj.rating_count || 0),
    studentsCount: Number(courseObj.students_count || 0),
    whatYouWillLearn: Array.isArray(courseObj.what_you_will_learn)
      ? (courseObj.what_you_will_learn as string[])
      : [],
    chapters: mappedChapters,
    instructor: {
      name: String(courseObj.author_name || 'Đội ngũ Giảng viên LingoSphere'),
      title: 'Giảng viên chuyên môn',
      avatar: String(courseObj.author_avatar || ''),
      rating: typeof courseObj.rating === 'number' ? courseObj.rating : 5.0,
      studentsCount: Number(courseObj.students_count || 0),
      coursesCount: 1,
      bio: String(courseObj.author_bio || 'Chuyên gia giảng dạy ngôn ngữ giàu kinh nghiệm thực chiến.'),
    },
    overview: {
      whatYouWillLearn: Array.isArray(courseObj.what_you_will_learn)
        ? (courseObj.what_you_will_learn as string[])
        : [],
      requirements: ['Có máy tính hoặc điện thoại kết nối internet.'],
      targetAudience: ['Học viên muốn nâng cao trình độ nhanh chóng và bài bản.'],
    },
    reviews: mappedReviews,
    qna: mappedQnA,
    notes: mappedNotes,
    final_test_questions: Array.isArray(courseObj.final_test_questions)
      ? (courseObj.final_test_questions as Array<RawQuestionInput>).map((q, qIdx) => {
          let opts: string[] = []
          if (Array.isArray(q.options)) {
            opts = q.options.map((o) => (typeof o === 'string' ? o : String(o?.text || o?.key || '')))
          }
          return {
            id: String(q._id || q.id || `fq_${qIdx}`),
            question_text: String(q.question_text || q.prompt || `Câu hỏi ${qIdx + 1}`),
            options: opts,
            correct_answer: String(q.correct_answer || q.correct_option || 'A'),
            explanation: q.explanation || '',
            media_url: q.audio_url || q.media_url || '',
            audio_url: q.audio_url || q.media_url || '',
            image_url: q.image_url || '',
          }
        })
      : [],
    final_test_duration_minutes: Number(courseObj.final_test_duration_minutes || 60),
    final_test_audio_url: String(courseObj.final_test_audio_url || ''),
    final_test_speaking_prompt: String(courseObj.final_test_speaking_prompt || ''),
    final_test_speaking_file_url: String(courseObj.final_test_speaking_file_url || ''),
    final_test_writing_prompt: String(courseObj.final_test_writing_prompt || ''),
    final_test_writing_file_url: String(courseObj.final_test_writing_file_url || ''),
    category: String(courseObj.category || ''),
    skills: Array.isArray(courseObj.skills) ? (courseObj.skills as string[]) : [],
    target_score: typeof courseObj.target_score === 'number' ? courseObj.target_score : undefined,
    price: Number(courseObj.price || 0),
    discount_price: typeof courseObj.discount_price === 'number' ? courseObj.discount_price : undefined,
    thumbnail: courseObj.thumbnail_url || courseObj.thumbnail || '',
    finalTest: { status: userIsEnrolled ? 'available' : 'locked' },
  }
}

export function getCourseEffectivePrice(course: { price?: number; discount_price?: number }): number {
  const rawPrice = typeof course.price === 'number' ? course.price : 0
  const rawDiscount = typeof course.discount_price === 'number' ? course.discount_price : 0
  return rawDiscount > 0 && rawDiscount < rawPrice ? rawDiscount : rawPrice
}
