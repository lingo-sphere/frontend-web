
import { createBrowserRouter } from 'react-router-dom'
import { App } from '@/App'
import { DashboardRoute } from '@/routes/dashboard-route'
import { CoursesRoute } from '@/routes/courses-route'
import { CourseRoute } from '@/routes/course-route'
import { RoadmapRoute } from '@/routes/roadmap-route'
import { PracticeRoute } from '@/routes/practice-route'
import { ListeningRoute } from '@/routes/listening-route'
import { GrammarRoute } from '@/routes/grammar-route'
import { NotesRoute } from '@/routes/notes-route'
import { AiLearningRoute } from '@/routes/ai-learning-route'
import { CommunityRoute } from '@/routes/community-route'
import { SidebarLeaderboardRoute } from '@/routes/sidebar-leaderboard-route'
import { ProgressRoute } from '@/routes/progress-route'
import { SettingsRoute } from '@/routes/settings-route'
import { NotificationsRoute } from '@/routes/notifications-route'
import { PublicDecksRoute } from '@/routes/public-decks-route'
import { IpaRoute } from '@/routes/ipa-route'
import { TopicsRoute } from '@/routes/topics-route'
import { VocabularyRoute } from '@/routes/vocabulary-route'
import { VocabularyNotebookRoute } from '@/routes/vocabulary-notebook-route'
import { VocabularyLearnRoute } from '@/routes/vocabulary-learn-route'
import { ProfileRoute } from '@/routes/profile-route'
import { WritingRoute } from '@/routes/writing-route'
import { SpeakingRoute } from '@/routes/speaking-route'
import { ToeicRoute } from '@/routes/toeic-route'
import { ToeicExamRoute } from '@/routes/toeic-exam-route'
import { DailyJournalRoute } from '@/routes/daily-journal-route'
import { AiTranslationRoute } from '@/routes/ai-translation-route'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardRoute /> },
      { path: 'courses', element: <CoursesRoute /> },
      { path: 'course/:courseId', element: <CourseRoute /> },
      { path: 'roadmap', element: <RoadmapRoute /> },
      { path: 'practice', element: <PracticeRoute /> },
      { path: 'toeic', element: <ToeicRoute /> },
      { path: 'toeic/exam/:examId', element: <ToeicExamRoute /> },
      { path: 'listening', element: <ListeningRoute /> },
      { path: 'grammar', element: <GrammarRoute /> },
      { path: 'ipa', element: <IpaRoute /> },
      { path: 'journal', element: <DailyJournalRoute /> },
      { path: 'translate', element: <AiTranslationRoute /> },
      { path: 'notes', element: <NotesRoute /> },
      { path: 'ai-learning', element: <AiLearningRoute /> },
      { path: 'community', element: <CommunityRoute /> },
      { path: 'public-decks', element: <PublicDecksRoute /> },
      { path: 'topics', element: <TopicsRoute /> },
      { path: 'vocabulary', element: <VocabularyRoute /> },
      { path: 'vocabulary/notebook', element: <VocabularyNotebookRoute /> },
      { path: 'vocabulary/learn', element: <VocabularyLearnRoute /> },
      { path: 'vocabulary/learn/:deckId', element: <VocabularyLearnRoute /> },
      { path: 'writing', element: <WritingRoute /> },
      { path: 'writing/*', element: <WritingRoute /> },
      { path: 'speaking', element: <SpeakingRoute /> },
      { path: 'speaking/*', element: <SpeakingRoute /> },
      { path: 'leaderboard', element: <SidebarLeaderboardRoute /> },
      { path: 'progress', element: <ProgressRoute /> },
      { path: 'settings', element: <SettingsRoute /> },
      { path: 'notifications', element: <NotificationsRoute /> },
      { path: 'profile', element: <ProfileRoute /> },
    ],
  },
])
