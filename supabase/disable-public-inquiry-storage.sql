-- Run this once in Supabase SQL Editor after deploying the email-only contact page.
-- It preserves existing historical hls_inquiries rows and only blocks new public writes.

begin;

drop policy if exists "hls_inquiries_public_insert" on public.hls_inquiries;
revoke insert on public.hls_inquiries from anon;

commit;
