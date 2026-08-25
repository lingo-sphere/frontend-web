// ============================================================
// TOEIC Test 1 - Complete Mock Data
// Source: BỘ ĐỀ THI 2019 / TEST 1
// LingoSphere - English Learning Platform
// ============================================================

import type { ToeicExam, ToeicQuestion, ToeicPart, ToeicPassage, ToeicAnswer } from '@/types/toeic'

// ============================================================
// EXAM INFO
// ============================================================

export const toeicTest1: ToeicExam = {
  id: 'toeic_2019_test1',
  title: 'Đề thi TOEIC 2019 - Test 1',
  code: 'HACKER_2019_TEST1',
  description: 'Bộ đề luyện thi TOEIC năm 2019 - Đề số 1. Phù hợp cho người ôn tập TOEIC.',
  examType: 'PRACTICE_TEST',
  skillsEnabled: 'LR',
  releaseYear: 2019,
  examSeries: 'HACKER',
  examVariant: 'HACKER_2019',
  isOfficial: false,
  listeningQuestionCount: 100,
  readingQuestionCount: 100,
  totalQuestions: 200,
  difficultyLevel: 'MEDIUM',
  targetScore: 990,
  passingScore: 600,
  scoringVersion: 'ETS_2018',
  status: 'PUBLISHED',
  sourceInfo: 'Bộ đề thi 2019 - TEST 1',
  thumbnailUrl: '/assets/toeic/test1-thumb.png',
  totalAttempts: 15420,
  avgScore: 685,
  avgTimeMinutes: 125,
}

// ============================================================
// PARTS
// ============================================================

export const toeicTest1Parts: ToeicPart[] = [
  {
    id: 'p1-t1',
    partNumber: 1,
    section: 'LISTENING',
    skillType: 'LISTENING',
    name: 'Photographs',
    nameVi: 'Mô tả hình ảnh',
    description: 'Look at the photograph and choose the best response.',
    descriptionVi: 'Nhìn hình ảnh và chọn câu mô tả đúng nhất.',
    questionType: 'PHOTOGRAPHS',
    standardQuestionCount: 6,
    hasAudio: true,
    hasImage: true,
    hasPassage: false,
    displayOrder: 1,
  },
  {
    id: 'p2-t1',
    partNumber: 2,
    section: 'LISTENING',
    skillType: 'LISTENING',
    name: 'Question-Response',
    nameVi: 'Hỏi - Đáp',
    description: 'Listen to the question and three responses, then choose the best answer.',
    descriptionVi: 'Nghe câu hỏi và ba câu trả lời, chọn câu trả lời đúng nhất.',
    questionType: 'QUESTION_RESPONSE',
    standardQuestionCount: 25,
    hasAudio: true,
    hasImage: false,
    hasPassage: false,
    displayOrder: 2,
  },
  {
    id: 'p3-t1',
    partNumber: 3,
    section: 'LISTENING',
    skillType: 'LISTENING',
    name: 'Conversations',
    nameVi: 'Đoạn hội thoại',
    description: 'Listen to conversations and answer the questions.',
    descriptionVi: 'Nghe các đoạn hội thoại và trả lời câu hỏi.',
    questionType: 'CONVERSATIONS',
    standardQuestionCount: 39,
    hasAudio: true,
    hasImage: false,
    hasPassage: true,
    passageType: 'CONVERSATION',
    displayOrder: 3,
  },
  {
    id: 'p4-t1',
    partNumber: 4,
    section: 'LISTENING',
    skillType: 'LISTENING',
    name: 'Short Talks',
    nameVi: 'Bài nói ngắn',
    description: 'Listen to short talks and answer the questions.',
    descriptionVi: 'Nghe các bài nói ngắn và trả lời câu hỏi.',
    questionType: 'TALKS',
    standardQuestionCount: 30,
    hasAudio: true,
    hasImage: false,
    hasPassage: true,
    passageType: 'TALK',
    displayOrder: 4,
  },
  {
    id: 'p5-t1',
    partNumber: 5,
    section: 'READING',
    skillType: 'READING',
    name: 'Incomplete Sentences',
    nameVi: 'Hoàn thành câu',
    description: 'Complete the sentence by choosing the best word.',
    descriptionVi: 'Hoàn thành câu bằng cách chọn từ đúng nhất.',
    questionType: 'INCOMPLETE_SENTENCES',
    standardQuestionCount: 30,
    hasAudio: false,
    hasImage: false,
    hasPassage: false,
    displayOrder: 5,
  },
  {
    id: 'p6-t1',
    partNumber: 6,
    section: 'READING',
    skillType: 'READING',
    name: 'Text Completion',
    nameVi: 'Hoàn thành đoạn văn',
    description: 'Complete the passage by choosing the best answer.',
    descriptionVi: 'Hoàn thành đoạn văn bằng cách chọn đáp án đúng.',
    questionType: 'TEXT_COMPLETION',
    standardQuestionCount: 16,
    hasAudio: false,
    hasImage: false,
    hasPassage: true,
    passageType: 'TRIPLE_PASSAGE',
    displayOrder: 6,
  },
  {
    id: 'p7-t1',
    partNumber: 7,
    section: 'READING',
    skillType: 'READING',
    name: 'Reading Comprehension',
    nameVi: 'Đọc hiểu',
    description: 'Read the passages and answer the questions.',
    descriptionVi: 'Đọc các đoạn văn và trả lời câu hỏi.',
    questionType: 'READING_COMPREHENSION',
    standardQuestionCount: 54,
    hasAudio: false,
    hasImage: false,
    hasPassage: true,
    passageType: 'DOUBLE_PASSAGE',
    displayOrder: 7,
  },
]

