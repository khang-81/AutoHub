import { getAllCarsApi } from './cars';
import type { Car } from '../types';

import axiosInstance from './axiosInstance';

const SYSTEM_PROMPT = `Bạn là AutoBot - trợ lý AI của AutoHub, nền tảng **cho thuê và bán ô tô** tại Việt Nam.

THÔNG TIN AUTOHUB:
- Thuê xe tự lái: sedan, SUV, MPV, hatchback — giá theo ngày (VNĐ/ngày), tùy xe.
- Mua xe: xe niêm yết bán (giá bán một lần), có thể đặt cọc / thanh toán theo quy trình trên web.
- Chung: CCCD/Hộ chiếu, GPLX hợp lệ; GPLX được duyệt trước khi đặt thuê; xem xe / liên hệ qua trang web.
- Thuê — quy trình gợi ý: Chọn xe → Chọn ngày → Đặt xe → Cọc / thanh toán → Nhận xe → Trả xe → Tất toán.
- Mua — quy trình gợi ý: Chọn xe bán → Đặt mua / cọc theo hướng dẫn → Thanh toán → Hoàn tất thủ tục.
- Hotline: 1800-AUTO • Email: support@autohub.vn

NHIỆM VỤ (RẤT QUAN TRỌNG):
1. Khi khách hỏi về xe, BẮT BUỘC dùng danh sách xe THẬT trong phần "Du lieu realtime (API)" ở dưới. TUYỆT ĐỐI KHÔNG bịa tên xe, hãng, giá.
2. Lọc xe theo đúng tiêu chí khách nêu: số chỗ, giá tối đa, loại hộp số (AUTO/MANUAL), nhiên liệu (GASOLINE/DIESEL/HYBRID/ELECTRIC), mục đích (đi phố/đi xa/...).
3. Mỗi gợi ý ghi rõ: Tên xe | Số chỗ | Hộp số | Nhiên liệu | Giá. Nếu khách hỏi tiêu chí không xe nào match, nói rõ và đề xuất nới rộng tiêu chí.
4. Giải thích quy trình thuê / mua khi khách hỏi.
5. Nếu thiếu dữ liệu cụ thể, khuyên xem trang danh sách xe hoặc liên hệ hotline.

PHONG CÁCH:
- Tiếng Việt, thân thiện, tối đa 300 từ mỗi lần trả lời.
- Dùng danh sách bullet/đánh số khi liệt kê xe.
- Trích dẫn giá chính xác từ DB, không làm tròn.
- Luôn có thể giới thiệu mình là AutoBot khi được hỏi.`;

export interface ChatMessage {
    role: 'user' | 'model' | 'assistant';
    content: string;
}

export type ChatReplySource = 'arcanic' | 'faq' | 'fallback';

export interface ChatReply {
    content: string;
    source: ChatReplySource;
    model?: string;
    totalTokens?: number;
}

export interface AiStatus {
    aiConfigured: boolean;
}

let aiStatusCache: { data: AiStatus; at: number } | null = null;
const AI_STATUS_CACHE_MS = 60_000;

