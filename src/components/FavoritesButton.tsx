import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  offerId: string;
};

function FavoritesButton({ offerId }: Props) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('offer_id', offerId)
      .maybeSingle();

    setIsFavorite(Boolean(data));
  };

  useEffect(() => {
    load();
  }, [offerId]);

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('offer_id', offerId);

      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        offer_id: offerId
      });
      setIsFavorite(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
    >
      {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    </button>
  );
}

export default FavoritesButton;
