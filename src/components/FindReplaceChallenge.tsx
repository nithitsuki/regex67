import { useState, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { supabase } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Level } from '@/types'

interface Props {
  level: Level
  username: string
  classId: number
  onComplete: (nextLevelNumber: number) => void
  onBack: () => void
}

export default function FindReplaceChallenge({ level, username, classId, onComplete, onBack }: Props) {
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [result, setResult] = useState(level.buffer || '')
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    setFind('')
    setReplace('')
    setResult(level.buffer || '')
    setSolved(false)
  }, [level.level_number])

  const handleApply = useCallback(() => {
    if (!find) return
    try {
      const flags = find.startsWith('/') ? find.match(/^\/(.*)\/([gimsuy]*)$/) : null
      let regex: RegExp
      if (flags) {
        regex = new RegExp(flags[1], flags[2])
      } else {
        regex = new RegExp(find, 'g')
      }
      const transformed = result.replace(regex, replace)
      setResult(transformed)
    } catch {
      toast.error('Invalid regex pattern')
    }
  }, [find, replace, result])

  const handleCheck = useCallback(() => {
    if (result === level.expected) {
      setSolved(true)
      supabase
        .from('class_students')
        .update({ current_level: level.level_number + 1 })
        .eq('student_username', username)
        .eq('class_id', classId)
        .then(({ error }) => {
          if (!error) toast.success(`Level ${level.level_number} solved!`)
        })
    } else {
      toast.error('Output does not match expected result')
    }
  }, [result, level, username, classId])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
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
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground">Find</label>
          <Input
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Regex pattern"
            className="font-mono"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground">Replace with</label>
          <Input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replacement string"
            className="font-mono"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleApply} disabled={solved}>Apply</Button>
          <Button onClick={() => setResult(level.buffer || '')} variant="outline" disabled={solved}>Reset</Button>
          <Button onClick={handleCheck} variant="outline" disabled={solved}>Check</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Input buffer</p>
          <div className="rounded-lg border overflow-hidden">
            <Editor
              height="200px"
              defaultLanguage="plaintext"
              value={level.buffer || ''}
              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Result</p>
          <div className="rounded-lg border overflow-hidden">
            <Editor
              height="200px"
              defaultLanguage="plaintext"
              value={result}
              options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, theme: 'vs-dark' }}
            />
          </div>
        </div>
      </div>

      {level.expected && !solved && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Show expected output</summary>
          <pre className="mt-1 rounded bg-muted p-2 font-mono text-sm">{level.expected}</pre>
        </details>
      )}

      {solved && (
        <div className="flex justify-center">
          <Button onClick={() => onComplete(level.level_number + 1)}>
            Next Level
          </Button>
        </div>
      )}
    </div>
  )
}