export async function getAiStatus(): Promise<AiStatus> {
    const now = Date.now();
    if (aiStatusCache && now - aiStatusCache.at < AI_STATUS_CACHE_MS) {
        return aiStatusCache.data;
    }
    try {
        const res = await axiosInstance.get<AiStatus>('/api/ai/status');
        const data = { aiConfigured: Boolean(res.data?.aiConfigured) };
        aiStatusCache = { data, at: now };
        return data;
    } catch {
        return { aiConfigured: false };
    }
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

function listingTypeUpper(c: Car): string {
    return String(c.listingType ?? 'RENT_ONLY').toUpperCase();
}

function isRentCar(c: Car): boolean {
    return listingTypeUpper(c) !== 'SALE_ONLY';
}

function isSaleCar(c: Car): boolean {
    return listingTypeUpper(c) === 'SALE_ONLY' && (c.salePrice ?? 0) > 0;
}

function carLabel(c: Car): string {
    return `${c.model?.brand?.name || ''} ${c.model?.name || ''}`.trim();
}

function formatVnd(value: number) {
    return new Intl.NumberFormat('vi-VN').format(value);
}

function pickTopRentCars(cars: Car[], count = 5): Car[] {
    const rent = cars.filter((c) => isRentCar(c) && (c.dailyPrice ?? 0) > 0);
    return [...rent].sort((a, b) => (a.dailyPrice ?? 0) - (b.dailyPrice ?? 0)).slice(0, count);
}

function pickTopSaleCars(cars: Car[], count = 5): Car[] {
    const sale = cars.filter(isSaleCar);
    return [...sale].sort((a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0)).slice(0, count);
}

function wantsSale(msg: string): boolean {
    return (
        msg.includes('mua xe') ||
        msg.includes('mua ') ||
        msg.includes('bán xe') ||
        msg.includes('ban xe') ||
        msg.includes('giá bán') ||
        msg.includes('gia ban') ||
        msg.includes('niêm yết') ||
        msg.includes('sang tên') ||
        msg.includes('đặt mua') ||
        msg.includes('dat mua') ||
        msg.includes('cọc mua') ||
        msg.includes('coc mua') ||
        (msg.includes('xe mới') && msg.includes('mua'))
    );
}

function wantsRent(msg: string): boolean {
    return (
        msg.includes('thuê') ||
        msg.includes('thue') ||
        msg.includes('/ngày') ||
        (msg.includes('ngay') && (msg.includes('thuê') || msg.includes('thue')))
    );
}

function buildLiveContextBlock(cars: Car[]): string {
    if (!cars.length) return 'Du lieu realtime tam thoi chua tai duoc.';

    const rentCars = cars
        .filter((c) => isRentCar(c) && (c.dailyPrice ?? 0) > 0)
        .sort((a, b) => (a.dailyPrice ?? 0) - (b.dailyPrice ?? 0));
    const saleCars = cars
        .filter(isSaleCar)
        .sort((a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0));

    const parts: string[] = [
        `Tong ${cars.length} xe trong he thong AutoHub.`,
        '',
        '=== XE CHO THUE (uu tien tu van) ===',
    ];

    if (rentCars.length) {
        const dMin = rentCars[0].dailyPrice ?? 0;
        const dMax = rentCars[rentCars.length - 1].dailyPrice ?? 0;
        parts.push(
            `Tong ${rentCars.length} xe thue, gia tu ${formatVnd(dMin)} den ${formatVnd(dMax)} VND/ngay.`
        );
        parts.push('');
    parts.push('Danh sach chi tiet (moi dong la 1 xe that trong DB):');
        rentCars.forEach((c, i) => {
          const year = c.modelYear ? `${c.modelYear}` : '?';
          const color = c.color?.name ? c.color.name : '?';
          const seats = c.seats != null ? `${c.seats} cho` : '? cho';
          const trans = c.transmission ? String(c.transmission).toUpperCase() : '?';
          const fuel = c.fuelType ? String(c.fuelType).toUpperCase() : '?';
          const km = c.kilometer != null ? `${formatVnd(c.kilometer)} km` : '? km';
          const price = formatVnd(c.dailyPrice ?? 0);
          parts.push(`  ${i + 1}. ${carLabel(c)} ${year} | mau ${color} | ${seats} | hop so ${trans} | ${fuel} | ${km} | ${price} VND/ngay`);
        });
    } else {
        parts.push('Hien khong co xe cho thue hop le.');
    }

    parts.push('');
    parts.push('=== XE CHO BAN ===');
    if (saleCars.length) {
        const sMin = saleCars[0].salePrice ?? 0;
        const sMax = saleCars[saleCars.length - 1].salePrice ?? 0;
        parts.push(
            `Tong ${saleCars.length} xe ban, gia tu ${formatVnd(sMin)} den ${formatVnd(sMax)} VND.`
        );
        parts.push('');
        parts.push('Danh sach tat ca xe ban (moi dong la 1 xe that trong DB):');
        saleCars.forEach((c, i) => {
            const year = c.modelYear ? `${c.modelYear}` : '?';
            const color = c.color?.name ? c.color.name : '?';
            const km = c.kilometer != null ? `${formatVnd(c.kilometer)} km` : '? km';
            const price = formatVnd(c.salePrice ?? 0);
            parts.push(`  ${i + 1}. ${carLabel(c)} ${year} | mau ${color} | ${km} | ${price} VND`);
        });
    } else {
        parts.push('Hien khong co xe ban hop le.');
    }

    parts.push('');
    parts.push(
        'QUAN TRONG: Chi tu van cac xe co trong danh sach tren. Neu khong co xe phu hop, noi ro va goi y trang /cars hoac /cars/mua.'
    );

    return parts.join('\n');
}

async function tryBusinessReply(message: string): Promise<string | null> {
    const msg = message.toLowerCase();
    const cars = await getCarsLive();
    const totalCars = cars.length;
    const rentCars = cars.filter((c) => isRentCar(c) && (c.dailyPrice ?? 0) > 0);
    const saleCars = cars.filter(isSaleCar);

    if (msg.includes('liên hệ') || msg.includes('lien he') || msg.includes('hotline') || msg.includes('hỗ trợ') || msg.includes('ho tro')) {
        return '📞 Liên hệ AutoHub:\n- Hotline: **1800-AUTO**\n- Email: **support@autohub.vn**\n- Trang **Liên hệ** trên web để gửi tin nhắn / đặt lịch xem xe.';
    }

    if (wantsSale(msg) && (msg.includes('điều kiện') || msg.includes('dieu kien') || msg.includes('cần gì'))) {
        return '📋 **Mua xe (gợi ý):** Xác minh GPLX theo yêu cầu; đặt mua & thanh toán trên trang chi tiết xe; có thể đặt **lịch xem xe** trước. Chi tiết cọc & thủ tục hiển thị theo từng xe trên AutoHub.';
    }

    if (wantsRent(msg) && (msg.includes('điều kiện') || msg.includes('dieu kien') || (msg.includes('thuê') && msg.includes('cần')))) {
        return '📋 **Thuê xe:** CCCD/Hộ chiếu còn hiệu lực, GPLX hợp lệ, **GPLX được duyệt** trước khi đặt thuê; đặt cọc theo từng đơn.';
    }

    if (msg.includes('điều kiện') || msg.includes('dieu kien')) {
        return '📋 **Thuê:** GPLX duyệt + CCCD/Hộ chiếu + cọc theo đơn.\n**Mua:** kiểm tra trạng thái xe (còn bán), đặt mua / thanh toán trên web; có thể hẹn **xem xe** trước.';
    }

    if (wantsSale(msg) && (msg.includes('quy trình') || msg.includes('quy trinh') || msg.includes('các bước') || msg.includes('cac buoc'))) {
        return '🛒 **Quy trình mua (tóm tắt):**\n1) Vào **Xe bán** (/cars/mua) hoặc tab Mua trên chi tiết xe\n2) Đặt mua / đặt cọc theo hướng dẫn\n3) Thanh toán\n4) Hoàn tất thủ tục — chi tiết theo từng xe trên hệ thống.';
    }

    if (wantsRent(msg) && (msg.includes('quy trình') || msg.includes('quy trinh') || msg.includes('các bước') || msg.includes('cac buoc') || msg.includes('như thế nào'))) {
        return '🛞 **Quy trình thuê:** Chọn xe → Chọn ngày nhận/trả → Đặt xe → Thanh toán/cọc → Nhận xe → Trả xe & tất toán.';
    }

    if (msg.includes('quy trình') || msg.includes('quy trinh') || msg.includes('các bước') || msg.includes('cac buoc')) {
        return '🛞 **Thuê:** chọn xe → ngày → đặt thuê → cọc/thanh toán → nhận/trả xe.\n🛒 **Mua:** chọn xe bán → đặt mua/cọc → thanh toán → thủ tục. Xem chi tiết từng bước trên trang xe.';
    }

    if (msg.includes('xem xe') || msg.includes('lich xem') || msg.includes('lịch xem') || msg.includes('đặt lịch')) {
        return '📅 Bạn có thể **đặt lịch xem xe** từ trang chi tiết xe (tab Xem / Đặt lịch). Với xe bán, nên xem trực tiếp trước khi quyết định.';
    }

    if (
        (msg.includes('giá') || msg.includes('gia') || msg.includes('bao nhiêu') || msg.includes('bao nhieu') || msg.includes('phí') || msg.includes('phi')) &&
        wantsSale(msg) &&
        !wantsRent(msg)
    ) {
        if (!saleCars.length) {
            return '💰 Hiện chưa có dữ liệu **xe bán** (giá một lần) trong hệ thống, hoặc đang tải. Bạn mở trang **Xe bán** (/cars/mua) nhé.';
        }
        const sMin = Math.min(...saleCars.map((c) => c.salePrice ?? 0));
        const sMax = Math.max(...saleCars.map((c) => c.salePrice ?? 0));
        const top = pickTopSaleCars(cars, 4)
            .map((c) => `${carLabel(c)} — **${formatVnd(c.salePrice ?? 0)}** VNĐ`)
            .join('\n');
        return `💰 **Giá bán (realtime):** ${saleCars.length} xe, từ **${formatVnd(sMin)}** đến **${formatVnd(sMax)}** VNĐ.\nGợi ý:\n${top}`;
    }

    if (msg.includes('giá') || msg.includes('gia') || msg.includes('bao nhiêu') || msg.includes('bao nhieu') || msg.includes('phí') || msg.includes('phi')) {
        if (!totalCars) {
            return '💰 Mình chưa đọc được dữ liệu xe realtime. Thử lại sau hoặc xem **/cars** (thuê) và **/cars/mua** (bán).';
        }
        const lines: string[] = [`💰 Tổng **${totalCars}** xe trong hệ thống.`];
        if (rentCars.length) {
            const dMin = Math.min(...rentCars.map((c) => c.dailyPrice ?? 0));
            const dMax = Math.max(...rentCars.map((c) => c.dailyPrice ?? 0));
            lines.push(`**Thuê:** ${rentCars.length} xe — **${formatVnd(dMin)}**–**${formatVnd(dMax)}** VNĐ/ngày.`);
            lines.push(`Gợi ý thuê rẻ: ${pickTopRentCars(cars, 3).map(carLabel).join(', ')}`);
        }
        if (saleCars.length) {
            const sMin = Math.min(...saleCars.map((c) => c.salePrice ?? 0));
            const sMax = Math.max(...saleCars.map((c) => c.salePrice ?? 0));
            lines.push(`**Mua:** ${saleCars.length} xe — **${formatVnd(sMin)}**–**${formatVnd(sMax)}** VNĐ.`);
        }
        return lines.join('\n');
    }

    if (msg.includes('xe') && (msg.includes('rẻ') || msg.includes('re') || msg.includes('gợi ý') || msg.includes('goi y') || msg.includes('nào') || msg.includes('nao'))) {
        if (!totalCars) return '🚗 Chưa tải được danh sách xe. Mở **/cars** hoặc **/cars/mua** nhé.';
        if (wantsSale(msg) && !wantsRent(msg) && saleCars.length) {
            const lines = pickTopSaleCars(cars, 5).map(
                (c, i) => `${i + 1}. ${carLabel(c)} — ${formatVnd(c.salePrice ?? 0)} VNĐ`
            );
            return `🚗 **Xe bán giá tốt:**\n${lines.join('\n')}`;
        }
        if (rentCars.length) {
            const lines = pickTopRentCars(cars, 5).map(
                (c, i) => `${i + 1}. ${carLabel(c)} — ${formatVnd(c.dailyPrice ?? 0)} VNĐ/ngày`
            );
            return `🚗 **Thuê giá tốt:**\n${lines.join('\n')}`;
        }
        if (saleCars.length) {
            const lines = pickTopSaleCars(cars, 5).map(
                (c, i) => `${i + 1}. ${carLabel(c)} — ${formatVnd(c.salePrice ?? 0)} VNĐ`
            );
            return `🚗 **Xe bán:**\n${lines.join('\n')}`;
        }
        return '🚗 Chưa có xe phù hợp để gợi ý giá. Xem danh sách trên web.';
    }

    if (msg.includes('tư vấn xe') || msg.includes('tu van xe') || msg.includes('chọn xe') || msg.includes('chon xe')) {
        if (!totalCars) return '🚗 Chưa có dữ liệu xe realtime. Thử lại sau.';
        const chunks: string[] = [];
        if (rentCars.length) {
            const lines = pickTopRentCars(cars, 3)
                .map((c) => `- ${carLabel(c)} (thuê): **${formatVnd(c.dailyPrice ?? 0)}** VNĐ/ngày`)
                .join('\n');
            chunks.push(`**Thuê:**\n${lines}`);
        }
        if (saleCars.length) {
            const lines = pickTopSaleCars(cars, 3)
                .map((c) => `- ${carLabel(c)} (mua): **${formatVnd(c.salePrice ?? 0)}** VNĐ`)
                .join('\n');
            chunks.push(`**Mua:**\n${lines}`);
        }
        return `🚗 Gợi ý nhanh:\n${chunks.join('\n\n')}\n\nCho mình biết bạn ưu tiên **thuê** hay **mua** và ngân sách nhé.`;
    }

    if (msg.includes('suv') || msg.includes('7 chỗ') || msg.includes('7 cho') || msg.includes('gia đình') || msg.includes('gia dinh')) {
        const matchSuvName = (c: Car) => {
            const modelName = (c.model?.name || '').toLowerCase();
            return (
                modelName.includes('fortuner') ||
                modelName.includes('santafe') ||
                modelName.includes('everest') ||
                modelName.includes('cxeight')
            );
        };
        const rentSuv = rentCars.filter(matchSuvName);
        const saleSuv = saleCars.filter(matchSuvName);
        const lines: string[] = [];
        if (rentSuv.length) {
            lines.push(
                `**Thuê:**\n${rentSuv
                    .slice(0, 4)
                    .map((c) => `- ${carLabel(c)}: ${formatVnd(c.dailyPrice ?? 0)} VNĐ/ngày`)
                    .join('\n')}`
            );
        }
        if (saleSuv.length) {
            lines.push(
                `**Mua:**\n${saleSuv
                    .slice(0, 4)
                    .map((c) => `- ${carLabel(c)}: ${formatVnd(c.salePrice ?? 0)} VNĐ`)
                    .join('\n')}`
            );
        }
        if (lines.length) return `🚙 Gợi ý SUV / gia đình:\n${lines.join('\n\n')}`;
        return '🚙 Bạn có thể lọc SUV trên **/cars** (thuê) hoặc **/cars/mua** (bán) theo hãng Toyota / Hyundai / Ford.';
    }

    return null;
}

function toErrorMessage(error: unknown): string {
    const text = String(error || '').toLowerCase();
    if (text.includes('404') || text.includes('not found') || text.includes('model')) {
        return '⚠️ Model Gemini AI hiện tại không tương thích với key/project. AutoBot đã tự chuyển sang chế độ dự phòng nghiệp vụ realtime.';
    }
    if (text.includes('api key') || text.includes('permission') || text.includes('403') || text.includes('401')) {
        return '⚠️ Gemini AI API key đang bị từ chối (401/403). Mình đã chuyển sang chế độ tư vấn nghiệp vụ realtime từ dữ liệu hệ thống.';
    }
    if (text.includes('quota') || text.includes('429') || text.includes('rate')) {
        return '⚠️ Gemini AI đang quá tải/quá quota. Mình vẫn có thể tư vấn theo dữ liệu xe realtime của AutoHub.';
    }
    return '⚠️ Kết nối Gemini AI tạm thời lỗi. Mình tiếp tục hỗ trợ bằng dữ liệu nghiệp vụ realtime nhé.';
}

function getBusinessFallback(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('xe') || msg.includes('tư vấn') || msg.includes('tu van') || msg.includes('gia') || msg.includes('thuê') || msg.includes('thue') || msg.includes('mua')) {
        return '🚗 Chế độ dự phòng: hỏi **"giá thuê"**, **"giá bán xe"**, **"quy trình thuê/mua"**, **"điều kiện thuê"**, hoặc **"đặt lịch xem xe"**.';
    }
    return '🤖 Mình đang ở chế độ dự phòng. Thử hỏi về thuê/mua xe, giá, quy trình — hoặc liên hệ hotline.';
}

