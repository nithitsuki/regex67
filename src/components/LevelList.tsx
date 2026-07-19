import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import LevelChallenge from '@/components/LevelChallenge'
import FindReplaceChallenge from '@/components/FindReplaceChallenge'
import Cheatsheet from '@/components/Cheatsheet'
import type { Level } from '@/types'

interface Props {
  classId: number
  className: string
  currentLevel: number
  username: string
  onBack: () => void
}

export default function LevelList({ classId, className, currentLevel, username, onBack }: Props) {
  const [levels, setLevels] = useState<Level[]>([])
  const [activeLevel, setActiveLevel] = useState<Level | null>(null)
  const [activeLvl, setActiveLvl] = useState(currentLevel)
  const [showCheatsheet, setShowCheatsheet] = useState(false)

  useEffect(() => {
    supabase
      .from('levels')
      .select('*')
      .eq('class_id', classId)
      .order('level_number')
      .then(({ data }) => {
        if (data) setLevels(data)
      })
  }, [classId])

  const handleComplete = (nextLevelNumber: number) => {
    setActiveLvl(nextLevelNumber)
    const next = levels.find((l) => l.level_number === nextLevelNumber)
    if (next) {
      setActiveLevel(next)
    } else {
      setActiveLevel(null)
    }
  }

  if (activeLevel) {
    const Challenge = activeLevel.buffer ? FindReplaceChallenge : LevelChallenge
    return (
      <Challenge
        level={activeLevel}
        username={username}
        classId={classId}
        allLevels={levels}
        onComplete={handleComplete}
        onBack={() => setActiveLevel(null)}
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>Classes</Button>
          <h1 className="text-xl font-bold">{className}</h1>
        </div>
        <Button variant="outline" onClick={() => setShowCheatsheet(true)}>
          Cheatsheet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={((activeLvl - 1) / 50) * 100} className="flex-1">
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
            <span className="text-sm text-muted-foreground">
              Level {Math.min(activeLvl, 50)} / 50
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => {
          const level = levels.find((l) => l.level_number === num)
          const unlocked = num <= activeLvl
          const current = num === activeLvl
          return (
            <Button
              key={num}
              variant={current ? 'default' : unlocked ? 'outline' : 'ghost'}
              disabled={!unlocked || !level}
              onClick={() => level && setActiveLevel(level)}
              className="h-12"
            >
              {num}
            </Button>
          )
        })}
      </div>

      {showCheatsheet && <Cheatsheet onClose={() => setShowCheatsheet(false)} />}
    </div>
  )
}
