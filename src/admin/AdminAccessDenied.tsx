import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminAccessDeniedProps {
  email?: string;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ email }) => {
  return (
    <div className="min-h-screen bg-[#F7F1E5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E0D5] shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-lg font-bold text-[#33261D] mb-2">Доступ запрещён</h1>
        <p className="text-xs text-[#7A695D] leading-relaxed mb-6">
          {email ? <>Аккаунт <span className="font-semibold text-[#33261D]">{email}</span> не</> : 'Этот аккаунт не'}{' '}
          имеет прав администратора Amina Kids.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full py-3 border border-[#E8E0D5] text-[#7A695D] text-xs font-bold rounded-xl hover:bg-[#FAF6F0] hover:text-[#33261D] transition-colors"
        >
          Выйти и попробовать другой аккаунт
        </button>
      </div>
    </div>
  );
};
