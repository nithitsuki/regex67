import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { testRegexLive, allPass, type MatchDetail } from '@/utils/regex'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Level, TestCase } from '@/types'

interface Props {
  level: Level
  username: string
  classId: number
  allLevels: Level[]
  onComplete: (nextLevelNumber: number) => void
  onBack: () => void
}

function HighlightedText({ text, ranges, highlightClass }: { text: string; ranges: { start: number; end: number }[]; highlightClass: string }) {
  if (ranges.length === 0) return <>{text}</>
  const parts: { t: string; highlight: boolean }[] = []
  let last = 0
  for (const r of ranges) {
    if (r.start > last) parts.push({ t: text.slice(last, r.start), highlight: false })
    parts.push({ t: text.slice(r.start, r.end), highlight: true })
    last = r.end
  }
  if (last < text.length) parts.push({ t: text.slice(last), highlight: false })
  return (
    <>
      {parts.map((p, i) =>
        p.highlight ? (
          <span key={i} className={highlightClass}>{p.t}</span>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  )
}

export default function LevelChallenge({ level, username, classId, allLevels, onComplete, onBack }: Props) {
  const [pattern, setPattern] = useState('')
  const [submitted, setSubmitted] = useState<MatchDetail[] | null>(null)
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    setPattern('')
    setSubmitted(null)
    setSolved(false)
  }, [level.level_number])

  const live = useMemo(() => {
    if (!pattern) return null
    return testRegexLive(pattern, level.test_cases as TestCase[])
  }, [pattern, level.test_cases])

  const handleCheck = useCallback(async () => {
    const r = testRegexLive(pattern, level.test_cases as TestCase[])
    setSubmitted(r)
    if (allPass(r)) {
      setSolved(true)
      const { error } = await supabase
        .from('class_students')
        .update({ current_level: level.level_number + 1 })
        .eq('student_username', username)
        .eq('class_id', classId)
      if (!error) {
        toast.success(`Level ${level.level_number} solved!`)
      }
    }
  }, [pattern, level, username, classId])

  const nextLevel = allLevels.find((l) => l.level_number === level.level_number + 1)
  const hasNext = level.level_number < 50

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <h1 className="text-xl font-bold">Level {level.level_number}</h1>
        </div>
        {solved && <Badge variant="default">Solved!</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <div className="text-sm leading-relaxed [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{level.description}</ReactMarkdown>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
          <Input
            value={pattern}
            onChange={(e) => { setPattern(e.target.value); setSubmitted(null) }}
            placeholder="Enter your regex pattern"
            className="pl-7 font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">/</span>
        </div>
        <Button onClick={handleCheck} disabled={solved}>
          Check
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {(level.test_cases as TestCase[]).map((tc, i) => {
          const detail = live?.[i]
          const submitResult = submitted?.[i]
          const showSubmit = submitted !== null
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border px-4 py-2 font-mono text-sm"
            >
              <div className="flex items-center gap-1">
                {detail && pattern ? (
                  detail.matched ? (
                    <HighlightedText
                      text={tc.string}
                      ranges={detail.ranges}
                      highlightClass={
                        tc.shouldMatch
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400 rounded'
                          : 'bg-red-500/20 text-red-700 dark:text-red-400 rounded'
                      }
                    />
                  ) : (
                    <span>{tc.string}</span>
                  )
                ) : (
                  <span>{tc.string}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tc.shouldMatch ? 'default' : 'secondary'}>
                  {tc.shouldMatch ? 'should match' : 'should NOT match'}
                </Badge>
                {showSubmit && (
                  <Badge variant={submitResult?.passed ? 'default' : 'destructive'}>
                    {submitResult?.passed ? '✓' : '✗'}
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {solved && (
        <div className="flex justify-center gap-3">
          {nextLevel ? (
            <Button onClick={() => onComplete(level.level_number + 1)}>
              Next Level
            </Button>
          ) : hasNext ? (
            <Button onClick={() => onComplete(level.level_number + 1)}>
              Next Level (no content yet)
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
