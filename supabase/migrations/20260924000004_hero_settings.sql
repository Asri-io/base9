-- Seed default site settings for the hero section
insert into public.site_settings (key, value)
values ('hero_product_id', '')
on conflict (key) do nothing;

insert into public.site_settings (key, value)
values ('hero_label', 'Featured Drop')
on conflict (key) do nothing;
