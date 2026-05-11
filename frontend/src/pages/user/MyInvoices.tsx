import { useQuery } from '@tanstack/react-query';
import { FileText, Printer } from 'lucide-react';
import { getMyInvoicesApi } from '../../api/invoices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/helpers';
import type { Invoice } from '../../types';

const MyInvoices = () => {
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['myInvoices'],
    queryFn: getMyInvoicesApi,
  });

  const handlePrint = (inv: Invoice) => {
    const carLabel = inv.rental?.car
      ? `${inv.rental.car.model?.brand?.name || ''} ${inv.rental.car.model?.name || ''}`
      : inv.saleOrder?.car
      ? `${inv.saleOrder.car.model?.brand?.name || ''} ${inv.saleOrder.car.model?.name || ''}`
      : '';
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Hóa đơn ${inv.invoiceNo}</title>
<style>
body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 20px}
h1{font-size:22px;color:#1B2A4A;border-bottom:2px solid #C9A227;padding-bottom:10px}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee}
th{background:#f8f8f8;font-weight:600}
.total{font-size:18px;font-weight:bold;color:#C9A227}
.footer{margin-top:40px;font-size:12px;color:#888;text-align:center}
@media print{body{margin:0;padding:20px}}
</style></head><body>
<h1>HÓA ĐƠN #${inv.invoiceNo}</h1>
<table>
<tr><th>Mã hóa đơn</th><td>${inv.invoiceNo}</td></tr>
<tr><th>Ngày tạo</th><td>${inv.createdDate ? formatDate(inv.createdDate) : '-'}</td></tr>
<tr><th>Xe</th><td>${carLabel}</td></tr>
<tr><th>Giảm giá</th><td>${inv.discountRate}%</td></tr>
<tr><th>Thuế</th><td>${inv.taxRate}%</td></tr>
<tr><th>Tổng tiền</th><td class="total">${formatCurrency(inv.totalPrice)}</td></tr>
</table>
<div class="footer">AutoHub &mdash; Cảm ơn quý khách đã sử dụng dịch vụ.</div>
</body></html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 300);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Hóa đơn của tôi</h1>
        </div>
        <p className="text-gray-400 text-sm">Danh sách hóa đơn từ các đơn thuê và mua xe của bạn</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8"><LoadingSpinner /></div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-navy text-lg mb-2">Chưa có hóa đơn</h3>
          <p className="text-gray-400">Hóa đơn sẽ được tạo khi đơn hàng hoàn tất.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-500">
                  <th className="text-left px-5 py-4 font-medium">Mã HĐ</th>
                  <th className="text-left px-5 py-4 font-medium">Ngày</th>
                  <th className="text-left px-5 py-4 font-medium">Xe</th>
                  <th className="text-right px-5 py-4 font-medium">Tổng tiền</th>
                  <th className="text-right px-5 py-4 font-medium">In</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: Invoice) => {
                  const carLabel = inv.rental?.car
                    ? `${inv.rental.car.model?.brand?.name || ''} ${inv.rental.car.model?.name || ''}`
                    : inv.saleOrder?.car
                    ? `${inv.saleOrder.car.model?.brand?.name || ''} ${inv.saleOrder.car.model?.name || ''}`
                    : '-';
                  return (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-navy">{inv.invoiceNo}</td>
                      <td className="px-5 py-4 text-gray-600">{inv.createdDate ? formatDate(inv.createdDate) : '-'}</td>
                      <td className="px-5 py-4 text-gray-700">{carLabel}</td>
                      <td className="px-5 py-4 text-right font-semibold text-primary">{formatCurrency(inv.totalPrice)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handlePrint(inv)}
                          className="p-2 rounded-lg text-navy hover:bg-gray-100 transition-colors"
                          title="In hóa đơn"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInvoices;
