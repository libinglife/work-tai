import { useMemo, useState } from 'react'
import { CHECKS, SNIPPETS } from '../catalog'
import { matches, todayKey } from '../format'
import { readChecks, writeChecks } from '../storage'
import { CopyButton } from './CopyButton'

export function ToolsView({ query }: { query: string }) {
  const [checks, setChecks] = useState(readChecks)
  const groups = useMemo(() => {
    const visible = SNIPPETS.filter((item) => matches(query, item.group, item.title, item.note, item.command))
    const names = [...new Set(visible.map((item) => item.group))]
    return names.map((name) => ({ name, items: visible.filter((item) => item.group === name) }))
  }, [query])

  const day = todayKey()
  const flags = checks.dayKey === day ? checks.flags : CHECKS.map(() => false)

  function toggle(index: number) {
    const next = {
      dayKey: day,
      flags: CHECKS.map((_, flagIndex) => (flagIndex === index ? !flags[flagIndex] : flags[flagIndex])),
    }
    setChecks(next)
    writeChecks(next)
  }

  return (
    <div className="tools">
      <section className="panel">
        <div className="panel-head">
          <h2>开工检查</h2>
          <p className="meta">每天重置</p>
        </div>
        <ul className="check-list">
          {CHECKS.map((item, index) => (
            <li key={item}>
              <label>
                <input type="checkbox" checked={flags[index]} onChange={() => toggle(index)} />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
      <div className="stack">
        {groups.length === 0 ? (
          <section className="panel">
            <p className="empty">没有符合「{query.trim()}」的命令。</p>
          </section>
        ) : (
          groups.map((group) => (
            <section key={group.name} className="panel">
              <h2>{group.name}</h2>
              <ul className="snippet-list">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <div className="snippet-head">
                      <div>
                        <h3>{item.title}</h3>
                        <p className="meta">{item.note}</p>
                      </div>
                      <CopyButton text={item.command} />
                    </div>
                    <pre className="command">{item.command}</pre>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
