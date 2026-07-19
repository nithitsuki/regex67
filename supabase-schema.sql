-- Enable anonymous sign-ins: go to Auth > Settings > enable "Allow anonymous sign-ins"
-- Then run this in the SQL Editor:

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now()
);

create table if not exists todos (
  id bigint primary key generated always as identity,
  name text not null,
  created_at timestamptz default now()
);

insert into todos (name) values
  ('Learn Supabase'),
  ('Build something cool');

alter table profiles enable row level security;
alter table todos enable row level security;

create policy "Anyone can read profiles"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Anyone can read todos"
  on todos for select using (true);
