import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function SellerSetupPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState('Yaoundé');
  const [quartier, setQuartier] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const saveProfile = async () => {
    if (!user) {
      setMessage('Tu dois être connecté pour créer un profil vendeur.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('seller_profiles').upsert({
      id: user.id,
      shop_name: shopName,
      city,
      quartier,
      phone,
      whatsapp,
      description
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Profil vendeur enregistré.');
  };

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">Vendeur</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Créer mon profil boutique</h1>

        {!user && (
          <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
            Connecte-toi d’abord pour créer un profil vendeur.
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Nom de la boutique"
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la boutique"
            className="min-h-[120px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ville"
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />
            <input
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              placeholder="Quartier"
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp"
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={loading || !user}
            className="rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
          </button>

          {message && <div className="text-sm text-slate-300">{message}</div>}
        </div>
      </div>
    </main>
  );
}

export default SellerSetupPage;
