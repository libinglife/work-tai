import { useMemo, useState } from 'react'
import { BOOKS, PROJECTS, SHELVES } from '../catalog'
import { matches } from '../format'
import { readLibrary, writeLibrary, type LibraryMarks } from '../storage'
import type { ShelfId, ShelfMark } from '../types'

const BOOK_LABEL: Record<ShelfMark, string> = { idle: '想读', active: '在读', done: '读过' }
const PROJECT_LABEL: Record<ShelfMark, string> = { idle: '待做', active: '在做', done: '做完' }
const SHELF_LABEL: Record<ShelfId, string> = {
  base: '底子',
  craft: '手艺',
  judgment: '判断',
  field: '方向',
  skill: '技能',
  history: '人文',
  literature: '文学',
  society: '社会',
  thinking: '思维',
  growth: '成长',
}

function nextMark(mark: ShelfMark): ShelfMark {
  if (mark === 'idle') return 'active'
  if (mark === 'active') return 'done'
  return 'idle'
}

export function LibraryView({ query }: { query: string }) {
  const [shelf, setShelf] = useState<(typeof SHELVES)[number]['id']>('all')
  const [marks, setMarks] = useState<LibraryMarks>(readLibrary)

  function setBook(id: string) {
    setMarks((current) => {
      const next = { ...current.books }
      const mark = nextMark(current.books[id] ?? 'idle')
      if (mark === 'idle') delete next[id]
      else next[id] = mark
      const saved = { ...current, books: next }
      writeLibrary(saved)
      return saved
    })
  }

  function setProject(id: string) {
    setMarks((current) => {
      const next = { ...current.projects }
      const mark = nextMark(current.projects[id] ?? 'idle')
      if (mark === 'idle') delete next[id]
      else next[id] = mark
      const saved = { ...current, projects: next }
      writeLibrary(saved)
      return saved
    })
  }

  const books = useMemo(
    () =>
      BOOKS.filter((book) => (shelf === 'all' || shelf === book.shelf) && matches(query, book.title, book.author, book.why, book.field)),
    [query, shelf],
  )
  const projects = useMemo(
    () =>
      PROJECTS.filter(
        (project) =>
          (shelf === 'all' || shelf === 'project') && matches(query, project.title, project.why, ...project.steps),
      ),
    [query, shelf],
  )
  const reading = Object.values(marks.books).filter((mark) => mark === 'active').length
  const finished = Object.values(marks.books).filter((mark) => mark === 'done').length
  const doing = Object.values(marks.projects).filter((mark) => mark === 'active').length

  return (
    <div className={books.length && projects.length ? 'library split' : 'library'}>
      <div className="library-tools">
        <div className="hot-tabs" role="tablist" aria-label="书架">
          {SHELVES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={shelf === item.id}
              onClick={() => setShelf(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="meta">
          在读 {reading} · 读过 {finished} · 在做 {doing}
        </p>
      </div>

      {books.length ? (
        <section className="panel">
          <h2>书</h2>
          <ul className="book-list">
            {books.map((book) => {
              const mark = marks.books[book.id] ?? 'idle'
              return (
                <li key={book.id}>
                  <span className="cover" style={{ background: book.tint }}>
                    {book.mark}
                  </span>
                  <div>
                    <h3>
                      <a href={book.href} target="_blank" rel="noreferrer">
                        {book.title}
                      </a>
                    </h3>
                    <p className="meta">
                      {book.author}
                      {book.field ? ` · ${book.field}` : ` · ${SHELF_LABEL[book.shelf]}`}
                    </p>
                    <p className="why">{book.why}</p>
                  </div>
                  <button type="button" className={`btn mark ${mark}`} onClick={() => setBook(book.id)}>
                    {BOOK_LABEL[mark]}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {projects.length ? (
        <section className="panel">
          <h2>项目学习</h2>
          <ul className="project-list">
            {projects.map((project) => {
              const mark = marks.projects[project.id] ?? 'idle'
              return (
                <li key={project.id}>
                  <div className="project-head">
                    <span className="cover" style={{ background: project.tint }}>
                      {project.mark}
                    </span>
                    <div>
                      <h3>
                        <a href={project.href} target="_blank" rel="noreferrer">
                          {project.title}
                        </a>
                      </h3>
                      <p className="why">{project.why}</p>
                    </div>
                    <button type="button" className={`btn mark ${mark}`} onClick={() => setProject(project.id)}>
                      {PROJECT_LABEL[mark]}
                    </button>
                  </div>
                  <ol>
                    {project.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {!books.length && !projects.length ? <p className="empty">这层书架没有对上的内容。</p> : null}
      <p className="meta library-note">链接指向豆瓣、课程官网、作者或出版社。进度只存在这台浏览器里。</p>
    </div>
  )
}
