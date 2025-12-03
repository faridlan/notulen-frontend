/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 space-y-3 flex flex-col items-center">
  {toasts.map((t) => (
    <div
      key={t.id}
      className={`px-4 py-2 rounded-lg shadow text-sm text-white ${
        t.type === "success"
          ? "bg-green-600"
          : t.type === "error"
          ? "bg-red-600"
          : "bg-gray-800"
      }`}
    >
      {t.message}
    </div>
  ))}
</div>

    </ToastContext.Provider>
  );
};
