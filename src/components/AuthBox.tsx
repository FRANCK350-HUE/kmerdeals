import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function AuthBox() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage('Connexion réussie');
  };

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Compte créé. Vérifie ton email si la confirmation est activée.');
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-xl font-bold text-white">Connexion / inscription</h2>

      <div className="space-y-3">
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

        <div className="flex gap-3">
          <button onClick={signIn} disabled={loading} className="flex-1 rounded-xl bg-yellow-400 p-3 font-semibold text-slate-900">
            Connexion
          </button>
          <button onClick={signUp} disabled={loading} className="flex-1 rounded-xl border border-slate-700 p-3 font-semibold text-white">
            Inscription
          </button>
        </div>

        {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
      </div>
    </div>
  );
}

export default AuthBox;
