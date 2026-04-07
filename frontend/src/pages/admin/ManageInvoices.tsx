import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Eye, Printer } from 'lucide-react';
import { getAllInvoicesApi } from '../../api/invoices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/helpers';
import type { Invoice } from '../../types';

const ManageInvoices = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: getAllInvoicesApi,
  });

  const getRentalId = (inv: Invoice) => inv.rental?.id ?? inv.rentalId;

  const filtered = invoices.filter((inv) =>
    inv.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
    String(inv.id).includes(search) ||
    String(getRentalId(inv) ?? '').includes(search)
  );

  const totalRevenue = invoices.reduce((s, inv) => s + (inv.totalPrice || 0), 0);

  const handleExportCSV = () => {
    const header = ['ID', 'Số HĐ', 'Mã đơn thuê', 'Tổng tiền', 'Chiết khấu (%)', 'Thuế (%)'];
    const rows = invoices.map((inv) => [
      inv.id,
      inv.invoiceNo || `INV-${inv.id}`,
      getRentalId(inv),
      inv.totalPrice,
      inv.discountRate,
      inv.taxRate,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-navy">Quản lý hóa đơn</h1>
          <p className="text-gray-400 text-sm mt-1">
            {invoices.length} hóa đơn • Tổng: {formatCurrency(totalRevenue)}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <FileText className="w-4 h-4" />
          Xuất CSV
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số hóa đơn, mã đơn thuê..."
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="text-left px-5 py-4 font-medium">#</th>
                  <th className="text-left px-5 py-4 font-medium">Số hóa đơn</th>
                  <th className="text-left px-5 py-4 font-medium">Mã đơn thuê</th>
                  <th className="text-right px-5 py-4 font-medium">Tổng tiền</th>
                  <th className="text-right px-5 py-4 font-medium">Chiết khấu</th>
                  <th className="text-right px-5 py-4 font-medium">Thuế VAT</th>
                  <th className="text-right px-5 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-400">{invoice.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-navy">
                          {invoice.invoiceNo || `INV-${invoice.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">#{getRentalId(invoice)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-primary">
                      {formatCurrency(invoice.totalPrice)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="badge bg-green-100 text-green-700">{invoice.discountRate}%</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="badge bg-blue-100 text-blue-700">{invoice.taxRate}%</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelected(invoice)}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                          title="In hóa đơn"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Không có hóa đơn
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Chi tiết hóa đơn" size="md">
        {selected && (
          <div className="space-y-5">
            <div className="text-center pb-5 border-b">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-heading font-bold text-xl text-navy">
                {selected.invoiceNo || `INV-${selected.id}`}
              </h2>
              <p className="text-gray-400 text-sm">AutoHub Car Rental</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'ID hóa đơn', value: `#${selected.id}` },
                { label: 'Mã đơn thuê', value: `#${getRentalId(selected)}` },
                { label: 'Chiết khấu', value: `${selected.discountRate}%` },
                { label: 'Thuế VAT', value: `${selected.taxRate}%` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className="font-medium text-navy">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 rounded-xl p-4 flex justify-between items-center">
              <span className="font-semibold text-navy">Tổng thanh toán</span>
              <span className="font-heading font-bold text-2xl text-primary">
                {formatCurrency(selected.totalPrice)}
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                <Printer className="w-4 h-4" />
                In hóa đơn
              </button>
              <button onClick={() => setSelected(null)} className="btn-outline flex-1">Đóng</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageInvoices;
