import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Eye, Search, Receipt } from 'lucide-react';
import { getMyInvoicesApi } from '../../api/invoices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import type { Invoice } from '../../types';

const MyInvoices = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['myInvoices'],
    queryFn: getMyInvoicesApi,
  });

  const getRentalId = (inv: Invoice) => inv.rental?.id ?? inv.rentalId;

  const filtered = invoices.filter((inv) =>
    inv.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
    String(inv.id).includes(search) ||
    String(getRentalId(inv) ?? '').includes(search)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <Receipt className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Hóa đơn của tôi</h1>
        </div>
        <p className="text-gray-400 text-sm">Tổng {invoices.length} hóa đơn</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
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

      {/* Invoice list */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-navy text-lg mb-2">Chưa có hóa đơn</h3>
          <p className="text-gray-400">Hóa đơn sẽ xuất hiện sau khi đơn thuê hoàn tất.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy">#{invoice.invoiceNo || `INV-${invoice.id}`}</p>
                    <p className="text-gray-400 text-sm">Đơn thuê #{getRentalId(invoice)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Tổng tiền</p>
                    <p className="font-bold text-primary text-lg">{formatCurrency(invoice.totalPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Chiết khấu</p>
                    <p className="font-semibold text-green-600">{invoice.discountRate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Thuế VAT</p>
                    <p className="font-semibold text-gray-600">{invoice.taxRate}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelected(invoice)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    In
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Chi tiết hóa đơn" size="md">
        {selected && (
          <div className="space-y-6" id="invoice-print">
            {/* Invoice header */}
            <div className="text-center border-b pb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading font-bold text-2xl text-navy">HÓA ĐƠN</h2>
              <p className="text-gray-500 text-sm mt-1">AutoHub Car Rental</p>
            </div>

            {/* Invoice details */}
            <div className="space-y-3">
              {[
                { label: 'Số hóa đơn', value: selected.invoiceNo || `INV-${selected.id}` },
                { label: 'Mã đơn thuê', value: `#${getRentalId(selected)}` },
                {
                  label: 'Xe',
                  value: selected.rental?.car
                    ? `${selected.rental.car.model?.brand?.name ?? ''} ${selected.rental.car.model?.name ?? ''}`.trim()
                    : 'N/A',
                },
                { label: 'Biển số', value: selected.rental?.car?.plate || 'N/A' },
                { label: 'Ngày nhận xe', value: selected.rental?.startDate ? formatDate(selected.rental.startDate) : 'N/A' },
                { label: 'Ngày trả xe', value: selected.rental?.endDate ? formatDate(selected.rental.endDate) : 'N/A' },
                { label: 'Chiết khấu', value: `${selected.discountRate}%` },
                { label: 'Thuế VAT', value: `${selected.taxRate}%` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{row.label}</span>
                  <span className="font-medium text-navy">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-primary/5 rounded-xl p-4 flex justify-between items-center">
              <span className="font-heading font-semibold text-navy text-lg">Tổng thanh toán</span>
              <span className="font-heading font-bold text-2xl text-primary">{formatCurrency(selected.totalPrice)}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                <Download className="w-4 h-4" />
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

export default MyInvoices;
