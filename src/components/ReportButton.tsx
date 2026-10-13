import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  offerId: string;
};

function ReportButton({ offerId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Prix anormalement bas');
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Connecte-toi pour signaler une offre.');
      return;
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      offer_id: offerId,
      reason,
      details,
      status: 'open'
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Signalement envoyé.');
    setOpen(false);
    setDetails('');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-red-700 bg-red-900/20 px-4 py-3 font-semibold text-red-200"
      >
        Signaler
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
      <h3 className="font-semibold text-white">Signaler cette offre</h3>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
      >
        <option>Prix anormalement bas</option>
        <option>Annonce dupliquée</option>
        <option>Vendeur suspect</option>
        <option>Informations incorrectes</option>
      </select>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Détails du signalement..."
        className="mt-3 min-h-[100px] w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
      />

      <div className="mt-3 flex gap-3">
        <button onClick={handleSubmit} className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white">
          Envoyer
        </button>
        <button onClick={() => setOpen(false)} className="rounded-xl border border-slate-700 px-4 py-2 text-white">
          Fermer
        </button>
      </div>

      {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
    </div>
  );
}

export default ReportButton;
