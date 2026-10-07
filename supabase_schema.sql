-- ANFRA FOUNDING 1000
-- Run this in Supabase SQL Editor.

create table if not exists public.founding_members (
  rank integer primary key,
  wallet text unique not null,
  created_at timestamptz not null default now()
);

alter table public.founding_members enable row level security;

-- Public can read the Founding 1000 list.
drop policy if exists "Public can read founding members" on public.founding_members;
create policy "Public can read founding members"
on public.founding_members
for select
to anon, authenticated
using (true);

-- Atomic assignment of the next available rank.
create or replace function public.claim_founding_member(p_wallet text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_rank integer;
  next_rank integer;
begin
  if p_wallet is null or length(trim(p_wallet)) < 20 then
    raise exception 'Invalid wallet';
  end if;

  select rank into existing_rank
  from public.founding_members
  where wallet = p_wallet;

  if existing_rank is not null then
    return jsonb_build_object(
      'claimed', false,
      'already_member', true,
      'rank', existing_rank
    );
  end if;

  select coalesce(max(rank), 0) + 1 into next_rank
  from public.founding_members;

  if next_rank > 1000 then
    return jsonb_build_object(
      'claimed', false,
      'already_member', false,
      'full', true
    );
  end if;

  insert into public.founding_members(rank, wallet)
  values(next_rank, p_wallet);

  return jsonb_build_object(
    'claimed', true,
    'already_member', false,
    'rank', next_rank
  );
end;
$$;

revoke all on function public.claim_founding_member(text) from public;
-- Only the Supabase Edge Function should be able to claim a Founding slot.
-- This prevents a browser user from bypassing the 10,000 ANFRA eligibility check.
revoke execute on function public.claim_founding_member(text) from anon, authenticated;

-- The browser must NOT be allowed to insert/update/delete rows directly.
revoke insert, update, delete on public.founding_members from anon, authenticated;
grant select on public.founding_members to anon, authenticated;
