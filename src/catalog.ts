import type { DomainId, SectionId } from './types'

export type Section = {
  id: SectionId
  label: string
  key: string
  subtitle: string
}

export const SECTIONS: Section[] = [
  {
    id: 'today',
    label: '今日',
    key: '1',
    subtitle: '先做今天的一件事，再扫四个方向。',
  },
  {
    id: 'frontend',
    label: '全栈',
    key: '2',
    subtitle: '从界面走到数据，再走到一次能打开的部署。',
  },
  {
    id: 'backend',
    label: '后端',
    key: '3',
    subtitle: '先写失败和契约。',
  },
  {
    id: 'web3',
    label: 'Web3',
    key: '4',
    subtitle: '签名要可读，密钥不进仓库。',
  },
  {
    id: 'ai',
    label: 'AI',
    key: '5',
    subtitle: '先固定样本，再换模型。',
  },
  {
    id: 'library',
    label: '图书馆',
    key: '6',
    subtitle: '先补底子，再用一个做完的项目验收。',
  },
  {
    id: 'tools',
    label: '工具',
    key: '7',
    subtitle: '新鲜仓库 + 开工检查。',
  },
  {
    id: 'focus',
    label: '专注',
    key: '8',
    subtitle: '刷新后，剩余时间还在。',
  },
  {
    id: 'study',
    label: '题库',
    key: '9',
    subtitle: '自己的题记在这里。公开课按 AI、全栈和口才来放。',
  },
]

export type DomainDesk = {
  id: DomainId
  label: string
  code: string
  brief: string
  noteHint: string
}

export const DOMAINS: DomainDesk[] = [
  {
    id: 'frontend',
    label: '全栈',
    code: 'FS',
    brief: '一条路径要同时说清界面、契约、数据和谁有权改。',
    noteHint: '记下这条路径卡在哪一层：界面、契约、数据、权限，还是交付。',
  },
  {
    id: 'backend',
    label: '后端',
    code: 'BE',
    brief: '先写失败和契约，再写顺利的那条路径。',
    noteHint: '记下接口契约、失败码，或一条慢查询。',
  },
  {
    id: 'web3',
    label: 'Web3',
    code: 'W3',
    brief: '签名文案要人能读懂，密钥不进仓库。',
    noteHint: '记下不变量、链，或一笔待核对的交易。',
  },
  {
    id: 'ai',
    label: 'AI',
    code: 'AI',
    brief: '先固定样本和输出契约，再换模型。',
    noteHint: '记下一条失败样本，或一个不该调用的工具。',
  },
]

export const CHECKS = [
  '写下一句怎样算做完',
  '标出失败时对方看到什么',
  '确认状态刷新后还在',
  '确认密钥没有进仓库',
]

export function sectionById(id: SectionId) {
  return SECTIONS.find((section) => section.id === id) ?? SECTIONS[0]
}

export function domainById(id: DomainId) {
  const domain = DOMAINS.find((item) => item.id === id)
  if (!domain) throw new Error(`unknown domain ${id}`)
  return domain
}
