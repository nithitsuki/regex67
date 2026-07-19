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
import { sampleLevels } from '@/levels'
import type { Class, Level, ClassStudent, Profile } from '@/types'

function LevelEditor({ classId, onDone }: { classId: number; onDone: () => void }) {
  const [levels, setLevels] = useState<Level[]>([])

  useEffect(() => {
    supabase.from('levels').select('*').eq('class_id', classId).order('level_number').then(({ data }) => {
      if (data) setLevels(data)
    })
  }, [classId])

  const [editing, setEditing] = useState<Partial<Level>>({})

  const seedLevels = async () => {
    const existing = levels.filter((l) => l.level_number <= 5)
    if (existing.length === 5) return
    for (const lv of sampleLevels) {
      if (!levels.find((l) => l.level_number === lv.level_number)) {
        await supabase.from('levels').insert({ class_id: classId, ...lv })
      }
    }
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
    const payload = {
      class_id: classId,
      level_number: editing.level_number,
      description: editing.description || '',
      pattern: editing.pattern || '',
      test_cases: editing.test_cases || [],
    }
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
          {levels.filter((l) => l.level_number <= 5).length}/5 levels created
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
  const [students, setStudents] = useState<(ClassStudent & { profile?: Profile })[]>([])

  useEffect(() => {
    supabase
      .from('class_students')
      .select('*')
      .eq('class_id', classId)
      .then(async ({ data: enrollments }) => {
        if (!enrollments) return
        const { data: profiles } = await supabase.from('profiles').select('*')
        const withProfiles = enrollments.map((e) => ({
          ...e,
          profile: profiles?.find((p: Profile) => p.id === e.profile_id),
        }))
        setStudents(withProfiles)
      })
  }, [classId])

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">No students have joined yet.</p>
  }

  const levelCounts: Record<number, number> = {}
  for (let i = 1; i <= 50; i++) levelCounts[i] = 0
  for (const s of students) levelCounts[s.current_level] = (levelCounts[s.current_level] || 0) + 1

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Students per level</h3>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 50 }, (_, i) => i + 1).map((lv) => (
            <div
              key={lv}
              className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border text-xs"
            >
              <span className="font-mono font-bold">{lv}</span>
              <span className="text-muted-foreground">{levelCounts[lv] || 0}</span>
            </div>
          ))}
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
              <TableCell>{s.profile?.username || 'Unknown'}</TableCell>
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
