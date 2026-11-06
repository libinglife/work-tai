import { domainById, type SeriesStage } from '../catalog'
import { formatTime, matches } from '../format'
import type { DomainId, Signal, Task, TaskDomain } from '../types'
import { signalsFor } from '../signals'
import { SignalList } from './SignalList'
import { TaskList } from './TaskList'

type Props = {
  domainId: DomainId
  tasks: Task[]
  notes: string
  query: string
  signals: Signal[]
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
  const stages = (domain.series ?? [])
    .map((stage, index) => ({
      ...stage,
      order: index + 1,
      points: stage.points.filter((point) => matches(query, stage.title, stage.aim, point)),
    }))
    .filter((stage) => stage.points.length > 0 || matches(query, stage.title, stage.aim))

  return (
    <>
    {domain.series ? <SeriesPanel stages={stages} /> : null}
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
            empty={
              domain.series
                ? '这批热帖里没有对上全栈的标题。系列和入口仍然可用。'
                : '这批热帖里没有对上这个方向的标题。入口和本周关注仍然可用。'
            }
          />
        )}
      </section>
      <div className="stack">
        <section className="panel">
          <h2>本周关注</h2>
          {domain.practices.filter((item) => matches(query, item)).length === 0 ? (
            <p className="empty">没有符合的关注点。</p>
          ) : (
            <ul className="practice-list">
              {domain.practices
                .filter((item) => matches(query, item))
                .map((item) => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          )}
        </section>
        <section className="panel">
          <h2>入口</h2>
          {domain.links.filter((link) => matches(query, link.label, link.note)).length === 0 ? (
            <p className="empty">没有符合的入口。</p>
          ) : (
            <ul className="link-list">
              {domain.links
                .filter((link) => matches(query, link.label, link.note))
                .map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                    <span>{link.note}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>
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

function SeriesPanel({ stages }: { stages: Array<SeriesStage & { order: number }> }) {
  return (
    <section className="panel series-panel">
      <h2>全栈系列</h2>
      {stages.length === 0 ? (
        <p className="empty">没有符合的一层。</p>
      ) : (
        <ol className="series">
          {stages.map((stage) => (
            <li key={stage.id}>
              <p className="series-index">{stage.order}</p>
              <div>
                <h3>{stage.title}</h3>
                <p className="why">{stage.aim}</p>
                <ul>
                  {stage.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