export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<ChatReply> => {
    const status = await getAiStatus();

    if (status.aiConfigured) {
        try {
            const cars = await getCarsLive();
            const liveContext = buildLiveContextBlock(cars);

            const historyTrimmed = history.slice(-10);

            const res = await axiosInstance.post<{
                success?: boolean;
                message?: string;
                model?: string;
                totalTokens?: number;
            }>('/api/ai/chat', {
                message,
                history: historyTrimmed,
                systemPrompt: `${SYSTEM_PROMPT}\n\nDu lieu realtime (API): ${liveContext}`,
            });

            if (res?.data?.success && res?.data?.message) {
                return {
                    content: res.data.message,
                    source: 'arcanic',
                    model: res.data.model,
                    totalTokens: res.data.totalTokens ?? undefined,
                };
            }
            throw new Error(res?.data?.message || 'AI backend returned no response');
        } catch (error) {
            console.error('Gemini AI API error:', error);
            const businessReply = await tryBusinessReply(message);
            const fallback = businessReply || getBusinessFallback(message);
            return {
                content: `${toErrorMessage(error)}\n\n${fallback}`,
                source: businessReply ? 'faq' : 'fallback',
            };
        }
    }

    const businessReply = await tryBusinessReply(message);
    if (businessReply) {
        return { content: businessReply, source: 'faq' };
    }

    return {
        content:
            '🤖 **Chế độ FAQ:** Server chưa cấu hình `ARCANIC_API_KEY` nên AutoBot chỉ trả lời câu hỏi mẫu (giá, quy trình, liên hệ…).\n\n' +
            'Để hỏi tự do (so sánh xe, tư vấn theo ngữ cảnh…), thêm key Gemini AI (Arcanic) vào `.env` rồi `docker compose up -d --build api`.\n\n' +
            getBusinessFallback(message),
        source: 'fallback',
    };
};
