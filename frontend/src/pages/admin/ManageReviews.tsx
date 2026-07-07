import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Reply, Search, Star, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminReplyReviewApi, deleteReviewAdminApi, getAllReviewsAdminApi, adminSetReviewHiddenApi, type ReviewDto } from '../../api/reviews';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { formatDate } from '../../utils/helpers';

const ManageReviews = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'RENTAL' | 'SALE_ORDER'>('ALL');
  const [ratingFilter, setRatingFilter] = useState<number | 0>(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [detailReview, setDetailReview] = useState<ReviewDto | null>(null);

  const { data: reviews = [], isLoading } = useQuery<ReviewDto[]>({
    queryKey: ['adminReviews'],
    queryFn: getAllReviewsAdminApi,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReviewAdminApi(id),
    onSuccess: (res: { message?: string }) => {
      showToast(res?.message || 'Đã xóa đánh giá', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car'] });
      queryClient.invalidateQueries({ queryKey: ['myRentals'] });
      queryClient.invalidateQueries({ queryKey: ['mySaleOrders'] });
      setDeleteId(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể xóa đánh giá', 'error');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) => adminReplyReviewApi(id, reply),
    onSuccess: (res: { message?: string }) => {
      showToast(res?.message || 'Đã phản hồi', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      setReplyId(null);
      setReplyText('');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể phản hồi', 'error');
    },
  });

  const hiddenMutation = useMutation({
    mutationFn: ({ id, hidden }: { id: number; hidden: boolean }) => adminSetReviewHiddenApi(id, hidden),
    onSuccess: (res: { message?: string }) => {
      showToast(res?.message || 'Đã cập nhật hiển thị', 'success');
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể cập nhật', 'error');
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const bySource = sourceFilter === 'ALL' || r.sourceType === sourceFilter;
      const byRating = ratingFilter === 0 || r.rating === ratingFilter;
      const bySearch =
        q.length === 0 ||
        String(r.id).includes(q) ||
        (r.authorLabel || '').toLowerCase().includes(q) ||
        (r.carLabel || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q);
      return bySource && byRating && bySearch;
    });
  }, [reviews, ratingFilter, search, sourceFilter]);

  const countBySource = useMemo(() => {
    const all = reviews.length;
    const rental = reviews.filter((r) => r.sourceType === 'RENTAL').length;
    const sale = reviews.filter((r) => r.sourceType === 'SALE_ORDER').length;
    return { all, rental, sale };
  }, [reviews]);

  const avg = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '-';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-bold text-2xl text-navy">Quản lý đánh giá</h1>
        <p className="text-gray-400 text-sm mt-1">
          {reviews.length} đánh giá • Điểm trung bình: {avg}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 inline-flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setSourceFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            sourceFilter === 'ALL'
              ? 'bg-navy text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Tất cả
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              sourceFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {countBySource.all}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSourceFilter('RENTAL')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            sourceFilter === 'RENTAL'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 hover:bg-blue-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Thuê xe
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              sourceFilter === 'RENTAL' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {countBySource.rental}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSourceFilter('SALE_ORDER')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            sourceFilter === 'SALE_ORDER'
              ? 'bg-amber-600 text-white shadow'
              : 'text-gray-600 hover:bg-amber-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Mua xe
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              sourceFilter === 'SALE_ORDER' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {countBySource.sale}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
            placeholder="Tìm theo ID, xe, nhận xét..."
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(Number(e.target.value) as number | 0)}
          className="input-field"
        >
          <option value={0}>Tất cả sao</option>
          <option value={5}>5 sao</option>
          <option value={4}>4 sao</option>
          <option value={3}>3 sao</option>
          <option value={2}>2 sao</option>
          <option value={1}>1 sao</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="text-left px-5 py-4 font-medium">ID</th>
                  <th className="text-left px-5 py-4 font-medium">Nguồn</th>
                  <th className="text-left px-5 py-4 font-medium">Xe</th>
                  <th className="text-left px-5 py-4 font-medium">Khách</th>
                  <th className="text-left px-5 py-4 font-medium">Nội dung</th>
                  <th className="text-right px-5 py-4 font-medium">Ngày</th>
                  <th className="text-left px-5 py-4 font-medium">Hiển thị</th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-500">#{r.id}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${r.sourceType === 'SALE_ORDER' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {r.sourceType === 'SALE_ORDER' ? `Mua #${r.saleOrderId}` : `Thuê #${r.rentalId}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{r.carLabel || '-'}</td>
                    <td className="px-5 py-4 text-gray-600">{r.authorLabel}</td>
                    <td className="px-5 py-4 text-gray-700 max-w-[380px]">
                      <div className="flex items-center gap-2 mb-1 text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={`${r.id}-${i}`} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="line-clamp-2">{r.comment || <span className="text-gray-400 italic">Không có nhận xét</span>}</p>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-500">{formatDate(r.createdDate)}</td>
                    <td className="px-5 py-4">
                      {r.hiddenFromPublic ? (
                        <span className="badge text-xs bg-slate-200 text-slate-700">Đã ẩn web</span>
                      ) : (
                        <span className="badge text-xs bg-emerald-50 text-emerald-700">Công khai</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right flex items-center justify-end gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setDetailReview(r)}
                        className="p-2 rounded-lg text-navy hover:bg-slate-100 transition-colors"
                        title="Chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          hiddenMutation.mutate({ id: r.id, hidden: !Boolean(r.hiddenFromPublic) })
                        }
                        disabled={hiddenMutation.isPending}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                        title={r.hiddenFromPublic ? 'Hiện lại trên web' : 'Ẩn khỏi trang công khai'}
                      >
                        {r.hiddenFromPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReplyId(r.id); setReplyText(r.adminReply || ''); }}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="Phản hồi"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Không có đánh giá phù hợp
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={!!detailReview} onClose={() => setDetailReview(null)} title={`Đánh giá #${detailReview?.id ?? ''}`} size="md">
        {detailReview && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className={`badge text-xs ${detailReview.sourceType === 'SALE_ORDER' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {detailReview.sourceType === 'SALE_ORDER' ? `Đơn mua #${detailReview.saleOrderId}` : `Đơn thuê #${detailReview.rentalId}`}
              </span>
              {detailReview.hiddenFromPublic ? (
                <span className="badge text-xs bg-slate-200 text-slate-700">Đang ẩn trên web</span>
              ) : (
                <span className="badge text-xs bg-emerald-50 text-emerald-700">Hiển thị công khai</span>
              )}
            </div>
            <p><span className="text-gray-500">Xe:</span> <strong>{detailReview.carLabel || '—'}</strong></p>
            <p><span className="text-gray-500">Khách:</span> {detailReview.authorLabel}</p>
            <p><span className="text-gray-500">Ngày:</span> {formatDate(detailReview.createdDate)}</p>
            <div className="flex gap-0.5 text-amber-500">
              {Array.from({ length: detailReview.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
              <p className="text-xs text-gray-500 mb-1">Nội dung</p>
              <p className="text-gray-800 whitespace-pre-wrap">{detailReview.comment || '—'}</p>
            </div>
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="text-xs text-gray-500 mb-1">Phản hồi admin</p>
              <p className="text-gray-800 whitespace-pre-wrap">{detailReview.adminReply || 'Chưa có phản hồi.'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDetailReview(null)} className="btn-outline">
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !Boolean(detailReview.hiddenFromPublic);
                  hiddenMutation.mutate({ id: detailReview.id, hidden: next });
                  setDetailReview({ ...detailReview, hiddenFromPublic: next });
                }}
                className="btn-outline"
              >
                {detailReview.hiddenFromPublic ? 'Hiện lại web' : 'Ẩn khỏi web'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xóa đánh giá" size="sm">
        <p className="text-gray-600 mb-4">Bạn có chắc muốn xóa đánh giá #{deleteId}?</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            disabled={deleteMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
          </button>
          <button type="button" onClick={() => setDeleteId(null)} className="btn-outline">
            Hủy
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!replyId} onClose={() => setReplyId(null)} title="Phản hồi đánh giá" size="sm">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={4}
          className="input-field w-full mb-4"
          placeholder="Nhập phản hồi từ quản trị viên..."
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => replyId && replyText.trim() && replyMutation.mutate({ id: replyId, reply: replyText.trim() })}
            disabled={replyMutation.isPending || !replyText.trim()}
            className="btn-primary disabled:opacity-60"
          >
            {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
          </button>
          <button type="button" onClick={() => setReplyId(null)} className="btn-outline">
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageReviews;
