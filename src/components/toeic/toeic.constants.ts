/**
 * @file toeic.constants.ts
 * @description Hằng số phân bổ thời gian và mẹo làm bài các phần thi TOEIC (Part 1 - 7)
 */

export const PART_TIMINGS: Record<number, { questions: number; timeMinutes: number; description: string }> = {
  1: { questions: 6, timeMinutes: 3, description: 'Phần nghe mô tả tranh (Part 1)' },
  2: { questions: 25, timeMinutes: 9, description: 'Phần nghe câu hỏi - đáp (Part 2)' },
  3: { questions: 39, timeMinutes: 17, description: 'Phần nghe đoạn hội thoại (Part 3)' },
  4: { questions: 30, timeMinutes: 14, description: 'Phần nghe bài nói ngắn (Part 4)' },
  5: { questions: 30, timeMinutes: 12, description: 'Hoàn thành câu ngữ pháp & từ vựng (Part 5)' },
  6: { questions: 16, timeMinutes: 8, description: 'Hoàn thành đoạn văn (Part 6)' },
  7: { questions: 54, timeMinutes: 55, description: 'Đọc hiểu đoạn đơn & đoạn kép (Part 7)' },
}

export const PART_TIPS: Record<number, string> = {
  1: 'Quan sát kỹ hành động của người, đồ vật và bối cảnh xung quanh trước khi nghe.',
  2: 'Tập trung bắt từ để hỏi (Who, Where, When, Why, How) và tránh bẫy từ đồng âm.',
  3: 'Đọc lướt 3 câu hỏi trước khi audio phát để định vị sẵn thông tin cần nghe.',
  4: 'Xác định nhanh bối cảnh (sân bay, thông báo công ty, bản tin thời tiết).',
  5: 'Xác định từ loại trước và sau chỗ trống trước khi xét đến nghĩa của từ.',
  6: 'Đọc lướt cả đoạn văn để nắm mạch nội dung trước khi chọn câu điền phù hợp.',
  7: 'Đọc câu hỏi trước -> Tìm từ khóa (keywords) -> Quét đoạn văn để tìm đáp án.',
}
