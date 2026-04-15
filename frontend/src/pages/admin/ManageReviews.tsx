import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Star, Trash2 } from 'lucide-react';
import { deleteReviewAdminApi, getAllReviewsAdminApi, type ReviewDto } from '../../api/reviews';
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

  const avg = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '-';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-bold text-2xl text-navy">Quản lý đánh giá</h1>
        <p className="text-gray-400 text-sm mt-1">
          {reviews.length} đánh giá • Điểm trung bình: {avg}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
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
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as 'ALL' | 'RENTAL' | 'SALE_ORDER')}
          className="input-field"
        >
          <option value="ALL">Tất cả nguồn</option>
          <option value="RENTAL">Từ đơn thuê</option>
          <option value="SALE_ORDER">Từ đơn mua</option>
        </select>
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
                    <td className="px-5 py-4 text-right">
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
    </div>
  );
};

export default ManageReviews;
