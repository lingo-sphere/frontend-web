// Updated: 2026-08-17
// Course Detail Page - trang chi tiết khóa học:
// - Course header với progress
// - Course Curriculum (accordion)
// - Pre-test dialog
// - Lesson player integration

import { useState } from 'react'
import { Play, Trophy, ChevronDown, ChevronRight, Lock, Check, Circle, BookOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { demoCourse } from '@/data/course-data'
import type { Lesson, Chapter, Course } from '@/types/course'
import { LessonPlayer } from './LessonPlayer'
import { PreTestDialog } from './PreTestDialog'
import { TestResultDialog } from './TestResultDialog'
import type { TestResult } from '@/types/course'

interface CourseDetailPageProps {
  courseId?: string
  onBack: () => void
}

export function CourseDetailPage({ onBack }: CourseDetailPageProps) {
  const [course, setCourse] = useState<Course>(demoCourse)
  const [expandedChapter, setExpandedChapter] = useState<string>('ch-02')
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [showPreTest, setShowPreTest] = useState(false)
  const [showTestResult, setShowTestResult] = useState<TestResult | null>(null)
  const [testResultType, setTestResultType] = useState<string>('')

  // Calculate progress
  const completedLessons = course.chapters.reduce((acc, ch) =>
    acc + ch.lessons.filter(l => l.status === 'completed').length, 0)
  const totalLessons = course.totalLessons
  const progressPercent = Math.round((completedLessons / totalLessons) * 100)

  // Handle lesson click
  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === 'locked') return
    setCurrentLesson(lesson)
  }

  // Handle lesson progress update
  const handleLessonProgress = (lessonId: string, progress: number) => {
    setCourse(prev => {
      const updated = { ...prev }
      const chapter = updated.chapters.find(ch =>
        ch.lessons.some(l => l.id === lessonId)
      )
      if (!chapter) return updated

      const lesson = chapter.lessons.find(l => l.id === lessonId)
      if (!lesson) return updated

      lesson.progress = progress

      // Unlock next lesson if 80% reached
      if (progress >= 80) {
        const lessonIndex = chapter.lessons.findIndex(l => l.id === lessonId)
        if (lessonIndex < chapter.lessons.length - 1) {
          const nextLesson = chapter.lessons[lessonIndex + 1]
          if (nextLesson.status === 'locked') {
            nextLesson.status = 'available'
          }
        }

        // Mark current lesson as completed if 100%
        if (progress >= 100) {
          lesson.status = 'completed'
          // Unlock next if completed
          if (lessonIndex < chapter.lessons.length - 1) {
            chapter.lessons[lessonIndex + 1].status = 'available'
          }
        }
      }

      // Recalculate chapter progress
      const allLessonsDone = chapter.lessons.every(l => l.status === 'completed')
      if (allLessonsDone) {
        chapter.status = 'completed'
        chapter.exercise.status = 'available'
      }

      // Recalculate course progress
      const totalCompleted = updated.chapters.reduce((acc, ch) =>
        acc + ch.lessons.filter(l => l.status === 'completed').length, 0)
      updated.progress.currentProgress = Math.round((totalCompleted / updated.totalLessons) * 100)

      return updated
    })
  }

  // Handle test completion
  const handleTestComplete = (result: TestResult, type: string) => {
    setTestResultType(type)
    setShowTestResult(result)
  }

  // Get status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-success" />
      case 'available':
      case 'in-progress':
        return <Circle className="h-4 w-4 text-primary" />
      default:
        return <Lock className="h-4 w-4 text-text-tertiary" />
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 h-auto p-0 text-[13px] text-text-secondary hover:bg-transparent hover:text-primary"
        onClick={onBack}
      >
        ← Back to Courses
      </Button>

      {/* Course Header */}
      <section className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left - Course Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-primary-soft px-3 py-1 text-[12px] font-semibold text-primary">
                {course.level}
              </span>
            </div>
            <h1 className="mt-2 text-[24px] font-bold text-text-primary">{course.title}</h1>
            <p className="mt-1 text-[14px] text-text-secondary">{course.description}</p>

            {/* Course meta */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-text-secondary">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.totalChapters} Chapters
              </span>
              <span className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                {course.totalLessons} Lessons
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                {course.duration}
              </span>
            </div>
          </div>

          {/* Right - Progress & Action */}
          <div className="shrink-0 lg:w-[320px]">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-text-primary">Course Progress</span>
                <span className="text-[13px] font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-surface-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-[12px] text-text-secondary">
                {completedLessons} / {totalLessons} lessons completed
              </p>
            </div>

            {/* Action button */}
            <Button
              className="w-full bg-primary hover:bg-primary-hover"
              onClick={() => setShowPreTest(true)}
            >
              <Play className="mr-2 h-4 w-4" />
              {course.progress.baselineScore ? 'Continue Learning' : 'Learn Now'}
            </Button>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="mb-6">
        <h2 className="mb-4 text-[18px] font-bold text-text-primary">Course Curriculum</h2>

        {/* Pre-test */}
        <Card className="mb-4 dashboard-card border-primary/30 bg-primary-soft/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-text-primary">Course Pre-test</h3>
                <p className="text-[12px] text-text-secondary">
                  {course.progress.baselineScore
                    ? 'Find out your current level'
                    : 'Your baseline has not been established yet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {course.progress.baselineScore ? (
                <Button
                  variant="outline"
                  className="h-auto border-primary/30 bg-surface p-2 text-[12px] text-primary"
                  onClick={() => setShowPreTest(true)}
                >
                  View Baseline
                </Button>
              ) : (
                <Button
                  className="bg-primary hover:bg-primary-hover"
                  onClick={() => setShowPreTest(true)}
                >
                  Take Pre-test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chapters */}
        <div className="space-y-3">
          {course.chapters.map((chapter) => (
            <ChapterAccordion
              key={chapter.id}
              chapter={chapter}
              isExpanded={expandedChapter === chapter.id}
              onToggle={() => setExpandedChapter(expandedChapter === chapter.id ? '' : chapter.id)}
              onLessonClick={handleLessonClick}
            />
          ))}
        </div>

        {/* Final Test */}
        <Card className={`mt-4 dashboard-card ${course.finalTest.status === 'locked' ? 'opacity-60' : 'border-primary/30'}`}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                course.finalTest.status === 'locked'
                  ? 'bg-surface-subtle'
                  : 'bg-primary/20'
              }`}>
                <Trophy className={`h-5 w-5 ${
                  course.finalTest.status === 'locked'
                    ? 'text-text-tertiary'
                    : 'text-primary'
                }`} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-text-primary">Final Test</h3>
                <p className="text-[12px] text-text-secondary">
                  {course.finalTest.status === 'locked'
                    ? 'Complete all required chapters to unlock'
                    : '4 Skills Assessment'}
                </p>
              </div>
            </div>
            <StatusIcon status={course.finalTest.status} />
          </CardContent>
        </Card>
      </section>

      {/* Lesson Player Modal */}
      {currentLesson && (
        <LessonPlayer
          lesson={currentLesson}
          onClose={() => setCurrentLesson(null)}
          onProgress={handleLessonProgress}
        />
      )}

      {/* Pre-test Dialog */}
      <PreTestDialog
        isOpen={showPreTest}
        onClose={() => setShowPreTest(false)}
        hasBaseline={!!course.progress.baselineScore}
        baseline={course.progress.baselineScore}
        onComplete={(result) => {
          handleTestComplete(result, 'pre-test')
          setShowPreTest(false)
        }}
      />

      {/* Test Result Dialog */}
      <TestResultDialog
        isOpen={!!showTestResult}
        onClose={() => setShowTestResult(null)}
        result={showTestResult}
        testType={testResultType}
      />
    </div>
  )
}

// Chapter Accordion Component
interface ChapterAccordionProps {
  chapter: Chapter
  isExpanded: boolean
  onToggle: () => void
  onLessonClick: (lesson: Lesson) => void
}

function ChapterAccordion({ chapter, isExpanded, onToggle, onLessonClick }: ChapterAccordionProps) {
  const completedLessons = chapter.lessons.filter(l => l.status === 'completed').length
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-success" />
      case 'available':
      case 'in-progress':
        return <Circle className="h-4 w-4 text-primary" />
      default:
        return <Lock className="h-4 w-4 text-text-tertiary" />
    }
  }

  return (
    <Card className={`dashboard-card overflow-hidden ${chapter.status === 'locked' ? 'opacity-60' : ''}`}>
      {/* Chapter Header */}
      <button
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-surface-hover"
        onClick={onToggle}
        disabled={chapter.status === 'locked'}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            chapter.status === 'completed' ? 'bg-success/20' :
            chapter.status === 'in-progress' ? 'bg-primary/20' :
            'bg-surface-subtle'
          }`}>
            <span className={`text-[16px] font-bold ${
              chapter.status === 'completed' ? 'text-success' :
              chapter.status === 'in-progress' ? 'text-primary' :
              'text-text-tertiary'
            }`}>
              {chapter.order}
            </span>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">{chapter.title}</h3>
            <p className="text-[12px] text-text-secondary">
              {completedLessons}/{chapter.lessons.length} lessons
              {chapter.challengeTest.status === 'completed' && ' • Challenge passed'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusIcon status={chapter.status} />
          {isExpanded
            ? <ChevronDown className="h-5 w-5 text-text-tertiary" />
            : <ChevronRight className="h-5 w-5 text-text-tertiary" />
          }
        </div>
      </button>

      {/* Chapter Content */}
      {isExpanded && chapter.status !== 'locked' && (
        <div className="border-t border-border bg-surface-subtle/50 p-4">
          {/* Challenge Test */}
          <div className={`mb-3 flex items-center justify-between rounded-lg p-3 ${
            chapter.challengeTest.status === 'completed'
              ? 'bg-success-soft/50'
              : 'bg-surface'
          }`}>
            <div className="flex items-center gap-2">
              <StatusIcon status={chapter.challengeTest.status} />
              <span className="text-[13px] font-medium text-text-primary">{chapter.challengeTest.title}</span>
            </div>
            <span className="text-[12px] text-text-secondary">{chapter.challengeTest.questionsCount} questions</span>
          </div>

          {/* Lessons */}
          <div className="space-y-2">
            {chapter.lessons.map((lesson) => (
              <div key={lesson.id}>
                <button
                  className={`flex w-full items-center justify-between rounded-lg p-3 transition-colors ${
                    lesson.status === 'locked'
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:bg-surface cursor-pointer'
                  } ${lesson.status === 'in-progress' || lesson.progress > 0 ? 'bg-primary-soft/30' : 'bg-surface'}`}
                  onClick={() => onLessonClick(lesson)}
                  disabled={lesson.status === 'locked'}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={lesson.status} />
                    <div className="text-left">
                      <span className="text-[13px] font-medium text-text-primary">
                        Lesson {lesson.order}: {lesson.title}
                      </span>
                      {lesson.status === 'locked' && (
                        <p className="text-[11px] text-text-tertiary">
                          Complete at least 80% of the previous lesson to unlock
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.progress > 0 && lesson.progress < 100 && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${lesson.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-text-secondary">{lesson.progress}%</span>
                      </div>
                    )}
                    {lesson.status === 'completed' && (
                      <span className="text-[11px] text-success">✓</span>
                    )}
                  </div>
                </button>

                {/* Unlock message when previous lesson at 80% */}
                {lesson.status === 'available' && lesson.progress === 0 && (
                  <div className="ml-10 mb-2 text-[11px] text-primary">
                    ← Available now! Click to start.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chapter Exercise */}
          <div className={`mt-4 flex items-center justify-between rounded-lg p-3 ${
            chapter.exercise.status === 'locked' ? 'bg-surface opacity-60' :
            chapter.exercise.status === 'completed' ? 'bg-success-soft/50' :
            'bg-surface'
          }`}>
            <div className="flex items-center gap-2">
              <StatusIcon status={chapter.exercise.status} />
              <span className="text-[13px] font-medium text-text-primary">{chapter.exercise.title}</span>
            </div>
            <span className="text-[12px] text-text-secondary">{chapter.exercise.questionsCount} questions</span>
          </div>

          {/* Post-mini Test */}
          <div className={`mt-2 flex items-center justify-between rounded-lg p-3 ${
            chapter.postMiniTest.status === 'locked' ? 'bg-surface opacity-60' :
            chapter.postMiniTest.status === 'completed' ? 'bg-success-soft/50' :
            'bg-surface'
          }`}>
            <div className="flex items-center gap-2">
              <StatusIcon status={chapter.postMiniTest.status} />
              <span className="text-[13px] font-medium text-text-primary">{chapter.postMiniTest.title}</span>
            </div>
            <span className="text-[12px] text-text-secondary">{chapter.postMiniTest.questionsCount} questions</span>
          </div>
        </div>
      )}
    </Card>
  )
}
