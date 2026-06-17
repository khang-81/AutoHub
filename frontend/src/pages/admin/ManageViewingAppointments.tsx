import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock, CheckCircle, Search, XCircle, UserX, CircleCheck, Phone, MessageSquare, Mail, User as UserIcon,
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

/** Parse trích đoạn "Họ tên: …" trong note (được ghi từ form Liên hệ). */
function parseCustomerNameFromNote(note: string | null | undefined): string {
  if (!note) return '';
  const m = note.match(/Họ\s*tên\s*:\s*([^\n\r]+)/i);
  return m ? m[1].trim() : '';
}

/** Bỏ phần metadata "Họ tên: …" / "Email: …" ở đầu note, trả về phần yêu cầu thuần. */
function stripNoteMetadata(note: string | null | undefined): string {
  if (!note) return '';
  return note
    .split(/\r?\n/)
    .filter((line) => !/^\s*(Họ\s*tên|Email)\s*:/i.test(line))
    .join('\n')
    .trim();
}

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
    <div>
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
                  <th className="text-left px-5 py-4 font-medium">Khách hàng</th>
                  <th className="text-left px-5 py-4 font-medium">Thời gian</th>
                  <th className="text-left px-5 py-4 font-medium">Yêu cầu</th>
                  <th className="text-left px-5 py-4 font-medium">TT</th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const customerName = parseCustomerNameFromNote(r.note);
                  const customerRequest = stripNoteMetadata(r.note);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setDetailRow(r)}
                    >
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
                      <td className="px-5 py-4">
                        <div className="space-y-1 min-w-[220px]">
                          {customerName && (
                            <div className="flex items-center gap-1.5 font-medium text-navy">
                              <UserIcon className="w-3.5 h-3.5 text-primary" />
                              <span>{customerName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[220px]" title={r.user?.email}>
                              {r.user?.email || '—'}
                            </span>
                          </div>
                          {r.contactPhone?.trim() ? (
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <a
                                href={`tel:${r.contactPhone}`}
                                className="hover:text-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {r.contactPhone}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs italic">
                              <Phone className="w-3.5 h-3.5" />
                              <span>Chưa để lại SĐT</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                        {formatDateTime(r.scheduledAt)}
                      </td>
                      <td className="px-5 py-4 max-w-[260px]">
                        {customerRequest ? (
                          <div
                            className="text-gray-600 text-xs whitespace-pre-wrap line-clamp-3"
                            title={customerRequest}
                          >
                            {customerRequest}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Không có yêu cầu thêm</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge text-xs bg-gray-100 text-gray-700 whitespace-nowrap">
                          {statusLabel(r.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div
                          className="flex flex-wrap items-center justify-end gap-1 max-w-[220px] ml-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {r.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openModal(r, 'CONFIRMED')}
                                className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                title="Xác nhận lịch"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openModal(r, 'CANCELLED')}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Hủy lịch"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {r.status === 'CONFIRMED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openModal(r, 'COMPLETED')}
                                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                title="Hoàn tất (đã xem)"
                              >
                                <CircleCheck className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openModal(r, 'NO_SHOW')}
                                className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Khách không đến"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openModal(r, 'CANCELLED')}
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Hủy lịch"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                <span className="text-gray-400">Thời gian hẹn:</span>{' '}
                <strong>{formatDateTime(detailRow.scheduledAt)}</strong>
              </p>
              <p className="text-gray-600">
                <span className="text-gray-400">Trạng thái:</span> {statusLabel(detailRow.status)}
              </p>
              {detailRow.createdDate && (
                <p className="text-gray-600">
                  <span className="text-gray-400">Ngày tạo:</span> {formatDateTime(detailRow.createdDate)}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="font-medium text-navy mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" />
                Thông tin khách hàng
              </p>
              <div className="space-y-1.5">
                {parseCustomerNameFromNote(detailRow.note) && (
                  <p className="text-gray-700">
                    <span className="text-gray-400">Họ tên:</span>{' '}
                    <strong>{parseCustomerNameFromNote(detailRow.note)}</strong>
                  </p>
                )}
                <p className="text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {detailRow.user?.email || '—'}
                </p>
                <p className="text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {detailRow.contactPhone?.trim() ? (
                    <a href={`tel:${detailRow.contactPhone}`} className="hover:text-primary">
                      {detailRow.contactPhone}
                    </a>
                  ) : (
                    <span className="italic text-gray-400">Chưa để lại SĐT</span>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="font-medium text-navy mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Yêu cầu thêm từ khách
              </p>
              <p className="text-gray-600 whitespace-pre-wrap">
                {stripNoteMetadata(detailRow.note) || 'Không có yêu cầu thêm'}
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
