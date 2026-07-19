import type { Level } from '@/types'

export const sampleLevels: Omit<Level, 'id' | 'class_id'>[] = [
  {
    level_number: 1,
    description:
      '**Literal Characters** — Match the exact sequence "cat" anywhere in the string.',
    pattern: 'cat',
    test_cases: [
      { string: 'cat', shouldMatch: true },
      { string: 'cats', shouldMatch: true },
      { string: 'catapult', shouldMatch: true },
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
]
