import { getAllCarsApi } from './cars';
import type { Car } from '../types';

import axiosInstance from './axiosInstance';

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

let carsCache: { data: Car[]; at: number } | null = null;
const CARS_CACHE_MS = 60_000;

async function getCarsLive(): Promise<Car[]> {
    const now = Date.now();
    if (carsCache && now - carsCache.at < CARS_CACHE_MS) return carsCache.data;
    try {
        const cars = await getAllCarsApi();
        const normalized = Array.isArray(cars) ? cars : [];
        carsCache = { data: normalized, at: now };
        return normalized;
    } catch {
        return carsCache?.data || [];
    }
}

function formatVnd(value: number) {
    return new Intl.NumberFormat('vi-VN').format(value);
}

function pickTopCars(cars: Car[], count = 5) {
    return [...cars]
        .sort((a, b) => a.dailyPrice - b.dailyPrice)
        .slice(0, count)
        .map((c) => `${c.model?.brand?.name || ''} ${c.model?.name || ''}`.trim());
}

async function tryBusinessReply(message: string): Promise<string | null> {
    const msg = message.toLowerCase();
    const cars = await getCarsLive();
    const totalCars = cars.length;
    const minPrice = totalCars ? Math.min(...cars.map((c) => c.dailyPrice || 0)) : 0;
    const maxPrice = totalCars ? Math.max(...cars.map((c) => c.dailyPrice || 0)) : 0;

    if (msg.includes('giá') || msg.includes('bao nhiêu') || msg.includes('phí')) {
        if (!totalCars) {
            return '💰 Hiện mình chưa đọc được dữ liệu giá xe realtime. Bạn thử lại sau vài giây hoặc xem trực tiếp trang danh sách xe nhé.';
        }
        const topCars = pickTopCars(cars, 4).join(', ');
        return `💰 Dữ liệu realtime hiện có **${totalCars} xe**.\n- Giá thấp nhất: **${formatVnd(minPrice)} VNĐ/ngày**\n- Giá cao nhất: **${formatVnd(maxPrice)} VNĐ/ngày**\n- Gợi ý xe giá tốt: ${topCars}`;
    }

    if (msg.includes('xe') && (msg.includes('rẻ') || msg.includes('gợi ý') || msg.includes('nào'))) {
        if (!totalCars) return '🚗 Hiện mình chưa tải được danh sách xe realtime. Bạn mở trang Xe để xem ngay nhé.';
        const cheapCars = [...cars]
            .sort((a, b) => a.dailyPrice - b.dailyPrice)
            .slice(0, 5)
            .map((c, idx) => `${idx + 1}. ${c.model?.brand?.name || ''} ${c.model?.name || ''} - ${formatVnd(c.dailyPrice)} VNĐ/ngày`);
        return `🚗 Top xe giá tốt hiện tại:\n${cheapCars.join('\n')}`;
    }

    if (msg.includes('tư vấn xe') || msg.includes('tu van xe') || msg.includes('chon xe')) {
        if (!totalCars) return '🚗 Mình chưa tải được dữ liệu xe realtime lúc này. Bạn thử lại sau vài giây nhé.';
        const suggestions = [...cars]
            .sort((a, b) => a.dailyPrice - b.dailyPrice)
            .slice(0, 4)
            .map((c) => `- ${c.model?.brand?.name || ''} ${c.model?.name || ''}: ${formatVnd(c.dailyPrice)} VNĐ/ngày`);
        return `🚗 Mình gợi ý nhanh 4 xe dễ thuê từ dữ liệu hiện tại:\n${suggestions.join('\n')}\n\nBạn cho mình thêm ngân sách/ngày và số người, mình lọc chuẩn hơn nhé.`;
    }

    if (msg.includes('suv') || msg.includes('7 chỗ') || msg.includes('gia đình')) {
        const suvCars = cars.filter((c) => {
            const modelName = (c.model?.name || '').toLowerCase();
            return (
                modelName.includes('fortuner') ||
                modelName.includes('santafe') ||
                modelName.includes('everest') ||
                modelName.includes('cxeight')
            );
        });
        if (!suvCars.length) {
            return '🚙 Mình gợi ý nhóm SUV/7 chỗ cho gia đình. Bạn có thể lọc theo thương hiệu Toyota/Hyundai/Ford để chọn nhanh hơn nhé.';
        }
        return `🚙 Gợi ý xe gia đình từ dữ liệu hiện tại:\n${suvCars
            .slice(0, 4)
            .map((c) => `- ${c.model?.brand?.name} ${c.model?.name}: ${formatVnd(c.dailyPrice)} VNĐ/ngày`)
            .join('\n')}`;
    }

    if (msg.includes('điều kiện') || (msg.includes('thuê') && msg.includes('cần'))) {
        return '📋 Điều kiện thuê xe AutoHub:\n1. CCCD/Hộ chiếu còn hiệu lực\n2. GPLX hợp lệ\n3. Hồ sơ tài khoản đầy đủ\n4. Đặt cọc theo chính sách từng xe';
    }

    if (msg.includes('quy trình') || msg.includes('các bước') || msg.includes('như thế nào')) {
        return '🛞 Quy trình thuê xe:\n1) Chọn xe\n2) Chọn ngày nhận/trả\n3) Đặt xe\n4) Xác nhận và đặt cọc\n5) Nhận xe\n6) Trả xe và tất toán';
    }

    if (msg.includes('liên hệ') || msg.includes('hotline') || msg.includes('hỗ trợ')) {
        return '📞 Liên hệ AutoHub:\n- Hotline: **1800-AUTO**\n- Email: **support@autohub.vn**\n- Giờ hỗ trợ: 07:00 - 22:00';
    }

    return null;
}

