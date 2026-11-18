-- Waitlist project zbqtaiozkhfscwynddjd only (not the API's sbriafdrvhibvhlyjugv).
-- Nothing in this repo applies it: the owner runs it once in the SQL editor
-- (or `supabase db push`), then deploys the matching public/main.js.
--
-- Moves both anonymous writes behind SECURITY DEFINER functions:
--   * join_waitlist answers identically for new and existing emails (204),
--     so the response no longer reveals membership. It records the
--     waitlist_new_signup event itself, only when a row was really inserted.
--   * log_event allowlists event names (waitlist_new_signup excluded, so the
--     primary metric cannot be forged) and caps every text length.
--   * Both are rate-limited per client IP.
-- Direct anon INSERT on the tables is revoked.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.write_limits (
    bucket       text        not null,
    window_start timestamptz not null,
    hits         integer     not null default 1,
    primary key (bucket, window_start)
);

-- True while the caller's IP is within p_max calls per p_window for p_kind.
create or replace function private.within_limit(p_kind text, p_max integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
    -- cf-connecting-ip is set by Supabase's Cloudflare edge and cannot be supplied by the client.
    ip text := coalesce(headers->>'cf-connecting-ip',
                        nullif(btrim(split_part(headers->>'x-forwarded-for', ',', 1)), ''),
                        'unknown');
    bucket_start timestamptz := to_timestamp(floor(extract(epoch from now()) / extract(epoch from p_window))
                                             * extract(epoch from p_window));
    current_hits integer;
begin
    insert into private.write_limits as w (bucket, window_start)
    values (p_kind || ':' || md5(ip), bucket_start)
    on conflict (bucket, window_start) do update set hits = w.hits + 1
    returning w.hits into current_hits;

    if random() < 0.01 then
        delete from private.write_limits where window_start < now() - interval '1 day';
    end if;

    return current_hits <= p_max;
end;
$$;

create or replace function public.join_waitlist(
    p_email      text,
    p_persona    text default null,
    p_session_id text default null,
    p_referrer   text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    clean_email text := lower(btrim(coalesce(p_email, '')));
    inserted integer;
begin
    if char_length(clean_email) > 254 or clean_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
        raise exception 'invalid email' using errcode = '22023';
    end if;
    if p_persona is not null and p_persona not in ('driver', 'garage_owner') then
        raise exception 'invalid persona' using errcode = '22023';
    end if;
    if not private.within_limit('waitlist', 5, interval '10 minutes') then
        raise sqlstate 'PT429' using message = 'too many requests';
    end if;

    insert into public.waitlist (email, persona)
    values (clean_email, p_persona)
    on conflict (email) do nothing;
    get diagnostics inserted = row_count;

    -- Server-side, so it counts real new rows and stays invisible to the caller.
    if inserted > 0 then
        insert into public.landing_events (name, session_id, persona, referrer)
        values ('waitlist_new_signup',
                left(p_session_id, 64),
                coalesce(p_persona, 'unknown'),
                left(p_referrer, 255));
    end if;
end;
$$;

create or replace function public.log_event(
    p_name       text,
    p_session_id text default null,
    p_persona    text default null,
    p_referrer   text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if p_name is null or p_name not in (
            'landing_view', 'hero_example_used', 'hero_search_submit', 'share_used',
            'waitlist_view', 'waitlist_focus', 'waitlist_submit', 'waitlist_success',
            'waitlist_error', 'waitlist_edit_email')
       or char_length(p_session_id) > 64
       or (p_persona is not null and p_persona not in ('driver', 'garage_owner', 'unknown'))
       or char_length(p_referrer) > 255 then
        raise exception 'invalid event' using errcode = '22023';
    end if;
    -- Over the limit is dropped silently: analytics must never fail the page.
    if not private.within_limit('event', 60, interval '1 minute') then
        return;
    end if;

    insert into public.landing_events (name, session_id, persona, referrer)
    values (p_name, p_session_id, p_persona, p_referrer);
end;
$$;

revoke all on function private.within_limit(text, integer, interval) from public, anon, authenticated;
revoke all on function public.join_waitlist(text, text, text, text) from public;
revoke all on function public.log_event(text, text, text, text) from public;
grant execute on function public.join_waitlist(text, text, text, text) to anon;
grant execute on function public.log_event(text, text, text, text) to anon;

revoke insert on public.waitlist from anon, authenticated;
revoke insert on public.landing_events from anon, authenticated;

-- Backstop for any other writer. NOT VALID: existing rows are left unchecked.
alter table public.waitlist
    add constraint waitlist_email_len check (char_length(email) <= 254) not valid,
    add constraint waitlist_persona_allowed check (persona is null or persona in ('driver', 'garage_owner')) not valid;
alter table public.landing_events
    add constraint landing_events_name_len check (char_length(name) <= 64) not valid,
    add constraint landing_events_session_len check (char_length(session_id) <= 64) not valid,
    add constraint landing_events_persona_len check (char_length(persona) <= 32) not valid,
    add constraint landing_events_emirate_len check (char_length(emirate) <= 32) not valid,
    add constraint landing_events_referrer_len check (char_length(referrer) <= 255) not valid;

commit;

notify pgrst, 'reload schema';
