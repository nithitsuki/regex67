import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import LevelList from '@/components/LevelList'
import Cheatsheet from '@/components/Cheatsheet'
import type { Class, ClassStudent } from '@/types'

export default function StudentDashboard() {
  const { username, logout } = useStore()
  const [classes, setClasses] = useState<Class[]>([])
  const [enrollments, setEnrollments] = useState<ClassStudent[]>([])
  const [selectedClass, setSelectedClass] = useState<{ id: number; name: string; currentLevel: number } | null>(null)
  const [showCheatsheet, setShowCheatsheet] = useState(false)

  useEffect(() => {
    supabase.from('classes').select('*').eq('enabled', true).then(({ data }) => {
      if (data) setClasses(data)
    })
    supabase.from('class_students').select('*').eq('student_username', username).then(({ data }) => {
      if (data) setEnrollments(data)
    })
  }, [username])

  const handleJoin = async (c: Class) => {
    const { data, error } = await supabase
      .from('class_students')
      .insert({ class_id: c.id, student_username: username, current_level: 1 })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        toast.error('Already enrolled in this class')
      } else if (error.code === '23503') {
        toast.error('This class no longer exists — ask your teacher to create a new one')
      } else {
        toast.error(error.message)
      }
      return
    }

    if (data) {
      setEnrollments((prev) => [...prev, data])
      setSelectedClass({ id: c.id, name: c.name, currentLevel: 1 })
    }
  }

  if (selectedClass) {
    return (
      <LevelList
        classId={selectedClass.id}
        className={selectedClass.name}
        currentLevel={selectedClass.currentLevel}
        username={username}
        onBack={() => setSelectedClass(null)}
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Welcome, {username}</h1>
          <p className="text-sm text-muted-foreground">Select a class to start learning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCheatsheet(true)}>
            Cheatsheet
          </Button>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {classes.map((c) => {
          const enrolled = enrollments.find((e) => e.class_id === c.id)
          return (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{c.name}</CardTitle>
                    <CardDescription>Teacher: {c.teacher_username}</CardDescription>
                  </div>
                  {enrolled && <Badge>Level {enrolled.current_level}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {enrolled ? (
                  <Button
                    onClick={() =>
                      setSelectedClass({ id: c.id, name: c.name, currentLevel: enrolled.current_level })
                    }
                  >
                    Continue
                  </Button>
                ) : (
                  <Button onClick={() => handleJoin(c)}>Join Class</Button>
                )}
              </CardContent>
            </Card>
          )
        })}
        {classes.length === 0 && (
          <p className="text-center text-muted-foreground">No classes available yet.</p>
        )}
      </div>

      {showCheatsheet && <Cheatsheet onClose={() => setShowCheatsheet(false)} />}
    </div>
  )
}