function toErrorMessage(error: unknown): string {
    const text = String(error || '').toLowerCase();
    if (text.includes('404') || text.includes('not found') || text.includes('model')) {
        return '⚠️ Model Gemini hiện tại không tương thích với key/project. AutoBot đã tự chuyển sang chế độ dự phòng nghiệp vụ realtime.';
    }
    if (text.includes('api key') || text.includes('permission') || text.includes('403')) {
        return '⚠️ Gemini API key đang bị từ chối (403). Mình đã chuyển sang chế độ tư vấn nghiệp vụ realtime từ dữ liệu hệ thống.';
    }
    if (text.includes('quota') || text.includes('429') || text.includes('rate')) {
        return '⚠️ Gemini đang quá tải/quá quota. Mình vẫn có thể tư vấn theo dữ liệu xe realtime của AutoHub.';
    }
    return '⚠️ Kết nối Gemini tạm thời lỗi. Mình tiếp tục hỗ trợ bằng dữ liệu nghiệp vụ realtime nhé.';
}

function getBusinessFallback(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('xe') || msg.includes('tư vấn') || msg.includes('gia') || msg.includes('thuê')) {
        return '🚗 Mình đang dùng chế độ dự phòng nghiệp vụ. Bạn có thể hỏi cụ thể như: "xe dưới 1 triệu/ngày", "xe gia đình 7 chỗ", "điều kiện thuê xe".';
    }
    return '🤖 Mình đang ở chế độ dự phòng nghiệp vụ. Bạn thử hỏi về giá xe, quy trình thuê, điều kiện thuê hoặc liên hệ để mình hỗ trợ nhanh nhé.';
}

export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<string> => {
    const businessReply = await tryBusinessReply(message);
    if (businessReply) return businessReply;

    try {
        const cars = await getCarsLive();
        const liveContext = cars.length
            ? `Du lieu realtime: tong ${cars.length} xe, gia tu ${formatVnd(
                Math.min(...cars.map((c) => c.dailyPrice || 0))
            )} den ${formatVnd(Math.max(...cars.map((c) => c.dailyPrice || 0)))} VND/ngay.`
            : 'Du lieu realtime tam thoi chua tai duoc.';

        const res = await axiosInstance.post('/api/ai/chat', {
            message,
            history,
            systemPrompt: `${SYSTEM_PROMPT}\n\n${liveContext}`,
        });
        if (res?.data?.success && res?.data?.message) {
            return res.data.message as string;
        }
        throw new Error(res?.data?.message || 'AI backend returned no response');
    } catch (error) {
        console.error('Gemini API error:', error);
        const fallback = (await tryBusinessReply(message)) || getBusinessFallback(message);
        return `${toErrorMessage(error)}\n\n${fallback}`;
    }
};
