drop table if exists levels cascade;
drop table if exists class_students cascade;
drop table if exists classes cascade;
drop table if exists profiles cascade;

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
  student_username text not null,
  current_level int default 1,
  created_at timestamptz default now(),
  unique(class_id, student_username)
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

alter table profiles enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;
alter table levels enable row level security;

create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Anyone can insert profiles" on profiles for insert with check (true);
create policy "Anyone can update profiles" on profiles for update using (true);

create policy "Anyone can read classes" on classes for select using (true);
create policy "Anyone can insert classes" on classes for insert with check (true);
create policy "Anyone can update classes" on classes for update using (true);

create policy "Anyone can read class_students" on class_students for select using (true);
create policy "Anyone can insert class_students" on class_students for insert with check (true);
create policy "Anyone can update class_students" on class_students for update using (true);

create policy "Anyone can read levels" on levels for select using (true);
create policy "Anyone can insert levels" on levels for insert with check (true);
create policy "Anyone can update levels" on levels for update using (true);

-- After logging in once:
-- update profiles set is_teacher = true where username = 'nithitsuki';
