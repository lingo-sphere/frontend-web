
export interface ToeicPart {
  id: string
  partNumber: number
  section: 'LISTENING' | 'READING'
  skillType: 'LISTENING' | 'READING'
  name: string
  nameVi: string
  description: string
  descriptionVi: string
  questionType: string
  standardQuestionCount: number
  hasAudio: boolean
  hasImage: boolean
  hasPassage: boolean
  hasRecording?: boolean
  hasWriting?: boolean
  passageType?: 'CONVERSATION' | 'TALK' | 'SINGLE_PASSAGE' | 'DOUBLE_PASSAGE' | 'TRIPLE_PASSAGE'
  listeningDurationSeconds?: number
  speakingDurationSeconds?: number
  writingDurationSeconds?: number
  displayOrder: number
  isActive?: boolean
}

export interface ToeicExam {
  id: string
  title: string
  code: string
  description?: string
  examType: 'FULL_TEST' | 'PRACTICE_TEST' | 'MOCK_TEST' | 'DIAGNOSTIC_TEST'
  skillsEnabled: 'LR' | 'LRSW'

  releaseYear?: number
  examSeries?: string
  examVariant?: string
  isOfficial?: boolean
  officialCode?: string

  listeningQuestionCount?: number
  readingQuestionCount?: number
  speakingQuestionCount?: number
  writingQuestionCount?: number
  totalQuestions?: number

  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD'
  targetScore?: number
  scoringVersion?: string
  passingScore?: number
  speakingPassingScore?: number
  writingPassingScore?: number

  sourceInfo?: string
  sourceUrl?: string
  thumbnailUrl?: string
  copyrightNote?: string

  totalAttempts?: number
  avgScore?: number
  avgTimeMinutes?: number

  status?: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface ToeicOption {
  key: string
  textEn: string
  textVi?: string
}

export interface ToeicQuestion {
  id: string
  examId?: string
  partId?: string
  partNumber: number
  questionNumber: number
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK'
  questionTextEn?: string
  questionTextVi?: string
  instructionEn?: string
  instructionVi?: string
  options?: ToeicOption[]
  correctOption: string
  explanationEn?: string
  explanationVi?: string
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD'
  skillType?: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'
  topicId?: string
  subtopic?: string
  grammarPointId?: string
  lexicalItemIds?: string[]
  audioMediaId?: string
  imageMediaId?: string
  passageId?: string
  passageTitle?: string
  passageContent?: string
  sourceInfo?: string
  status?: 'DRAFT' | 'PUBLISHED'
  hasAudio?: boolean
  hasImage?: boolean
  hasPassage?: boolean
  createdAt?: string
}

export interface ToeicPassage {
  id: string
  examId?: string
  partId?: string
  partNumber?: number
  passageType: 'CONVERSATION' | 'TALK' | 'SINGLE_PASSAGE' | 'DOUBLE_PASSAGE' | 'TRIPLE_PASSAGE'
  title?: string
  titleVi?: string
  contentEn?: string
  contentVi?: string
  transcriptEn?: string
  transcriptVi?: string
  audioMediaId?: string
  imageMediaId?: string
  questionCount?: number
  difficultyLevel?: string
  metadata?: Record<string, unknown>
  status?: string
}

export interface ToeicAttempt {
  id: string
  userId: string
  examId: string
  exam?: ToeicExam
  attemptType: 'FULL_TEST' | 'PART_PRACTICE' | 'SECTION_PRACTICE'
  targetPart?: number
  targetParts?: number[]

  startedAt: string
  submittedAt?: string
  expiredAt?: string
  totalTimeSeconds?: number

  totalQuestions?: number
  answeredQuestions?: number
  skippedQuestions?: number

  correctQuestions?: number
  incorrectQuestions?: number
  listeningRawScore?: number
  readingRawScore?: number
  listeningScaledScore?: number
  readingScaledScore?: number
  totalScaledScore?: number

  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'CANCELLED'
  isBestAttempt?: boolean
  improvementVsPrevious?: number
  previousAttemptId?: string
}

export interface ToeicAnswer {
  id: string
  attemptId: string
  questionId: string
  question?: ToeicQuestion
  partNumber: number
  questionNumber: number
  groupIndex?: number
  selectedOption?: string
  correctOption: string
  isCorrect: boolean
  isSkipped?: boolean
  confidenceLevel?: 1 | 2 | 3 | 4 | 5
  answerTimeSeconds?: number
  flaggedForReview?: boolean
  createdAt?: string
}

export interface ToeicPartAnalysis {
  id?: string
  attemptId?: string
  userId?: string
  partId?: string
  partNumber: number
  partName?: string
  section: 'LISTENING' | 'READING'
  totalQuestions: number
  correctCount: number
  incorrectCount?: number
  skippedCount?: number
  rawScore?: number
  scaledScore?: number
  accuracyPercent: number
  avgAnswerTimeSeconds?: number
  weakTopics?: string[]
  weakGrammar?: string[]
  weakVocabulary?: string[]
}

export interface ToeicExamResult {
  attempt: ToeicAttempt
  answers: ToeicAnswer[]
  partAnalyses: ToeicPartAnalysis[]
  passingStatus: 'PASS' | 'FAIL'
  scoreLevel: string
  improvement?: number
}

export interface ToeicExamFilters {
  year?: string
  series?: string
  difficulty?: string
  examType?: string
  isOfficial?: boolean
  search?: string
}

export interface ToeicPartPractice {
  partNumber: number
  section: 'LISTENING' | 'READING'
  questions: ToeicQuestion[]
  passage?: ToeicPassage
  timeLimit?: number
}
