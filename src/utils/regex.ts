import XRegExp from 'xregexp'
import type { TestCase } from '@/types'

export interface MatchDetail {
  passed: boolean
  matched: boolean
  ranges: { start: number; end: number }[]
}

export function testRegexLive(pattern: string, testCases: TestCase[]): MatchDetail[] {
  try {
    const regex = XRegExp(pattern)
    return testCases.map((tc) => {
      const match = XRegExp.exec(tc.string, regex)
      const matched = match !== null
      const ranges = matched ? [{ start: match.index, end: match.index + match[0].length }] : []
      return {
        passed: matched === tc.shouldMatch,
        matched,
        ranges,
      }
    })
  } catch {
    return testCases.map(() => ({ passed: false, matched: false, ranges: [] }))
  }
}

export function allPass(details: MatchDetail[]): boolean {
  return details.length > 0 && details.every((d) => d.passed)
}
