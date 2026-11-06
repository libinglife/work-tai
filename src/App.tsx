import { useEffect, useRef, useState } from 'react'
import { SECTIONS, sectionById } from './catalog'
import { formatBoardDate, formatTime } from './format'
import { loadSignals } from './signals'
import {
  readIntention,
  readNotes,
  readSection,
  readTasks,
  writeIntention,
  writeNotes,
  writeSection,
  writeTasks,
} from './storage'
import type { DomainId, Notes, SectionId, Signal, Task, TaskDomain } from './types'
import { DomainView } from './components/DomainView'
import { FocusPanel } from './components/FocusPanel'
import { RailIcon } from './components/RailIcon'
import { LibraryView } from './components/LibraryView'
import { StudyView } from './components/StudyView'
import { TodayView } from './components/TodayView'
import { ToolsView } from './components/ToolsView'

const DOMAIN_IDS: DomainId[] = ['frontend', 'backend', 'web3', 'ai']

export function App() {
  const [section, setSection] = useState<SectionId>(readSection)
  const [query, setQuery] = useState('')
  const [intention, setIntention] = useState(readIntention)
  const [tasks, setTasks] = useState<Task[]>(readTasks)
  const [notes, setNotes] = useState<Notes>(readNotes)
  const [signals, setSignals] = useState<Signal[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [stale, setStale] = useState(false)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [clock, setClock] = useState(() => new Date())
  const searchRef = useRef<HTMLInputElement>(null)
  const current = sectionById(section)

  useEffect(() => writeSection(section), [section])
  useEffect(() => writeIntention(intention), [intention])
  useEffect(() => writeTasks(tasks), [tasks])
  useEffect(() => writeNotes(notes), [notes])

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void refresh(false, controller.signal)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (event.key === '/' && !typing) {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
      if (event.key === 'Escape') {
        setQuery('')
        searchRef.current?.blur()
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      const next = SECTIONS.find((item) => item.key === event.key)
      if (next) setSection(next.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function refresh(force: boolean, signal?: AbortSignal) {
    setStatus('loading')
    setError('')
    let settled = false
    const timeout = window.setTimeout(() => {
      if (settled || signal?.aborted) return
      setStatus('error')
      setError('热帖读取超时。本周关注和入口仍可使用。')
    }, 12000)
    try {
      const feed = await loadSignals(force, signal)
      if (signal?.aborted) return
      settled = true
      setSignals(feed.items)
      setFetchedAt(feed.fetchedAt)
      setStale(feed.stale)
      setStatus('ready')
    } catch (caught) {
      if (signal?.aborted || (caught instanceof DOMException && caught.name === 'AbortError')) return
      settled = true
      setStatus('error')
      if (caught instanceof TypeError) {
        setError('当前网络读不到 Hacker News。本周关注和入口仍可使用。')
      } else if (caught instanceof Error && caught.message) {
        setError(caught.message)
      } else {
        setError('热帖没有读到。本周关注和入口仍可使用。')
      }
    } finally {
      window.clearTimeout(timeout)
    }
  }

  function addTask(title: string, domain: TaskDomain) {
    setTasks((currentTasks) => [
      { id: crypto.randomUUID(), title, domain, done: false, createdAt: Date.now() },
      ...currentTasks,
    ])
  }

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    )
  }

  function removeTask(id: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id))
  }

  function clearDone(domain?: TaskDomain) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => !(task.done && (domain ? task.domain === domain : true))),
    )
  }

  return (
    <div className="shell">
      <a className="skip" href="#desk">
        跳到内容
      </a>
      <aside className="rail">
        <nav className="rail-nav" aria-label="分区">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rail-btn"
              title={`按 ${item.key} 切换`}
              aria-current={item.id === section ? 'page' : undefined}
              onClick={() => setSection(item.id)}
            >
              <RailIcon id={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main id="desk" className="desk">
        <header className="topbar">
          <div className="clock-block">
            <p className="big-time">{formatTime(clock)}</p>
            <p className="date-line">{formatBoardDate(clock)}</p>
          </div>
          <div className="search-wrap">
            <form
              className="search-pill"
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                searchRef.current?.blur()
              }}
            >
              <label className="sr" htmlFor="desk-search">
                过滤当前分区
              </label>
              <svg className="search-mark" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <path d="M16 16l4 4" />
              </svg>
              <input
                id="desk-search"
                ref={searchRef}
                value={query}
                placeholder="过滤任务、信号、题目"
                onChange={(event) => setQuery(event.target.value)}
              />
              {query ? (
                <button type="button" className="search-go" onClick={() => setQuery('')}>
                  清除
                </button>
              ) : (
                <button type="submit" className="search-go">
                  搜索
                </button>
              )}
            </form>
            <div className="quick">
              {SECTIONS.filter((item) => item.id !== 'today').map((item) => (
                <button key={item.id} type="button" onClick={() => setSection(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {section === 'today' ? (
          <TodayView
            intention={intention}
            onIntention={setIntention}
            tasks={tasks}
            query={query}
            signals={signals}
            status={status}
            error={error}
            clock={clock}
            onOpen={setSection}
            onAdd={addTask}
            onToggle={toggleTask}
          />
        ) : (
          <div className="stage">
            <h1>{current.label}</h1>
            <p className="sub">{current.subtitle}</p>

        {DOMAIN_IDS.includes(section as DomainId) ? (
          <DomainView
            domainId={section as DomainId}
            tasks={tasks}
            notes={notes[section as DomainId]}
            query={query}
            signals={signals}
            status={status}
            error={error}
            stale={stale}
            fetchedAt={fetchedAt}
            onNotes={(value) => setNotes((currentNotes) => ({ ...currentNotes, [section]: value }))}
            onRefresh={() => void refresh(true)}
            onAdd={addTask}
            onToggle={toggleTask}
            onRemove={removeTask}
            onClearDone={() => clearDone(section as TaskDomain)}
          />
        ) : null}

        {section === 'library' ? <LibraryView query={query} /> : null}
        {section === 'study' ? <StudyView query={query} /> : null}
        {section === 'tools' ? <ToolsView query={query} /> : null}
        {section === 'focus' ? (
            <div className="focus-page">
              <FocusPanel />
              {query ? <p className="empty">检索在今日、各方向、图书馆、题库和工具页生效。</p> : null}
            </div>
          ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
