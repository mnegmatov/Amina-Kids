-- ============================================================================
-- #5 — Storage review (product-images bucket)
-- ============================================================================
-- Current state (from supabase-storage-policies.sql), confirmed correct:
--   - bucket is PUBLIC → anyone can read/view images (needed for the shop)
--   - INSERT is restricted to users in admin_users → a regular visitor
--     cannot upload anything, which is already correct and required no fix.
--
-- Gap found: there's no UPDATE/DELETE policy, so an admin removing an image
-- from the product form only clears the URL in `products.images` — the file
-- itself is never deleted from Storage and just accumulates. This adds the
-- missing admin-only UPDATE/DELETE policies. It does not change who can
-- upload (still admin-only) or who can read (still public).
--
-- Safe to run anytime; does not touch the existing INSERT policy.
-- ============================================================================

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.admin_users au where au.user_id = auth.uid()
  )
);
