import type { DomainId, Signal, SignalFeed } from './types'

const CACHE_KEY = 'worktai.signals.v2'
const TTL = 10 * 60 * 1000
const HN = 'https://hacker-news.firebaseio.com/v0'

type Term = { kind: 'word' | 'phrase'; value: string }

const RULES: { domain: DomainId; terms: Term[] }[] = [
  {
    domain: 'ai',
    terms: [
      { kind: 'word', value: 'ai' },
      { kind: 'word', value: 'llm' },
      { kind: 'phrase', value: 'llms' },
      { kind: 'phrase', value: 'chatgpt' },
      { kind: 'word', value: 'gpt' },
      { kind: 'word', value: 'claude' },
      { kind: 'word', value: 'gemini' },
      { kind: 'word', value: 'kimi' },
      { kind: 'word', value: 'qwen' },
      { kind: 'word', value: 'llama' },
      { kind: 'word', value: 'mistral' },
      { kind: 'word', value: 'grok' },
      { kind: 'word', value: 'deepseek' },
      { kind: 'word', value: 'openai' },
      { kind: 'word', value: 'anthropic' },
      { kind: 'word', value: 'mcp' },
      { kind: 'word', value: 'rag' },
      { kind: 'phrase', value: 'machine learning' },
      { kind: 'phrase', value: 'neural' },
      { kind: 'phrase', value: 'transformer' },
      { kind: 'phrase', value: 'inference' },
    ],
  },
  {
    domain: 'web3',
    terms: [
      { kind: 'word', value: 'ethereum' },
      { kind: 'word', value: 'bitcoin' },
      { kind: 'word', value: 'solidity' },
      { kind: 'word', value: 'blockchain' },
      { kind: 'word', value: 'solana' },
      { kind: 'word', value: 'defi' },
      { kind: 'word', value: 'web3' },
      { kind: 'word', value: 'evm' },
      { kind: 'word', value: 'nft' },
      { kind: 'word', value: 'wallet' },
      { kind: 'word', value: 'crypto' },
      { kind: 'phrase', value: 'rollup' },
    ],
  },
  {
    domain: 'frontend',
    terms: [
      { kind: 'word', value: 'react' },
      { kind: 'word', value: 'vue' },
      { kind: 'word', value: 'svelte' },
      { kind: 'word', value: 'angular' },
      { kind: 'word', value: 'css' },
      { kind: 'word', value: 'typescript' },
      { kind: 'word', value: 'javascript' },
      { kind: 'word', value: 'frontend' },
      { kind: 'word', value: 'tailwind' },
      { kind: 'word', value: 'wasm' },
      { kind: 'word', value: 'vite' },
      { kind: 'word', value: 'html' },
      { kind: 'phrase', value: 'next.js' },
      { kind: 'phrase', value: 'nextjs' },
      { kind: 'phrase', value: 'full-stack' },
      { kind: 'phrase', value: 'fullstack' },
      { kind: 'phrase', value: 'full stack' },
      { kind: 'word', value: 'remix' },
      { kind: 'word', value: 'astro' },
      { kind: 'word', value: 'htmx' },
      { kind: 'word', value: 'prisma' },
      { kind: 'word', value: 'trpc' },
    ],
  },
  {
    domain: 'backend',
    terms: [
      { kind: 'word', value: 'postgres' },
      { kind: 'word', value: 'postgresql' },
      { kind: 'word', value: 'kubernetes' },
      { kind: 'word', value: 'redis' },
      { kind: 'word', value: 'grpc' },
      { kind: 'word', value: 'kafka' },
      { kind: 'word', value: 'nginx' },
      { kind: 'word', value: 'docker' },
      { kind: 'word', value: 'backend' },
      { kind: 'word', value: 'database' },
      { kind: 'word', value: 'sql' },
      { kind: 'word', value: 'golang' },
      { kind: 'word', value: 'rust' },
      { kind: 'word', value: 'linux' },
      { kind: 'word', value: 'sqlite' },
      { kind: 'phrase', value: 'graphql' },
    ],
  },
]

type HnItem = {
  id?: number
  title?: string
  url?: string
  score?: number
  time?: number
  descendants?: number
  type?: string
}

