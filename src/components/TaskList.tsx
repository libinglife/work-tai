import { useState } from 'react'
import type { Task, TaskDomain } from '../types'
import { matches } from '../format'

const OPTIONS: { value: TaskDomain; label: string }[] = [
  { value: 'general', label: '今日' },
  { value: 'frontend', label: '全栈' },
  { value: 'backend', label: '后端' },
  { value: 'web3', label: 'Web3' },
  { value: 'ai', label: 'AI' },
]

type Props = {
  tasks: Task[]
  domain?: TaskDomain
  query: string
  onAdd: (title: string, domain: TaskDomain) => void
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onClearDone: () => void
}

export function TaskList({ tasks, domain, query, onAdd, onToggle, onRemove, onClearDone }: Props) {
  const [title, setTitle] = useState('')
  const [picked, setPicked] = useState<TaskDomain>(domain ?? 'general')
  const scoped = tasks.filter((task) => (domain ? task.domain === domain : true))
  const visible = scoped
    .filter((task) => matches(query, task.title, labelOf(task.domain)))
    .sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt)
  const doneCount = scoped.filter((task) => task.done).length
  const filed = domain ?? picked

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>待办</h2>
        {doneCount > 0 ? (
          <button type="button" className="text-btn" onClick={onClearDone}>
            清除已完成
          </button>
        ) : null}
      </div>
      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault()
          const next = title.trim()
          if (!next) return
          onAdd(next, filed)
          setTitle('')
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={domain ? '加一条这个方向的待办' : '加一条今天要做的事'}
          aria-label="待办内容"
          maxLength={120}
        />
        {domain ? null : (
          <select
            value={picked}
            onChange={(event) => setPicked(event.target.value as TaskDomain)}
            aria-label="归入方向"
          >
            {OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        <button type="submit" className="btn primary">
          添加
        </button>
      </form>
      {scoped.length === 0 ? (
        <p className="empty">写下要完成的一件事。勾选后会留在列表里，直到你清除。</p>
      ) : visible.length === 0 ? (
        <p className="empty">没有符合「{query.trim()}」的待办。</p>
      ) : (
        <ul className="task-list">
          {visible.map((task) => (
            <li key={task.id} className={task.done ? 'done' : undefined}>
              <label>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggle(task.id)}
                />
                <span>{task.title}</span>
              </label>
              {domain ? null : <em>{labelOf(task.domain)}</em>}
              <button type="button" className="text-btn" onClick={() => onRemove(task.id)}>
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function labelOf(domain: TaskDomain) {
  return OPTIONS.find((option) => option.value === domain)?.label ?? '今日'
}
