import type { Signal } from '../types'
import { fromNow, hostOf, matches } from '../format'

export function SignalList({
  items,
  query,
  empty,
}: {
  items: Signal[]
  query: string
  empty: string
}) {
  const visible = items.filter((item) => matches(query, item.title, hostOf(item.url), String(item.score)))
  if (items.length === 0) return <p className="empty">{empty}</p>
  if (visible.length === 0) return <p className="empty">没有符合「{query.trim()}」的信号。</p>

  return (
    <ul className="signal-list">
      {visible.map((item) => (
        <li key={item.id}>
          <a className="signal-title" href={item.url} target="_blank" rel="noreferrer">
            {item.title}
          </a>
          <p className="meta">
            {hostOf(item.url)} · {item.score} 分 · {fromNow(item.time)} · {item.comments} 条讨论
          </p>
        </li>
      ))}
    </ul>
  )
}
