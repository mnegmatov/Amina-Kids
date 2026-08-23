import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError('Неверный email или пароль.');
    }
    // On success, useAdminAuth's onAuthStateChange listener picks up the
    // new session automatically and AdminApp re-renders — no navigation
    // call needed here.
  };

  return (
    <div className="min-h-screen bg-[#F7F1E5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E0D5] shadow-sm p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F8EBE8] text-[#E2A69B] flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#33261D]">Amina Kids Admin</h1>
          <p className="text-xs text-[#7A695D] mt-1">Вход только для администраторов</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#7A695D] uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aminakids.tj"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] text-sm text-[#33261D] focus:outline-none focus:border-[#E2A69B] transition-colors"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#7A695D] uppercase tracking-wide mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E0D5] text-sm text-[#33261D] focus:outline-none focus:border-[#E2A69B] transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#4A3A0B] text-white text-xs font-bold rounded-xl hover:bg-[#2C2008] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};
