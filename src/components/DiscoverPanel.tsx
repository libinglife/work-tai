import { formatTime, matches } from '../format'
import type { DiscoverItem, DiscoverSource } from '../types'

const SOURCE_LABEL: Record<DiscoverSource, string> = {
  github: 'GitHub',
  youtube: 'YouTube',
  bilibili: 'B站',
}

const COVER_CLASS: Record<DiscoverSource, string> = {
  github: 'doc',
  youtube: 'yt',
  bilibili: 'bili',
}

const COVER_MARK: Record<DiscoverSource, string> = {
  github: 'GH',
  youtube: 'YT',
  bilibili: 'B',
}

type Props = {
  title: string
  sourceLine: string
  items: DiscoverItem[]
  query: string
  status: 'loading' | 'ready' | 'error'
  error: string
  stale: boolean
  fetchedAt: number | null
  empty: string
  onRefresh: () => void
  mark?: { label: (mark: string) => string; value: (id: string) => string; onMark: (id: string) => void }
  sourceFilter?: DiscoverSource | 'all'
}

export function DiscoverPanel({
  title,
  sourceLine,
  items,
  query,
  status,
  error,
  stale,
  fetchedAt,
  empty,
  onRefresh,
  mark,
  sourceFilter = 'all',
}: Props) {
  const visible = items
    .filter((item) => sourceFilter === 'all' || item.source === sourceFilter)
    .filter((item) => matches(query, item.title, item.summary, item.metric, SOURCE_LABEL[item.source]))

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <button type="button" className="text-btn" onClick={onRefresh}>
          {status === 'loading' ? '拉取中' : '重新拉取'}
        </button>
      </div>
      <p className="meta source-line">
        {sourceLine}
        {fetchedAt ? ` · ${formatTime(new Date(fetchedAt))}` : ''}
        {stale ? ' · 显示上次结果，刚刚刷新失败' : ''}
      </p>
      {status === 'loading' && visible.length === 0 ? <p className="empty">正在拉取 GitHub / YouTube / B站</p> : null}
      {status === 'error' ? (
        <p className="empty">
          {error}{' '}
          <button type="button" className="text-btn" onClick={onRefresh}>
            重试
          </button>
        </p>
      ) : null}
      {visible.length === 0 && status !== 'loading' ? <p className="empty">{empty}</p> : null}
      {visible.length > 0 ? (
        <ul className="course-list discover-list">
          {visible.map((item) => {
            const markState = mark ? mark.value(item.id) : ''
            return (
              <li key={item.id}>
                <span className={`cover platform ${COVER_CLASS[item.source]}`}>{COVER_MARK[item.source]}</span>
                <div>
                  <h3>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p className="meta">
                    {SOURCE_LABEL[item.source]} · {item.metric}
                  </p>
                  <p className="why">{item.summary}</p>
                </div>
                {mark ? (
                  <button
                    type="button"
                    className={`btn mark ${markState || 'idle'}`}
                    onClick={() => mark.onMark(item.id)}
                  >
                    {mark.label(markState || 'idle')}
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
