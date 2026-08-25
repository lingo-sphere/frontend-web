// Updated: 2026-08-17
// Mock data cho Topics page:
// - topics: 30 topics phổ biến với thông tin cơ bản
// - accessCount: lượt truy cập (để sort/filter)

export interface Topic {
  id: string
  nameEn: string
  nameVi: string
  description: string
  wordCount: number
  accessCount: number
  cefrLevel: string
  emoji: string
  isFeatured: boolean
}

export const topics: Topic[] = [
  { id: '1', nameEn: 'Business & Office', nameVi: 'Kinh doanh & Văn phòng', description: 'Từ vựng chuyên ngành trong môi trường doanh nghiệp', wordCount: 150, accessCount: 12500, cefrLevel: 'B1-B2', emoji: '💼', isFeatured: true },
  { id: '2', nameEn: 'Travel & Tourism', nameVi: 'Du lịch & Khách sạn', description: 'Từ vựng cho chuyến đi và trải nghiệm du lịch', wordCount: 120, accessCount: 11200, cefrLevel: 'A2-B1', emoji: '✈️', isFeatured: true },
  { id: '3', nameEn: 'Technology & IT', nameVi: 'Công nghệ & IT', description: 'Thuật ngữ công nghệ và tin học hiện đại', wordCount: 180, accessCount: 10800, cefrLevel: 'B1-B2', emoji: '💻', isFeatured: true },
  { id: '4', nameEn: 'Health & Medicine', nameVi: 'Sức khỏe & Y tế', description: 'Từ vựng y khoa và chăm sóc sức khỏe', wordCount: 140, accessCount: 9500, cefrLevel: 'B2-C1', emoji: '🏥', isFeatured: true },
  { id: '5', nameEn: 'Education & School', nameVi: 'Giáo dục & Trường học', description: 'Từ vựng liên quan đến học tập và trường lớp', wordCount: 110, accessCount: 8900, cefrLevel: 'A2-B1', emoji: '🎓', isFeatured: false },
  { id: '6', nameEn: 'Food & Restaurant', nameVi: 'Ẩm thực & Nhà hàng', description: 'Món ăn, đồ uống và giao tiếp trong nhà hàng', wordCount: 130, accessCount: 8500, cefrLevel: 'A2-B1', emoji: '🍽️', isFeatured: false },
  { id: '7', nameEn: 'Sports & Fitness', nameVi: 'Thể thao & Gym', description: 'Từ vựng về các môn thể thao và tập gym', wordCount: 100, accessCount: 8200, cefrLevel: 'A2-B1', emoji: '⚽', isFeatured: false },
  { id: '8', nameEn: 'Music & Entertainment', nameVi: 'Âm nhạc & Giải trí', description: 'Thuật ngữ âm nhạc và thế giới giải trí', wordCount: 95, accessCount: 7800, cefrLevel: 'A2-B1', emoji: '🎵', isFeatured: false },
  { id: '9', nameEn: 'Finance & Banking', nameVi: 'Tài chính & Ngân hàng', description: 'Từ vựng tài chính, đầu tư và ngân hàng', wordCount: 160, accessCount: 7500, cefrLevel: 'B2-C1', emoji: '💰', isFeatured: false },
  { id: '10', nameEn: 'Law & Legal', nameVi: 'Pháp luật & Tư pháp', description: 'Thuật ngữ pháp lý và tố tụng', wordCount: 145, accessCount: 6200, cefrLevel: 'C1-C2', emoji: '⚖️', isFeatured: false },
  { id: '11', nameEn: 'Science & Nature', nameVi: 'Khoa học & Thiên nhiên', description: 'Từ vựng khoa học và các hiện tượng tự nhiên', wordCount: 135, accessCount: 5900, cefrLevel: 'B1-B2', emoji: '🔬', isFeatured: false },
  { id: '12', nameEn: 'Fashion & Beauty', nameVi: 'Thời trang & Làm đẹp', description: 'Trang phục, phụ kiện và chăm sóc sắc đẹp', wordCount: 105, accessCount: 5600, cefrLevel: 'A2-B1', emoji: '👗', isFeatured: false },
  { id: '13', nameEn: 'Real Estate', nameVi: 'Bất động sản', description: 'Từ vựng về nhà đất và đầu tư bất động sản', wordCount: 125, accessCount: 5200, cefrLevel: 'B1-B2', emoji: '🏠', isFeatured: false },
  { id: '14', nameEn: 'Marketing & Sales', nameVi: 'Marketing & Bán hàng', description: 'Thuật ngữ quảng cáo, marketing và kinh doanh', wordCount: 140, accessCount: 4900, cefrLevel: 'B1-B2', emoji: '📈', isFeatured: false },
  { id: '15', nameEn: 'HR & Recruitment', nameVi: 'Nhân sự & Tuyển dụng', description: 'Từ vựng về nhân sự, tuyển dụng và HR', wordCount: 115, accessCount: 4600, cefrLevel: 'B1-B2', emoji: '👔', isFeatured: false },
  { id: '16', nameEn: 'Media & Journalism', nameVi: 'Truyền thông & Báo chí', description: 'Thuật ngữ truyền thông và tác nghiệp báo chí', wordCount: 120, accessCount: 4300, cefrLevel: 'B2-C1', emoji: '📰', isFeatured: false },
  { id: '17', nameEn: 'Environment', nameVi: 'Môi trường', description: 'Từ vựng về môi trường và phát triển bền vững', wordCount: 90, accessCount: 4000, cefrLevel: 'B1-B2', emoji: '🌍', isFeatured: false },
  { id: '18', nameEn: 'Cooking & Recipes', nameVi: 'Nấu ăn & Công thức', description: 'Từ vựng nấu ăn và các món ăn quốc tế', wordCount: 110, accessCount: 3800, cefrLevel: 'A2-B1', emoji: '🍳', isFeatured: false },
  { id: '19', nameEn: 'Aviation', nameVi: 'Hàng không', description: 'Thuật ngữ hàng không và hàng không dân dụng', wordCount: 100, accessCount: 3500, cefrLevel: 'B2-C1', emoji: '✈️', isFeatured: false },
  { id: '20', nameEn: 'Art & Design', nameVi: 'Nghệ thuật & Thiết kế', description: 'Từ vựng về mỹ thuật và thiết kế đồ họa', wordCount: 95, accessCount: 3200, cefrLevel: 'B1-B2', emoji: '🎨', isFeatured: false },
  { id: '21', nameEn: 'Social Media', nameVi: 'Mạng xã hội', description: 'Từ vựng công nghệ mạng xã hội hiện đại', wordCount: 85, accessCount: 3000, cefrLevel: 'A2-B1', emoji: '📱', isFeatured: false },
  { id: '22', nameEn: 'Agriculture', nameVi: 'Nông nghiệp', description: 'Từ vựng nông nghiệp và trồng trọt', wordCount: 80, accessCount: 2800, cefrLevel: 'B1-B2', emoji: '🌾', isFeatured: false },
  { id: '23', nameEn: 'Automotive', nameVi: 'Ô tô & Xe máy', description: 'Thuật ngữ về phương tiện giao thông', wordCount: 90, accessCount: 2600, cefrLevel: 'B1-B2', emoji: '🚗', isFeatured: false },
  { id: '24', nameEn: 'Pet & Animals', nameVi: 'Thú cưng & Động vật', description: 'Từ vựng về thú cưng và động vật', wordCount: 75, accessCount: 2400, cefrLevel: 'A2', emoji: '🐕', isFeatured: false },
  { id: '25', nameEn: 'Gardening', nameVi: 'Làm vườn', description: 'Từ vựng về cây cối và làm vườn', wordCount: 70, accessCount: 2200, cefrLevel: 'A2-B1', emoji: '🌱', isFeatured: false },
  { id: '26', nameEn: 'Photography', nameVi: 'Nhiếp ảnh', description: 'Thuật ngữ nhiếp ảnh và kỹ thuật chụp ảnh', wordCount: 85, accessCount: 2000, cefrLevel: 'B1-B2', emoji: '📷', isFeatured: false },
  { id: '27', nameEn: 'Astronomy', nameVi: 'Thiên văn học', description: 'Từ vựng về vũ trụ và các thiên thể', wordCount: 80, accessCount: 1800, cefrLevel: 'B2-C1', emoji: '🌌', isFeatured: false },
  { id: '28', nameEn: 'Psychology', nameVi: 'Tâm lý học', description: 'Thuật ngữ tâm lý và sức khỏe tinh thần', wordCount: 110, accessCount: 1600, cefrLevel: 'B2-C1', emoji: '🧠', isFeatured: false },
  { id: '29', nameEn: 'Philosophy', nameVi: 'Triết học', description: 'Từ vựng triết học và tư duy', wordCount: 95, accessCount: 1400, cefrLevel: 'C1-C2', emoji: '📚', isFeatured: false },
  { id: '30', nameEn: 'Mythology', nameVi: 'Thần thoại', description: 'Từ vựng về thần thoại Hy Lạp, La Mã', wordCount: 70, accessCount: 1200, cefrLevel: 'B1-B2', emoji: '🏛️', isFeatured: false },
]
