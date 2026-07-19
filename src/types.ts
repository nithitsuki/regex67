export interface Profile {
  id: string
  username: string
  is_teacher: boolean
}

export interface Class {
  id: number
  name: string
  teacher_username: string
  enabled: boolean
}

export interface ClassStudent {
  id: number
  class_id: number
  student_username: string
  current_level: number
}

export interface TestCase {
  string: string
  shouldMatch: boolean
}

export interface Level {
  id: number
  class_id: number
  level_number: number
  description: string
  pattern: string
  test_cases: TestCase[]
  buffer?: string
  expected?: string
}
