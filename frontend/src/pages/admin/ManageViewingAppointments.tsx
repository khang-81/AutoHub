import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock, CheckCircle, Search, XCircle, UserX, CircleCheck, Eye, Phone, MessageSquare, MoreHorizontal,
} from 'lucide-react';
import {
  getAllViewingAppointmentsAdminApi,
  updateViewingStatusAdminApi,
} from '../../api/viewingAppointments';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { CAR_PLACEHOLDER, formatDateTime } from '../../utils/helpers';
import type { ViewingAppointment } from '../../types';

const statusLabel = (s: string) => {
  switch (s) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'COMPLETED':
      return 'Hoàn tất';
    case 'NO_SHOW':
      return 'Không đến';
    default:
      return s;
  }
};

const ManageViewingAppointments = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{
    row: ViewingAppointment;
    action: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [detailRow, setDetailRow] = useState<ViewingAppointment | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['viewingAppointmentsAdmin'],
    queryFn: getAllViewingAppointmentsAdminApi,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: number;
      status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
      note?: string;
    }) => updateViewingStatusAdminApi(id, { status, adminNote: note }),
    onSuccess: (data) => {
      showToast(data?.message || 'Đã cập nhật', 'success');
      queryClient.invalidateQueries({ queryKey: ['viewingAppointmentsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['myViewingAppointments'] });
      setModal(null);
      setAdminNote('');
      setOpenMenuId(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Lỗi cập nhật', 'error');
    },
  });

  const q = search.toLowerCase();
  const filtered = rows.filter(
    (r) =>
      r.user?.email?.toLowerCase().includes(q) ||
      String(r.id).includes(q) ||
      `${r.car?.model?.brand?.name} ${r.car?.model?.name}`.toLowerCase().includes(q)
  );
  const sorted = [...filtered].sort((a, b) => b.id - a.id);

  const openModal = (
    row: ViewingAppointment,
    action: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  ) => {
    setModal({ row, action });
    setAdminNote('');
  };

  const actionTitle = (a: string) => {
    switch (a) {
      case 'CONFIRMED':
        return 'Xác nhận lịch';
      case 'CANCELLED':
        return 'Hủy lịch';
      case 'COMPLETED':
        return 'Hoàn tất (đã xem xe)';
      case 'NO_SHOW':
        return 'Khách không đến';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      {openMenuId != null && (
        <button
          type="button"
          className="fixed inset-0 z-10 cursor-default bg-black/5"
          aria-label="Đóng menu"
          onClick={() => setOpenMenuId(null)}
        />
      )}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-navy flex items-center gap-2">
          <CalendarClock className="w-7 h-7 text-primary" />
          Quản lý lịch xem xe
        </h1>
        <p className="text-gray-400 text-sm mt-1">{rows.length} lịch</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email, ID, xe..."
            className="input-field pl-12"
          />
        </div>
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
                  <th className="text-left px-5 py-4 font-medium">Xe</th>
                  <th className="text-left px-5 py-4 font-medium">Khách</th>
                  <th className="text-left px-5 py-4 font-medium">Thời gian</th>
                  <th className="text-left px-5 py-4 font-medium">TT</th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-400">#{r.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <img
                          src={r.car?.imagePath || CAR_PLACEHOLDER}
                          alt=""
                          className="w-10 h-8 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                          }}
                        />
                        <span className="font-medium text-navy">
                          {r.car?.model?.brand?.name} {r.car?.model?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[160px] truncate">{r.user?.email}</td>
                    <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                      {formatDateTime(r.scheduledAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge text-xs bg-gray-100 text-gray-700">{statusLabel(r.status)}</span>
                    </td>
                    <td className="px-5 py-4 text-right relative z-40">
                      <div className="flex justify-end">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            title="Thao tác"
                            onClick={() => setOpenMenuId((cur) => (cur === r.id ? null : r.id))}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-navy shadow-sm hover:bg-gray-50"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                            Thao tác
                          </button>
                          {openMenuId === r.id && (
                            <div
                              className="absolute right-0 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50 text-sm overflow-hidden"
                              role="menu"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => {
                                  setDetailRow(r);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Eye className="w-4 h-4 text-navy" />
                                Xem chi tiết
                              </button>
                              {r.status === 'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2.5 hover:bg-green-50 text-green-700 flex items-center gap-2"
                                    onClick={() => {
                                      openModal(r, 'CONFIRMED');
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Xác nhận lịch
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    onClick={() => {
                                      openModal(r, 'CANCELLED');
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Hủy lịch
                                  </button>
                                </>
                              )}
                              {r.status === 'CONFIRMED' && (
                                <>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2.5 hover:bg-primary/5 text-primary flex items-center gap-2"
                                    onClick={() => {
                                      openModal(r, 'COMPLETED');
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <CircleCheck className="w-4 h-4" />
                                    Hoàn tất (đã xem)
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2.5 hover:bg-amber-50 text-amber-700 flex items-center gap-2"
                                    onClick={() => {
                                      openModal(r, 'NO_SHOW');
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <UserX className="w-4 h-4" />
                                    Khách không đến
                                  </button>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full text-left px-3 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                    onClick={() => {
                                      openModal(r, 'CANCELLED');
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Hủy lịch
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sorted.length === 0 && (
              <p className="text-center text-gray-400 py-12">Không có lịch phù hợp</p>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!modal}
        onClose={() => {
          setModal(null);
          setAdminNote('');
        }}
        title={modal ? actionTitle(modal.action) : ''}
        size="sm"
      >
        {modal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Lịch #{modal.row.id} — {modal.row.user?.email}
            </p>
            <label className="block text-sm text-gray-700">Ghi chú admin (không bắt buộc)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="input-field w-full min-h-[80px]"
              placeholder="Ví dụ: Gặp tại showroom Long Biên..."
              maxLength={500}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  statusMutation.mutate({
                    id: modal.row.id,
                    status: modal.action,
                    note: adminNote.trim() || undefined,
                  })
                }
                disabled={statusMutation.isPending}
                className="btn-primary flex-1"
              >
                {statusMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="btn-outline flex-1"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!detailRow}
        onClose={() => setDetailRow(null)}
        title={detailRow ? `Chi tiết lịch #${detailRow.id}` : ''}
        size="md"
      >
        {detailRow && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-gray-200 p-3 space-y-2">
              <p className="text-gray-600">
                <span className="text-gray-400">Xe:</span>{' '}
                <span className="font-medium text-navy">
                  {detailRow.car?.model?.brand?.name} {detailRow.car?.model?.name}
                </span>
              </p>
              <p className="text-gray-600">
                <span className="text-gray-400">Khách:</span> {detailRow.user?.email}
              </p>
              <p className="text-gray-600">
                <span className="text-gray-400">Thời gian hẹn:</span>{' '}
                <strong>{formatDateTime(detailRow.scheduledAt)}</strong>
              </p>
              <p className="text-gray-600">
                <span className="text-gray-400">Trạng thái:</span> {statusLabel(detailRow.status)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="font-medium text-navy mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Liên hệ
              </p>
              <p className="text-gray-600">
                {detailRow.contactPhone?.trim() ? detailRow.contactPhone : 'Khách chưa để lại số điện thoại'}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="font-medium text-navy mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Yêu cầu thêm từ khách
              </p>
              <p className="text-gray-600 whitespace-pre-wrap">
                {detailRow.note?.trim() ? detailRow.note : 'Không có ghi chú thêm'}
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="font-medium text-navy mb-2">Phản hồi admin</p>
              <p className="text-gray-700 whitespace-pre-wrap">
                {detailRow.adminNote?.trim() ? detailRow.adminNote : 'Chưa có phản hồi'}
              </p>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setDetailRow(null)} className="btn-outline px-6">
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageViewingAppointments;