// ============================================================
// SAMPLE QUESTIONS - Part 5 (Vocabulary & Grammar)
// ============================================================

export const toeicTest1Part5Questions: ToeicQuestion[] = [
  {
    id: 'q-p5-t1-151',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 151,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'The company announced a new policy regarding employee _____.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'vacation' },
      { key: 'B', textEn: 'vacationing' },
      { key: 'C', textEn: 'vacationer' },
      { key: 'D', textEn: 'vacationed' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    topicId: 'topic-business',
    grammarPointId: 'noun-derivation',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-152',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 152,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'Please submit your report by Friday if _____.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'possible' },
      { key: 'B', textEn: 'you possible' },
      { key: 'C', textEn: 'it possible' },
      { key: 'D', textEn: 'possible to' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    grammarPointId: 'if-clause',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-153',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 153,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'The manager was satisfied _____ the team\'s performance.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'with' },
      { key: 'B', textEn: 'to' },
      { key: 'C', textEn: 'about' },
      { key: 'D', textEn: 'for' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    grammarPointId: 'preposition-adjective',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-154',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 154,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: ' _____ the meeting starts, please make sure all documents are ready.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'Before' },
      { key: 'B', textEn: 'Behind' },
      { key: 'C', textEn: 'Between' },
      { key: 'D', textEn: 'Beyond' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    grammarPointId: 'preposition-time',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-155',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 155,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'The conference will be held _____ the Grand Hotel.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'at' },
      { key: 'B', textEn: 'in' },
      { key: 'C', textEn: 'on' },
      { key: 'D', textEn: 'to' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    grammarPointId: 'preposition-place',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-156',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 156,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'Employees who _____ late may face disciplinary action.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'arrive' },
      { key: 'B', textEn: 'arrives' },
      { key: 'C', textEn: 'arriving' },
      { key: 'D', textEn: 'arrived' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    grammarPointId: 'relative-clause',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-157',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 157,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'The quarterly report shows a _____ increase in sales.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'significant' },
      { key: 'B', textEn: 'significantly' },
      { key: 'C', textEn: 'significance' },
      { key: 'D', textEn: 'signify' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    grammarPointId: 'adjective-vs-adverb',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-158',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 158,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'She asked me _____ the proposal before the deadline.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'to submit' },
      { key: 'B', textEn: 'submitting' },
      { key: 'C', textEn: 'submit' },
      { key: 'D', textEn: 'submitted' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    grammarPointId: 'infinitive',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-159',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 159,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'The new software has been _____ installed on all computers.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'successfully' },
      { key: 'B', textEn: 'success' },
      { key: 'C', textEn: 'successful' },
      { key: 'D', textEn: 'succeed' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    grammarPointId: 'adverb-usage',
    status: 'PUBLISHED',
  },
  {
    id: 'q-p5-t1-160',
    examId: 'toeic_2019_test1',
    partId: 'p5-t1',
    partNumber: 5,
    questionNumber: 160,
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: '_____ of the employees attended the training session.',
    instructionEn: 'Choose the best answer to complete the sentence.',
    options: [
      { key: 'A', textEn: 'Most' },
      { key: 'B', textEn: 'Much' },
      { key: 'C', textEn: 'More' },
      { key: 'D', textEn: 'Many' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    grammarPointId: 'quantifiers',
    status: 'PUBLISHED',
  },
]

// ============================================================
// SAMPLE QUESTIONS - Part 6 (Text Completion)
// ============================================================

export const toeicTest1Part6Passage: ToeicPassage = {
  id: 'passage-p6-t1-1',
  examId: 'toeic_2019_test1',
  partId: 'p6-t1',
  partNumber: 6,
  passageType: 'TRIPLE_PASSAGE',
  title: 'Office Memorandum',
  contentEn: `To: All Staff
From: Human Resources Department
Date: March 15, 2019
Subject: Updated Attendance Policy

Dear colleagues,

As part of our commitment to maintaining a professional work environment, we have updated our attendance policy effective April 1, 2019.

The new policy requires all employees to:
- Arrive at work by 9:00 AM
- Notify their supervisor if they will be late
- Submit leave requests at least 24 hours in advance

Employees who consistently arrive late may face disciplinary action, including written warnings and potential termination for repeated violations.

Please review the updated employee handbook for complete details. If you have any questions, contact the HR department.

Best regards,
Human Resources Department`,
  difficultyLevel: 'MEDIUM',
  questionCount: 4,
}

export const toeicTest1Part6Questions: ToeicQuestion[] = [
  {
    id: 'q-p6-t1-171',
    examId: 'toeic_2019_test1',
    partId: 'p6-t1',
    partNumber: 6,
    questionNumber: 171,
    passageId: 'passage-p6-t1-1',
    passageTitle: 'Office Memorandum',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'What is the purpose of this memo?',
    options: [
      { key: 'A', textEn: 'To announce a new attendance policy' },
      { key: 'B', textEn: 'To request employee feedback' },
      { key: 'C', textEn: 'To schedule a meeting' },
      { key: 'D', textEn: 'To announce a company merger' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
  {
    id: 'q-p6-t1-172',
    examId: 'toeic_2019_test1',
    partId: 'p6-t1',
    partNumber: 6,
    questionNumber: 172,
    passageId: 'passage-p6-t1-1',
    passageTitle: 'Office Memorandum',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'When does the new policy take effect?',
    options: [
      { key: 'A', textEn: 'April 1, 2019' },
      { key: 'B', textEn: 'March 15, 2019' },
      { key: 'C', textEn: 'January 1, 2019' },
      { key: 'D', textEn: 'May 1, 2019' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
  {
    id: 'q-p6-t1-173',
    examId: 'toeic_2019_test1',
    partId: 'p6-t1',
    partNumber: 6,
    questionNumber: 173,
    passageId: 'passage-p6-t1-1',
    passageTitle: 'Office Memorandum',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'What should employees do before taking leave?',
    options: [
      { key: 'A', textEn: 'Submit a request 24 hours in advance' },
      { key: 'B', textEn: 'Call the CEO directly' },
      { key: 'C', textEn: 'Send an email to all colleagues' },
      { key: 'D', textEn: 'Write a formal letter' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
  {
    id: 'q-p6-t1-174',
    examId: 'toeic_2019_test1',
    partId: 'p6-t1',
    partNumber: 6,
    questionNumber: 174,
    passageId: 'passage-p6-t1-1',
    passageTitle: 'Office Memorandum',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'Who can employees contact for questions?',
    options: [
      { key: 'A', textEn: 'The HR department' },
      { key: 'B', textEn: 'The CEO' },
      { key: 'C', textEn: 'External consultants' },
      { key: 'D', textEn: 'The IT department' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
]

// ============================================================
// SAMPLE QUESTIONS - Part 7 (Reading Comprehension)
// ============================================================

export const toeicTest1Part7Passage: ToeicPassage = {
  id: 'passage-p7-t1-1',
  examId: 'toeic_2019_test1',
  partId: 'p7-t1',
  partNumber: 7,
  passageType: 'DOUBLE_PASSAGE',
  title: 'Hotel Reservation Confirmation',
  contentEn: `Dear Mr. Thompson,

Thank you for choosing Grand Plaza Hotel for your upcoming business trip. We are pleased to confirm your reservation as follows:

Reservation Details:
- Guest Name: Robert Thompson
- Check-in Date: April 10, 2019
- Check-out Date: April 12, 2019
- Room Type: Deluxe King Suite
- Number of Guests: 1
- Room Rate: $250 per night (inclusive of breakfast)

Your room will be ready by 3:00 PM on the day of arrival. Early check-in can be arranged upon request, subject to availability.

Our hotel offers complimentary shuttle service to the downtown business district from 7:00 AM to 10:00 PM. The airport shuttle is available every two hours.

Please present this confirmation letter upon check-in. Should you need to modify or cancel your reservation, please contact us at least 48 hours before your scheduled arrival.

We look forward to welcoming you to Grand Plaza Hotel.

Sincerely,
Reservation Department
Grand Plaza Hotel
Phone: (555) 123-4567
Email: reservations@grandplaza.com`,
  difficultyLevel: 'MEDIUM',
  questionCount: 5,
}

export const toeicTest1Part7Questions: ToeicQuestion[] = [
  {
    id: 'q-p7-t1-186',
    examId: 'toeic_2019_test1',
    partId: 'p7-t1',
    partNumber: 7,
    questionNumber: 186,
    passageId: 'passage-p7-t1-1',
    passageTitle: 'Hotel Reservation Confirmation',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'What is the purpose of this letter?',
    options: [
      { key: 'A', textEn: 'To confirm a hotel reservation' },
      { key: 'B', textEn: 'To cancel a flight booking' },
      { key: 'C', textEn: 'To apply for a credit card' },
      { key: 'D', textEn: 'To request a job interview' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
  {
    id: 'q-p7-t1-187',
    examId: 'toeic_2019_test1',
    partId: 'p7-t1',
    partNumber: 7,
    questionNumber: 187,
    passageId: 'passage-p7-t1-1',
    passageTitle: 'Hotel Reservation Confirmation',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'How many nights will Mr. Thompson stay at the hotel?',
    options: [
      { key: 'A', textEn: 'Two nights' },
      { key: 'B', textEn: 'Three nights' },
      { key: 'C', textEn: 'One night' },
      { key: 'D', textEn: 'Four nights' },
    ],
    correctOption: 'A',
    difficultyLevel: 'EASY',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
  {
    id: 'q-p7-t1-188',
    examId: 'toeic_2019_test1',
    partId: 'p7-t1',
    partNumber: 7,
    questionNumber: 188,
    passageId: 'passage-p7-t1-1',
    passageTitle: 'Hotel Reservation Confirmation',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'What is included in the room rate?',
    options: [
      { key: 'A', textEn: 'Breakfast' },
      { key: 'B', textEn: 'Dinner' },
      { key: 'C', textEn: 'Gym access' },
      { key: 'D', textEn: 'Airport transfer' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
  {
    id: 'q-p7-t1-189',
    examId: 'toeic_2019_test1',
    partId: 'p7-t1',
    partNumber: 7,
    questionNumber: 189,
    passageId: 'passage-p7-t1-1',
    passageTitle: 'Hotel Reservation Confirmation',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'What time does the shuttle to downtown operate?',
    options: [
      { key: 'A', textEn: 'From 7:00 AM to 10:00 PM' },
      { key: 'B', textEn: 'From 9:00 AM to 5:00 PM' },
      { key: 'C', textEn: 'From 6:00 AM to 11:00 PM' },
      { key: 'D', textEn: 'From 8:00 AM to 9:00 PM' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
  {
    id: 'q-p7-t1-190',
    examId: 'toeic_2019_test1',
    partId: 'p7-t1',
    partNumber: 7,
    questionNumber: 190,
    passageId: 'passage-p7-t1-1',
    passageTitle: 'Hotel Reservation Confirmation',
    questionType: 'MULTIPLE_CHOICE',
    questionTextEn: 'How far in advance should the guest cancel to avoid a fee?',
    options: [
      { key: 'A', textEn: 'At least 48 hours' },
      { key: 'B', textEn: 'At least 24 hours' },
      { key: 'C', textEn: 'At least 72 hours' },
      { key: 'D', textEn: 'At least one week' },
    ],
    correctOption: 'A',
    difficultyLevel: 'MEDIUM',
    skillType: 'READING',
    hasPassage: true,
    status: 'PUBLISHED',
  },
]

// ============================================================
// ALL QUESTIONS FOR DEMO
// ============================================================

export const toeicTest1AllQuestions: ToeicQuestion[] = [
  ...toeicTest1Part5Questions,
  ...toeicTest1Part6Questions,
  ...toeicTest1Part7Questions,
]

// ============================================================
// ANSWER KEY
// ============================================================

export const toeicTest1AnswerKey: Record<number, string> = {
  // Part 5 (sample)
  151: 'A', 152: 'A', 153: 'A', 154: 'A', 155: 'A',
  156: 'A', 157: 'A', 158: 'A', 159: 'A', 160: 'A',
  // Part 6 (sample)
  171: 'A', 172: 'A', 173: 'A', 174: 'A',
  // Part 7 (sample)
  186: 'A', 187: 'A', 188: 'A', 189: 'A', 190: 'A',
}

// ============================================================
// PART TIMINGS
// ============================================================

export const toeicTest1PartTimings = {
  part1: { questions: 6, seconds: 0 },
  part2: { questions: 25, seconds: 0 },
  part3: { questions: 39, seconds: 0 },
  part4: { questions: 30, seconds: 0 },
  part5: { questions: 30, seconds: 0 },
  part6: { questions: 16, seconds: 0 },
  part7: { questions: 54, seconds: 0 },
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getPartByNumber(partNumber: number): ToeicPart | undefined {
  return toeicTest1Parts.find(p => p.partNumber === partNumber)
}

export function getQuestionsByPart(partNumber: number): ToeicQuestion[] {
  return toeicTest1AllQuestions.filter(q => q.partNumber === partNumber)
}

export function checkAnswer(questionNumber: number, selectedOption: string): boolean {
  return toeicTest1AnswerKey[questionNumber] === selectedOption
}

export function calculateScore(answers: Record<number, string>): { correct: number; total: number; percentage: number } {
  let correct = 0
  const total = Object.keys(answers).length

  for (const [qNum, selected] of Object.entries(answers)) {
    if (toeicTest1AnswerKey[parseInt(qNum)] === selected) {
      correct++
    }
  }

  return {
    correct,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  }
}
