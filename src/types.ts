export type DomainId = 'frontend' | 'backend' | 'web3' | 'ai'

export type SectionId = 'today' | DomainId | 'library' | 'tools' | 'focus' | 'study'

export type StudyTrack = 'ai' | 'fullstack' | 'speech' | 'other'

export type ShelfId =
  | 'base'
  | 'craft'
  | 'judgment'
  | 'field'
  | 'skill'
  | 'history'
  | 'literature'
  | 'society'
  | 'thinking'
  | 'growth'

export type ShelfMark = 'idle' | 'active' | 'done'

export type TaskDomain = 'general' | DomainId

export type Task = {
  id: string
  title: string
  domain: TaskDomain
  done: boolean
  createdAt: number
}

export type Signal = {
  id: number
  title: string
  url: string
  score: number
  comments: number
  time: number
  domain: DomainId | 'other'
}

export type SignalFeed = {
  fetchedAt: number
  stale: boolean
  items: Signal[]
}

export type Notes = Record<DomainId, string>

export type DailyChecks = {
  dayKey: string
  flags: boolean[]
}
