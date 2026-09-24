-- One-time upgrade for an existing HLS Supabase database.
-- Run this in Supabase SQL Editor before uploading MP4 or WebM files.

begin;

alter table public.hls_products add column if not exists videos text[] not null default '{}';
alter table public.hls_media add column if not exists original_size_bytes bigint;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.hls_media'::regclass
      and contype = 'c'
      and (
        pg_get_constraintdef(oid) ilike '%mime_type%'
        or (pg_get_constraintdef(oid) ilike '%size_bytes%' and pg_get_constraintdef(oid) not ilike '%original_size_bytes%')
      )
  loop
    execute format('alter table public.hls_media drop constraint %I', constraint_name);
  end loop;
  alter table public.hls_media drop constraint if exists hls_media_original_size_check;
  alter table public.hls_media add constraint hls_media_mime_type_check
    check (mime_type in ('image/webp', 'video/mp4', 'video/webm'));
  alter table public.hls_media add constraint hls_media_size_bytes_check
    check (size_bytes between 1 and 104857600);
  alter table public.hls_media add constraint hls_media_original_size_check
    check (original_size_bytes is null or original_size_bytes between 1 and 104857600);
end;
$$;

create or replace function public.hls_get_media_usage(p_url text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when public.hls_is_admin() then jsonb_build_object(
    'categories', (select count(*) from public.hls_product_categories where image = p_url),
    'products', (select count(*) from public.hls_products where p_url = any(images) or p_url = any(spec_images) or p_url = any(videos)),
    'locations', (select count(*) from public.hls_locations where image = p_url)
  ) else null end;
$$;

revoke all on function public.hls_get_media_usage(text) from public;
grant execute on function public.hls_get_media_usage(text) to authenticated;

commit;
