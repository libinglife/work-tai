import { useMemo, useState } from 'react'
import { DOMAINS } from '../catalog'
import { dayOfYear, matches } from '../format'
import { formatHolidayRemaining, holidayCountdown } from '../holidays'
import type { DiscoverItem, DiscoverSource, DomainId, SectionId, Signal, Task, TaskDomain } from '../types'
import { signalsFor } from '../signals'
import { FocusPanel } from './FocusPanel'

type HotRow = {
  id: string
  title: string
  url: string
  badge: string
}

type Props = {
  intention: string
  onIntention: (value: string) => void
  tasks: Task[]
  query: string
  signals: Signal[]
  picksByDomain: Record<DomainId, DiscoverItem[]>
  signalStatus: 'loading' | 'ready' | 'error'
  signalError: string
  discoverStatus: 'loading' | 'ready' | 'error'
  discoverError: string
  clock: Date
  onOpen: (id: Exclude<SectionId, 'today'>) => void
  onAdd: (title: string, domain: TaskDomain) => void
  onToggle: (id: string) => void
}

const SOURCE_BADGE: Record<DiscoverSource, string> = {
  github: 'GH',
  youtube: 'YT',
  bilibili: 'B站',
}

export function TodayView({
  intention,
  onIntention,
  tasks,
  query,
  signals,
  picksByDomain,
  signalStatus,
  signalError,
  discoverStatus,
  discoverError,
  clock,
  onOpen,
  onAdd,
  onToggle,
}: Props) {
  const [tab, setTab] = useState<DomainId>('ai')
  const [draft, setDraft] = useState('')
  const openTasks = tasks.filter((task) => !task.done)
  const visibleTasks = openTasks.filter((task) => matches(query, task.title)).slice(0, 3)

  const feed = useMemo(
    () => buildHotFeed(tab, signals, picksByDomain[tab] ?? [], query),
    [tab, signals, picksByDomain, query],
  )

  const hotLoading =
    feed.length === 0 && (discoverStatus === 'loading' || (signalStatus === 'loading' && signals.length === 0))
  const hotError =
    feed.length === 0 && discoverStatus === 'error' && signalStatus === 'error'
      ? [discoverError, signalError].filter(Boolean).join(' ')
      : ''

  const holiday = holidayCountdown(clock)
  const holidayText = formatHolidayRemaining(clock, holiday)

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
          <p className="widget-kicker hot-kicker">当日热点</p>
          <div className="hot-tabs" role="tablist" aria-label="热点分类">
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
          <p className="meta hot-source">GitHub / B站 / YouTube 推荐为主，HN 热帖补足</p>
          {hotLoading ? <p className="empty">正在拉取热点</p> : null}
          {hotError ? <p className="empty">{hotError}</p> : null}
          {!hotLoading && feed.length === 0 ? (
            <p className="empty">暂无{DOMAINS.find((item) => item.id === tab)?.label}热点。推荐拉取完成后会自动出现。</p>
          ) : null}
          <ol className="hot-list">
            {feed.map((item, index) => (
              <li key={item.id}>
                <span className="rank">{index + 1}</span>
                <a href={item.url} target="_blank" rel="noreferrer" title={item.title}>
                  {item.title}
                </a>
                <span className="score">{item.badge}</span>
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
          <hr className="cal-divider" aria-hidden="true" />
          <p className="cal-holiday-head">{holidayText.headline}</p>
          <p className="cal-holiday-time" aria-live="polite">
            {holidayText.detail}
          </p>
        </article>
      </section>

      <section className="groups" aria-label="常用入口">
        {DOMAINS.map((domain) => {
          const picks = (picksByDomain[domain.id] ?? []).slice(0, 4)
          return (
            <div key={domain.id} className="group">
              <div className="group-tiles">
                {picks.length === 0 ? (
                  <button type="button" className="tile-link" onClick={() => onOpen(domain.id)}>
                    <span className="tile" style={{ background: '#64748b' }}>
                      {domain.code}
                    </span>
                    <span>打开</span>
                  </button>
                ) : (
                  picks.map((item) => (
                    <a
                      key={item.id}
                      className="tile-link"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      title={item.title}
                    >
                      <span className="tile" style={{ background: tileTint(item.source) }}>
                        {tileMark(item)}
                      </span>
                      <span>{shortTitle(item.title)}</span>
                    </a>
                  ))
                )}
              </div>
              <p className="group-name">{domain.label}</p>
            </div>
          )
        })}

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
                工具
              </span>
              <span>工具</span>
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

function buildHotFeed(
  tab: DomainId,
  signals: Signal[],
  picks: DiscoverItem[],
  query: string,
): HotRow[] {
  const sortedPicks = [...picks]
    .filter((item) => matches(query, item.title, item.summary, item.metric))
    .sort((a, b) => {
      const rank = (s: DiscoverItem['source']) => (s === 'bilibili' || s === 'youtube' ? 1 : 0)
      return rank(b.source) - rank(a.source) || (b.hotScore ?? 0) - (a.hotScore ?? 0)
    })

  const fromDiscover: HotRow[] = sortedPicks.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      badge: SOURCE_BADGE[item.source],
    }))

  const hn = signalsFor(signals, tab)
    .filter((item) => matches(query, item.title))
    .slice(0, 8 - fromDiscover.length)
    .map((item) => ({
      id: `hn-${item.id}`,
      title: item.title,
      url: item.url,
      badge: `HN ${item.score}`,
    }))

  return [...fromDiscover, ...hn].slice(0, 8)
}

function tileTint(source: DiscoverSource) {
  if (source === 'github') return '#24292f'
  if (source === 'youtube') return '#c4302b'
  return '#00a1d6'
}

function tileMark(item: DiscoverItem) {
  if (item.source === 'github') return 'GH'
  if (item.source === 'youtube') return 'YT'
  return 'B'
}

function shortTitle(title: string) {
  const compact = title.replace(/\s+/g, ' ').trim()
  if (compact.length <= 8) return compact
  return `${compact.slice(0, 7)}…`
}
