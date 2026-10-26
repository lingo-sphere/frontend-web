// Shared helpers and constants for Progress Skills Tabs

export const SKILL_VN_MAP: Record<string, string> = {
  reading: "Đọc hiểu",
  listening: "Nghe hiểu",
  grammar: "Ngữ pháp",
  writing: "Kỹ năng Viết",
  speaking: "Kỹ năng Nói",
  vocabulary: "Từ vựng",
  pronunciation: "Ngữ âm (IPA)",
};

export const TREND_VN_MAP: Record<string, string> = {
  improving: "Tiến bộ ↗",
  declining: "Cần chú ý ↘",
  stable: "Ổn định →",
  accelerating: "Bứt phá ⚡",
};

export const EXERCISE_AND_DIMENSION_MAP: Record<string, string> = {
  // Reading
  main_idea: "Đọc hiểu ý chính",
  purpose: "Mục đích đoạn văn",
  detail: "Thông tin chi tiết",
  detail_information: "Thông tin chi tiết",
  specific_information: "Thông tin cụ thể",
  summary: "Tóm tắt bài đọc",
  title_selection: "Chọn tiêu đề bài đọc",
  inference: "Suy luận ngữ cảnh",
  implied_information: "Thông tin hàm ẩn",
  reference: "Đại từ quy chiếu",
  vocabulary: "Từ vựng trong ngữ cảnh",
  vocabulary_in_context: "Từ vựng trong ngữ cảnh",
  paraphrase: "Diễn đạt lại (Paraphrase)",
  author_attitude: "Thái độ của tác giả",
  cause_and_effect: "Nguyên nhân & Kết quả",
  sentence_insertion: "Chèn câu vào đoạn văn",
  sentence_completion: "Hoàn thành câu",
  sentence_ordering: "Sắp xếp câu",
  paragraph_ordering: "Sắp xếp đoạn văn",
  text_completion: "Điền từ hoàn thành đoạn (Part 6)",
  single_passage: "Đoạn văn đơn (Part 7)",
  double_passage: "Đoạn văn kép (Part 7)",
  triple_passage: "Đoạn văn ba (Part 7)",
  incomplete_sentences: "Điền câu chưa hoàn chỉnh (Part 5)",
  reading_comprehension: "Đọc hiểu văn bản",
  part_6: "Điền từ đoạn văn (Part 6)",
  part_7: "Đọc hiểu văn bản (Part 7)",
  real_world_task: "Nhiệm vụ tình huống thực tế",
  info_matching: "Ghép nối thông tin logic",
  verb_tense: "Thì của động từ (Verb Tense)",
  parts_of_speech: "Từ loại (Parts of Speech)",
  task_constraints: "Yêu cầu nhiệm vụ",

  // Listening
  part_1: "Mô tả tranh (Part 1)",
  part_2: "Hỏi & Đáp (Part 2)",
  part_3: "Hội thoại ngắn (Part 3)",
  part_4: "Bài nói ngắn (Part 4)",
  listening_part_1: "Mô tả tranh (Part 1)",
  listening_part_2: "Hỏi & Đáp (Part 2)",
  listening_part_3: "Hội thoại ngắn (Part 3)",
  listening_part_4: "Bài nói ngắn (Part 4)",
  dictation: "Chép chính tả",
  dictation_blank: "Điền từ bài nghe",
  dictation_blanks: "Điền từ bài nghe",
  dictation_sentence: "Chép chính tả cả câu",
  listening_comprehension: "Nghe hiểu hội thoại",

  // Speaking
  read_aloud: "Đọc to đoạn văn",
  repeat_after_audio: "Nghe & Lặp lại",
  shadow_speaking: "Nói đuổi (Shadowing)",
  describe_picture: "Mô tả tranh",
  answer_question: "Trả lời câu hỏi",
  personal_response: "Phản hồi cá nhân",
  role_play: "Đóng vai tình huống",
  situation_response: "Xử lý tình huống",
  story_retelling: "Kể lại câu chuyện",
  opinion_response: "Trình bày quan điểm",
  discussion: "Thảo luận chủ đề",

  // Writing
  word_reordering: "Sắp xếp từ thành câu",
  sentence_rewriting: "Viết lại câu",
  sentence_transformation: "Biến đổi cấu trúc câu",
  paragraph_completion: "Hoàn thành đoạn văn",
  paragraph_writing: "Viết đoạn văn",
  write_message: "Viết tin nhắn ngắn",
  write_email: "Viết email công việc",
  write_review: "Viết nhận xét / đánh giá",
  summarize_text: "Tóm tắt văn bản",
  express_opinion: "Viết bài luận quan điểm",
  guided_writing: "Viết có hướng dẫn",

  // Chung & Trắc nghiệm
  multiple_choice: "Trắc nghiệm chọn đáp án",
  true_false: "Đúng / Sai",
  fill_blank: "Điền vào chỗ trống",
  fill_in_blank: "Điền vào chỗ trống",
  fill_in_blanks: "Điền vào chỗ trống",
  matching: "Nối cặp tương ứng",
  ordering: "Sắp xếp thứ tự",
  short_answer: "Trả lời ngắn",
  sentence_building: "Xây dựng câu hoàn chỉnh",

  // Grammar topics
  tenses: "Các thì trong tiếng Anh",
  verb_tenses: "Các thì của động từ",
  present_simple: "Hiện tại đơn",
  past_simple: "Quá khứ đơn",
  present_perfect: "Hiện tại hoàn thành",
  articles: "Mạo từ (a, an, the)",
  prepositions: "Giới từ (in, on, at,...)",
  relative_clauses: "Mệnh đề quan hệ",
  conditionals: "Câu điều kiện",
  passive_voice: "Câu bị động",
  subject_verb_agreement: "Hòa hợp chủ vị",
  modal_verbs: "Động từ khiếm khuyết",
  gerund_and_infinitive: "Danh động từ & Động từ nguyên mẫu",
  conjunctions: "Liên từ liên kết",
  comparisons: "Cấu trúc so sánh",
  pronouns: "Đại từ",
  adjectives_and_adverbs: "Tính từ & Trạng từ",
  word_order: "Trật tự từ trong câu",
};

export function formatSkillName(skill?: string): string {
  if (!skill) return "Kỹ năng";
  const clean = skill.trim().toLowerCase();
  return SKILL_VN_MAP[clean] || skill;
}

export function formatTrendName(trend?: string): string {
  if (!trend) return "Ổn định →";
  const clean = trend.trim().toLowerCase();
  return TREND_VN_MAP[clean] || "Ổn định →";
}

export function formatDimensionName(key?: string): string {
  if (!key) return "Luyện tập trọng tâm";
  const clean = key.trim();
  if (
    /^[0-9a-fA-F]{24}$/.test(clean) ||
    clean.startsWith("gk_") ||
    clean.startsWith("ctx_") ||
    clean.startsWith("item_")
  ) {
    return "Luyện tập trọng tâm";
  }
  const cleanKey = clean.toLowerCase().replace(/[\s-]+/g, "_");
  if (EXERCISE_AND_DIMENSION_MAP[cleanKey]) {
    return EXERCISE_AND_DIMENSION_MAP[cleanKey];
  }
  if (cleanKey.startsWith("part_")) {
    const pNum = cleanKey.replace("part_", "");
    return `Part ${pNum}`;
  }
  return clean.replace(/_/g, " ");
}

