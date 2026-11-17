import type { DiscoverBundle, DiscoverItem, DiscoverScope, DiscoverSource } from './types'

const CACHE_KEY = 'worktai.discover.v3'
const TTL = 6 * 60 * 60 * 1000

const PIPED_HOSTS = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.in.projectsegfau.lt',
  'https://pipedapi.adminforge.de',
]

type QueryPack = { github: string; youtube: string; bilibili: string }

const SCOPE_QUERIES: Record<DiscoverScope, QueryPack> = {
  frontend: {
    github: 'full stack react typescript stars:>300',
    youtube: 'full stack react tutorial 2024',
    bilibili: '全栈 前端 React 实战',
  },
  backend: {
    github: 'postgres redis backend stars:>400',
    youtube: 'system design backend tutorial',
    bilibili: '后端 架构 实战 教程',
  },
  web3: {
    github: 'ethereum solidity foundry stars:>80 pushed:>2024-06-01',
    youtube: 'ethereum smart contract tutorial',
    bilibili: 'Web3 智能合约 教程',
  },
  ai: {
    github: 'llm agent rag stars:>200 pushed:>2024-06-01',
    youtube: 'ai agent llm tutorial',
    bilibili: '大模型 Agent 教程',
  },
  tools: {
    github: 'cli developer tools awesome stars:>400',
    youtube: 'developer tools productivity',
    bilibili: '程序员 效率 工具',
  },
}

export const DISCOVER_SCOPES: DiscoverScope[] = [
  'frontend',
  'backend',
  'web3',
  'ai',
  'tools',
]

function readCache(): DiscoverBundle | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DiscoverBundle
    if (!parsed || typeof parsed.fetchedAt !== 'number' || !parsed.byScope) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(bundle: DiscoverBundle) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(bundle))
  } catch {
    /* 忽略 */
  }
}

export function discoverForScope(bundle: DiscoverBundle | null, scope: DiscoverScope): DiscoverItem[] {
  if (!bundle?.byScope) return []
  return bundle.byScope[scope] ?? []
}

export async function loadDiscover(force: boolean, signal?: AbortSignal): Promise<DiscoverBundle> {
  const cached = readCache()
  if (!force && cached && Date.now() - cached.fetchedAt < TTL) {
    return { ...cached, stale: false }
  }

  try {
    const bundle = await fetchAllDiscover(signal)
    writeCache(bundle)
    return bundle
  } catch (error) {
    if (signal?.aborted) throw error
    if (cached) return { ...cached, stale: true }
    throw error
  }
}

async function fetchAllDiscover(signal?: AbortSignal): Promise<DiscoverBundle> {
  const byScope: Partial<Record<DiscoverScope, DiscoverItem[]>> = {}
  for (const scope of DISCOVER_SCOPES) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const queries = SCOPE_QUERIES[scope]
    const [github, youtube, bilibili] = await Promise.all([
      fetchGitHub(queries.github, scope, signal).catch(() => []),
      fetchYouTube(queries.youtube, scope, signal).catch(() => []),
      fetchBilibili(queries.bilibili, scope, signal).catch(() => []),
    ])
    const merged = mergeScopeItems(github, youtube, bilibili)
    if (merged.length > 0) byScope[scope] = merged
  }

  const total = Object.values(byScope).reduce((n, list) => n + (list?.length ?? 0), 0)
  if (total === 0) throw new Error('没有拉到推荐内容')
  return { fetchedAt: Date.now(), stale: false, byScope }
}

function mergeScopeItems(github: DiscoverItem[], youtube: DiscoverItem[], bilibili: DiscoverItem[]) {
  const bili = sortByHot(bilibili).slice(0, 6)
  const yt = sortByHot(youtube).slice(0, 6)
  const gh = sortByHot(github).slice(0, 4)
  const merged: DiscoverItem[] = []
  const maxRounds = Math.max(bili.length, yt.length, gh.length)
  for (let i = 0; i < maxRounds; i += 1) {
    if (bili[i]) merged.push(bili[i])
    if (yt[i]) merged.push(yt[i])
    if (gh[i] && merged.length < 14) merged.push(gh[i])
    if (merged.length >= 14) break
  }
  return merged.slice(0, 14)
}

function sortByHot(items: DiscoverItem[]) {
  return [...items].sort((a, b) => (b.hotScore ?? 0) - (a.hotScore ?? 0))
}

