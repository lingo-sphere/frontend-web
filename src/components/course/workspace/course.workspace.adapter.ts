// Handles course workspace data transformation.

import type { Course, Chapter, Lesson, NoteItem, QnAItem, CourseReviewItem } from '@/types/course'

export function formatExactDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 phút'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} giờ ${m > 0 ? `${m} phút` : ''}`.trim()
  return `${m} phút`
}

export function mapCourseDataToWorkspace(
  courseId: string,
  courseObj: any,
  userIsEnrolled: boolean,
  progressDetail: any,
  reviewsRes: any,
  notesRes: any,
  qnaRes: any
): Course {
  const rawModules = courseObj.modules || courseObj.curriculum || courseObj.chapters || []
  const modulesArr = Array.isArray(rawModules) ? rawModules : []

  const completedLessonIdSet = new Set<string>()
  const compLessonIds = progressDetail?.completed_lesson_ids || progressDetail?.completed_lessons
  if (userIsEnrolled && Array.isArray(compLessonIds)) {
    compLessonIds.forEach((id: string) => completedLessonIdSet.add(id))
  }

  const mappedChapters: Chapter[] = modulesArr.map((mod: any, cIdx: number) => {
    const rawLessons = mod.lessons || []
    const lessonsArr = Array.isArray(rawLessons) ? rawLessons : []
    const modId = String(mod._id || mod.id)

    const modProgress = progressDetail?.modules_progress?.find(
      (m: any) => m.module_id === modId
    )

    let chapterStatus: Chapter['status'] = 'in-progress'
    if (modProgress) {
      if (modProgress.status === 'COMPLETED' || modProgress.status === 'SKIPPED_BY_CHALLENGE') {
        chapterStatus = 'completed'
      } else if (modProgress.status === 'LOCKED') {
        chapterStatus = 'locked'
      }
    }

    const mappedLessons: Lesson[] = lessonsArr.map((l: any, lIdx: number) => {
      const lesId = String(l._id || l.id)
      const isCompleted = l.status === 'completed' || completedLessonIdSet.has(lesId)
      return {
        id: lesId,
        chapterId: modId,
        order: l.order_index ?? (lIdx + 1),
        title: String(l.title || `Bài ${lIdx + 1}`),
        duration: typeof l.duration_seconds === 'number' ? l.duration_seconds : 600,
        type: l.lesson_type || l.type || 'video',
        status: isCompleted ? 'completed' : l.status || 'available',
        progress: isCompleted ? 100 : l.progress || 0,
        videoUrl: l.video_url || l.videoUrl || l.content?.videoUrl,
        is_free_preview: Boolean(l.is_free_preview),
        is_preview: Boolean(l.is_free_preview),
        resources: Array.isArray(l.resources) ? l.resources : [],
        content: typeof l.content === 'object' && l.content !== null ? l.content : { sections: [] },
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

  const mappedReviews: CourseReviewItem[] = (reviewsRes?.reviews || []).map((r: any) => ({
    id: String(r._id || r.id),
    author: String(r.author_name || r.author || 'Học viên'),
    avatar: r.author_avatar || '',
    rating: Number(r.rating) || 5,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
    content: String(r.content || ''),
  }))

  const mappedNotes: NoteItem[] = (Array.isArray(notesRes) ? notesRes : []).map((n: any) => ({
    id: String(n._id || n.id),
    lessonId: String(n.lesson_id),
    lessonTitle: String(n.lesson_title || 'Bài học'),
    timestamp: Number(n.timestamp) || 0,
    formattedTime: String(n.formatted_time || '0:00'),
    content: String(n.content || ''),
    createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
  }))

  const mappedQnA: QnAItem[] = (Array.isArray(qnaRes) ? qnaRes : []).map((q: any) => ({
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
    answers: (q.answers || []).map((a: any) => ({
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
    level: String(courseObj.level || 'Intermediate'),
    description: String(courseObj.description || ''),
    duration: formatExactDuration(totalDurationSec),
    totalChapters: mappedChapters.length,
    totalLessons: totalLes,
    rating: typeof reviewsRes?.rating === 'number' ? reviewsRes.rating : 5.0,
    ratingCount: typeof reviewsRes?.rating_count === 'number' ? reviewsRes.rating_count : 0,
    studentsCount: Number(courseObj.students_count || courseObj.studentsCount || 0),
    whatYouWillLearn: Array.isArray(courseObj.what_you_will_learn)
      ? (courseObj.what_you_will_learn as string[])
      : [],
    chapters: mappedChapters,
    instructor: {
      name: String(courseObj.author_name || 'Đội ngũ Giảng viên LingoSphere'),
      title: 'Giảng viên chuyên môn',
      avatar: String(courseObj.author_avatar || ''),
      rating: 5.0,
      studentsCount: 100,
      coursesCount: 1,
      bio: 'Chuyên gia giảng dạy ngôn ngữ giàu kinh nghiệm thực chiến.',
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
    final_test_questions: (courseObj.final_test_questions as any) || [],
    final_test_duration_minutes: Number((courseObj as any).final_test_duration_minutes || 60),
    final_test_audio_url: String(courseObj.final_test_audio_url || ''),
    final_test_speaking_prompt: String((courseObj as any).final_test_speaking_prompt || ''),
    final_test_speaking_file_url: String((courseObj as any).final_test_speaking_file_url || ''),
    final_test_writing_prompt: String((courseObj as any).final_test_writing_prompt || ''),
    final_test_writing_file_url: String((courseObj as any).final_test_writing_file_url || ''),
    category: String(courseObj.category || ''),
    skills: Array.isArray(courseObj.skills) ? (courseObj.skills as string[]) : [],
    finalTest: { status: userIsEnrolled ? 'available' : 'locked' },
  }
}
