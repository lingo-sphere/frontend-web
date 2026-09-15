// Hàm tiện ích phân loại cấp độ và mô tả trình độ học viên theo điểm số TOEIC.

export interface UserScoreLevelInfo {
  name: string
  desc: string
  badgeColor: string
}

export interface UserScoreData {
  totalScore?: number
  listeningScore?: number
  readingScore?: number
  speakingScore?: number
  writingScore?: number
  targetScore?: number
  skillsType?: '2SKILLS' | '4SKILLS' | string
  isManuallyEdited?: boolean
  hasTested?: boolean
  testedAt?: string | null
  placement_test_score?: number
  placement_listening_score?: number
  placement_reading_score?: number
  placement_speaking_score?: number
  placement_writing_score?: number
  placement_skills_type?: '2SKILLS' | '4SKILLS' | string
  target_toeic_score?: number
  current_estimated_score?: number
  is_score_manually_edited?: boolean
  placement_tested_at?: string
}

export interface LeaderboardEntry {
  user_id?: string
  username?: string
  user_name?: string
  full_name?: string
  xp_total?: number
  xp?: number
  avatar_url?: string
  rank?: number
}

export function getUserScoreLevelInfo(score: number, hasTested: boolean): UserScoreLevelInfo {
  if (!hasTested || score === 0) {
    return {
      name: 'Chưa xác định cấp độ',
      desc: 'Hãy làm bài kiểm tra đầu vào hoặc tự điền điểm để nhận lộ trình phù hợp.',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    }
  }
  if (score < 450) {
    return {
      name: 'Mất Gốc / Nền Tảng (Beginner)',
      desc: 'Cần củng cố từ vựng cơ bản, phát âm và ngữ pháp thiết yếu.',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    }
  }
  if (score < 650) {
    return {
      name: 'Trung Cấp (Intermediate)',
      desc: 'Đã nắm vững cấu trúc cơ bản, cần tăng tốc độ làm bài & kỹ thuật bẫy TOEIC.',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    }
  }
  if (score < 800) {
    return {
      name: 'Nâng Cao (Upper-Intermediate)',
      desc: 'Khả năng giao tiếp và làm bài tốt, hướng tới band 800+ và kỹ năng Speaking & Writing.',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    }
  }
  return {
    name: 'Cao Cấp / Master (Advanced)',
    desc: 'Năng lực xuất sắc, làm quen với đề thi khó và bộ bẫy nâng cao 850 - 990.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  }
}
