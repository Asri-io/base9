-- More site settings for admin-editable content
insert into public.site_settings (key, value) values
  ('announcement_text', 'Hoodies dropping soon — Bulk orders available now · 5+ pieces get special pricing'),
  ('announcement_link', '/bulk-orders'),
  ('announcement_enabled', 'true'),
  ('whatsapp_number', ''),
  ('instagram_url', ''),
  ('twitter_url', ''),
  ('tiktok_url', ''),
  ('contact_email', 'hello@base9.co'),
  ('order_notification_whatsapp', '')
on conflict (key) do nothing;
