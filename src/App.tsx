import { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'

type Todo = { id: number; name: string }

function Login({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!username.trim()) return
    setLoading(true)
    setError('')

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle()

    if (existing) {
      onLogin(username.trim())
      return
    }

    const { data: auth, error: authErr } = await supabase.auth.signInAnonymously()
    if (authErr || !auth.user) {
      setError(authErr?.message || 'Login failed')
      setLoading(false)
      return
    }

    const { error: insertErr } = await supabase
      .from('profiles')
      .insert({ id: auth.user.id, username: username.trim() })

    if (insertErr) {
      setError(insertErr.message)
      setLoading(false)
      return
    }

    onLogin(username.trim())
  }

  return (
    <div>
      <h1>Login</h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

function Todos({ username }: { username: string }) {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    supabase.from('todos').select('*').then(({ data }) => {
      if (data) setTodos(data)
    })
  }, [])

  return (
    <div>
      <h1>Welcome, {username}</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUsername(data.username)
            setChecking(false)
          })
      } else {
        setChecking(false)
      }
    })
  }, [])

  if (checking) return <p>Loading...</p>

  return username ? <Todos username={username} /> : <Login onLogin={setUsername} />
}
