import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SellerSetupPage from './pages/SellerSetupPage';
import CreateOfferPage from './pages/CreateOfferPage';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Vérification de session...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    load();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-slate-900">
              K
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-400">KmerDeals</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Compare. Choisis. Achète mieux.
              </div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/" className="rounded-full border border-slate-700 px-3 py-2 hover:bg-slate-800">Accueil</Link>
            <Link to="/vendeur" className="rounded-full border border-slate-700 px-3 py-2 hover:bg-slate-800">Vendeur</Link>
            <Link to="/seller-setup" className="rounded-full border border-slate-700 px-3 py-2 hover:bg-slate-800">Profil</Link>
            <Link to="/new-offer" className="rounded-full border border-slate-700 px-3 py-2 hover:bg-slate-800">Publier</Link>
            <Link to="/admin" className="rounded-full border border-slate-700 px-3 py-2 hover:bg-slate-800">Admin</Link>

            {loading ? (
              <span className="rounded-full border border-slate-700 px-3 py-2 text-slate-400">...</span>
            ) : session ? (
              <>
                <span className="rounded-full border border-emerald-700 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  {session.user.email}
                </span>
                <button onClick={handleSignOut} className="rounded-full border border-slate-700 px-3 py-2 hover:bg-slate-800">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-yellow-400 px-3 py-2 font-semibold text-slate-900">
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/offer/:id" element={<ProductPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/vendeur" element={<ProtectedRoute><VendorDashboard /></ProtectedRoute>} />
        <Route path="/seller-setup" element={<ProtectedRoute><SellerSetupPage /></ProtectedRoute>} />
        <Route path="/new-offer" element={<ProtectedRoute><CreateOfferPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
