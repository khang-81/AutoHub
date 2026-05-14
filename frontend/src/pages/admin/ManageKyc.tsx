import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check, X, Loader2, ExternalLink, Eye } from 'lucide-react';
import {
  getPendingKycAdminApi,
  approveKycApi,
  rejectKycApi,
  kycFileAbsoluteUrl,
  getAdminKycDocumentsByUserIdApi,
  type UserDocumentDto,
} from '../../api/kyc';
import { getAllUsersApi } from '../../api/users';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';

function isLikelyImageUrl(fileUrl: string): boolean {
  const u = kycFileAbsoluteUrl(fileUrl).split('?')[0].toLowerCase();
  return /\.(png|jpe?g|webp|gif|bmp)$/i.test(u);
}

/** Gộp các giấy tờ PENDING theo một khách hàng (một dòng bảng). */
function groupPendingByUserId(rows: UserDocumentDto[]): Map<number, UserDocumentDto[]> {
  const m = new Map<number, UserDocumentDto[]>();
  for (const row of rows) {
    const uid = row.userId;
    if (uid == null) continue;
    const arr = m.get(uid) ?? [];
    arr.push(row);
    m.set(uid, arr);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => a.documentType.localeCompare(b.documentType));
  }
  return m;
}

const ManageKyc = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [rejectUserId, setRejectUserId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['kycPending'],
    queryFn: getPendingKycAdminApi,
  });

  const pendingByUser = useMemo(() => groupPendingByUserId(pending), [pending]);
  const pendingRows = useMemo(() => Array.from(pendingByUser.entries()), [pendingByUser]);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersApi,
  });

  const { data: userAllKyc = [], isLoading: loadUserKyc } = useQuery({
    queryKey: ['adminKycUser', detailUserId],
    queryFn: () => getAdminKycDocumentsByUserIdApi(detailUserId!),
    enabled: detailUserId != null,
  });

  const pendingForDetailUser = useMemo(() => {
    if (detailUserId == null) return [];
    return userAllKyc.filter((d) => d.status === 'PENDING');
  }, [userAllKyc, detailUserId]);

  const invalidateKyc = () => {
    queryClient.invalidateQueries({ queryKey: ['kycPending'] });
    queryClient.invalidateQueries({ queryKey: ['adminKycUser'] });
  };

  const approveAllMutation = useMutation({
    mutationFn: async (docs: UserDocumentDto[]) => {
      for (const d of docs) {
        await approveKycApi(d.id);
      }
    },
    onSuccess: (_, docs) => {
      showToast(docs.length > 1 ? `Đã duyệt ${docs.length} giấy tờ.` : 'Đã duyệt hồ sơ', 'success');
      invalidateKyc();
      setDetailUserId(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Lỗi khi duyệt', 'error');
    },
  });

  const rejectAllMutation = useMutation({
    mutationFn: async ({ docs, note }: { docs: UserDocumentDto[]; note?: string }) => {
      for (const d of docs) {
        await rejectKycApi(d.id, note);
      }
    },
    onSuccess: (_, { docs }) => {
      showToast(docs.length > 1 ? `Đã từ chối ${docs.length} giấy tờ.` : 'Đã từ chối hồ sơ', 'success');
      invalidateKyc();
      setRejectUserId(null);
      setRejectNote('');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Lỗi khi từ chối', 'error');
    },
  });

  const emailFor = (userId?: number) => {
    if (!userId) return '—';
    const u = users.find((x: { id: number }) => x.id === userId);
    return u?.email ?? `#${userId}`;
  };

  const docsForReject = rejectUserId != null ? pendingByUser.get(rejectUserId) ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Duyệt giấy tờ KYC</h1>
          <p className="text-gray-500 text-sm">Mỗi khách một dòng (CCCD + GPLX gộp) — xem ảnh/PDF rồi duyệt hoặc từ chối cả bộ</p>
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
                <th className="text-left p-4 font-semibold text-navy">Khách</th>
                <th className="text-left p-4 font-semibold text-navy">Giấy tờ chờ duyệt</th>
                <th className="text-left p-4 font-semibold text-navy">File</th>
                <th className="text-right p-4 font-semibold text-navy">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingRows.map(([userId, docs]) => (
                <tr key={userId} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="p-4">{emailFor(userId)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {docs.map((d) => (
                        <span
                          key={d.id}
                          className="inline-flex items-center rounded-full bg-amber-50 text-amber-900 px-2.5 py-0.5 text-xs font-medium border border-amber-100"
                        >
                          {d.documentType}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {docs.map((d) => (
                        <a
                          key={d.id}
                          href={kycFileAbsoluteUrl(d.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 hover:underline text-xs"
                        >
                          {d.documentType}: mở tab <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setDetailUserId(userId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-navy/15 text-navy text-xs font-medium hover:bg-navy/5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => approveAllMutation.mutate(docs)}
                      disabled={approveAllMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60"
                    >
                      {approveAllMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Duyệt tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectUserId(userId)}
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

      <Modal
        isOpen={detailUserId != null}
        onClose={() => setDetailUserId(null)}
        title={detailUserId != null ? `KYC — ${emailFor(detailUserId)}` : ''}
        size="lg"
      >
        {detailUserId != null && (
          <div className="space-y-4">
            {loadUserKyc ? (
              <p className="text-sm text-gray-500 py-8 text-center">Đang tải...</p>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  Giấy tờ đang chờ duyệt:{' '}
                  <strong>
                    {pendingForDetailUser.length
                      ? pendingForDetailUser.map((d) => d.documentType).join(', ')
                      : '—'}
                  </strong>
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pendingForDetailUser.map((doc) => {
                    const absUrl = kycFileAbsoluteUrl(doc.fileUrl);
                    return (
                      <div key={doc.id} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                        <p className="text-xs font-semibold text-navy px-3 py-2 border-b border-gray-100 bg-white">
                          {doc.documentType}
                        </p>
                        <div className="min-h-[160px] flex items-center justify-center p-2">
                          {isLikelyImageUrl(doc.fileUrl) ? (
                            <img
                              src={absUrl}
                              alt={doc.documentType}
                              className="max-h-[55vh] w-full object-contain"
                            />
                          ) : (
                            <div className="p-6 text-center text-gray-600 text-sm">
                              <p className="mb-2">PDF hoặc định dạng không xem trực tiếp được.</p>
                              <a
                                href={absUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary font-medium inline-flex items-center gap-1"
                              >
                                Mở / tải file <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {userAllKyc.length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm font-medium text-navy mb-2">Tất cả giấy tờ đã lưu</p>
                    <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
                      {userAllKyc.map((d) => (
                        <li
                          key={d.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <span>
                            <span className="font-medium text-navy">{d.documentType}</span>
                            <span className="text-gray-400 mx-2">·</span>
                            <span className="text-gray-600">{d.status}</span>
                          </span>
                          <a
                            href={kycFileAbsoluteUrl(d.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Mở tab
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDetailUserId(null)} className="btn-outline">
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  const docs = pendingByUser.get(detailUserId) ?? [];
                  if (docs.length) approveAllMutation.mutate(docs);
                }}
                disabled={approveAllMutation.isPending || !pendingByUser.get(detailUserId)?.length}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                Duyệt tất cả
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={rejectUserId != null} onClose={() => setRejectUserId(null)} title="Từ chối hồ sơ" size="sm">
        <p className="text-sm text-gray-600 mb-2">
          Từ chối {docsForReject.length} giấy tờ: {docsForReject.map((d) => d.documentType).join(', ')}
        </p>
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
            onClick={() =>
              rejectUserId != null &&
              rejectAllMutation.mutate({ docs: docsForReject, note: rejectNote })
            }
            disabled={rejectAllMutation.isPending || docsForReject.length === 0}
            className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
          >
            {rejectAllMutation.isPending ? 'Đang gửi...' : 'Xác nhận từ chối'}
          </button>
          <button type="button" onClick={() => setRejectUserId(null)} className="btn-outline flex-1">
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageKyc;