async function fetchGitHub(query: string, scope: DiscoverScope, signal?: AbortSignal): Promise<DiscoverItem[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=4`
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) throw new Error(`GitHub ${response.status}`)
  const payload = (await response.json()) as {
    items?: Array<{
      id: number
      full_name: string
      html_url: string
      description: string | null
      stargazers_count: number
      updated_at: string
    }>
  }
  return (payload.items ?? []).flatMap((repo) => {
    if (!repo.id || !repo.full_name) return []
    const publishedAt = repo.updated_at ? Date.parse(repo.updated_at) : undefined
    return [
      {
        id: `gh-${repo.id}`,
        title: repo.full_name,
        url: repo.html_url,
        source: 'github' as DiscoverSource,
        summary: repo.description?.trim() || '仓库暂无简介',
        metric: `★ ${formatCount(repo.stargazers_count)}`,
        scope,
        publishedAt,
        hotScore: repo.stargazers_count,
      },
    ]
  })
}

async function fetchYouTube(query: string, scope: DiscoverScope, signal?: AbortSignal): Promise<DiscoverItem[]> {
  let lastError: unknown
  for (const host of PIPED_HOSTS) {
    try {
      const response = await fetch(
        `${host}/search?q=${encodeURIComponent(query)}&filter=videos`,
        { signal },
      )
      if (!response.ok) throw new Error(`${response.status}`)
      const payload = (await response.json()) as {
        items?: Array<{
          title?: string
          url?: string
          uploadDate?: string
          views?: number
          uploaderName?: string
        }>
      }
      const raw = (payload.items ?? []).filter((video) => video.title && video.url)
      const sorted = raw.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      const items = sorted.slice(0, 10).flatMap((video, index) => {
        const publishedAt = video.uploadDate ? Date.parse(video.uploadDate) : undefined
        const views = video.views ?? 0
        return [
          {
            id: `yt-${scope}-${index}-${hash(video.url!)}`,
            title: video.title!,
            url: video.url!,
            source: 'youtube' as DiscoverSource,
            summary: video.uploaderName ? `频道 ${video.uploaderName}` : 'YouTube',
            metric: views > 0 ? `${formatCount(views)} 播放` : 'YouTube',
            scope,
            publishedAt,
            hotScore: views,
          },
        ]
      })
      return items
    } catch (error) {
      lastError = error
      if (signal?.aborted) throw error
    }
  }
  throw lastError ?? new Error('YouTube 不可用')
}

async function fetchBilibili(keyword: string, scope: DiscoverScope, signal?: AbortSignal): Promise<DiscoverItem[]> {
  const params = new URLSearchParams({
    search_type: 'video',
    keyword,
    page: '1',
    page_size: '12',
    order: 'click',
  })
  const response = await fetch(`/bili-api/x/web-interface/search/type?${params}`, { signal })
  if (!response.ok) throw new Error(`B站 ${response.status}`)
  const payload = (await response.json()) as {
    code?: number
    data?: { result?: Array<Record<string, unknown>> }
  }
  if (payload.code !== 0) throw new Error('B站搜索失败')
  const rows = (payload.data?.result ?? []).filter((row) => String(row.type ?? 'video') === 'video')
  const withPlay = rows
    .map((row) => {
      const play = Number(row.play ?? row.view ?? 0)
      return { row, play }
    })
    .sort((a, b) => b.play - a.play)

  const items = withPlay.slice(0, 10).flatMap(({ row, play }, index) => {
    const title = stripTags(String(row.title ?? ''))
    const bvid = String(row.bvid ?? '')
    const arcurl = String(row.arcurl ?? '')
    const url = bvid
      ? `https://www.bilibili.com/video/${bvid}`
      : arcurl.startsWith('http')
        ? arcurl.replace(/^http:/, 'https:')
        : ''
    if (!title || !url) return []
    const pub = Number(row.pubdate ?? 0)
    const publishedAt = pub > 0 ? pub * 1000 : undefined
    const author = stripTags(String(row.author ?? ''))
    return [
      {
        id: `bili-${scope}-${index}-${hash(url)}`,
        title,
        url,
        source: 'bilibili' as DiscoverSource,
        summary: author ? `UP ${author}` : 'Bilibili',
        metric: play > 0 ? `${formatCount(play)} 播放` : 'B站',
        scope,
        publishedAt,
        hotScore: play,
      },
    ]
  })
  return items
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, '').trim()
}

function hash(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0
  return Math.abs(h).toString(36)
}

function formatCount(value: number) {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}亿`
  if (value >= 10_000) return `${(value / 10_000).toFixed(1)}万`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}
