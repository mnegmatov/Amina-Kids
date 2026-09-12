import React, { useState, useEffect } from 'react';
import { X, Ruler, Sparkles, UserCheck } from 'lucide-react';
import { useBodyScrollLock } from '../utils/useBodyScrollLock';
import { AnimatePresence, motion } from 'motion/react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SizeRow {
  size: string;
  age: string;
  height: string;
  chest: string;
  waist?: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'baby' | 'kids'>('kids');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useBodyScrollLock(isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const babySizes: SizeRow[] = [
    { size: '56', age: '0 - 1 мес', height: '51 - 56 см', chest: '36 - 38 см' },
    { size: '62', age: '1 - 3 мес', height: '57 - 62 см', chest: '39 - 41 см' },
    { size: '68', age: '3 - 6 мес', height: '63 - 68 см', chest: '42 - 44 см' },
    { size: '74', age: '6 - 9 мес', height: '69 - 74 см', chest: '45 - 47 см' },
    { size: '80', age: '9 - 12 мес', height: '75 - 80 см', chest: '48 - 49 см' },
    { size: '86', age: '12 - 18 мес', height: '81 - 86 см', chest: '50 - 51 см' },
  ];

  const kidsSizes: SizeRow[] = [
    { size: '92', age: '2 года', height: '87 - 92 см', chest: '51 - 53 см', waist: '49 - 51 см' },
    { size: '98', age: '3 года', height: '93 - 98 см', chest: '53 - 55 см', waist: '51 - 52 см' },
    { size: '104', age: '4 года', height: '99 - 104 см', chest: '55 - 57 см', waist: '52 - 53 см' },
    { size: '110', age: '5 лет', height: '105 - 110 см', chest: '57 - 59 см', waist: '53 - 54 см' },
    { size: '116', age: '6 лет', height: '111 - 116 см', chest: '59 - 61 см', waist: '54 - 55 см' },
    { size: '122', age: '7 лет', height: '117 - 122 см', chest: '61 - 63 см', waist: '55 - 56 см' },
    { size: '128', age: '8 лет', height: '123 - 128 см', chest: '63 - 65 см', waist: '56 - 58 см' },
  ];

  const currentSizes = activeTab === 'baby' ? babySizes : kidsSizes;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-chart-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2C2008]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col border-t sm:border border-[#E8E0D5] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E8E0D5] bg-[#FAF6F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F8EBE8] text-[#4A3A0B] rounded-2xl flex items-center justify-center border border-[#E2A69B]/40 shrink-0">
                  <Ruler className="w-5 h-5 text-[#E2A69B]" />
                </div>
                <div>
                  <h3 id="size-chart-title" className="text-base sm:text-lg font-bold text-[#4A3A0B]">
                    Таблица размеров AMINA KIDS
                  </h3>
                  <p className="text-xs text-[#7A695D]">Гид по правильному подбору одежды</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-[#7A695D] hover:text-[#4A3A0B] hover:bg-white/80 rounded-full transition-colors active:scale-90 cursor-pointer"
                aria-label="Закрыть таблицу размеров"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Category Tabs & View Switcher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#E8E0D5] w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('baby')}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer ${
                      activeTab === 'baby'
                        ? 'bg-white text-[#4A3A0B] shadow-sm'
                        : 'text-[#7A695D] hover:text-[#4A3A0B]'
                    }`}
                  >
                    Малыши (0–18 мес)
                  </button>
                  <button
                    onClick={() => setActiveTab('kids')}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer ${
                      activeTab === 'kids'
                        ? 'bg-white text-[#4A3A0B] shadow-sm'
                        : 'text-[#7A695D] hover:text-[#4A3A0B]'
                    }`}
                  >
                    Дети (2–8 лет)
                  </button>
                </div>

                {/* Mobile View Toggle (Card grid vs Table) */}
                <div className="sm:hidden flex items-center justify-end gap-2 text-xs text-[#7A695D]">
                  <span className="text-[11px]">Вид:</span>
                  <button
                    onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] text-[11px] font-bold text-[#4A3A0B] active:scale-95 transition-transform"
                  >
                    {viewMode === 'table' ? 'Карточками' : 'Таблицей'}
                  </button>
                </div>
              </div>

              {/* Cards View for Mobile (if enabled) */}
              {viewMode === 'cards' ? (
                <div className="grid grid-cols-2 gap-2 sm:hidden">
                  {currentSizes.map((item) => (
                    <div
                      key={item.size}
                      className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-[#E2A69B]">{item.size}</span>
                        <span className="text-[10px] font-bold text-[#7A695D] bg-white px-2 py-0.5 rounded-md border border-[#E8E0D5]">
                          {item.age}
                        </span>
                      </div>
                      <div className="text-[11px] space-y-0.5 text-[#4A3A0B]">
                        <div><span className="text-[#7A695D]">Рост:</span> {item.height}</div>
                        <div><span className="text-[#7A695D]">Грудь:</span> {item.chest}</div>
                        {item.waist && <div><span className="text-[#7A695D]">Талия:</span> {item.waist}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Responsive Table View */
                <div className="overflow-x-auto rounded-2xl border border-[#E8E0D5] scrollbar-thin">
                  <table className="w-full text-left text-xs min-w-[340px]">
                    <thead className="bg-[#FAF6F0] text-[#4A3A0B] font-bold border-b border-[#E8E0D5]">
                      <tr>
                        <th className="py-3 px-3.5 whitespace-nowrap">Размер (Рост)</th>
                        <th className="py-3 px-3 whitespace-nowrap">Возраст</th>
                        <th className="py-3 px-3 whitespace-nowrap">Рост (см)</th>
                        <th className="py-3 px-3 whitespace-nowrap">Обхват груди</th>
                        {activeTab === 'kids' && <th className="py-3 px-3 whitespace-nowrap">Обхват талии</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E0D5] text-[#4A3A0B]">
                      {currentSizes.map((item, idx) => (
                        <tr key={item.size} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF6F0]/40'}>
                          <td className="py-2.5 px-3.5 font-extrabold text-[#E2A69B] whitespace-nowrap">
                            {item.size}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[#7A695D] font-medium">{item.age}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-medium">{item.height}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-medium">{item.chest}</td>
                          {activeTab === 'kids' && (
                            <td className="py-2.5 px-3 whitespace-nowrap font-medium">{item.waist}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Advice Block */}
              <div className="p-3.5 sm:p-4 bg-[#F8EBE8] rounded-2xl text-xs text-[#4A3A0B] flex items-start gap-3 border border-[#E2A69B]/40">
                <Sparkles className="w-4 h-4 text-[#E2A69B] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#4A3A0B] block">Совет по выбору размера:</span>
                  <p className="text-[11px] sm:text-xs text-[#4A3A0B]/90 leading-relaxed">
                    Если параметры ребенка находятся на границе двух размеров, мы рекомендуем выбирать больший размер для свободы движений и комфорта при носке.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 border-t border-[#E8E0D5] bg-[#FAF6F0] flex items-center justify-between pb-safe">
              <div className="flex items-center gap-1.5 text-[11px] text-[#7A695D]">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Соответствует ГОСТ стандартам</span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#4A3A0B] text-white text-xs font-bold rounded-xl hover:bg-[#2C2008] active:scale-[0.98] transition-all cursor-pointer min-h-[42px]"
              >
                Понятно
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


