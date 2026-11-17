import { domainById } from '../catalog'
import { formatTime } from '../format'
import { signalsFor } from '../signals'
import type { DiscoverItem, DomainId, Signal, Task, TaskDomain } from '../types'
import { DiscoverPanel } from './DiscoverPanel'
import { SignalList } from './SignalList'
import { TaskList } from './TaskList'

type Props = {
  domainId: DomainId
  tasks: Task[]
  notes: string
  query: string
  signals: Signal[]
  discover: DiscoverItem[]
  discoverStatus: 'loading' | 'ready' | 'error'
  discoverError: string
  discoverStale: boolean
  discoverFetchedAt: number | null
  onDiscoverRefresh: () => void
  status: 'loading' | 'ready' | 'error'
  error: string
  stale: boolean
  fetchedAt: number | null
  onNotes: (value: string) => void
  onRefresh: () => void
  onAdd: (title: string, domain: TaskDomain) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onClearDone: () => void
}

export function DomainView({
  domainId,
  tasks,
  notes,
  query,
  signals,
  discover,
  discoverStatus,
  discoverError,
  discoverStale,
  discoverFetchedAt,
  onDiscoverRefresh,
  status,
  error,
  stale,
  fetchedAt,
  onNotes,
  onRefresh,
  onAdd,
  onToggle,
  onRemove,
  onClearDone,
}: Props) {
  const domain = domainById(domainId)
  const items = signalsFor(signals, domainId).slice(0, 8)

  return (
    <>
      <DiscoverPanel
        title="推荐"
        sourceLine="B站 / YouTube 按播放量优先，与 GitHub 仓库交错展示，约 6 小时缓存"
        items={discover}
        query={query}
        status={discoverStatus}
        error={discoverError}
        stale={discoverStale}
        fetchedAt={discoverFetchedAt}
        empty="没有符合的推荐。清空过滤、重新拉取，或稍后再试。"
        onRefresh={onDiscoverRefresh}
      />
      <p className="meta domain-brief">{domain.brief}</p>
      <div className="domain">
        <section className="panel">
          <div className="panel-head">
            <h2>信号</h2>
            <button type="button" className="text-btn" onClick={onRefresh}>
              {status === 'loading' ? '读取中' : '重新拉取'}
            </button>
          </div>
          <p className="meta source-line">
            来源 Hacker News 热帖，按标题关键词归入{domain.label}
            {fetchedAt ? ` · ${formatTime(new Date(fetchedAt))}` : ''}
            {stale ? ' · 显示上次结果，刚刚刷新失败' : ''}
          </p>
          {status === 'loading' && items.length === 0 ? <p className="empty">正在读取热帖</p> : null}
          {status === 'error' ? (
            <p className="empty">
              {error}{' '}
              <button type="button" className="text-btn" onClick={onRefresh}>
                重试
              </button>
            </p>
          ) : null}
          {status === 'loading' && items.length === 0 ? null : (
            <SignalList
              items={items}
              query={query}
              empty="这批热帖里没有对上这个方向的标题。推荐与速记仍然可用。"
            />
          )}
        </section>
        <div className="stack">
          <TaskList
            tasks={tasks}
            domain={domainId}
            query={query}
            onAdd={onAdd}
            onToggle={onToggle}
            onRemove={onRemove}
            onClearDone={onClearDone}
          />
          <section className="panel">
            <h2>速记</h2>
            <textarea
              value={notes}
              placeholder={domain.noteHint}
              aria-label={`${domain.label}速记`}
              onChange={(event) => onNotes(event.target.value)}
            />
          </section>
        </div>
      </div>
    </>
  )
}
