create extension if not exists pgcrypto;

create table if not exists categories (
  id serial primary key,
  name text not null unique
);

insert into categories (name) values
('Smartphones'),
('Ordinateurs'),
('Télévisions'),
('Consoles'),
('Audio'),
('Appareils photo'),
('Montres connectées'),
('Tablettes'),
('Autres')
on conflict (name) do nothing;

create table if not exists user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer','seller','admin')),
  created_at timestamptz default now()
);

create table if not exists seller_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_name text,
  description text,
  city text,
  quartier text,
  address text,
  phone text,
  whatsapp text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  category_id int references categories(id),
  name text not null,
  brand text,
  model text,
  description text,
  price bigint not null check (price > 0),
  currency text not null default 'FCFA',
  condition text not null check (condition in ('Neuf','Occasion')) default 'Neuf',
  city text,
  quartier text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists offer_photos (
  id bigserial primary key,
  offer_id uuid not null references offers(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

create table if not exists favorites (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  offer_id uuid references offers(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, offer_id)
);

create table if not exists price_history (
  id bigserial primary key,
  offer_id uuid references offers(id) on delete cascade,
  price bigint not null,
  created_at timestamptz default now()
);

create table if not exists reports (
  id bigserial primary key,
  reporter_id uuid references auth.users(id),
  offer_id uuid references offers(id),
  reason text,
  details text,
  status text default 'open' check(status in ('open','in_review','resolved','dismissed')),
  created_at timestamptz default now()
);

create table if not exists seller_verifications (
  id bigserial primary key,
  seller_id uuid not null references auth.users(id) on delete cascade,
  admin_id uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  documents jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists admin_logs (
  id bigserial primary key,
  admin_id uuid references auth.users(id),
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists search_history (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  created_at timestamptz default now()
);

alter table categories enable row level security;
alter table user_roles enable row level security;
alter table seller_profiles enable row level security;
alter table offers enable row level security;
alter table offer_photos enable row level security;
alter table favorites enable row level security;
alter table price_history enable row level security;
alter table reports enable row level security;
alter table seller_verifications enable row level security;
alter table admin_logs enable row level security;
alter table notifications enable row level security;
alter table search_history enable row level security;

create policy "Categories are viewable by anyone"
on categories for select using (true);

create policy "Users can read their own role"
on user_roles for select using (auth.uid() = user_id);

create policy "Admins can read all roles"
on user_roles for select using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

create policy "Users can insert their own role"
on user_roles for insert with check (auth.uid() = user_id);

create policy "Admins can update roles"
on user_roles for update using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

create policy "Public read seller profiles"
on seller_profiles for select using (true);

create policy "Users can create their own seller profile"
on seller_profiles for insert with check (auth.uid() = id);

create policy "Users can update their own seller profile"
on seller_profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Public read offers"
on offers for select using (true);

create policy "Users can insert their own offers"
on offers for insert with check (auth.uid() = owner);

create policy "Users can update their own offers"
on offers for update using (auth.uid() = owner) with check (auth.uid() = owner);

create policy "Users can delete their own offers"
on offers for delete using (auth.uid() = owner);

create policy "Photos are viewable by anyone"
on offer_photos for select using (true);

create policy "Owner can insert photos for their own offers"
on offer_photos for insert with check (
  exists (
    select 1 from offers o
    where o.id = offer_id and o.owner = auth.uid()
  )
);

create policy "Owner can delete photos of own offer"
on offer_photos for delete using (
  exists (
    select 1 from offers o
    where o.id = offer_id and o.owner = auth.uid()
  )
);

create policy "Users can insert favorites"
on favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete their own favorites"
on favorites for delete using (auth.uid() = user_id);
create policy "Users can see their own favorites"
on favorites for select using (auth.uid() = user_id);

create policy "Users can create reports"
on reports for insert with check (auth.uid() = reporter_id);
create policy "Users can view their own reports"
on reports for select using (auth.uid() = reporter_id);
create policy "Admins can see all reports"
on reports for select using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);
create policy "Admins can update reports"
on reports for update using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

create policy "Admins can read their logs"
on admin_logs for select using (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

create policy "Admins can insert logs"
on admin_logs for insert with check (
  exists (select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin')
);

create policy "Users can view their own notifications"
on notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications"
on notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can access their own history"
on search_history for select using (auth.uid() = user_id);
create policy "Users can insert their own history"
on search_history for insert with check (auth.uid() = user_id);

create or replace function update_offer_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_offer_updated_at on offers;

create trigger trigger_update_offer_updated_at
before update on offers
for each row
execute function update_offer_updated_at();

create index if not exists idx_offers_owner on offers(owner);
create index if not exists idx_offers_city on offers(city);
create index if not exists idx_offers_price on offers(price);
create index if not exists idx_reports_status on reports(status);
