-- Experimental internal keep-alive for the HLS free Supabase project.
-- It runs every night at 23:20 Asia/Taipei (15:20 UTC), but performs the
-- content query and writes one audit row only when six days have elapsed.
-- This is intended to keep normal database activity before a possible pause;
-- it cannot resume a project that has already been paused.

create extension if not exists pg_cron;

create table if not exists public.hls_keepalive_runs (
  id bigint generated always as identity primary key,
  ran_at timestamptz not null default now(),
  source text not null default 'supabase-cron' check (source = 'supabase-cron')
);

create index if not exists hls_keepalive_runs_ran_at_idx
on public.hls_keepalive_runs (ran_at desc);

alter table public.hls_keepalive_runs enable row level security;
revoke all on public.hls_keepalive_runs from anon, authenticated;

create or replace function public.hls_run_keepalive_if_due()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  last_run_at timestamptz;
begin
  select max(ran_at) into last_run_at
  from public.hls_keepalive_runs;

  if last_run_at is not null and last_run_at > now() - interval '6 days' then
    return jsonb_build_object(
      'ran', false,
      'reason', 'not_due',
      'last_run_at', last_run_at
    );
  end if;

  -- Use the same lightweight read function as the public website.
  perform public.hls_get_site_content();
  insert into public.hls_keepalive_runs default values;

  return jsonb_build_object(
    'ran', true,
    'ran_at', now()
  );
end;
$$;

revoke all on function public.hls_run_keepalive_if_due() from public, anon, authenticated;

-- Re-running this file replaces the schedule instead of creating duplicates.
select cron.unschedule(jobid)
from cron.job
where jobname = 'hls-internal-keepalive-nightly';

select cron.schedule(
  'hls-internal-keepalive-nightly',
  '20 15 * * *',
  $$select public.hls_run_keepalive_if_due();$$
);

-- Optional immediate test. Run this separately if you want the first
-- keep-alive timestamp to be recorded now:
-- select public.hls_run_keepalive_if_due();

-- To inspect recent actual keep-alive runs:
-- select id, ran_at, source from public.hls_keepalive_runs order by ran_at desc;

-- To remove the automatic schedule later:
-- select cron.unschedule(jobid) from cron.job where jobname = 'hls-internal-keepalive-nightly';
