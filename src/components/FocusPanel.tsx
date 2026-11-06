import { useEffect, useReducer, useState } from 'react'
import { formatClock, todayKey } from '../format'
import {
  DEFAULT_PRESET,
  readFocus,
  writeFocus,
  type FocusSave,
} from '../storage'

type Action =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'reset' }
  | { type: 'again'; now: number }
  | { type: 'preset'; ms: number; mode: 'work' | 'break' }
  | { type: 'complete' }
  | { type: 'new-day'; dayKey: string }

const PRESETS: { label: string; ms: number; mode: 'work' | 'break' }[] = [
  { label: '25 分钟', ms: 25 * 60 * 1000, mode: 'work' },
  { label: '50 分钟', ms: 50 * 60 * 1000, mode: 'work' },
  { label: '休息 5 分钟', ms: 5 * 60 * 1000, mode: 'break' },
]

function reduce(state: FocusSave, action: Action): FocusSave {
  switch (action.type) {
    case 'start': {
      const ms = state.remainingMs > 0 ? state.remainingMs : state.presetMs
      return {
        ...state,
        running: true,
        finished: false,
        remainingMs: ms,
        endsAt: action.now + ms,
      }
    }
    case 'pause': {
      if (!state.running || state.endsAt == null) return state
      return {
        ...state,
        running: false,
        endsAt: null,
        remainingMs: Math.max(0, state.endsAt - action.now),
      }
    }
    case 'reset':
      return {
        ...state,
        running: false,
        endsAt: null,
        finished: false,
        remainingMs: state.presetMs,
      }
    case 'again':
      return {
        ...state,
        mode: 'work',
        presetMs: DEFAULT_PRESET,
        remainingMs: DEFAULT_PRESET,
        running: true,
        finished: false,
        endsAt: action.now + DEFAULT_PRESET,
      }
    case 'preset':
      return {
        ...state,
        mode: action.mode,
        presetMs: action.ms,
        remainingMs: action.ms,
        running: false,
        endsAt: null,
        finished: false,
      }
    case 'complete':
      if (!state.running) return state
      return {
        ...state,
        running: false,
        endsAt: null,
        remainingMs: 0,
        finished: true,
        sessions: state.mode === 'work' ? state.sessions + 1 : state.sessions,
        dayKey: todayKey(),
      }
    case 'new-day':
      if (state.dayKey === action.dayKey) return state
      return { ...state, dayKey: action.dayKey, sessions: 0 }
    default:
      return state
  }
}

export function FocusPanel({ compact = false }: { compact?: boolean }) {
  const [state, dispatch] = useReducer(reduce, undefined, readFocus)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    writeFocus(state)
  }, [state])

  useEffect(() => {
    const delay = state.running ? 200 : 30000
    const id = window.setInterval(() => setNow(Date.now()), delay)
    return () => window.clearInterval(id)
  }, [state.running])

  useEffect(() => {
    const key = todayKey()
    if (state.dayKey !== key) dispatch({ type: 'new-day', dayKey: key })
  }, [now, state.dayKey])

  useEffect(() => {
    if (!state.running || state.endsAt == null || now < state.endsAt) return
    dispatch({ type: 'complete' })
  }, [now, state.running, state.endsAt])

  useEffect(() => {
    if (state.running && state.endsAt) {
      document.title = `${formatClock(state.endsAt - Date.now())} · 工台`
      return
    }
    document.title = state.finished ? '时间到 · 工台' : '工台'
  }, [state.running, state.endsAt, state.finished, now])

  const displayMs = state.running && state.endsAt ? Math.max(0, state.endsAt - Date.now()) : state.remainingMs
  const modeLabel = state.mode === 'work' ? '专注' : '休息'

  function start() {
    const at = Date.now()
    setNow(at)
    dispatch({ type: 'start', now: at })
  }

  return (
    <section className={compact ? 'panel focus-panel compact' : 'panel focus-panel'}>
      <div className="panel-head">
        <h2>{compact ? '专注剩余' : modeLabel}</h2>
        <p className="meta">今日 {state.sessions} 轮</p>
      </div>
      <p className={state.finished ? 'digits pin' : 'digits'} aria-live="polite">
        {formatClock(displayMs)}
      </p>
      <p className="focus-status">
        {state.finished ? '这一轮结束了' : state.running ? `${modeLabel}进行中` : '准备开始'}
      </p>
      <div className="button-row">
        {state.running ? (
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'pause', now: Date.now() })}>
            暂停
          </button>
        ) : state.finished ? (
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'again', now: Date.now() })}>
            再来一轮
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={start}>
            开始
          </button>
        )}
        <button type="button" className="btn" onClick={() => dispatch({ type: 'reset' })}>
          重置
        </button>
      </div>
      {compact ? null : (
        <div className="preset-row">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={state.presetMs === preset.ms && state.mode === preset.mode ? 'btn current' : 'btn'}
              onClick={() => dispatch({ type: 'preset', ms: preset.ms, mode: preset.mode })}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
