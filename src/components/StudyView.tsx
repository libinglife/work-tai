import { useState } from 'react'
import { COURSES } from '../catalog'
import { matches } from '../format'
import { readStudy, writeStudy, type StudyPrompt, type StudySave } from '../storage'
import type { ShelfMark, StudyTrack } from '../types'

const TRACKS: { id: 'all' | StudyTrack; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'ai', label: 'AI' },
  { id: 'fullstack', label: '全栈' },
  { id: 'speech', label: '口才' },
  { id: 'other', label: '其他' },
]

const COURSE_TABS: { id: 'ai' | 'fullstack' | 'speech'; label: string }[] = [
  { id: 'ai', label: 'AI' },
  { id: 'fullstack', label: '全栈' },
  { id: 'speech', label: '口才社交' },
]

const TRACK_LABEL: Record<StudyTrack, string> = {
  ai: 'AI',
  fullstack: '全栈',
  speech: '口才',
  other: '其他',
}

const VIDEO_LABEL: Record<ShelfMark, string> = { idle: '想看', active: '在看', done: '看过' }

function nextMark(mark: ShelfMark): ShelfMark {
  if (mark === 'idle') return 'active'
  if (mark === 'active') return 'done'
  return 'idle'
}

export function StudyView({ query }: { query: string }) {
  const [study, setStudy] = useState<StudySave>(readStudy)
  const [track, setTrack] = useState<StudyTrack>('ai')
  const [filter, setFilter] = useState<(typeof TRACKS)[number]['id']>('all')
  const [courseTab, setCourseTab] = useState<(typeof COURSE_TABS)[number]['id']>('ai')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  function save(next: StudySave) {
    writeStudy(next)
    setStudy(next)
  }

  function addPrompt() {
    const trimmed = title.trim()
    if (!trimmed) return
    save({
      ...study,
      prompts: [
        {
          id: crypto.randomUUID(),
          title: trimmed,
          note: note.trim(),
          track,
          done: false,
          createdAt: Date.now(),
        },
        ...study.prompts,
      ],
    })
    setTitle('')
    setNote('')
  }

  function togglePrompt(id: string) {
    save({
      ...study,
      prompts: study.prompts.map((prompt) => (prompt.id === id ? { ...prompt, done: !prompt.done } : prompt)),
    })
  }

  function removePrompt(id: string) {
    save({ ...study, prompts: study.prompts.filter((prompt) => prompt.id !== id) })
  }

  function clearDone() {
    save({ ...study, prompts: study.prompts.filter((prompt) => !prompt.done) })
  }

  function markVideo(id: string) {
    const videos = { ...study.videos }
    const mark = nextMark(videos[id] ?? 'idle')
    if (mark === 'idle') delete videos[id]
    else videos[id] = mark
    save({ ...study, videos })
  }

  const prompts = study.prompts.filter(
    (prompt) =>
      (filter === 'all' || prompt.track === filter) && matches(query, prompt.title, prompt.note, TRACK_LABEL[prompt.track]),
  )
  const openCount = study.prompts.filter((prompt) => !prompt.done).length
  const doneCount = study.prompts.length - openCount
  const courses = COURSES.filter(
    (course) => course.track === courseTab && matches(query, course.title, course.who, course.why, course.platform),
  )

  return (
    <div className="study">
      <section className="panel">
        <div className="panel-head">
          <h2>我的题库</h2>
          {doneCount > 0 ? (
            <button type="button" className="text-btn" onClick={clearDone}>
              清除已会
            </button>
          ) : null}
        </div>
        <p className="meta">待学 {openCount} · 已会 {doneCount}</p>
        <form
          className="study-form"
          onSubmit={(event) => {
            event.preventDefault()
            addPrompt()
          }}
        >
          <input
            value={title}
            placeholder="写下要练的一道题"
            aria-label="题目"
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            value={note}
            placeholder="怎么算做会，可选"
            aria-label="完成标准"
            onChange={(event) => setNote(event.target.value)}
          />
          <select aria-label="题目方向" value={track} onChange={(event) => setTrack(event.target.value as StudyTrack)}>
            <option value="ai">AI</option>
            <option value="fullstack">全栈</option>
            <option value="speech">口才</option>
            <option value="other">其他</option>
          </select>
          <button type="submit" className="btn primary">
            加入
          </button>
        </form>
        <div className="hot-tabs" role="tablist" aria-label="题目方向">
          {TRACKS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {prompts.length === 0 ? (
          <p className="empty">还没有题目。上面加一道，刷新后还在。</p>
        ) : (
          <ul className="task-list">
            {prompts.map((prompt) => (
              <PromptRow key={prompt.id} prompt={prompt} onToggle={togglePrompt} onRemove={removePrompt} />
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>公开课</h2>
        <div className="hot-tabs" role="tablist" aria-label="公开课">
          {COURSE_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={courseTab === item.id}
              onClick={() => setCourseTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {courses.length === 0 ? (
          <p className="empty">这层没有对上的课。</p>
        ) : (
          <ul className="course-list">
            {courses.map((course) => {
              const mark = study.videos[course.id] ?? 'idle'
              return (
                <li key={course.id}>
                  <span
                    className={`cover platform ${
                      course.platform === 'B站'
                        ? 'bili'
                        : course.platform === 'MIT'
                          ? 'mit'
                          : course.platform === '文档'
                            ? 'doc'
                            : 'yt'
                    }`}
                  >
                    {course.platform === 'B站'
                      ? 'B'
                      : course.platform === 'MIT'
                        ? 'MIT'
                        : course.platform === '文档'
                          ? 'Doc'
                          : 'YT'}
                  </span>
                  <div>
                    <h3>
                      <a href={course.href} target="_blank" rel="noreferrer">
                        {course.title}
                      </a>
                    </h3>
                    <p className="meta">
                      {course.who} · {course.platform} · {course.plays}
                    </p>
                    <p className="why">{course.why}</p>
                  </div>
                  <button type="button" className={`btn mark ${mark}`} onClick={() => markVideo(course.id)}>
                    {VIDEO_LABEL[mark]}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <p className="meta library-note">播放量取自公开页面，之后会变。课堂课打开后可能要购买。</p>
      </section>
    </div>
  )
}

function PromptRow({
  prompt,
  onToggle,
  onRemove,
}: {
  prompt: StudyPrompt
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <li className={prompt.done ? 'done' : undefined}>
      <label>
        <input type="checkbox" checked={prompt.done} onChange={() => onToggle(prompt.id)} />
        <span>
          {prompt.title}
          <em>{TRACK_LABEL[prompt.track]}</em>
          {prompt.note ? <small>{prompt.note}</small> : null}
        </span>
      </label>
      <button type="button" className="text-btn" onClick={() => onRemove(prompt.id)}>
        删除
      </button>
    </li>
  )
}
