import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const categories = [
  { id: 1, label: 'Smartphones' },
  { id: 2, label: 'Ordinateurs' },
  { id: 3, label: 'Télévisions' },
  { id: 4, label: 'Consoles' },
  { id: 5, label: 'Audio' },
  { id: 6, label: 'Appareils photo' },
  { id: 7, label: 'Montres connectées' },
  { id: 8, label: 'Tablettes' },
  { id: 9, label: 'Autres' }
];

function CreateOfferPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('150000');
  const [condition, setCondition] = useState('Neuf');
  const [city, setCity] = useState('Yaoundé');
  const [quartier, setQuartier] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const createOffer = async () => {
    if (!user) {
      setMessage('Tu dois être connecté pour publier une annonce.');
      return;
    }

    setLoading(true);

    const { data: insertData, error: insertError } = await supabase
      .from('offers')
      .insert({
        owner: user.id,
        category_id: categoryId,
        name,
        brand,
        model,
        description,
        price: Number(price),
        currency: 'FCFA',
        condition,
        city,
        quartier,
        is_available: true,
        is_featured: false
      })
      .select()
      .single();

    if (insertError) {
      setLoading(false);
      setMessage(insertError.message);
      return;
    }

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('offer-photos')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) {
        setLoading(false);
        setMessage(uploadError.message);
        return;
      }

      const publicUrl = supabase.storage.from('offer-photos').getPublicUrl(uploadData.path).data.publicUrl;

      await supabase.from('offer_photos').insert({
        offer_id: insertData.id,
        image_url: publicUrl
      });
    }

    setLoading(false);
    setMessage('Annonce publiée avec succès.');
    setName('');
    setBrand('');
    setModel('');
    setDescription('');
    setPrice('150000');
    setCity('Yaoundé');
    setQuartier('');
    setCategoryId(1);
    setImageFile(null);
  };

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">Vendeur</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Publier une annonce</h1>

        {!user && (
          <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
            Connecte-toi pour publier.
          </div>
        )}

        <div className="mt-6 grid gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du produit"
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Marque"
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Modèle"
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="min-h-[120px] rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Prix en FCFA"
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            />

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="Neuf">Neuf</option>
              <option value="Occasion">Occasion</option>
            </select>
          </div>

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

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          />

          <button
            onClick={createOffer}
            disabled={loading || !user}
            className="rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 disabled:opacity-50"
          >
            {loading ? 'Publication...' : 'Publier l’annonce'}
          </button>

          {message && <div className="text-sm text-slate-300">{message}</div>}
        </div>
      </div>
    </main>
  );
}

export default CreateOfferPage;
