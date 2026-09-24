-- Base9 E-Commerce Schema

-- Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null default 'T-Shirts',
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  front_image text,
  back_image text,
  model_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  stock integer not null default 0,
  slug text not null unique
);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  items jsonb not null default '[]',
  total numeric(10,2) not null,
  status text not null default 'pending',
  notes text,
  custom_design_url text
);

-- Site settings table
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_published_idx on public.products (is_published);
create index if not exists products_featured_idx on public.products (is_featured);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_email_idx on public.orders (customer_email);

-- RLS: Enable Row Level Security
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.site_settings enable row level security;

-- Products: anyone can read published products
create policy "Public can read published products"
  on public.products for select
  using (is_published = true);

-- Products: service role can do everything (admin)
create policy "Service role full access on products"
  on public.products for all
  using (auth.role() = 'service_role');

-- Orders: anyone can insert (place an order)
create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

-- Orders: service role can read/update all orders
create policy "Service role full access on orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- Site settings: public read
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

-- Site settings: service role full access
create policy "Service role full access on site_settings"
  on public.site_settings for all
  using (auth.role() = 'service_role');

-- Storage buckets (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
-- insert into storage.buckets (id, name, public) values ('custom-designs', 'custom-designs', false) on conflict do nothing;
