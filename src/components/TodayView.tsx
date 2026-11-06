import { useState } from 'react'
import { DOMAINS } from '../catalog'
import { dayOfYear, matches } from '../format'
import type { DomainId, SectionId, Signal, Task, TaskDomain } from '../types'
import { signalsFor } from '../signals'
import { FocusPanel } from './FocusPanel'

type Props = {
  intention: string
  onIntention: (value: string) => void
  tasks: Task[]
  query: string
  signals: Signal[]
  status: 'loading' | 'ready' | 'error'
  error: string
  clock: Date
  onOpen: (id: Exclude<SectionId, 'today'>) => void
  onAdd: (title: string, domain: TaskDomain) => void
  onToggle: (id: string) => void
}

export function TodayView({
  intention,
  onIntention,
  tasks,
  query,
  signals,
  status,
  error,
  clock,
  onOpen,
  onAdd,
  onToggle,
}: Props) {
  const [tab, setTab] = useState<DomainId>('ai')
  const [draft, setDraft] = useState('')
  const openTasks = tasks.filter((task) => !task.done)
  const visibleTasks = openTasks.filter((task) => matches(query, task.title)).slice(0, 3)
  const feed = signalsFor(signals, tab)
    .filter((item) => matches(query, item.title))
    .slice(0, 8)

  return (
    <div className="home">
      <section className="widgets" aria-label="今日卡片">
        <article className="widget sky">
          <p className="widget-kicker">今日</p>
          <textarea
            className="sky-input"
            value={intention}
            maxLength={72}
            rows={3}
            placeholder="写下今天要完成的一件事"
            aria-label="今日意图"
            onChange={(event) => onIntention(event.target.value)}
          />
          <p className="sky-foot">{openTasks.length > 0 ? `${openTasks.length} 件待办` : '还没有待办'}</p>
        </article>

        <article className="widget hot">
          <div className="hot-tabs" role="tablist" aria-label="信号分类">
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                type="button"
                role="tab"
                aria-selected={tab === domain.id}
                onClick={() => setTab(domain.id)}
              >
                {domain.label}
              </button>
            ))}
          </div>
          {status === 'loading' && feed.length === 0 ? <p className="empty">正在读取热帖</p> : null}
          {status === 'error' ? <p className="empty">{error}</p> : null}
          {status !== 'loading' && feed.length === 0 ? (
            <p className="empty">这批标题里没有{DOMAINS.find((item) => item.id === tab)?.label}。</p>
          ) : null}
          <ol className="hot-list">
            {feed.map((item, index) => (
              <li key={item.id}>
                <span className="rank">{index + 1}</span>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                <span className="score">{item.score}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="widget countdown">
          <FocusPanel compact />
        </article>

        <article className="widget cal">
          <p>{clock.getFullYear()}</p>
          <p className="cal-day">{clock.getDate()}</p>
          <p>第 {dayOfYear(clock)} 天</p>
        </article>
      </section>

      <section className="groups" aria-label="常用入口">
        {DOMAINS.map((domain) => (
          <div key={domain.id} className="group">
            <div className="group-tiles">
              {domain.links.map((link) => (
                <a key={link.href} className="tile-link" href={link.href} target="_blank" rel="noreferrer">
                  <span className="tile" style={{ background: link.tint }}>
                    {link.mark}
                  </span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
            <p className="group-name">{domain.label}</p>
          </div>
        ))}

        <div className="group">
          <form
            className="memo"
            onSubmit={(event) => {
              event.preventDefault()
              const title = draft.trim()
              if (!title) return
              onAdd(title, 'general')
              setDraft('')
            }}
          >
            <p>备忘录</p>
            <input
              value={draft}
              placeholder="点击新建备忘"
              aria-label="新建备忘"
              onChange={(event) => setDraft(event.target.value)}
            />
            <ul>
              {visibleTasks.map((task) => (
                <li key={task.id}>
                  <label>
                    <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} />
                    <span>{task.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </form>
          <p className="group-name">备忘录</p>
        </div>

        <div className="group">
          <div className="group-tiles">
            <button type="button" className="tile-link" onClick={() => onOpen('tools')}>
              <span className="tile" style={{ background: '#334155' }}>
                命令
              </span>
              <span>命令</span>
            </button>
            <button type="button" className="tile-link" onClick={() => onOpen('focus')}>
              <span className="tile" style={{ background: '#0f766e' }}>
                专注
              </span>
              <span>专注</span>
            </button>
            <button type="button" className="tile-link" onClick={() => onOpen('frontend')}>
              <span className="tile" style={{ background: '#1d4ed8' }}>
                速记
              </span>
              <span>速记</span>
            </button>
            <button type="button" className="tile-link" onClick={() => onOpen('library')}>
              <span className="tile" style={{ background: '#9a3412' }}>
                书库
              </span>
              <span>书库</span>
            </button>
            <button type="button" className="tile-link" onClick={() => onOpen('study')}>
              <span className="tile" style={{ background: '#7c3aed' }}>
                题库
              </span>
              <span>题库</span>
            </button>
          </div>
          <p className="group-name">工作</p>
        </div>
      </section>
    </div>
  )
}
