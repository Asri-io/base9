-- Storage policies for Base9 buckets

-- product-images: public read, service role write
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('design-library', 'design-library', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('custom-designs', 'custom-designs', false) on conflict (id) do nothing;

-- product-images policies
create policy "Public read product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Anyone can upload product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

create policy "Anyone can update product-images"
  on storage.objects for update
  using (bucket_id = 'product-images');

create policy "Anyone can delete product-images"
  on storage.objects for delete
  using (bucket_id = 'product-images');

-- design-library policies
create policy "Public read design-library"
  on storage.objects for select
  using (bucket_id = 'design-library');

create policy "Anyone can upload design-library"
  on storage.objects for insert
  with check (bucket_id = 'design-library');

create policy "Anyone can update design-library"
  on storage.objects for update
  using (bucket_id = 'design-library');

create policy "Anyone can delete design-library"
  on storage.objects for delete
  using (bucket_id = 'design-library');

-- custom-designs: anyone can upload their design, only service role reads
create policy "Anyone can upload custom-designs"
  on storage.objects for insert
  with check (bucket_id = 'custom-designs');

create policy "Service role reads custom-designs"
  on storage.objects for select
  using (bucket_id = 'custom-designs');
