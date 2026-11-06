import type { DailyChecks, DomainId, Notes, SectionId, ShelfMark, StudyTrack, Task, TaskDomain } from './types'
import { BOOKS, CHECKS, COURSES, PROJECTS } from './catalog'
import { todayKey } from './format'

const TASKS_KEY = 'worktai.tasks.v1'
const INTENTION_KEY = 'worktai.intention.v1'
const NOTES_KEY = 'worktai.notes.v1'
const SECTION_KEY = 'worktai.section.v1'
const CHECKS_KEY = 'worktai.checks.v1'
const FOCUS_KEY = 'worktai.focus.v1'
const LIBRARY_KEY = 'worktai.library.v1'
const STUDY_KEY = 'worktai.study.v1'

const DOMAINS: DomainId[] = ['frontend', 'backend', 'web3', 'ai']
const SECTIONS: SectionId[] = ['today', 'frontend', 'backend', 'web3', 'ai', 'library', 'tools', 'focus', 'study']
const TASK_DOMAINS: TaskDomain[] = ['general', ...DOMAINS]

export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 存储满或被禁用时，页面仍可用，只是刷新后不保留。 */
  }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.done === 'boolean' &&
    typeof task.createdAt === 'number' &&
    TASK_DOMAINS.includes(task.domain as TaskDomain)
  )
}

export function readTasks(): Task[] {
  const value = readJson(TASKS_KEY)
  return Array.isArray(value) ? value.filter(isTask) : []
}

export function writeTasks(tasks: Task[]) {
  writeJson(TASKS_KEY, tasks)
}

export function readIntention() {
  const value = readJson(INTENTION_KEY)
  return typeof value === 'string' ? value : ''
}

export function writeIntention(intention: string) {
  writeJson(INTENTION_KEY, intention)
}

export function emptyNotes(): Notes {
  return { frontend: '', backend: '', web3: '', ai: '' }
}

export function readNotes(): Notes {
  const value = readJson(NOTES_KEY)
  const notes = emptyNotes()
  if (!value || typeof value !== 'object') return notes
  for (const domain of DOMAINS) {
    const text = (value as Record<string, unknown>)[domain]
    if (typeof text === 'string') notes[domain] = text
  }
  return notes
}

export function writeNotes(notes: Notes) {
  writeJson(NOTES_KEY, notes)
}

export function readSection(): SectionId {
  const value = readJson(SECTION_KEY)
  return typeof value === 'string' && SECTIONS.includes(value as SectionId)
    ? (value as SectionId)
    : 'today'
}

export function writeSection(section: SectionId) {
  writeJson(SECTION_KEY, section)
}

export function readChecks(): DailyChecks {
  const today = todayKey()
  const value = readJson(CHECKS_KEY)
  if (!value || typeof value !== 'object') return { dayKey: today, flags: CHECKS.map(() => false) }
  const saved = value as Partial<DailyChecks>
  if (saved.dayKey !== today || !Array.isArray(saved.flags)) {
    return { dayKey: today, flags: CHECKS.map(() => false) }
  }
  return {
    dayKey: today,
    flags: CHECKS.map((_, index) => Boolean(saved.flags?.[index])),
  }
}

export function writeChecks(checks: DailyChecks) {
  writeJson(CHECKS_KEY, checks)
}

export type FocusSave = {
  mode: 'work' | 'break'
  running: boolean
  endsAt: number | null
  remainingMs: number
  sessions: number
  dayKey: string
  presetMs: number
  finished: boolean
}

export const DEFAULT_PRESET = 25 * 60 * 1000

export function defaultFocus(): FocusSave {
  return {
    mode: 'work',
    running: false,
    endsAt: null,
    remainingMs: DEFAULT_PRESET,
    sessions: 0,
    dayKey: todayKey(),
    presetMs: DEFAULT_PRESET,
    finished: false,
  }
}

function isFocusSave(value: unknown): value is FocusSave {
  if (!value || typeof value !== 'object') return false
  const saved = value as Partial<FocusSave>
  return (
    (saved.mode === 'work' || saved.mode === 'break') &&
    typeof saved.running === 'boolean' &&
    (saved.endsAt === null || typeof saved.endsAt === 'number') &&
    typeof saved.remainingMs === 'number' &&
    typeof saved.sessions === 'number' &&
    typeof saved.dayKey === 'string' &&
    typeof saved.presetMs === 'number' &&
    typeof saved.finished === 'boolean'
  )
}

export function readFocus(): FocusSave {
  const value = readJson(FOCUS_KEY)
  const saved = isFocusSave(value) ? { ...value } : defaultFocus()
  const today = todayKey()
  if (saved.dayKey !== today) {
    saved.sessions = 0
    saved.dayKey = today
  }
  if (saved.running && saved.endsAt) {
    if (saved.endsAt <= Date.now()) {
      if (saved.mode === 'work') saved.sessions += 1
      saved.running = false
      saved.endsAt = null
      saved.remainingMs = 0
      saved.finished = true
    }
  }
  return saved
}

export function writeFocus(focus: FocusSave) {
  writeJson(FOCUS_KEY, focus)
}

export type LibraryMarks = {
  books: Record<string, ShelfMark>
  projects: Record<string, ShelfMark>
}

const MARKS: ShelfMark[] = ['idle', 'active', 'done']

function readMarks(value: unknown, ids: string[]): Record<string, ShelfMark> {
  const marks: Record<string, ShelfMark> = {}
  if (!value || typeof value !== 'object') return marks
  for (const [id, mark] of Object.entries(value)) {
    if (!ids.includes(id) || mark === 'idle' || !MARKS.includes(mark as ShelfMark)) continue
    marks[id] = mark as ShelfMark
  }
  return marks
}

export function readLibrary(): LibraryMarks {
  const value = readJson(LIBRARY_KEY)
  const saved = value && typeof value === 'object' ? (value as { books?: unknown; projects?: unknown }) : {}
  return {
    books: readMarks(saved.books, BOOKS.map((book) => book.id)),
    projects: readMarks(saved.projects, PROJECTS.map((project) => project.id)),
  }
}

export function writeLibrary(marks: LibraryMarks) {
  writeJson(LIBRARY_KEY, marks)
}

export type StudyPrompt = {
  id: string
  title: string
  note: string
  track: StudyTrack
  done: boolean
  createdAt: number
}

export type StudySave = {
  prompts: StudyPrompt[]
  videos: Record<string, ShelfMark>
}

const STUDY_TRACKS: StudyTrack[] = ['ai', 'fullstack', 'speech', 'other']

function isStudyPrompt(value: unknown): value is StudyPrompt {
  if (!value || typeof value !== 'object') return false
  const prompt = value as Partial<StudyPrompt>
  return (
    typeof prompt.id === 'string' &&
    typeof prompt.title === 'string' &&
    typeof prompt.note === 'string' &&
    typeof prompt.done === 'boolean' &&
    typeof prompt.createdAt === 'number' &&
    STUDY_TRACKS.includes(prompt.track as StudyTrack)
  )
}

export function readStudy(): StudySave {
  const value = readJson(STUDY_KEY)
  const saved = value && typeof value === 'object' ? (value as { prompts?: unknown; videos?: unknown }) : {}
  return {
    prompts: Array.isArray(saved.prompts) ? saved.prompts.filter(isStudyPrompt) : [],
    videos: readMarks(saved.videos, COURSES.map((course) => course.id)),
  }
}

export function writeStudy(study: StudySave) {
  writeJson(STUDY_KEY, study)
}

export { FOCUS_KEY }
