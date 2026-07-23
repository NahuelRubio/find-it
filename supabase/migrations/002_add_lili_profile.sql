alter table public.profiles drop constraint if exists profiles_display_name_check;
alter table public.profiles add constraint profiles_display_name_check check(display_name in ('Nahuel','ML','lili'));

alter table public.boxes drop constraint if exists boxes_owner_check;
alter table public.boxes add constraint boxes_owner_check check(owner in ('Nahuel','ML','lili','Compartido'));

alter table public.items drop constraint if exists items_owner_check;
alter table public.items add constraint items_owner_check check(owner in ('Nahuel','ML','lili','Compartido'));

insert into public.profiles(household_id,display_name)
select id,'lili' from public.households where slug='casa-nahuel-ml'
on conflict do nothing;
