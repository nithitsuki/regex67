-- Regex67 - Full Database Schema
-- Run this in your Supabase SQL Editor to set up the database.

-- Drop everything first for a clean slate
drop table if exists levels cascade;
drop table if exists class_students cascade;
drop table if exists classes cascade;
drop table if exists profiles cascade;

-- Profiles: linked to anonymous auth users
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  is_teacher boolean default false,
  created_at timestamptz default now()
);

-- Classes: created by teachers
create table classes (
  id bigint primary key generated always as identity,
  name text not null,
  teacher_username text not null,
  enabled boolean default false,
  created_at timestamptz default now()
);

-- Class students: tracks each student's progress per class
create table class_students (
  id bigint primary key generated always as identity,
  class_id bigint references classes(id) on delete cascade not null,
  student_username text not null,
  current_level int default 1,
  created_at timestamptz default now(),
  unique(class_id, student_username)
);

-- Levels: the regex challenges
-- For match challenges: use pattern + test_cases
-- For find/replace challenges: use buffer + expected (leave pattern/test_cases empty)
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

-- RLS: fully open for this demo app
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

-- Function to seed all 50 levels for a class. Usage: select seed_class_levels(1);
create or replace function seed_class_levels(cid bigint) returns text as $$
begin
  insert into levels (class_id, level_number, description, pattern, test_cases) values
    (cid, 1, E'**Anchors** — Use `^` and `$` to match the exact word "cat".', '^cat$', '[{"string":"cat","shouldMatch":true},{"string":"cats","shouldMatch":false},{"string":"catapult","shouldMatch":false},{"string":"dog","shouldMatch":false},{"string":"c at","shouldMatch":false}]'),
    (cid, 2, E'**The Dot Wildcard** — Use `.` to match any single character. Match "cat", "cot", and "cut".', 'c.t', '[{"string":"cat","shouldMatch":true},{"string":"cot","shouldMatch":true},{"string":"cut","shouldMatch":true},{"string":"ct","shouldMatch":false},{"string":"cart","shouldMatch":false}]'),
    (cid, 3, E'**Digit Matching** — Use `\\d` to match any digit. Match strings containing a digit.', '\\d', '[{"string":"1","shouldMatch":true},{"string":"abc","shouldMatch":false},{"string":"room 101","shouldMatch":true},{"string":"hello","shouldMatch":false},{"string":"99 bottles","shouldMatch":true}]'),
    (cid, 4, E'**Character Sets** — Use `[aeiou]` to match any vowel letter.', '[aeiou]', '[{"string":"apple","shouldMatch":true},{"string":"sky","shouldMatch":false},{"string":"hello","shouldMatch":true},{"string":"why","shouldMatch":false},{"string":"music","shouldMatch":true}]'),
    (cid, 5, E'**Optional Quantifier** — Use `?` to make the `u` optional. Match both "color" and "colour".', 'colou?r', '[{"string":"color","shouldMatch":true},{"string":"colour","shouldMatch":true},{"string":"colouur","shouldMatch":false},{"string":"colr","shouldMatch":false},{"string":"coolor","shouldMatch":false}]'),
    (cid, 6, E'**One or More** — Use `+` to match one or more digits.', '\\d+', '[{"string":"42","shouldMatch":true},{"string":"7","shouldMatch":true},{"string":"abc","shouldMatch":false},{"string":"","shouldMatch":false},{"string":"2024","shouldMatch":true}]'),
    (cid, 7, E'**Alternation** — Use `|` to match either "yes" or "no".', '^(yes|no)$', '[{"string":"yes","shouldMatch":true},{"string":"no","shouldMatch":true},{"string":"maybe","shouldMatch":false},{"string":"YES","shouldMatch":false},{"string":"no no","shouldMatch":false}]'),
    (cid, 8, E'**Email** — Match a simple email address using `\\S+@\\S+`.', '\\S+@\\S+', '[{"string":"user@example.com","shouldMatch":true},{"string":"name@domain.org","shouldMatch":true},{"string":"not-an-email","shouldMatch":false},{"string":"@missing.com","shouldMatch":false},{"string":"spaces in email@x.com","shouldMatch":false}]'),
    (cid, 9, E'**Phone Number** — Match a US phone using `\\d{3}-\\d{3}-\\d{4}`.', '\\d{3}-\\d{3}-\\d{4}', '[{"string":"555-123-4567","shouldMatch":true},{"string":"call 800-555-0199 now","shouldMatch":true},{"string":"1234567890","shouldMatch":false},{"string":"555-12-34567","shouldMatch":false},{"string":"555-1234-567","shouldMatch":false}]')
  on conflict (class_id, level_number) do update set description = excluded.description, pattern = excluded.pattern, test_cases = excluded.test_cases, buffer = '', expected = '';

  insert into levels (class_id, level_number, description, pattern, test_cases, buffer, expected) values
    (cid, 10, E'**Collapse Whitespace** — Replace one or more whitespace chars with a single space using `\\s+`.', '', '[]', 'hello    world\nfoo   bar\none  two', 'hello world\nfoo bar\none two'),
    (cid, 11, E'**Strip HTML Tags** — Remove all HTML tags using `<[^>]+>`. Leave replacement empty.', '', '[]', '<b>hello</b>\n<i>world</i>\n<span>regex</span>', 'hello\nworld\nregex'),
    (cid, 12, E'**Bold Words** — Wrap each word in `<b>` tags using `(\\w+)` and `$1`.', '', '[]', 'hello\nworld\nregex', '<b>hello</b>\n<b>world</b>\n<b>regex</b>'),
    (cid, 13, E'**US to EU Date** — Swap month and day using `(\\d{2})/(\\d{2})/(\\d{4})` -> `$2/$1/$3`.', '', '[]', '03/15/2024\n12/25/2024\n01/01/2025', '15/03/2024\n25/12/2024\n01/01/2025'),
    (cid, 14, E'**Quote Words** — Wrap each word in double quotes using `(\\w+)` and `"$1"`.', '', '[]', 'hello world\nfoo bar', '"hello" "world"\n"foo" "bar"'),
    (cid, 15, E'**Remove Line Numbers** — Remove line numbers like `1. ` using `^\\d+\\.\\s*` with multiline flag.', '', '[]', '1. first\n2. second\n3. third', 'first\nsecond\nthird'),
    (cid, 16, E'**Swap CSV Columns** — Swap two CSV columns using `(\\w+),(\\w+)` -> `$2,$1`.', '', '[]', 'name,age\ncity,zip', 'age,name\nzip,city'),
    (cid, 17, E'**Extract Domain** — Extract domain from emails using `@(\\S+)` and `$1`.', '', '[]', 'user@gmail.com\nadmin@example.org\ntest@yahoo.com', 'gmail.com\nexample.org\nyahoo.com'),
    (cid, 18, E'**Add List Markers** — Add `- ` at the start of each line using `^` with multiline flag.', '', '[]', 'apple\nbanana\ncherry', '- apple\n- banana\n- cherry'),
    (cid, 19, E'**Remove Comments** — Remove `//` comments using `//.*` and empty replacement.', '', '[]', 'let x = 1; // set x\nlet y = 2; // set y\nlet z = 3;', 'let x = 1; \nlet y = 2; \nlet z = 3;'),
    (cid, 20, E'**Extract Filenames** — Extract filenames from paths using `/(\\w+\\.\\w+)$`.', '', '[]', '/home/user/report.txt\n/var/log/system.log\n/tmp/data.csv', 'report.txt\nsystem.log\ndata.csv')
  on conflict (class_id, level_number) do update set description = excluded.description, pattern = excluded.pattern, test_cases = excluded.test_cases, buffer = excluded.buffer, expected = excluded.expected;

  insert into levels (class_id, level_number, description, pattern, test_cases, buffer, expected) values
    (cid, 21, E'**Wrap in Parentheses** — Wrap each word in parentheses using `(\\w+)` -> `($1)`.', '', '[]', 'cat dog bird', '(cat) (dog) (bird)'),
    (cid, 22, E'**Markdown to HTML Headings** — Convert `# Heading` to `<h1>Heading</h1>` using `^# (.+)` -> `<h1>$1</h1>` (multiline).', '', '[]', '# Title\n## Subtitle\n### Section', '<h1>Title</h1>\n<h2>Subtitle</h2>\n<h3>Section</h3>'),
    (cid, 23, E'**Phone Format** — Convert `5551234567` to `(555) 123-4567` using `(\\d{3})(\\d{3})(\\d{4})` -> `($1) $2-$3`.', '', '[]', '5551234567\n8005550199', '(555) 123-4567\n(800) 555-0199'),
    (cid, 24, E'**Remove Empty Lines** — Remove blank lines using `^\\s*$\\n?` and empty replacement.', '', '[]', 'hello\n\nworld\n\n\nfoo', 'hello\nworld\nfoo'),
    (cid, 25, E'**Snake to Camel** — Convert snake_case to camelCase. Use `_(.)` -> `$1` (then uppercase manually or do it letter by letter).', '', '[]', 'first_name\nlast_name\nuser_id', 'firstName\nlastName\nuserId'),
    (cid, 26, E'**Markdown Links** — Convert `[text](url)` to HTML using `\\[([^]]+)\\]\\(([^)]+)\\)` -> `<a href="$2">$1</a>`.', '', '[]', '[Google](https://google.com)\n[GitHub](https://github.com)', '<a href="https://google.com">Google</a>\n<a href="https://github.com">GitHub</a>'),
    (cid, 27, E'**Extract Hashtags** — Extract hashtags from text using `#(\\w+)` -> `$1`.', '', '[]', 'Love #coding and #regex\nCheck #javascript', 'coding\nregex\njavascript'),
    (cid, 28, E'**CSV to HTML Table Row** — Convert CSV to `<tr>` using `([^,]+),([^,]+),([^,]+)` -> `<tr><td>$1</td><td>$2</td><td>$3</td></tr>`.', '', '[]', 'John,30,NYC\nJane,25,LA', '<tr><td>John</td><td>30</td><td>NYC</td></tr>\n<tr><td>Jane</td><td>25</td><td>LA</td></tr>'),
    (cid, 29, E'**Currency Format** — Prepend `$` to numbers using `(\\d+)` -> `$$$1`. Use `$` before the dollar sign in the replacement.', '', '[]', 'costs 5\nprice 100', 'costs $5\nprice $100'),
    (cid, 30, E'**Remove Vowels** — Remove all vowels with `/[aeiou]/gi` and empty replacement.', '', '[]', 'Hello World', 'Hll Wrld')
  on conflict (class_id, level_number) do update set description = excluded.description, pattern = excluded.pattern, test_cases = excluded.test_cases, buffer = excluded.buffer, expected = excluded.expected;

  insert into levels (class_id, level_number, description, pattern, test_cases, buffer, expected) values
    (cid, 31, E'**Reverse Words** — Reverse two-word lines using `(\\w+) (\\w+)` -> `$2 $1`.', '', '[]', 'hello world\nfoo bar', 'world hello\nbar foo'),
    (cid, 32, E'**Mask Passwords** — Mask `password=` values using `password=(\\S+)` -> `password=***`.', '', '[]', 'user=admin&password=secret\nuser=guest&password=letmein', 'user=admin&password=***\nuser=guest&password=***'),
    (cid, 33, E'**Extract Year** — Extract 4-digit years using `(\\d{4})` -> `$1`.', '', '[]', 'Born in 1990, graduated in 2012', '1990\n2012'),
    (cid, 34, E'**Convert Tabs to Spaces** — Replace `\\t` with 4 spaces.', '', '[]', 'hello\tworld\nfoo\tbar', 'hello    world\nfoo    bar'),
    (cid, 35, E'**Markdown Checkbox** — Convert `- [x]` to `✓` and `- [ ]` to `✗`.', '', '[]', '- [x] learn regex\n- [ ] practice', '✓ learn regex\n✗ practice'),
    (cid, 36, E'**Extract Hex Colors** — Extract hex colors using `(#[0-9a-fA-F]{3,6})` -> `$1`.', '', '[]', 'color: #ff0000;\nbackground: #abc;', '#ff0000\n#abc'),
    (cid, 37, E'**XML to Self-Closing** — Convert `<tag></tag>` to `<tag/>` using `<\\w+></\\w+>` -> same tag self-closed.', '', '[]', '<div></div>\n<span></span>\n<p>text</p>', '<div/>\n<span/>\n<p>text</p>'),
    (cid, 38, E'**Wrap Lines in List Items** — Wrap each line in `<li>` using `^(.+)$` -> `<li>$1</li>` (multiline).', '', '[]', 'apple\nbanana\ncherry', '<li>apple</li>\n<li>banana</li>\n<li>cherry</li>'),
    (cid, 39, E'**Format Time** — Convert `HH:MM:SS` to `H hours M minutes S seconds` using `(\\d{2}):(\\d{2}):(\\d{2})`.', '', '[]', '14:30:00\n09:15:30', '14 hours 30 minutes 00 seconds\n09 hours 15 minutes 30 seconds'),
    (cid, 40, E'**Bold to Strong** — Convert `**text**` to `<strong>text</strong>` using `\\*\\*([^*]+)\\*\\*` -> `<strong>$1</strong>`.', '', '[]', '**bold** text', '<strong>bold</strong> text')
  on conflict (class_id, level_number) do update set description = excluded.description, pattern = excluded.pattern, test_cases = excluded.test_cases, buffer = excluded.buffer, expected = excluded.expected;

  insert into levels (class_id, level_number, description, pattern, test_cases, buffer, expected) values
    (cid, 41, E'**Extract URL Paths** — Extract paths from URLs using `https?://[^/]+(/\\S+)` -> `$1`.', '', '[]', 'https://example.com/docs/guide\nhttps://api.site.com/v1/users', '/docs/guide\n/v1/users'),
    (cid, 42, E'**Number Lines** — Add line numbers using multiple passes. First add `1. ` before each line, then increment.', '', '[]', 'first\nsecond\nthird', '1. first\n2. second\n3. third'),
    (cid, 43, E'**Remove Duplicate Words** — Remove consecutive dupes using `(\\b\\w+\\b)\\s+\\1` -> `$1`.', '', '[]', 'the the quick brown fox', 'the quick brown fox'),
    (cid, 44, E'**Italic to Em** — Convert `*text*` to `<em>text</em>` using `\\*([^*]+)\\*` -> `<em>$1</em>`.', '', '[]', '*italic* text', '<em>italic</em> text'),
    (cid, 45, E'**SQL Values to CSV** — Convert `(''val1'',''val2'')` to `val1,val2` using regex to strip SQL syntax.', '', '[]', '(''John'',''30'',''NYC'')', 'John,30,NYC'),
    (cid, 46, E'**Camel to Snake** — Convert camelCase to snake_case using `([a-z])([A-Z])` -> `$1_$2` then lowercase.', '', '[]', 'firstName\nlastName\nuserId', 'first_name\nlast_name\nuser_id'),
    (cid, 47, E'**Extract JSON Keys** — Extract keys from JSON using `"(\\w+)"\\s*:` -> `$1`.', '', '[]', '{"name":"John","age":30}', 'name\nage'),
    (cid, 48, E'**Markdown Table to HTML** — Convert `|A|B|` lines to `<tr><td>A</td><td>B</td></tr>`. Multiple passes needed.', '', '[]', '|Name|Age|\n|---|\n|John|30|', '<table>\n<tr><th>Name</th><th>Age</th></tr>\n<tr><td>John</td><td>30</td></tr>\n</table>'),
    (cid, 49, E'**XML to JSON Fragment** — Convert `<tag>val</tag>` to `"tag": "val"` using `<([^>]+)>([^<]*)</\\1>` -> `"$1": "$2"`.', '', '[]', '<name>John</name>\n<age>30</age>', '"name": "John"\n"age": "30"'),
    (cid, 50, E'**Final Boss** — Multiple transformations. Convert markdown table cells to uppercase and wrap in HTML. Use multiple passes.', '', '[]', '| name |\n| john |\n| jane |', '<table>\n<tr><th>NAME</th></tr>\n<tr><td>JOHN</td></tr>\n<tr><td>JANE</td></tr>\n</table>')
  on conflict (class_id, level_number) do update set description = excluded.description, pattern = excluded.pattern, test_cases = excluded.test_cases, buffer = excluded.buffer, expected = excluded.expected;

  return '50 levels seeded for class ' || cid;
end;
$$ language plpgsql;
