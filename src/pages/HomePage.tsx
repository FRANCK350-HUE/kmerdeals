import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { formatPrice } from '../lib/format';

type FilterState = {
  q: string;
  city: string;
  category: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
};

const initialFilters: FilterState = {
  q: '',
  city: 'Tous',
  category: 'Tous',
  condition: 'Tous',
  minPrice: 0,
  maxPrice: 2000000
};

function HomePage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  async function fetchOffers() {
    setLoading(true);

    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    setOffers(data ?? []);
  }

  useEffect(() => {
    fetchOffers();
  }, []);

  const cityOptions = ['Tous', ...new Set(offers.map((o) => o.city).filter(Boolean))];

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const q = filters.q.trim().toLowerCase();
      const textMatches =
        !q ||
        offer.name.toLowerCase().includes(q) ||
        offer.brand?.toLowerCase().includes(q) ||
        offer.model?.toLowerCase().includes(q);

      const cityMatches = filters.city === 'Tous' || offer.city === filters.city;
      const categoryMatches = filters.category === 'Tous' || offer.category_id === Number(filters.category);
      const conditionMatches = filters.condition === 'Tous' || offer.condition === filters.condition;
      const minMatches = Number(offer.price) >= filters.minPrice;
      const maxMatches = Number(offer.price) <= filters.maxPrice;

      return textMatches && cityMatches && categoryMatches && conditionMatches && minMatches && maxMatches;
    });
  }, [offers, filters]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.22em] text-yellow-400">KmerDeals</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Compare les meilleurs prix électroniques</h1>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Rechercher produit..."
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white md:col-span-2"
          />

          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
          >
            <option value="Tous">Toutes catégories</option>
            <option value="1">Smartphones</option>
            <option value="2">Ordinateurs</option>
            <option value="3">Télévisions</option>
            <option value="4">Consoles</option>
            <option value="5">Audio</option>
            <option value="6">Appareils photo</option>
            <option value="7">Montres connectées</option>
            <option value="8">Tablettes</option>
            <option value="9">Autres</option>
          </select>

          <select
            value={filters.condition}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white"
          >
            <option value="Tous">Tous états</option>
            <option value="Neuf">Neuf</option>
            <option value="Occasion">Occasion</option>
          </select>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Prix min
            <input
              type="range"
              min={0}
              max={2000000}
              step={50000}
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
              className="mt-2 w-full"
            />
            <div className="mt-1 text-yellow-400">{formatPrice(filters.minPrice)}</div>
          </label>

          <label className="text-sm text-slate-300">
            Prix max
            <input
              type="range"
              min={0}
              max={2000000}
              step={50000}
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="mt-2 w-full"
            />
            <div className="mt-1 text-yellow-400">{formatPrice(filters.maxPrice)}</div>
          </label>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Offres</h2>
          <span className="text-sm text-slate-400">{filteredOffers.length} résultats</span>
        </div>

        {loading && <div className="text-slate-300">Chargement…</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOffers.map((offer) => (
            <article key={offer.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img
                src={offer.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'}
                alt={offer.name}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-yellow-300">
                    {offer.category_id || 'Autres'}
                  </span>
                  <span className="text-xs text-slate-400">{offer.city}</span>
                </div>

                <h3 className="text-lg font-bold text-white">{offer.name}</h3>
                <p className="text-sm text-slate-400">{offer.brand} • {offer.model}</p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Prix</p>
                    <p className="text-2xl font-bold text-yellow-400">{formatPrice(Number(offer.price))}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                    {offer.condition}
                  </span>
                </div>

                <Link to={`/offer/${offer.id}`} className="mt-4 block rounded-xl bg-yellow-400 px-4 py-3 text-center font-semibold text-slate-900">
                  Voir l’offre
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
