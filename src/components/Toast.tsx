import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] inset-x-3 sm:inset-x-auto sm:right-6 z-50 flex flex-col gap-2.5 sm:max-w-sm sm:w-full pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2, ease: 'easeIn' } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-start gap-3 bg-white/95 backdrop-blur-md border border-[#E8E0D5] p-3.5 sm:p-4 rounded-2xl shadow-[0_8px_30px_rgba(74,58,11,0.12)]"
            role="alert"
            aria-live="polite"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'info' ? (
                <div className="w-7 h-7 rounded-full bg-[#FAF6F0] flex items-center justify-center text-[#4A3A0B] border border-[#E8E0D5]">
                  <Info className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#F8EBE8] flex items-center justify-center text-[#E2A69B] border border-[#E2A69B]/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#4A3A0B] leading-tight">{toast.title}</h4>
              <p className="text-[11px] sm:text-xs text-[#7A695D] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="min-w-[40px] min-h-[40px] -mr-1.5 -mt-1.5 flex items-center justify-center text-[#7A695D] hover:text-[#4A3A0B] rounded-xl hover:bg-[#FAF6F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2A69B] shrink-0"
              aria-label="Закрыть уведомление"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
