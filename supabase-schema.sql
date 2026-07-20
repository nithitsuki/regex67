-- Regex67 - Full Database Schema
-- Run this in your Supabase SQL Editor to set up the database.

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

-- Match challenges use pattern + test_cases. Find/replace challenges use buffer + expected.
create table levels (
  id bigint primary key generated always as identity,
  class_id bigint references classes(id) on delete cascade not null,
  level_number int not null,
  description text not null default '',
  pattern text not null default '',
  test_cases jsonb not null default '[]'::jsonb,
  buffer text not null default '',
  expected text not null default '',
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

-- After logging in once, run:
-- update profiles set is_teacher = true where username = 'your-username';

-- Usage: select seed_class_levels(1);
create or replace function seed_class_levels(cid bigint) returns text as $body$
begin
  delete from levels where class_id = cid and level_number > 12;
  update class_students set current_level = least(current_level, 13) where class_id = cid;

  insert into levels (class_id, level_number, description, pattern, test_cases, buffer, expected) values
    (cid, 1, E'**Exact text** — Match only the complete string `cat`. Use start and end anchors.', '^cat$', '[{"string":"cat","shouldMatch":true},{"string":"cats","shouldMatch":false},{"string":"a cat","shouldMatch":false},{"string":"Cat","shouldMatch":false},{"string":"","shouldMatch":false}]', '', ''),
    (cid, 2, E'**Wildcard and escaping** — Match exactly `file1.txt`, `fileA.txt`, and `file-.txt`. The character before `.txt` may be anything, but the dot must be literal.', E'^file.\\.txt$', '[{"string":"file1.txt","shouldMatch":true},{"string":"fileA.txt","shouldMatch":true},{"string":"file-.txt","shouldMatch":true},{"string":"file.txt","shouldMatch":false},{"string":"file1xtxt","shouldMatch":false}]', '', ''),
    (cid, 3, E'**Character classes and ranges** — Match exactly one lowercase hexadecimal digit: `0`–`9` or `a`–`f`.', '^[0-9a-f]$', '[{"string":"0","shouldMatch":true},{"string":"9","shouldMatch":true},{"string":"b","shouldMatch":true},{"string":"g","shouldMatch":false},{"string":"AF","shouldMatch":false}]', '', ''),
    (cid, 4, E'**Shorthand and negated classes** — Match a string containing at least one digit and no whitespace. Use `\\d`, `\\s`, and a negated class.', E'^[^\\s]*\\d[^\\s]*$', '[{"string":"abc1","shouldMatch":true},{"string":"42","shouldMatch":true},{"string":"x-9-y","shouldMatch":true},{"string":"abcdef","shouldMatch":false},{"string":"abc 1","shouldMatch":false}]', '', ''),
    (cid, 5, E'**Quantifiers** — Match `color` or `colour`, followed by one or more exclamation marks. Use `?` and `+`.', '^colou?r!+$', '[{"string":"color!","shouldMatch":true},{"string":"colour!!!","shouldMatch":true},{"string":"color","shouldMatch":false},{"string":"colouur!","shouldMatch":false},{"string":"color!?","shouldMatch":false}]', '', ''),
    (cid, 6, E'**Counted repetition** — Match a PIN containing exactly 4 to 6 digits.', E'^\\d{4,6}$', '[{"string":"1234","shouldMatch":true},{"string":"123456","shouldMatch":true},{"string":"123","shouldMatch":false},{"string":"1234567","shouldMatch":false},{"string":"12a4","shouldMatch":false}]', '', ''),
    (cid, 7, E'**Grouping and alternation** — Match exactly `cat`, `cats`, `dog`, or `dogs`. Group the alternatives and make the final `s` optional.', '^(cat|dog)s?$', '[{"string":"cat","shouldMatch":true},{"string":"cats","shouldMatch":true},{"string":"dogs","shouldMatch":true},{"string":"catdog","shouldMatch":false},{"string":"dogss","shouldMatch":false}]', '', ''),
    (cid, 8, E'**Word boundaries** — Find the whole word `cat` inside text without matching it inside a larger word. Use `\\b`.', E'\\bcat\\b', '[{"string":"a cat naps","shouldMatch":true},{"string":"cat!","shouldMatch":true},{"string":"concatenate","shouldMatch":false},{"string":"cats","shouldMatch":false},{"string":"bobcat","shouldMatch":false}]', '', ''),
    (cid, 9, E'**Practical validation** — Match a username that starts with a letter and then has 2–15 letters, digits, or underscores.', E'^[A-Za-z]\\w{2,15}$', '[{"string":"sam","shouldMatch":true},{"string":"User_42","shouldMatch":true},{"string":"ab","shouldMatch":false},{"string":"4runner","shouldMatch":false},{"string":"user-name","shouldMatch":false},{"string":"abcdefghijklmnopq","shouldMatch":false}]', '', ''),
    (cid, 10, E'**Global replacement** — Replace each run of spaces with one space. In the editor, enable regex and replace all using ` +`.', '', '[]', E'hello    world\nregex   is    useful', E'hello world\nregex is useful'),
    (cid, 11, E'**Capture groups** — Change each `YYYY-MM-DD` date to `DD/MM/YYYY` using three capture groups and `$1`, `$2`, `$3` in the replacement.', '', '[]', E'Released: 2024-03-15\nUpdated: 2025-12-01', E'Released: 15/03/2024\nUpdated: 01/12/2025'),
    (cid, 12, E'**Multiline anchors** — Remove the `> ` prefix at the start of every line. Enable regex and replace all using `^> `.', '', '[]', E'> first line\n> second line\n> third line', E'first line\nsecond line\nthird line')
  on conflict (class_id, level_number) do update set
    description = excluded.description,
    pattern = excluded.pattern,
    test_cases = excluded.test_cases,
    buffer = excluded.buffer,
    expected = excluded.expected;

  return '12 essential levels seeded for class ' || cid;
end;
$body$ language plpgsql;
