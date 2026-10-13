import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function VendorDashboard() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    setSellerProfile(data ?? null);
  };

  const fetchOffers = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('owner', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setOffers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
    fetchOffers();
  }, []);

  const createOffer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('offers').insert({
      owner: user.id,
      category_id: 1,
      name: 'Annonce test vendeur',
      brand: 'Samsung',
      model: 'Galaxy A15',
      description: 'Annonce créée depuis le dashboard vendeur',
      price: 175000,
      currency: 'FCFA',
      condition: 'Neuf',
      city: 'Yaoundé',
      quartier: 'Mokolo',
      is_available: true
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Annonce créée');
    fetchOffers();
  };

  const updateOffer = async (id: string) => {
    const { error } = await supabase
      .from('offers')
      .update({
        name: 'Produit mis à jour',
        price: 190000,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Annonce mise à jour');
    fetchOffers();
  };

  const deleteOffer = async (id: string) => {
    const { error } = await supabase.from('offers').delete().eq('id', id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Annonce supprimée');
    fetchOffers();
  };

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">Dashboard vendeur</p>
          <h1 className="text-3xl font-bold text-white">Mes annonces</h1>
        </div>

        <button onClick={createOffer} className="rounded-xl bg-yellow-400 px-4 py-2 font-semibold text-slate-900">
          Nouvelle annonce
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-bold text-white">Profil boutique</h2>

        {sellerProfile ? (
          <div className="mt-3 text-sm text-slate-300">
            <p>Nom: {sellerProfile.shop_name || 'Non défini'}</p>
            <p>Ville: {sellerProfile.city || 'Non défini'}</p>
            <p>Quartier: {sellerProfile.quartier || 'Non défini'}</p>
            <p>Téléphone: {sellerProfile.phone || 'Non défini'}</p>
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-400">
            Aucun profil boutique enregistré. Crée-le dans la page Profil.
          </div>
        )}
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-slate-300">Chargement…</div>
      ) : (
        <div className="space-y-3">
          {offers.length === 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-slate-300">
              Aucune annonce pour le moment.
            </div>
          )}

          {offers.map((offer) => (
            <div key={offer.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{offer.name}</div>
                <div className="text-sm text-slate-300">{offer.brand} • {offer.model} • {offer.city}</div>
                <div className="mt-1 text-sm text-slate-400">{offer.price.toLocaleString('fr-CM')} FCFA • {offer.condition}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                  {offer.is_available ? 'Disponible' : 'Indisponible'}
                </span>
                <button onClick={() => updateOffer(offer.id)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                  Modifier
                </button>
                <button onClick={() => deleteOffer(offer.id)} className="rounded-lg border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default VendorDashboard;
