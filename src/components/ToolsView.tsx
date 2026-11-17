import { useState } from 'react'
import { CHECKS } from '../catalog'
import { todayKey } from '../format'
import { readChecks, writeChecks } from '../storage'
import type { DiscoverItem } from '../types'
import { DiscoverPanel } from './DiscoverPanel'

type Props = {
  query: string
  items: DiscoverItem[]
  discoverStatus: 'loading' | 'ready' | 'error'
  discoverError: string
  discoverStale: boolean
  discoverFetchedAt: number | null
  onDiscoverRefresh: () => void
}

export function ToolsView({
  query,
  items,
  discoverStatus,
  discoverError,
  discoverStale,
  discoverFetchedAt,
  onDiscoverRefresh,
}: Props) {
  const [checks, setChecks] = useState(readChecks)

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
      <DiscoverPanel
        title="新鲜工具仓"
        sourceLine="GitHub / 视频里的 CLI 与开发者工具，按 star 与更新时间筛"
        items={items}
        query={query}
        status={discoverStatus}
        error={discoverError}
        stale={discoverStale}
        fetchedAt={discoverFetchedAt}
        empty="没有符合的工具推荐。重新拉取或稍后再试。"
        onRefresh={onDiscoverRefresh}
      />
    </div>
  )
}
