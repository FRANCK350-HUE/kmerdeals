import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage('Compte créé. Vérifie ton email si la confirmation est activée.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }

        setMessage('Connexion réussie.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          {mode === 'login' ? 'Accédez à votre compte' : 'Créez votre compte'}
        </h1>

        <div className="mt-5 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 disabled:opacity-60"
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-semibold text-white"
          >
            {mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}
          </button>

          {message && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
