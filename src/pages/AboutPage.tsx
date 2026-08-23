import React from 'react';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#E2A69B]">О бренде</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#4A3A0B]">История AMINA KIDS</h1>
        <p className="text-xs sm:text-sm text-[#7A695D] leading-relaxed">
          Бренд основан мамой, которая искала для своего ребенка исключительно мягкую, дышащую и нежную одежду из чистого гипоаллергенного хлопкового муслина.
        </p>
      </div>

      {/* Philosophy Banner */}
      <div className="bg-[#F7F1E5] rounded-3xl p-8 sm:p-12 border border-[#E8E0D5] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-[#4A3A0B]">Наша философия — Нежность & Качество</h2>
          <p className="text-xs text-[#7A695D] leading-relaxed">
            Каждая модель AMINA KIDS создается с мысли о комфорте ребенка во время активных игр и отдыха. Мы отказались от грубых синтетических тканей, плотных колючих швов и неудобных замков.
          </p>
          <div className="space-y-2 text-xs text-[#33261D] font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E2A69B]" /> 100% двухслойный хлопковый муслин
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E2A69B]" /> Безопасные европейские эко-красители
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#E2A69B]" /> Сертифицировано для детей 0+
            </div>
          </div>
        </div>

        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
          <img
            src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800"
            alt="AMINA KIDS производство"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
