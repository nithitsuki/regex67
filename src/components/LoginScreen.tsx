import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface Props {
  onLogin: (username: string) => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const trimmed = username.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', trimmed)
      .maybeSingle()

    if (existing) {
      onLogin(trimmed)
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
      .insert({ id: auth.user.id, username: trimmed })

    if (insertErr) {
      setError(insertErr.message)
      setLoading(false)
      return
    }

    onLogin(trimmed)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Regex67</CardTitle>
          <CardDescription>Enter your username to get started</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
