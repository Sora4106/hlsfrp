-- One-time upgrade for an existing HLS Supabase database.
-- Product videos are YouTube URLs, so no Storage video MIME or file-size changes are required.

begin;

alter table public.hls_products add column if not exists videos text[] not null default '{}';

commit;
