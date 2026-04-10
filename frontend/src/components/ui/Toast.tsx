/* eslint-disable react-refresh/only-export-components -- useToast dùng chung với ToastProvider */
import { useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${colorMap[toast.type]}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorMap[toast.type]}`} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button onClick={() => remove(toast.id)} className="flex-shrink-0 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
