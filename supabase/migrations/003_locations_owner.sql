alter table public.locations
  add column if not exists owner text;

update public.locations
set owner = 'Nahuel'
where owner is null;

alter table public.locations
  alter column owner set not null;

alter table public.locations
  drop constraint if exists locations_owner_check;

alter table public.locations
  add constraint locations_owner_check check(owner in ('Nahuel','ML','lili','Compartido'));
