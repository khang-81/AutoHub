import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Users, Shield } from 'lucide-react';
import { getAllUsersApi, deleteUserApi } from '../../api/users';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ManageUsers = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: getAllUsersApi });

  const deleteMutation = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => { showToast('Đã xóa người dùng', 'success'); queryClient.invalidateQueries({ queryKey: ['users'] }); setDeleteId(null); },
    onError: () => showToast('Lỗi khi xóa', 'error'),
  });

  const usersArr = Array.isArray(users) ? users : [];
  const filtered = usersArr.filter((u: { email?: string }) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Quản lý người dùng</h1>
          <p className="text-gray-400 text-sm mt-1">{usersArr.length} tài khoản</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo email..." className="input-field pl-12" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="text-left px-5 py-4 font-medium">#</th>
                  <th className="text-left px-5 py-4 font-medium">Email</th>
                  <th className="text-left px-5 py-4 font-medium">Vai trò</th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user: { id: number; email: string; authorities?: { authority: string }[] }) => {
                  const isAdmin = user.authorities?.some((a) => a.authority?.toLowerCase().includes('admin'));
                  return (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-400">{user.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">{user.email?.[0]?.toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-navy">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs flex items-center gap-1 w-fit ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'}`}>
                          {isAdmin && <Shield className="w-3 h-3" />}
                          {isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => setDeleteId(user.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Không tìm thấy người dùng
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Xóa người dùng" size="sm">
        <p className="text-gray-600 mb-5">Bạn có chắc muốn xóa tài khoản người dùng này? Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">Xóa</button>
          <button onClick={() => setDeleteId(null)} className="btn-outline">Hủy</button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;
