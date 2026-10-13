import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setRole(data.role);
      } else {
        setRole('buyer');
      }

      setLoading(false);
    };

    loadRole();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setRole(null);
        setLoading(false);
        return;
      }
      loadRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading };
}
