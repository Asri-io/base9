-- Designs table: admin-uploaded design options buyers can pick from
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  description text,
  image_url text not null,
  category text not null default 'All',
  tags text[] not null default '{}',
  is_active boolean not null default true
);

create index if not exists designs_active_idx on public.designs (is_active);
create index if not exists designs_category_idx on public.designs (category);

alter table public.designs enable row level security;

-- Anyone can read active designs
create policy "Public can read active designs"
  on public.designs for select
  using (is_active = true);

-- Service role full access
create policy "Service role full access on designs"
  on public.designs for all
  using (auth.role() = 'service_role');

-- Add selected_design_id and selected_design_url to orders
alter table public.orders
  add column if not exists selected_design_id uuid references public.designs(id),
  add column if not exists selected_design_url text,
  add column if not exists whatsapp text,
  add column if not exists address text;