function hits(title: string, terms: Term[]) {
  return terms.reduce((count, term) => {
    if (term.kind === 'phrase') {
      return count + (title.toLowerCase().includes(term.value) ? 1 : 0)
    }
    const pattern = new RegExp(`(?:^|[^a-z0-9])${term.value}(?:[^a-z0-9]|$)`, 'i')
    return count + (pattern.test(title) ? 1 : 0)
  }, 0)
}

export function classifyTitle(title: string): DomainId | 'other' {
  let best: DomainId | 'other' = 'other'
  let bestScore = 0
  for (const rule of RULES) {
    const score = hits(title, rule.terms)
    if (score > bestScore) {
      best = rule.domain
      bestScore = score
    }
  }
  return best
}

function readCache(): SignalFeed | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SignalFeed
    if (!parsed || !Array.isArray(parsed.items) || typeof parsed.fetchedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(feed: SignalFeed) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(feed))
  } catch {
    /* 缓存写失败不影响本次展示。 */
  }
}

export async function loadSignals(force: boolean, signal?: AbortSignal): Promise<SignalFeed> {
  const cached = readCache()
  if (!force && cached && Date.now() - cached.fetchedAt < TTL) {
    return { ...cached, stale: false }
  }

  try {
    const feed = await fetchSignals(signal)
    writeCache(feed)
    return feed
  } catch (error) {
    if (signal?.aborted) throw error
    if (cached) return { ...cached, stale: true }
    throw error
  }
}

async function fetchSignals(signal?: AbortSignal): Promise<SignalFeed> {
  try {
    const items = await fetchAlgolia(signal)
    if (items.length > 0) return { fetchedAt: Date.now(), stale: false, items }
  } catch (error) {
    if (signal?.aborted) throw error
  }

  const items = await fetchFirebase(signal)
  if (items.length === 0) throw new Error('没有解析到热帖')
  return { fetchedAt: Date.now(), stale: false, items }
}

async function fetchFirebase(signal?: AbortSignal) {
  const listResponse = await fetch(`${HN}/topstories.json`, { signal })
  if (!listResponse.ok) throw new Error(`热帖列表返回 ${listResponse.status}`)
  const ids = (await listResponse.json()) as unknown
  if (!Array.isArray(ids)) throw new Error('热帖列表格式无法识别')

  const stories = await Promise.all(
    ids.slice(0, 30).map(async (id) => {
      const response = await fetch(`${HN}/item/${id}.json`, { signal })
      if (!response.ok) return null
      return (await response.json()) as HnItem
    }),
  )

  return stories.flatMap((item) => {
    if (!item?.id || !item.title || item.type !== 'story') return []
    return [toSignal(item.id, item.title, item.url, item.score ?? 0, item.descendants ?? 0, item.time ?? 0)]
  })
}

type AlgoliaHit = {
  objectID?: string
  title?: string
  url?: string
  points?: number
  num_comments?: number
  created_at?: string
}

async function fetchAlgolia(signal?: AbortSignal) {
  const response = await fetch(
    'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30',
    { signal },
  )
  if (!response.ok) throw new Error(`热帖列表返回 ${response.status}`)
  const payload = (await response.json()) as { hits?: AlgoliaHit[] }
  return (payload.hits ?? []).flatMap((hit) => {
    const id = Number(hit.objectID)
    if (!id || !hit.title) return []
    const time = hit.created_at ? Math.floor(new Date(hit.created_at).getTime() / 1000) : 0
    return [toSignal(id, hit.title, hit.url, hit.points ?? 0, hit.num_comments ?? 0, time)]
  })
}

function toSignal(
  id: number,
  title: string,
  url: string | undefined,
  score: number,
  comments: number,
  time: number,
): Signal {
  return {
    id,
    title,
    url: url || `https://news.ycombinator.com/item?id=${id}`,
    score,
    comments,
    time,
    domain: classifyTitle(title),
  }
}

export function signalsFor(items: Signal[], domain: DomainId) {
  return items.filter((item) => item.domain === domain).sort((a, b) => b.score - a.score)
}
