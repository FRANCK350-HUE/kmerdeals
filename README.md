# KmerDeals

Application de comparaison de prix d’appareils électroniques au Cameroun.

## Stack
- React + Vite + TypeScript
- Supabase
- PWA installable

## Étapes de démarrage

### 1) Créer un projet Supabase
- Aller sur https://supabase.com
- Créer un projet
- Récupérer:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY

### 2) Exécuter le SQL
- Ouvrir Supabase → SQL Editor
- Copier le contenu de `supabase/schema.sql`
- Lancer le script

### 3) Créer le bucket Storage
Dans Supabase → Storage, créer un bucket nommé :
- `offer-photos`

### 4) Créer le fichier .env.local
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5) Installer les dépendances
```bash
npm install
```

### 6) Lancer le projet localement
```bash
npm run dev
```

### 7) Ouvrir l’application
- http://localhost:5173

## Déploiement Vercel
1. Pousser le code sur GitHub
2. Sur Vercel : Import project
3. Selectionner le repo
4. Ajouter les variables d’environnement :
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
5. Déployer

## Installer la PWA sur téléphone
- Ouvrir l’URL Vercel dans Chrome
- Ouvrir le menu
- Choisir : Ajouter à l’écran d’accueil

## Donner le rôle admin
```sql
insert into user_roles (user_id, role)
values ('ID_DE_LUTILISATEUR', 'admin')
on conflict (user_id) do update
set role = excluded.role;
```

## Notes
- La version actuelle est une base solide pour un MVP.
- Vendeur, boutique, offres, admin, signalements et produits sont connectés à Supabase.
- La logique avancée (paiement, SMS, vérification documentaire renforcée) est à ajouter dans une étape suivante.
