-- After creating a class, replace CLASS_ID with the actual ID and run this.
-- Or just use the "Seed 5 sample levels" button in the teacher dashboard.

insert into levels (class_id, level_number, description, pattern, test_cases) values
(1, 1, E'**Anchors** — Use `^` and `$` to match the exact word "cat".',
  '^cat$',
  '[{"string": "cat", "shouldMatch": true}, {"string": "cats", "shouldMatch": false}, {"string": "catapult", "shouldMatch": false}, {"string": "dog", "shouldMatch": false}, {"string": "c at", "shouldMatch": false}]'),

(1, 2, E'**The Dot Wildcard** — Use `.` to match any single character. Match "cat", "cot", and "cut".',
  'c.t',
  '[{"string": "cat", "shouldMatch": true}, {"string": "cot", "shouldMatch": true}, {"string": "cut", "shouldMatch": true}, {"string": "ct", "shouldMatch": false}, {"string": "cart", "shouldMatch": false}]'),

(1, 3, E'**Digit Matching** — Use `\\d` to match any digit. Match strings that contain a digit.',
  '\\d',
  '[{"string": "1", "shouldMatch": true}, {"string": "abc", "shouldMatch": false}, {"string": "room 101", "shouldMatch": true}, {"string": "hello", "shouldMatch": false}, {"string": "99 bottles", "shouldMatch": true}]'),

(1, 4, E'**Character Sets** — Use `[aeiou]` to match any vowel letter.',
  '[aeiou]',
  '[{"string": "apple", "shouldMatch": true}, {"string": "sky", "shouldMatch": false}, {"string": "hello", "shouldMatch": true}, {"string": "why", "shouldMatch": false}, {"string": "music", "shouldMatch": true}]'),

(1, 5, E'**Optional Quantifier** — Use `?` to make the `u` optional. Match both "color" and "colour".',
  'colou?r',
  '[{"string": "color", "shouldMatch": true}, {"string": "colour", "shouldMatch": true}, {"string": "colouur", "shouldMatch": false}, {"string": "colr", "shouldMatch": false}, {"string": "coolor", "shouldMatch": false}]');
