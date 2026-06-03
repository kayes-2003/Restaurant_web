-- ============================================================
--  La Maison Restaurant — Full DB Migration
--  Run: supabase db push   OR   paste in Supabase SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── TABLES ──────────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text not null,
  role       text not null default 'customer'
               check (role in ('admin', 'customer')),
  created_at timestamptz default now()
);

create table if not exists public.menu_items (
  id            uuid default uuid_generate_v4() primary key,
  name          text not null,
  description   text default '',
  price         numeric(10,2) not null check (price >= 0),
  category      text not null default 'Other',
  image_url     text default '🍽️',
  offer_percent int  not null default 0 check (offer_percent between 0 and 99),
  available     boolean not null default true,
  created_at    timestamptz default now()
);

create table if not exists public.cart_items (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  menu_item_id uuid references public.menu_items on delete cascade not null,
  quantity     int  not null default 1 check (quantity > 0),
  created_at   timestamptz default now(),
  unique (user_id, menu_item_id)
);

-- ── RLS ─────────────────────────────────────────────────────

alter table public.profiles   enable row level security;
alter table public.menu_items enable row level security;
alter table public.cart_items enable row level security;

-- Profiles
drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Menu items: public read, admin write
drop policy if exists "menu_select_all"    on public.menu_items;
drop policy if exists "menu_insert_admin"  on public.menu_items;
drop policy if exists "menu_update_admin"  on public.menu_items;
drop policy if exists "menu_delete_admin"  on public.menu_items;
create policy "menu_select_all"   on public.menu_items for select using (true);
create policy "menu_insert_admin" on public.menu_items for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "menu_update_admin" on public.menu_items for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "menu_delete_admin" on public.menu_items for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Cart: each user owns their own rows
drop policy if exists "cart_own" on public.cart_items;
create policy "cart_own" on public.cart_items for all using (auth.uid() = user_id);

-- ── TRIGGER: auto-create profile on signup ───────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── SEED DATA ────────────────────────────────────────────────

insert into public.menu_items (name, description, price, category, image_url, offer_percent) values
  ('Margherita Pizza',    'Classic tomato base, fresh mozzarella & basil',         12.99,'Pizza',   '🍕',0),
  ('Pepperoni Feast',     'Double pepperoni, extra mozzarella, oregano',            15.99,'Pizza',   '🍕',10),
  ('BBQ Chicken Burger',  'Smoky BBQ sauce, crispy chicken thigh, coleslaw',        11.50,'Burgers', '🍔',0),
  ('Beef Smash Burger',   'Double smash patty, aged cheddar, dill pickles',         13.99,'Burgers', '🍔',15),
  ('Caesar Salad',        'Romaine, house croutons, shaved parmesan, anchovy',       8.99,'Salads',  '🥗',0),
  ('Greek Salad',         'Kalamata olives, creamy feta, cucumber, ripe tomato',     9.50,'Salads',  '🥗',5),
  ('Spaghetti Carbonara', 'Guanciale, egg yolk, aged pecorino, black pepper',       14.00,'Pasta',   '🍝',0),
  ('Penne Arrabbiata',    'San Marzano tomato, garlic, bird''s eye chili, basil',   10.50,'Pasta',   '🍝',20),
  ('Mango Lassi',         'Alphonso mango, chilled yogurt, hint of cardamom',        4.50,'Drinks',  '🥭',0),
  ('Espresso',            'Double-shot Italian roast, crema on top',                3.00,'Drinks',  '☕',0),
  ('Tiramisu',            'Mascarpone cream, espresso-soaked ladyfingers, cocoa',    6.50,'Desserts','🍮',0),
  ('Lava Cake',           'Warm dark chocolate fondant, vanilla ice cream',          7.00,'Desserts','🍫',12)
on conflict do nothing;
