import type { Level } from '@/types'

export const TOTAL_LEVELS = 12

export const sampleLevels: Omit<Level, 'id' | 'class_id'>[] = [
  {
    level_number: 1,
    description: '**Exact text** — Match only the complete string `cat`. Use start and end anchors.',
    pattern: '^cat$',
    test_cases: [
      { string: 'cat', shouldMatch: true },
      { string: 'cats', shouldMatch: false },
      { string: 'a cat', shouldMatch: false },
      { string: 'Cat', shouldMatch: false },
      { string: '', shouldMatch: false },
    ],
  },
  {
    level_number: 2,
    description: '**Wildcard and escaping** — Match exactly `file1.txt`, `fileA.txt`, and `file-.txt`. The character before `.txt` may be anything, but the dot must be literal.',
    pattern: '^file.\\.txt$',
    test_cases: [
      { string: 'file1.txt', shouldMatch: true },
      { string: 'fileA.txt', shouldMatch: true },
      { string: 'file-.txt', shouldMatch: true },
      { string: 'file.txt', shouldMatch: false },
      { string: 'file1xtxt', shouldMatch: false },
    ],
  },
  {
    level_number: 3,
    description: '**Character classes and ranges** — Match exactly one lowercase hexadecimal digit: `0`–`9` or `a`–`f`.',
    pattern: '^[0-9a-f]$',
    test_cases: [
      { string: '0', shouldMatch: true },
      { string: '9', shouldMatch: true },
      { string: 'b', shouldMatch: true },
      { string: 'g', shouldMatch: false },
      { string: 'AF', shouldMatch: false },
    ],
  },
  {
    level_number: 4,
    description: '**Shorthand and negated classes** — Match a string containing at least one digit and no whitespace. Use `\\d`, `\\s`, and a negated class.',
    pattern: '^[^\\s]*\\d[^\\s]*$',
    test_cases: [
      { string: 'abc1', shouldMatch: true },
      { string: '42', shouldMatch: true },
      { string: 'x-9-y', shouldMatch: true },
      { string: 'abcdef', shouldMatch: false },
      { string: 'abc 1', shouldMatch: false },
    ],
  },
  {
    level_number: 5,
    description: '**Quantifiers** — Match `color` or `colour`, followed by one or more exclamation marks. Use `?` and `+`.',
    pattern: '^colou?r!+$',
    test_cases: [
      { string: 'color!', shouldMatch: true },
      { string: 'colour!!!', shouldMatch: true },
      { string: 'color', shouldMatch: false },
      { string: 'colouur!', shouldMatch: false },
      { string: 'color!?', shouldMatch: false },
    ],
  },
  {
    level_number: 6,
    description: '**Counted repetition** — Match a PIN containing exactly 4 to 6 digits.',
    pattern: '^\\d{4,6}$',
    test_cases: [
      { string: '1234', shouldMatch: true },
      { string: '123456', shouldMatch: true },
      { string: '123', shouldMatch: false },
      { string: '1234567', shouldMatch: false },
      { string: '12a4', shouldMatch: false },
    ],
  },
  {
    level_number: 7,
    description: '**Grouping and alternation** — Match exactly `cat`, `cats`, `dog`, or `dogs`. Group the alternatives and make the final `s` optional.',
    pattern: '^(cat|dog)s?$',
    test_cases: [
      { string: 'cat', shouldMatch: true },
      { string: 'cats', shouldMatch: true },
      { string: 'dogs', shouldMatch: true },
      { string: 'catdog', shouldMatch: false },
      { string: 'dogss', shouldMatch: false },
    ],
  },
  {
    level_number: 8,
    description: '**Word boundaries** — Find the whole word `cat` inside text without matching it inside a larger word. Use `\\b`.',
    pattern: '\\bcat\\b',
    test_cases: [
      { string: 'a cat naps', shouldMatch: true },
      { string: 'cat!', shouldMatch: true },
      { string: 'concatenate', shouldMatch: false },
      { string: 'cats', shouldMatch: false },
      { string: 'bobcat', shouldMatch: false },
    ],
  },
  {
    level_number: 9,
    description: '**Practical validation** — Match a username that starts with a letter and then has 2–15 letters, digits, or underscores.',
    pattern: '^[A-Za-z]\\w{2,15}$',
    test_cases: [
      { string: 'sam', shouldMatch: true },
      { string: 'User_42', shouldMatch: true },
      { string: 'ab', shouldMatch: false },
      { string: '4runner', shouldMatch: false },
      { string: 'user-name', shouldMatch: false },
      { string: 'abcdefghijklmnopq', shouldMatch: false },
    ],
  },
  {
    level_number: 10,
    description: '**Global replacement** — Replace each run of spaces with one space. In the editor, enable regex and replace all using ` +`.',
    pattern: '',
    test_cases: [],
    buffer: 'hello    world\nregex   is    useful',
    expected: 'hello world\nregex is useful',
  },
  {
    level_number: 11,
    description: '**Capture groups** — Change each `YYYY-MM-DD` date to `DD/MM/YYYY` using three capture groups and `$1`, `$2`, `$3` in the replacement.',
    pattern: '',
    test_cases: [],
    buffer: 'Released: 2024-03-15\nUpdated: 2025-12-01',
    expected: 'Released: 15/03/2024\nUpdated: 01/12/2025',
  },
  {
    level_number: 12,
    description: '**Multiline anchors** — Remove the `> ` prefix at the start of every line. Enable regex and replace all using `^> `.',
    pattern: '',
    test_cases: [],
    buffer: '> first line\n> second line\n> third line',
    expected: 'first line\nsecond line\nthird line',
  },
]
