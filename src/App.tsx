import { useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useStore } from '@/store'
import LoginScreen from '@/components/LoginScreen'
import StudentDashboard from '@/components/StudentDashboard'
import TeacherDashboard from '@/components/TeacherDashboard'

export default function App() {
  const { screen, initialize, setUser } = useStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (screen === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={async (username) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single()
          if (profile) {
            setUser(profile.username, profile.id, profile.is_teacher)
          }
        }}
      />
    )
  }

  if (screen === 'student') {
    return <StudentDashboard />
  }

  return <TeacherDashboard />
}
