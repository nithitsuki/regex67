import type { Level } from '@/types'

export const sampleLevels: Omit<Level, 'id' | 'class_id'>[] = [
  {
    level_number: 1,
    description:
      '**Anchors** — Use `^` and `$` to match the exact word "cat".',
    pattern: '^cat$',
    test_cases: [
      { string: 'cat', shouldMatch: true },
      { string: 'cats', shouldMatch: false },
      { string: 'catapult', shouldMatch: false },
      { string: 'dog', shouldMatch: false },
      { string: 'c at', shouldMatch: false },
    ],
  },
  {
    level_number: 2,
    description:
      '**The Dot Wildcard** — Use `.` to match any single character. Match "cat", "cot", and "cut".',
    pattern: 'c.t',
    test_cases: [
      { string: 'cat', shouldMatch: true },
      { string: 'cot', shouldMatch: true },
      { string: 'cut', shouldMatch: true },
      { string: 'ct', shouldMatch: false },
      { string: 'cart', shouldMatch: false },
    ],
  },
  {
    level_number: 3,
    description:
      '**Digit Matching** — Use `\\d` to match any digit. Match strings that contain a digit.',
    pattern: '\\d',
    test_cases: [
      { string: '1', shouldMatch: true },
      { string: 'abc', shouldMatch: false },
      { string: 'room 101', shouldMatch: true },
      { string: 'hello', shouldMatch: false },
      { string: '99 bottles', shouldMatch: true },
    ],
  },
  {
    level_number: 4,
    description:
      '**Character Sets** — Use `[aeiou]` to match any vowel letter.',
    pattern: '[aeiou]',
    test_cases: [
      { string: 'apple', shouldMatch: true },
      { string: 'sky', shouldMatch: false },
      { string: 'hello', shouldMatch: true },
      { string: 'why', shouldMatch: false },
      { string: 'music', shouldMatch: true },
    ],
  },
  {
    level_number: 5,
    description:
      '**Optional Quantifier** — Use `?` to make the `u` optional. Match both "color" and "colour".',
    pattern: 'colou?r',
    test_cases: [
      { string: 'color', shouldMatch: true },
      { string: 'colour', shouldMatch: true },
      { string: 'colouur', shouldMatch: false },
      { string: 'colr', shouldMatch: false },
      { string: 'coolor', shouldMatch: false },
    ],
  },
  {
    level_number: 6,
    description:
      '**Find & Replace Basics** — Use find and replace to swap the words on each line. Find two words and reverse their order.',
    pattern: '',
    test_cases: [],
    buffer: 'hello world\nfoo bar\none two',
    expected: 'world hello\nbar foo\ntwo one',
  },
  {
    level_number: 7,
    description:
      '**Strip Digits** — Remove all digits from the text using `\\d+` in the find field and an empty replacement.',
    pattern: '',
    test_cases: [],
    buffer: 'abc123def456ghi789',
    expected: 'abcdefghi',
  },
  {
    level_number: 8,
    description:
      '**CSV to Pipes** — Replace all commas with pipe characters `|` using find and replace.',
    pattern: '',
    test_cases: [],
    buffer: 'a,b,c\n1,2,3\nx,y,z',
    expected: 'a|b|c\n1|2|3\nx|y|z',
  },
]
