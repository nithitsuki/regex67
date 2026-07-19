import { create } from 'zustand'
import { supabase } from '@/utils/supabase'

export type Screen = 'loading' | 'login' | 'student' | 'teacher'

interface AppState {
  screen: Screen
  username: string
  profileId: string
  isTeacher: boolean
  setUser: (username: string, profileId: string, isTeacher: boolean) => void
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useStore = create<AppState>((set) => ({
  screen: 'loading',
  username: '',
  profileId: '',
  isTeacher: false,

  setUser: (username, profileId, isTeacher) =>
    set({ screen: isTeacher ? 'teacher' : 'student', username, profileId, isTeacher }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ screen: 'login', username: '', profileId: '', isTeacher: false })
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      set({ screen: 'login' })
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (data) {
      set({
        screen: data.is_teacher ? 'teacher' : 'student',
        username: data.username,
        profileId: data.id,
        isTeacher: data.is_teacher,
      })
    } else {
      set({ screen: 'login' })
    }
  },
}))
