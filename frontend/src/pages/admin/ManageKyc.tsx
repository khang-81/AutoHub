import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check, X, Loader2, ExternalLink } from 'lucide-react';
import {
  getPendingKycAdminApi,
  approveKycApi,
  rejectKycApi,
  kycFileAbsoluteUrl,
} from '../../api/kyc';
import { getAllUsersApi } from '../../api/users';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';

const ManageKyc = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['kycPending'],
    queryFn: getPendingKycAdminApi,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersApi,
  });

  const approveMutation = useMutation({
    mutationFn: approveKycApi,
    onSuccess: () => {
      showToast('Đã duyệt hồ sơ', 'success');
      queryClient.invalidateQueries({ queryKey: ['kycPending'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Lỗi', 'error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => rejectKycApi(id, note),
    onSuccess: () => {
      showToast('Đã từ chối hồ sơ', 'success');
      queryClient.invalidateQueries({ queryKey: ['kycPending'] });
      setRejectId(null);
      setRejectNote('');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Lỗi', 'error');
    },
  });

  const emailFor = (userId?: number) => {
    if (!userId) return '—';
    const u = users.find((x: { id: number }) => x.id === userId);
    return u?.email ?? `#${userId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Duyệt giấy tờ KYC</h1>
          <p className="text-gray-500 text-sm">CCCD và GPLX chờ đồng ý</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
          Không có hồ sơ chờ duyệt.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-navy">ID</th>
                <th className="text-left p-4 font-semibold text-navy">Khách</th>
                <th className="text-left p-4 font-semibold text-navy">Loại</th>
                <th className="text-left p-4 font-semibold text-navy">File</th>
                <th className="text-right p-4 font-semibold text-navy">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="p-4">#{row.id}</td>
                  <td className="p-4">{emailFor(row.userId)}</td>
                  <td className="p-4 font-medium">{row.documentType}</td>
                  <td className="p-4">
                    <a
                      href={kycFileAbsoluteUrl(row.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      Xem <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate(row.id)}
                      disabled={approveMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60"
                    >
                      {approveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectId(row.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100"
                    >
                      <X className="w-3.5 h-3.5" />
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!rejectId} onClose={() => setRejectId(null)} title="Từ chối hồ sơ" size="sm">
        <p className="text-sm text-gray-600 mb-3">Ghi chú cho khách (không bắt buộc)</p>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          className="input-field w-full min-h-[100px] mb-4"
          placeholder="Ví dụ: Ảnh mờ, thiếu thông tin..."
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => rejectId && rejectMutation.mutate({ id: rejectId, note: rejectNote })}
            disabled={rejectMutation.isPending}
            className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
          >
            {rejectMutation.isPending ? 'Đang gửi...' : 'Xác nhận từ chối'}
          </button>
          <button type="button" onClick={() => setRejectId(null)} className="btn-outline flex-1">
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageKyc;
