-- Supabase Storage policy for the public product-images bucket.
-- The bucket itself should be PUBLIC so the storefront can display images.
-- Only authenticated users listed in public.admin_users may upload.

drop policy if exists "Admins can upload product images" on storage.objects;

create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);
