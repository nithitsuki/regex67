-- Drop tables first (cascades to policies automatically)
drop table if exists levels cascade;
drop table if exists class_students cascade;
drop table if exists classes cascade;
drop table if exists profiles cascade;

-- Recreate everything
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  is_teacher boolean default false,
  created_at timestamptz default now()
);

create table classes (
  id bigint primary key generated always as identity,
  name text not null,
  teacher_username text not null,
  enabled boolean default false,
  created_at timestamptz default now()
);

create table class_students (
  id bigint primary key generated always as identity,
  class_id bigint references classes(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  current_level int default 1,
  created_at timestamptz default now(),
  unique(class_id, profile_id)
);

create table levels (
  id bigint primary key generated always as identity,
  class_id bigint references classes(id) on delete cascade not null,
  level_number int not null,
  description text not null default '',
  pattern text not null default '',
  test_cases jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  unique(class_id, level_number)
);

-- RLS
alter table profiles enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;
alter table levels enable row level security;

create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

create policy "Anyone can read classes" on classes for select using (true);
create policy "Anyone can insert classes" on classes for insert with check (true);
create policy "Anyone can update classes" on classes for update using (true);

create policy "Anyone can read class_students" on class_students for select using (true);
create policy "Anyone can insert class_students" on class_students for insert with check (true);
create policy "Students can update own progress" on class_students for update using (auth.uid() = profile_id);

create policy "Anyone can read levels" on levels for select using (true);
create policy "Anyone can insert levels" on levels for insert with check (true);
create policy "Anyone can update levels" on levels for update using (true);

-- After logging in once, run:
-- update profiles set is_teacher = true where username = 'nithitsuki';
