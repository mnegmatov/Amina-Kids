import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AdminAuthStatus =
  | 'loading'
  | 'signed-out'
  | 'forbidden'
  | 'admin';

interface AdminAuthState {
  status: AdminAuthStatus;
  user: User | null;
}

/**
 * Tracks the current Supabase Auth session and checks whether that user
 * is present in `public.admin_users`. Access to /admin is only granted
 * when status === 'admin'.
 *
 * Relies entirely on the existing "Admins can view own admin record" RLS
 * policy — a non-admin authenticated user simply gets an empty result
 * back (not an error), which this hook treats as 'forbidden'.
 */
export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ status: 'loading', user: null });

  useEffect(() => {
    let isMounted = true;

    async function checkAdminMembership(sessionUser: User | null) {
      if (!sessionUser) {
        if (isMounted) setState({ status: 'signed-out', user: null });
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error('[Admin] Failed to check admin_users:', error);
        setState({ status: 'forbidden', user: sessionUser });
        return;
      }

      setState({ status: data ? 'admin' : 'forbidden', user: sessionUser });
    }

    supabase.auth.getSession().then(({ data }) => {
      checkAdminMembership(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setState((prev) => ({ status: 'loading', user: prev.user }));
      checkAdminMembership(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
