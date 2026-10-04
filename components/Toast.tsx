'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

export function showToast(message: string, type: ToastType = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('fadrodzak_toast', {
      detail: { message, type },
    })
  );
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: ToastType }>;
      if (!customEvent.detail?.message) return;

      const newToast: ToastData = {
        id: Date.now() + Math.random(),
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'success',
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss setelah 3.2 detik
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3200);
    };

    window.addEventListener('fadrodzak_toast', handleToastEvent);
    return () => {
      window.removeEventListener('fadrodzak_toast', handleToastEvent);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-4 sm:right-6 z-[80] flex flex-col gap-2.5 max-w-[90vw] sm:max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-200 animate-in slide-in-from-top-3 fade-in ${
              isSuccess
                ? 'bg-[#FFFDF9]/95 border-[#E2D7CC] text-[#2C2A29]'
                : isError
                ? 'bg-rose-50/95 border-rose-200 text-rose-800'
                : 'bg-[#FAF8F5]/95 border-[#DECBC0] text-[#2C2A29]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess ? (
                <div className="w-6 h-6 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : isError ? (
                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-100 text-[#C85A32] flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
              )}
              <p className="text-xs font-serif font-medium leading-snug line-clamp-2">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="p-1 text-[#6B625D] hover:text-[#2C2A29] rounded-lg transition shrink-0 cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
