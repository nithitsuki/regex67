import { useState, useRef, useCallback, useEffect } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { supabase } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Level } from '@/types'

function useDarkMode() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

interface Props {
  level: Level
  username: string
  classId: number
  onComplete: (nextLevelNumber: number) => void
  onBack: () => void
}

export default function FindReplaceChallenge({ level, username, classId, onComplete, onBack }: Props) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [solved, setSolved] = useState(false)
  const dark = useDarkMode()
  const key = `fr-${level.level_number}`

  useEffect(() => {
    setSolved(false)
  }, [level.level_number])

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    editor.focus()
    editor.getAction('actions.find')?.run()
  }, [])

  const handleReset = useCallback(() => {
    editorRef.current?.setValue(level.buffer || '')
    editorRef.current?.focus()
  }, [level.buffer])

  const handleCheck = useCallback(() => {
    const content = editorRef.current?.getValue() || ''
    if (content === level.expected) {
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
  }, [level, username, classId])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <h1 className="text-xl font-bold">Level {level.level_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Use Cmd+F for find & replace</span>
          {solved && <Badge variant="default">Solved!</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <div className="text-sm leading-relaxed [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{level.description}</ReactMarkdown>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleReset} variant="outline" disabled={solved}>Reset</Button>
        <Button onClick={handleCheck} variant="outline" disabled={solved}>Check</Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Editor
          key={key}
          height="300px"
          defaultLanguage="plaintext"
          defaultValue={level.buffer || ''}
          onMount={handleMount}
          theme={dark ? 'vs-dark' : 'vs'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: solved,
          }}
        />
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
