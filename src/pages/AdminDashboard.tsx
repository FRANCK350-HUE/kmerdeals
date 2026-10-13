import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsAdmin(Boolean(data && data.role === 'admin'));
    setLoading(false);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setReports(data ?? []);
  };

  useEffect(() => {
    checkAdmin();
    fetchReports();
  }, []);

  const markStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(error);
      return;
    }

    fetchReports();
  };

  if (loading) {
    return <div className="p-6 text-white">Vérification accès admin...</div>;
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-red-700 bg-red-900/20 p-5 text-red-200">
          Accès refusé. Vous n’êtes pas administrateur.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">Admin</p>
        <h1 className="text-3xl font-bold text-white">Modération</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Total signalements</p>
          <p className="mt-2 text-3xl font-bold text-white">{reports.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Ouverts</p>
          <p className="mt-2 text-3xl font-bold text-white">{reports.filter((r) => r.status === 'open').length}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Résolus</p>
          <p className="mt-2 text-3xl font-bold text-white">{reports.filter((r) => r.status === 'resolved').length}</p>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-4 text-xl font-bold text-white">Signalements</h2>

        <div className="space-y-3">
          {reports.length === 0 && <div className="text-slate-300">Aucun signalement.</div>}

          {reports.map((report) => (
            <div key={report.id} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-white">Raison: {report.reason}</div>
                  <div className="text-sm text-slate-400">{report.details || 'Aucun détail'}</div>
                  <div className="mt-1 text-xs text-slate-500">Statut: {report.status}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => markStatus(report.id, 'in_review')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-white">
                    En examen
                  </button>
                  <button onClick={() => markStatus(report.id, 'resolved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">
                    Résolu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
