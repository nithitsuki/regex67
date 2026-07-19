import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { sampleLevels } from '@/levels'
import type { Class, Level, ClassStudent } from '@/types'

function LevelEditor({ classId, onDone }: { classId: number; onDone: () => void }) {
  const [levels, setLevels] = useState<Level[]>([])

  useEffect(() => {
    supabase.from('levels').select('*').eq('class_id', classId).order('level_number').then(({ data }) => {
      if (data) setLevels(data)
    })
  }, [classId])

  const [editing, setEditing] = useState<Partial<Level>>({})

  const seedLevels = async () => {
    const existingCount = levels.filter((l) => l.level_number <= 13).length
    if (existingCount === 13) {
      toast.info('All 13 sample levels already exist')
      return
    }
    let count = 0
    for (const lv of sampleLevels) {
      if (!levels.find((l) => l.level_number === lv.level_number)) {
        const { error } = await supabase.from('levels').insert({ class_id: classId, ...lv })
        if (error) {
          toast.error(`Failed to insert level ${lv.level_number}: ${error.message}`)
          return
        }
        count++
      }
    }
    toast.success(`${count} sample levels created`)
    onDone()
    const { data } = await supabase
      .from('levels')
      .select('*')
      .eq('class_id', classId)
      .order('level_number')
    if (data) setLevels(data)
  }

  const saveLevel = async () => {
    if (!editing.level_number) return
    const payload: Record<string, unknown> = {
      class_id: classId,
      level_number: editing.level_number,
      description: editing.description || '',
      pattern: editing.pattern || '',
      test_cases: editing.test_cases || [],
    }
    if (editing.buffer !== undefined) payload.buffer = editing.buffer
    if (editing.expected !== undefined) payload.expected = editing.expected
    const existing = levels.find((l) => l.level_number === editing.level_number)
    if (existing) {
      await supabase.from('levels').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('levels').insert(payload)
    }
    setEditing({})
    onDone()
    supabase.from('levels').select('*').eq('class_id', classId).order('level_number').then(({ data }) => {
      if (data) setLevels(data)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={seedLevels}>
          Seed 5 sample levels
        </Button>
        <span className="text-xs text-muted-foreground">
          {levels.filter((l) => l.level_number <= 13).length}/13 levels created
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 50 }, (_, i) => i + 1).map((n) => {
          const exists = levels.find((l) => l.level_number === n)
          return (
            <Button
              key={n}
              variant={editing.level_number === n ? 'default' : exists ? 'outline' : 'ghost'}
              size="sm"
              onClick={() =>
                setEditing(
                  levels.find((l) => l.level_number === n) || {
                    level_number: n,
                    description: '',
                    pattern: '',
                    test_cases: [],
                  }
                )
              }
            >
              {n}
            </Button>
          )
        })}
      </div>

      {editing.level_number && (
        <Card>
          <CardHeader>
            <CardTitle>Level {editing.level_number}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={editing.description || ''}
                onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this level teaches"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Correct Pattern</label>
              <Input
                value={editing.pattern || ''}
                onChange={(e) => setEditing((prev) => ({ ...prev, pattern: e.target.value }))}
                placeholder="e.g. \\d+"
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Buffer (for find/replace challenges)</label>
              <textarea
                value={editing.buffer || ''}
                onChange={(e) => setEditing((prev) => ({ ...prev, buffer: e.target.value }))}
                placeholder="Initial text buffer for find/replace challenges"
                className="min-h-[80px] w-full rounded-md border bg-muted p-3 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Expected (for find/replace challenges)</label>
              <textarea
                value={editing.expected || ''}
                onChange={(e) => setEditing((prev) => ({ ...prev, expected: e.target.value }))}
                placeholder="Expected output after find/replace"
                className="min-h-[80px] w-full rounded-md border bg-muted p-3 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Test Cases (JSON format)
              </label>
              <textarea
                value={JSON.stringify(editing.test_cases || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setEditing((prev) => ({ ...prev, test_cases: parsed }))
                  } catch {}
                }}
                className="min-h-[200px] w-full rounded-md border bg-muted p-3 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format: [{'{'}"string": "text", "shouldMatch": true{'}'}]
              </p>
            </div>
            <Button onClick={saveLevel}>Save Level</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CreateClass({ onCreated }: { onCreated: () => void }) {
  const { username } = useStore()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    setError('')
    const { error: err } = await supabase.from('classes').insert({
      name: name.trim(),
      teacher_username: username,
      enabled: false,
    })
    setCreating(false)
    if (err) {
      setError(err.message)
      return
    }
    setName('')
    onCreated()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Class name"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create Class'}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function ProgressView({ classId }: { classId: number }) {
  const [students, setStudents] = useState<ClassStudent[]>([])

  useEffect(() => {
    supabase
      .from('class_students')
      .select('*')
      .eq('class_id', classId)
      .then(({ data }) => {
        if (data) setStudents(data)
      })
  }, [classId])

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">No students have joined yet.</p>
  }

  const total = students.length

  const completion: Record<number, { count: number; pct: number }> = {}
  for (let i = 1; i <= 50; i++) {
    const completed = students.filter((s) => s.current_level > i).length
    completion[i] = { count: students.filter((s) => s.current_level === i).length, pct: Math.round((completed / total) * 100) }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-2 text-sm font-medium">Level completion ({total} students)</h3>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-1 h-48 pt-6 pb-6 min-w-[800px]">
          {Array.from({ length: 50 }, (_, i) => i + 1).map((lv) => {
            const { count, pct } = completion[lv]
            return (
              <div key={lv} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t transition-all group-hover:opacity-80"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: pct >= 80 ? 'hsl(142, 76%, 36%)' : pct >= 40 ? 'hsl(48, 96%, 53%)' : 'hsl(0, 84%, 60%)',
                  }}
                />
                <span className="mt-0.5 text-[10px] text-muted-foreground">{lv}</span>
                {pct > 0 && (
                  <span className="absolute -top-4 text-[10px] font-medium text-foreground">
                    {pct}%
                  </span>
                )}
                {count > 0 && (
                  <span className="absolute bottom-6 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {count} here
                  </span>
                )}
              </div>
            )
          })}
          </div>
        </div>
      </div>
      <Separator />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Current Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.student_username}</TableCell>
              <TableCell>
                <Badge>Level {s.current_level}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function TeacherDashboard() {
  const { username, logout } = useStore()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [tab, setTab] = useState('levels')

  const refreshClasses = () => {
    supabase.from('classes').select('*').eq('teacher_username', username).then(({ data }) => {
      if (data) setClasses(data)
    })
  }

  useEffect(refreshClasses, [username])

  if (selectedClass) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setSelectedClass(null)}>
            Back
          </Button>
          <h1 className="text-xl font-bold">{selectedClass.name}</h1>
          <Badge variant={selectedClass.enabled ? 'default' : 'secondary'}>
            {selectedClass.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="levels">Levels</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="levels">
            <LevelEditor classId={selectedClass.id} onDone={refreshClasses} />
          </TabsContent>
          <TabsContent value="progress">
            <ProgressView classId={selectedClass.id} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Teacher Dashboard</h1>
        <Button variant="ghost" onClick={logout}>Logout</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a Class</CardTitle>
          <CardDescription>Set up a new class for your students</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateClass onCreated={refreshClasses} />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Your Classes</h2>
        {classes.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{c.name}</CardTitle>
                <Badge variant={c.enabled ? 'default' : 'secondary'}>
                  {c.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => setSelectedClass(c)}>Manage</Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await supabase.from('classes').update({ enabled: !c.enabled }).eq('id', c.id)
                  refreshClasses()
                }}
              >
                {c.enabled ? 'Disable' : 'Enable'}
              </Button>
            </CardContent>
          </Card>
        ))}
        {classes.length === 0 && (
          <p className="text-center text-muted-foreground">No classes yet. Create one above.</p>
        )}
      </div>
    </div>
  )
}
