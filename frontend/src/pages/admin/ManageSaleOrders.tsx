import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShoppingBag, CheckCircle } from 'lucide-react';
import { confirmSaleOrderAdminApi, getAllSaleOrdersApi } from '../../api/saleOrders';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, CAR_PLACEHOLDER } from '../../utils/helpers';
import type { SaleOrder } from '../../types';

const ManageSaleOrders = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading } = useQuery<SaleOrder[]>({
    queryKey: ['saleOrders'],
    queryFn: getAllSaleOrdersApi,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmSaleOrderAdminApi(id),
    onSuccess: () => {
      showToast('Đã xác nhận — giao dịch mua hoàn tất', 'success');
      queryClient.invalidateQueries({ queryKey: ['saleOrders'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['mySaleOrders'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Lỗi xác nhận', 'error');
    },
  });

  const q = search.toLowerCase();
  const filtered = orders.filter(
    (o) =>
      o.user?.email?.toLowerCase().includes(q) ||
      String(o.id).includes(q) ||
      `${o.car?.model?.brand?.name} ${o.car?.model?.name}`.toLowerCase().includes(q)
  );
  const sorted = [...filtered].sort((a, b) => b.id - a.id);

  const canConfirm = (o: SaleOrder) => o.orderStatus === 'PENDING_ADMIN_CONFIRM';

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-navy">Quản lý đơn mua xe</h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} đơn</p>
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
                  <th className="text-right px-5 py-4 font-medium">Giá</th>
                  <th className="text-right px-5 py-4 font-medium">TT</th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-400">#{o.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={o.car?.imagePath || CAR_PLACEHOLDER}
                          alt=""
                          className="w-10 h-8 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                          }}
                        />
                        <span className="font-medium text-navy">
                          {o.car?.model?.brand?.name} {o.car?.model?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[160px] truncate">{o.user?.email}</td>
                    <td className="px-5 py-4 text-right font-semibold text-primary">
                      {formatCurrency(o.totalPrice)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="badge text-xs bg-gray-100 text-gray-700">{o.orderStatus}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {canConfirm(o) && (
                        <button
                          type="button"
                          onClick={() => confirmMutation.mutate(o.id)}
                          disabled={confirmMutation.isPending}
                          className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                          title="Xác nhận hoàn tất bán"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sorted.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Không có đơn mua
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSaleOrders;
