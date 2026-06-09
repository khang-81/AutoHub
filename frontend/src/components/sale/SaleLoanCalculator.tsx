import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { calcMonthlyInstallment } from '../../utils/saleCarHelpers';

interface SaleLoanCalculatorProps {
  carPrice: number;
  className?: string;
}

const SaleLoanCalculator = ({ carPrice, className = '' }: SaleLoanCalculatorProps) => {
  const [loanAmount, setLoanAmount] = useState(String(Math.round(carPrice * 0.7)));
  const [months, setMonths] = useState('60');
  const [rate, setRate] = useState('9');
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const principal = Math.max(0, Number(loanAmount.replace(/\D/g, '')) || 0);
    const m = Math.max(1, Number(months) || 1);
    const r = Math.max(0, Number(rate) || 0);
    const monthly = calcMonthlyInstallment(principal, r, m);
    const totalPay = monthly * m;
    const interest = totalPay - principal;
    return { principal, months: m, rate: r, monthly, totalPay, interest };
  }, [loanAmount, months, rate, showResult]);

  return (
    <div className={`sale-panel ${className}`}>
      <h3 className="sale-panel-title flex items-center gap-2">
        <Calculator className="h-5 w-5 text-orange-600" />
        Ước tính vay ngân hàng
      </h3>
      <p className="mb-4 text-xs leading-relaxed text-gray-500">
        Bảng này giúp bạn tính số tiền trả hàng tháng khi vay mua xe trả góp (lãi suất tham khảo).
      </p>

      <div className="space-y-3">
        <div>
          <label className="sale-field-label">Số tiền vay (VNĐ)</label>
          <input
            type="text"
            inputMode="numeric"
            value={Number(loanAmount.replace(/\D/g, '') || 0).toLocaleString('vi-VN')}
            onChange={(e) => setLoanAmount(e.target.value.replace(/\D/g, ''))}
            className="sale-field-input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="sale-field-label">Thời gian vay (tháng)</label>
            <select value={months} onChange={(e) => setMonths(e.target.value)} className="sale-field-input">
              {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                <option key={m} value={m}>
                  {m} tháng
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sale-field-label">Lãi suất (%/năm)</label>
            <input
              type="number"
              min={0}
              max={30}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="sale-field-input"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowResult(true)}
          className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Xem kết quả
        </button>
      </div>

      {showResult && result.principal > 0 && (
        <div className="mt-4 space-y-2 rounded-xl border border-orange-100 bg-orange-50/60 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Trả hàng tháng</span>
            <span className="font-bold text-orange-800">{formatCurrency(result.monthly)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tổng lãi ước tính</span>
            <span>{formatCurrency(result.interest)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tổng thanh toán</span>
            <span>{formatCurrency(result.totalPay)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleLoanCalculator;
