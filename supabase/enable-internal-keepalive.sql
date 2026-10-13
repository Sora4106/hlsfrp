-- Experimental internal keep-alive for the HLS free Supabase project.
-- This creates no HLS data table and writes no site content or audit data.
-- Every night at 23:20 Asia/Taipei (15:20 UTC), it only performs the same
-- read-only content query that the public website uses.
-- It cannot resume a project that has already been paused.

create extension if not exists pg_cron;

-- Clean up the logging helper used by the earlier version of this script.
-- These objects only contained keep-alive timestamps; no official-site
-- products, news, media, or customer data is affected.
select cron.unschedule(jobid)
from cron.job
where jobname = 'hls-internal-keepalive-nightly';

drop function if exists public.hls_run_keepalive_if_due();
drop table if exists public.hls_keepalive_runs;

-- Re-create one fixed schedule. The statement is read-only: it calls the
-- stable hls_get_site_content() SELECT function and stores no result.
select cron.schedule(
  'hls-internal-keepalive-nightly',
  '20 15 * * *',
  $$select public.hls_get_site_content();$$
);

-- Optional immediate read-only test:
-- select public.hls_get_site_content();

-- To remove the automatic schedule later:
-- select cron.unschedule(jobid) from cron.job where jobname = 'hls-internal-keepalive-nightly';
