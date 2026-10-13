import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { formatPrice } from '../lib/format';
import FavoritesButton from '../components/FavoritesButton';
import ReportButton from '../components/ReportButton';

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  const loadOffer = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setOffer(data);

    const { data: photoData } = await supabase
      .from('offer_photos')
      .select('*')
      .eq('offer_id', id);

    setPhotos(photoData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadOffer();
  }, [id]);

  if (loading || !offer) {
    return <div className="p-6 text-white">Chargement…</div>;
  }

  const phone = offer.phone || '+237000000000';
  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Bonjour, je suis intéressé par cette offre : ' + offer.name
  )}`;

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <img
            src={photos[0]?.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'}
            alt={offer.name}
            className="h-80 w-full object-cover"
          />

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-yellow-300">
                {offer.category_id}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                {offer.condition}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white">{offer.name}</h1>
            <p className="mt-1 text-sm text-slate-400">{offer.brand} • {offer.model}</p>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prix</p>
              <div className="mt-2 text-4xl font-bold text-yellow-400">
                {formatPrice(Number(offer.price))}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white">Description</h2>
              <p className="mt-2 text-slate-300">{offer.description}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white">Informations</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                <li>Ville: {offer.city}</li>
                <li>Quartier: {offer.quartier}</li>
                <li>Disponible : {offer.is_available ? 'Oui' : 'Non'}</li>
                <li>Mis à jour : {new Date(offer.updated_at).toLocaleDateString('fr-FR')}</li>
              </ul>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-bold text-white">Contact vendeur</h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Boutique</div>
              <div className="mt-1 font-semibold text-white">{offer.seller_name || 'Boutique'}</div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Téléphone</div>
              <div className="mt-1 font-semibold text-white">{phone}</div>
            </div>

            <a href={`tel:${phone}`} className="block rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white">
              Appeler
            </a>

            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block rounded-xl bg-green-600 px-4 py-3 text-center font-semibold text-white">
              WhatsApp
            </a>

            <FavoritesButton offerId={id ?? ''} />
            <ReportButton offerId={id ?? ''} />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default ProductPage;
