import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `Bạn là AutoBot - trợ lý AI thông minh của AutoHub, nền tảng thuê xe ô tô hàng đầu Việt Nam.

THÔNG TIN VỀ AUTOHUB:
- Dịch vụ: Cho thuê ô tô tự lái với đội xe đa dạng (sedan, SUV, MPV, hatchback)
- Giá thuê: từ 500.000 VNĐ/ngày đến 3.000.000 VNĐ/ngày tùy xe
- Yêu cầu: CCCD/Hộ chiếu, Giấy phép lái xe, đặt cọc xe
- Quy trình: Chọn xe → Chọn ngày → Đặt cọc → Nhận xe → Trả xe → Thanh toán
- Hotline: 1800-AUTO (miễn phí)
- Email: support@autohub.vn

NHIỆM VỤ:
1. Tư vấn khách hàng chọn xe phù hợp (số người, ngân sách, mục đích)
2. Giải thích quy trình thuê xe
3. Trả lời câu hỏi về giá cả, chính sách
4. Hướng dẫn sử dụng website
5. Giải quyết thắc mắc về đơn thuê

PHONG CÁCH:
- Thân thiện, chuyên nghiệp, nhiệt tình
- Trả lời bằng tiếng Việt
- Câu trả lời ngắn gọn, súc tích (tối đa 200 từ)
- Dùng emoji phù hợp để tăng thân thiện
- Nếu không biết, hướng dẫn liên hệ hotline

Hãy luôn giới thiệu mình là AutoBot khi được hỏi.`;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    // Demo mode - simulate responses when no API key
    await new Promise((r) => setTimeout(r, 800));
    return getDemoResponse(message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Tôi đã hiểu. Tôi sẽ đóng vai AutoBot - trợ lý AI của AutoHub.' }],
        },
        ...history.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hotline 1800-AUTO nhé! 🙏';
  }
};

function getDemoResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('giá') || msg.includes('bao nhiêu') || msg.includes('phí')) {
    return '💰 Giá thuê xe tại AutoHub dao động từ **500.000 VNĐ/ngày** (xe phổ thông) đến **3.000.000 VNĐ/ngày** (xe cao cấp). Bạn có thể xem giá chi tiết từng xe tại trang Danh sách xe nhé!';
  }
  if (msg.includes('thuê') && (msg.includes('cần') || msg.includes('yêu cầu') || msg.includes('điều kiện'))) {
    return '📋 Để thuê xe tại AutoHub, bạn cần:\n1. CCCD/Hộ chiếu còn hiệu lực\n2. Giấy phép lái xe hợp lệ\n3. Đặt cọc theo giá trị xe\n4. Tạo hồ sơ cá nhân trên website';
  }
  if (msg.includes('quy trình') || msg.includes('bước') || msg.includes('như thế nào')) {
    return '🚗 Quy trình thuê xe:\n1️⃣ Chọn xe phù hợp\n2️⃣ Chọn ngày nhận & trả\n3️⃣ Xác nhận đặt xe\n4️⃣ Đặt cọc & ký hợp đồng\n5️⃣ Nhận xe & lái đi\n6️⃣ Trả xe & thanh toán';
  }
  if (msg.includes('hủy') || msg.includes('cancel')) {
    return '❌ Chính sách hủy: Hủy trước 24h - hoàn 100% cọc. Hủy trong vòng 24h - mất 50% cọc. Vui lòng liên hệ support@autohub.vn để được hỗ trợ.';
  }
  if (msg.includes('xin chào') || msg.includes('hello') || msg.includes('hi') || msg.includes('chào')) {
    return '👋 Xin chào! Tôi là **AutoBot** - trợ lý AI của AutoHub. Tôi có thể giúp bạn tư vấn chọn xe, giải đáp thắc mắc về dịch vụ thuê xe. Bạn cần hỗ trợ gì hôm nay? 😊';
  }
  if (msg.includes('liên hệ') || msg.includes('hotline') || msg.includes('điện thoại')) {
    return '📞 Thông tin liên hệ AutoHub:\n- Hotline: **1800-AUTO** (miễn phí)\n- Email: support@autohub.vn\n- Giờ làm việc: 7:00 - 22:00 hàng ngày';
  }
  if (msg.includes('xe') && (msg.includes('suv') || msg.includes('7 chỗ') || msg.includes('gia đình'))) {
    return '🚙 Cho chuyến du lịch gia đình, tôi gợi ý xe **SUV 7 chỗ** như Toyota Fortuner, Mitsubishi Outlander hoặc Hyundai Santa Fe. Phù hợp cho 5-7 người với hành lý thoải mái. Xem thêm tại trang /cars!';
  }
  return '🤖 Cảm ơn bạn đã liên hệ AutoHub! Tôi đang trong chế độ demo (chưa có API key). Để sử dụng AI thực, vui lòng cài đặt VITE_GEMINI_API_KEY. Bạn có thể hỏi về: giá xe, quy trình thuê, điều kiện thuê xe... 😊';
}
