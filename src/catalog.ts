import type { DomainId, SectionId, ShelfId, StudyTrack } from './types'

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
    subtitle: '命令可复制，检查按天重置。',
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

export type SeriesStage = {
  id: string
  title: string
  aim: string
  points: string[]
}

export type DomainDesk = {
  id: DomainId
  label: string
  code: string
  brief: string
  practices: string[]
  series?: SeriesStage[]
  links: { label: string; note: string; href: string; tint: string; mark: string }[]
  noteHint: string
}

export const DOMAINS: DomainDesk[] = [
  {
    id: 'frontend',
    label: '全栈',
    code: 'FS',
    brief: '一条路径要同时说清界面、契约、数据和谁有权改。',
    practices: [
      '本周只打通一条路径：四种界面状态、一个失败码、库里的一条约束。',
      '权限在服务端再判一次。界面上藏起按钮，不算保护。',
      '上线前在自己能打开的地址走完，并用同一个请求标识对上日志。',
    ],
    series: [
      {
        id: 'ui',
        title: '界面',
        aim: '同一条数据在四种状态下都说得清，刷新之后还是那一条。',
        points: [
          '空、加载、错误、成功分开画。错误要写出下一步，而不是只写“失败”。',
          '筛选和页码放进地址。刷新、分享、后退时，看到的还是刚才那一页。',
          '服务端数据留在请求结果里。本地再抄一份，就会和接口各说各话。',
          '主路径用键盘走完。焦点看得见，含义不靠颜色单独传达。',
        ],
      },
      {
        id: 'contract',
        title: '契约',
        aim: '界面提交的字段和接口接受的字段是同一份契约。',
        points: [
          '每个写操作标出校验、权限、幂等和超时。同一请求重试不会多写一笔。',
          '失败返回稳定的码，以及人能读的原因。界面按码分支，不靠猜正文。',
          '列表默认分页，并限制单页大小。不要把整张表一次拉到浏览器。',
          '乐观更新只用于能撤销的动作。失败时滚回，并留下这次请求的标识。',
        ],
      },
      {
        id: 'data',
        title: '数据',
        aim: '不变量放在库里。应用代码忘掉时，库仍然拒绝坏数据。',
        points: [
          '唯一、外键、非空写成约束。应用里的校验是第二道，不是唯一一道。',
          '迁移可以重复执行。先让新旧读写都能过，再删旧字段。',
          '一次业务动作放在一个事务里。跨请求拼出来的过程，中断后会留下半截。',
          '变慢时先看查询计划。索引对上过滤和排序；缓存留给读多写少之后。',
        ],
      },
      {
        id: 'auth',
        title: '权限',
        aim: '谁能看、谁能改，在服务端判定。界面只把结果说出来。',
        points: [
          '隐藏按钮不是权限。每次读和写都在服务端再查身份和资源归属。',
          '会话放在 HttpOnly Cookie 或短期令牌里，不放进脚本能读到的本地存储。',
          '连接串和密钥只在环境里。日志、报错页和仓库都不打印它们。',
          '跨站的写请求核对来源。Cookie 写明站点范围。',
        ],
      },
      {
        id: 'ship',
        title: '交付',
        aim: '这条路径在你自己能打开的地址上走通，出了问题能对上一次请求。',
        points: [
          '提交前至少有一条自动检查：类型，或这条路径的接口契约。',
          '界面上的错误和服务器日志带同一个请求标识。没有标识，下次无法复盘。',
          '发布前写明怎么回滚：回到哪一版，旧数据是否还能读。',
          '上线后看一条真实路径的耗时和错误率，而不是只看构建成功。',
        ],
      },
    ],
    links: [
      { label: 'React', note: '状态、事件、向服务端要数据', href: 'https://react.dev/learn', tint: '#087ea4', mark: 'Re' },
      { label: 'MDN', note: '语义、焦点、无障碍', href: 'https://developer.mozilla.org/zh-CN/docs/Web', tint: '#3d5a80', mark: 'MDN' },
      { label: 'FSO', note: '从界面做到接口和部署', href: 'https://fullstackopen.com/zh/', tint: '#0f766e', mark: 'FSO' },
      { label: 'HTTP', note: '方法、状态码、缓存', href: 'https://developer.mozilla.org/zh-CN/docs/Web/HTTP', tint: '#5c6bc0', mark: 'HTTP' },
      { label: 'Node', note: '进程、HTTP、错误', href: 'https://nodejs.org/api/', tint: '#3c873a', mark: 'Node' },
      { label: 'Postgres', note: '约束、事务、索引', href: 'https://www.postgresql.org/docs/current/tutorial.html', tint: '#336791', mark: 'PG' },
    ],
    noteHint: '记下这条路径卡在哪一层：界面、契约、数据、权限，还是交付。',
  },
  {
    id: 'backend',
    label: '后端',
    code: 'BE',
    brief: '先写失败和契约，再写顺利的那条路径。',
    practices: [
      '每个写接口标出校验、权限、幂等和超时。',
      '列表默认分页，写路径和读路径分开看。',
      '日志带请求标识，错误返回可定位的码。',
    ],
    links: [
      { label: 'Node', note: '运行时 API', href: 'https://nodejs.org/api/', tint: '#3c873a', mark: 'Node' },
      { label: 'Postgres', note: '当前版本文档', href: 'https://www.postgresql.org/docs/current/', tint: '#336791', mark: 'PG' },
      { label: 'HTTP', note: '状态码', href: 'https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status', tint: '#5c6bc0', mark: 'HTTP' },
    ],
    noteHint: '记下接口契约、失败码，或一条慢查询。',
  },
  {
    id: 'web3',
    label: 'Web3',
    code: 'W3',
    brief: '签名文案要人能读懂，密钥不进仓库。',
    practices: [
      '交易可能被重放，RPC 结果先当不可信。',
      '用户签名前，屏幕上要写明资产和数量。',
      '合约改动先写不变量，再谈 gas。',
    ],
    links: [
      { label: 'ETH', note: '开发者文档', href: 'https://ethereum.org/zh/developers/', tint: '#627eea', mark: 'ETH' },
      { label: 'Solidity', note: '语言文档', href: 'https://docs.soliditylang.org/', tint: '#c27a3a', mark: 'Sol' },
      { label: 'Foundry', note: '测试与脚本', href: 'https://book.getfoundry.sh/', tint: '#e07a3d', mark: 'Fy' },
    ],
    noteHint: '记下不变量、链，或一笔待核对的交易。',
  },
  {
    id: 'ai',
    label: 'AI',
    code: 'AI',
    brief: '先固定样本和输出契约，再换模型。',
    practices: [
      '同一批样本上比较改动，一次只变一个因素。',
      '工具能碰什么、不能碰什么，写成边界。',
      '提示词写清约束，以及失败时如何停。',
    ],
    links: [
      { label: 'InfiSpace', note: 'Agent 转型手册 · 113 篇', href: 'https://joashchn.github.io/infispace-course/index.html', tint: '#6366f1', mark: 'IF' },
      { label: 'Claude', note: '构建文档', href: 'https://docs.anthropic.com/', tint: '#cc785c', mark: 'C' },
      { label: 'OpenAI', note: '接口文档', href: 'https://platform.openai.com/docs', tint: '#10a37f', mark: 'AI' },
      { label: 'MCP', note: '工具协议介绍', href: 'https://modelcontextprotocol.io/introduction', tint: '#5b4dff', mark: 'MCP' },
    ],
    noteHint: '记下一条失败样本，或一个不该调用的工具。',
  },
]

export const CHECKS = [
  '写下一句怎样算做完',
  '标出失败时对方看到什么',
  '确认状态刷新后还在',
  '确认密钥没有进仓库',
]

export type Snippet = {
  group: string
  title: string
  note: string
  command: string
}

export const SNIPPETS: Snippet[] = [
  {
    group: '版本库',
    title: '看改动范围',
    note: '提交前确认没有夹带无关文件',
    command: 'git status -sb && git diff --stat',
  },
  {
    group: '版本库',
    title: '最近提交',
    note: '对齐这个仓库已有的写法',
    command: 'git log -8 --oneline',
  },
  {
    group: '接口',
    title: '探活',
    note: '把地址换成你的本地服务',
    command: 'curl -fsS -o /dev/null -w "%{http_code}\\n" http://127.0.0.1:3000/health',
  },
  {
    group: '接口',
    title: '只看响应头',
    note: '确认状态码、类型和缓存',
    command: 'curl -sSI http://127.0.0.1:3000/health',
  },
  {
    group: '工程',
    title: '类型检查',
    note: '先于手动点页面',
    command: 'npx tsc --noEmit',
  },
  {
    group: '工程',
    title: '容器状态',
    note: '看本地依赖是否起来',
    command: 'docker compose ps --format "table {{.Service}}\\t{{.Status}}\\t{{.Ports}}"',
  },
  {
    group: '数据',
    title: '本机 Postgres',
    note: '连上后用 \\dt 看表',
    command: 'psql "postgres://localhost:5432/postgres"',
  },
  {
    group: '链上',
    title: '只读最新块',
    note: '不签名。先在终端导出 ETH_RPC_URL',
    command: 'cast block-number --rpc-url "$ETH_RPC_URL"',
  },
]

export type Book = {
  id: string
  title: string
  author: string
  why: string
  shelf: ShelfId
  field?: string
  href: string
  mark: string
  tint: string
}

export type StudyProject = {
  id: string
  title: string
  why: string
  steps: string[]
  href: string
  mark: string
  tint: string
}

export const SHELVES: { id: 'all' | ShelfId | 'project'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'base', label: '底子' },
  { id: 'craft', label: '手艺' },
  { id: 'judgment', label: '判断' },
  { id: 'field', label: '方向' },
  { id: 'skill', label: '技能' },
  { id: 'history', label: '人文' },
  { id: 'literature', label: '文学' },
  { id: 'society', label: '社会' },
  { id: 'thinking', label: '思维' },
  { id: 'growth', label: '成长' },
  { id: 'project', label: '项目' },
]

export const BOOKS: Book[] = [
  {
    id: 'csapp',
    title: '深入理解计算机系统',
    author: 'Bryant, O’Hallaron',
    why: '把程序放回机器上看：数据、缓存、链接和并发。',
    shelf: 'base',
    href: 'https://csapp.cs.cmu.edu/',
    mark: 'CS',
    tint: '#9f2d2d',
  },
  {
    id: 'ddia',
    title: '数据密集型应用系统设计',
    author: 'Martin Kleppmann',
    why: '存储、复制、分区和一致性。作者公开了英文全文。',
    shelf: 'base',
    href: 'https://dataintensive.net/',
    mark: 'DD',
    tint: '#1f4e79',
  },
  {
    id: 'sicp',
    title: '计算机程序的构造和解释',
    author: 'Abelson, Sussman',
    why: '用很少的概念搭起程序。有可在浏览器里做的版本。',
    shelf: 'base',
    href: 'https://sourceacademy.org/sicpjs/index',
    mark: 'SC',
    tint: '#6b3fa0',
  },
  {
    id: 'algs',
    title: '算法',
    author: 'Sedgewick, Wayne',
    why: '边写边测。普林斯顿课程站有代码和练习。',
    shelf: 'base',
    href: 'https://algs4.cs.princeton.edu/home/',
    mark: 'AL',
    tint: '#0b6e4f',
  },
  {
    id: 'tpp',
    title: '程序员修炼之道',
    author: 'Hunt, Thomas',
    why: '小步交付，用反馈修正，对结果负责。',
    shelf: 'craft',
    href: 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
    mark: 'PP',
    tint: '#7a2e0b',
  },
  {
    id: 'aposd',
    title: '软件设计的哲学',
    author: 'John Ousterhout',
    why: '复杂度来自依赖和含糊。书不长，适合反复看。',
    shelf: 'craft',
    href: 'https://web.stanford.edu/~ouster/cgi-bin/book.php',
    mark: 'DS',
    tint: '#8a5a00',
  },
  {
    id: 'refactor',
    title: '重构',
    author: 'Martin Fowler',
    why: '先用测试钉住行为，再改结构。',
    shelf: 'craft',
    href: 'https://refactoring.com/',
    mark: 'RF',
    tint: '#b45309',
  },
  {
    id: 'code-complete',
    title: '代码大全',
    author: 'Steve McConnell',
    why: '从需求到构造的工序，当检查手册翻，不必通读。',
    shelf: 'craft',
    href: 'https://www.construx.com/books/code-complete/',
    mark: 'CC',
    tint: '#334155',
  },
  {
    id: 'deep-work',
    title: '深度工作',
    author: 'Cal Newport',
    why: '难的技能靠整块、不被打断的时间。',
    shelf: 'judgment',
    href: 'https://www.calnewport.com/books/deep-work/',
    mark: 'DW',
    tint: '#1e3a5f',
  },
  {
    id: 'peak',
    title: '刻意练习',
    author: 'Ericsson, Pool',
    why: '练还不会的那一小节，并马上看反馈。',
    shelf: 'skill',
    href: 'https://www.harpercollins.com/products/peak-anders-ericssonk-anders-ericssonrobert-pool',
    mark: 'PK',
    tint: '#9f1239',
  },
  {
    id: 'soft-skills',
    title: '软技能',
    author: 'John Sonmez',
    why: '学习计划、职业和沟通，补代码以外的部分。',
    shelf: 'judgment',
    href: 'https://www.manning.com/books/soft-skills',
    mark: 'SS',
    tint: '#0f766e',
  },
  {
    id: 'atomic-habits',
    title: '原子习惯',
    author: 'James Clear',
    why: '把长期水平拆成小到每天能做完的动作。',
    shelf: 'judgment',
    href: 'https://jamesclear.com/atomic-habits',
    mark: 'AH',
    tint: '#365314',
  },
  {
    id: 'read-a-book',
    title: '如何有效阅读一本书',
    author: '奥野宣之',
    why: '选书、摘抄、写下自己的一句，再隔几天重读笔记。',
    shelf: 'skill',
    href: 'https://read.douban.com/ebook/36888407/',
    mark: '阅',
    tint: '#9a3412',
  },
  {
    id: 'wanli',
    title: '万历十五年',
    author: '黄仁宇',
    why: '从一个平常年份看制度如何把人卡住。',
    shelf: 'history',
    href: 'https://book.douban.com/subject/26303324/',
    mark: '历',
    tint: '#7c2d12',
  },
  {
    id: 'rivers',
    title: '万古江河',
    author: '许倬云',
    why: '不按朝代记流水账，看中国文化怎样一层层展开。',
    shelf: 'history',
    href: 'https://book.douban.com/subject/27591495/',
    mark: '江',
    tint: '#1e3a5f',
  },
  {
    id: 'lychee',
    title: '长安的荔枝',
    author: '马伯庸',
    why: '一件不可能的差事，看小人物怎样把期限扛下来。',
    shelf: 'history',
    href: 'https://book.douban.com/subject/36104107/',
    mark: '荔',
    tint: '#b91c1c',
  },
  {
    id: 'siddhartha',
    title: '悉达多',
    author: '赫尔曼·黑塞',
    why: '离开老师，自己把爱、钱和河水走一遍。',
    shelf: 'literature',
    href: 'https://book.douban.com/subject/38512491/',
    mark: '悉',
    tint: '#a16207',
  },
  {
    id: 'solitude',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    why: '一个家族的循环，看重复怎样变成命运。',
    shelf: 'literature',
    href: 'https://book.douban.com/subject/6082808/',
    mark: '孤',
    tint: '#3f3f46',
  },
  {
    id: 'ordinary-world',
    title: '平凡的世界',
    author: '路遥',
    why: '普通人在时代里把日子、劳动和尊严过下去。',
    shelf: 'literature',
    href: 'https://book.douban.com/subject/1084165/',
    mark: '凡',
    tint: '#92400e',
  },
  {
    id: 'crowd',
    title: '乌合之众',
    author: '古斯塔夫·勒庞',
    why: '人一进群体，判断怎样被情绪带走。',
    shelf: 'society',
    href: 'https://book.douban.com/subject/1012611/',
    mark: '众',
    tint: '#44403c',
  },
  {
    id: 'earthbound',
    title: '乡土中国',
    author: '费孝通',
    why: '差序格局和人情，看基层社会怎样运转。',
    shelf: 'society',
    href: 'https://book.douban.com/subject/35917524/',
    mark: '乡',
    tint: '#3f6212',
  },
  {
    id: 'feminism',
    title: '女性主义',
    author: '李银河',
    why: '理论、运动和流派。先有一个男女平等的框架。',
    shelf: 'society',
    href: 'https://book.douban.com/subject/35732399/',
    mark: '女',
    tint: '#9d174d',
  },
  {
    id: 'carnegie',
    title: '人性的弱点',
    author: '戴尔·卡耐基',
    why: '怎样说话，怎样让人愿意听完。',
    shelf: 'thinking',
    href: 'https://read.douban.com/ebook/1022192/',
    mark: '弱',
    tint: '#0f766e',
  },
  {
    id: 'awakening',
    title: '认知觉醒',
    author: '周岭',
    why: '看清焦虑从哪来，再把行动拆到能做完。',
    shelf: 'thinking',
    href: 'https://book.douban.com/subject/36906244/',
    mark: '醒',
    tint: '#1d4ed8',
  },
  {
    id: 'first-principles',
    title: '底层逻辑',
    author: '刘润',
    why: '找变化背后不变的那一层，用来看协作和选择。',
    shelf: 'thinking',
    href: 'https://book.douban.com/subject/35620025/',
    mark: '逻',
    tint: '#3730a3',
  },
  {
    id: 'courage',
    title: '被讨厌的勇气',
    author: '岸见一郎, 古贺史健',
    why: '把课题分开。不必靠别人的认可过今天。',
    shelf: 'growth',
    href: 'https://book.douban.com/subject/26369699/',
    mark: '勇',
    tint: '#c2410c',
  },
  {
    id: 'positive',
    title: '积极心理学',
    author: '克里斯托弗·彼得森',
    why: '入门看快乐、性格优势和关系，而不只修补短板。',
    shelf: 'growth',
    href: 'https://book.douban.com/subject/26747845/',
    mark: '心',
    tint: '#047857',
  },
  {
    id: 'eloquent-js',
    title: 'JavaScript 编程精解',
    author: 'Marijn Haverbeke',
    why: '语言机制配练习，全文免费。',
    shelf: 'field',
    field: '全栈',
    href: 'https://eloquentjavascript.net/',
    mark: 'JS',
    tint: '#a16207',
  },
  {
    id: 'release-it',
    title: '发布！',
    author: 'Michael Nygard',
    why: '超时、重试和隔离，让上线之后还站得住。',
    shelf: 'field',
    field: '后端',
    href: 'https://pragprog.com/titles/mnee2/release-it-second-edition/',
    mark: 'RI',
    tint: '#3c873a',
  },
  {
    id: 'mastering-eth',
    title: '精通以太坊',
    author: 'Antonopoulos, Wood',
    why: '账户、交易和合约。全书开源。',
    shelf: 'field',
    field: 'Web3',
    href: 'https://github.com/ethereumbook/ethereumbook',
    mark: 'ETH',
    tint: '#627eea',
  },
  {
    id: 'dmls',
    title: '设计机器学习系统',
    author: 'Chip Huyen',
    why: '数据、训练、上线和监控，不只调一次模型。',
    shelf: 'field',
    field: 'AI',
    href: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
    mark: 'ML',
    tint: '#c2410c',
  },
  {
    id: 'infispace-agent',
    title: 'AI Agent 转型手册',
    author: 'InfiSpace',
    why: '七个模块、113 篇：Python → LLM → LangChain / LangGraph → 面试 81 题，附 1,621 个可跑示例与技术演进串讲。',
    shelf: 'field',
    field: 'AI',
    href: 'https://joashchn.github.io/infispace-course/index.html',
    mark: 'IF',
    tint: '#6366f1',
  },
]

export const PROJECTS: StudyProject[] = [
  {
    id: 'nand2tetris',
    title: '从门电路做出一台计算机',
    why: 'Nand2Tetris。十二个项目走完一层抽象，比再看一篇综述有用。',
    steps: ['做到 CPU 能跑自己写的小汇编', '用这台机器跑通一个小程序', '能讲清编译器替你做了哪一步'],
    href: 'https://www.nand2tetris.org/',
    mark: 'N2',
    tint: '#111827',
  },
  {
    id: 'csapp-lab',
    title: '配合计算机系统做实验',
    why: 'CMU 的 Data Lab 和 Cache Lab，用来验收《深入理解计算机系统》。',
    steps: ['做完 Data Lab', '做完 Cache Lab，能解释一次未命中', '把结论写成十行笔记'],
    href: 'http://csapp.cs.cmu.edu/3e/labs.html',
    mark: 'LB',
    tint: '#9f2d2d',
  },
  {
    id: 'missing-semester',
    title: '补上缺失的一学期',
    why: 'MIT 的壳、Git 和调试。两周能收掉日常里最亏时间的操作。',
    steps: ['用脚本重复一件每周都做的事', '一次提交能讲清改了什么', '用调试器定位，而不是只打印'],
    href: 'https://missing.csail.mit.edu/',
    mark: 'MIT',
    tint: '#a31d1d',
  },
  {
    id: 'build-your-own',
    title: '做一个最小系统',
    why: 'Build Your Own X。只选 Git、数据库或解释器里的一个。',
    steps: ['做出能演示的最小版本', '写明它故意没做的部分', '用它处理一个真实小例子'],
    href: 'https://github.com/codecrafters-io/build-your-own-x',
    mark: 'BY',
    tint: '#1d4ed8',
  },
  {
    id: 'fullstackopen',
    title: '做完一个全栈小服务',
    why: '赫尔辛基的 Full Stack Open，有中文。从界面做到测试和部署。',
    steps: ['前端分清空、加载、错误、成功', '接口写明校验和错误码', '部署到一个自己能打开的地址'],
    href: 'https://fullstackopen.com/zh/',
    mark: 'FS',
    tint: '#0f766e',
  },
  {
    id: 'speedrun',
    title: '跑完一组合约挑战',
    why: 'Speedrun Ethereum。每个挑战都要测试，并且能向别人讲清签名内容。',
    steps: ['完成一个带测试的挑战', '签名前屏幕写明资产和数量', '密钥不进仓库'],
    href: 'https://speedrunethereum.com/',
    mark: 'SR',
    tint: '#6d28d9',
  },
  {
    id: 'fastai',
    title: '先做出一个能用的模型',
    why: 'fast.ai 实践课。先跑通，再换自己的小数据。',
    steps: ['跟完第一课并跑通笔记本', '换一份自己的数据再训一次', '记下这次比上次好在哪里'],
    href: 'https://course.fast.ai/',
    mark: 'FA',
    tint: '#ea580c',
  },
  {
    id: 'rag-notes',
    title: '用自己的笔记做检索问答',
    why: '固定二十条笔记当标准。换模型时还能比较，不靠感觉说变好了。',
    steps: ['准备二十条自己写的问答', '同一批问题至少对比两个模型', '答错的留下来，写成下一轮样本'],
    href: 'https://huggingface.co/learn',
    mark: 'QA',
    tint: '#be185d',
  },
  {
    id: 'infispace-agent',
    title: '按 InfiSpace 手册转型 Agent',
    why: '模块按依赖排好顺序；每章 demo 可跑；面试题答不上第三层追问就回查对应章节。',
    steps: [
      '读各模块「使用指南」，选定路线（有 Python / 先跑 demo / 只做 RAG）',
      'Agent 核心与 Tool Calling、ReAct 配套示例各跑通一遍',
      '用 LangChain 或 LangGraph 做出一个能演示的最小 Agent',
      '面试题库每题能扛住第三层追问，或记下要重读的章节',
    ],
    href: 'https://joashchn.github.io/infispace-course/index.html',
    mark: 'IF',
    tint: '#6366f1',
  },
]

export type Course = {
  id: string
  title: string
  who: string
  why: string
  track: Exclude<StudyTrack, 'other'>
  platform: 'B站' | 'YouTube' | 'MIT' | '文档'
  href: string
  plays: string
}

export const COURSES: Course[] = [
  {
    id: 'infispace-agent',
    title: 'AI Agent 转型手册',
    who: 'InfiSpace',
    why: '后端 / 前端转 Agent 的系统路线：原理、框架、工作流、工程化与 81 道面试追问链。',
    track: 'ai',
    platform: '文档',
    href: 'https://joashchn.github.io/infispace-course/index.html',
    plays: '113 篇文档 · 107 万字 · 站点内全文检索',
  },
  {
    id: 'karpathy',
    title: 'Neural Networks: Zero to Hero',
    who: 'Andrej Karpathy',
    why: '从手写反向传播做到一个小 GPT。官方播放列表。',
    track: 'ai',
    platform: 'YouTube',
    href: 'https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ',
    plays: '官方列表，单集长期高播放',
  },
  {
    id: '3b1b',
    title: '神经网络到底是什么',
    who: '3Blue1Brown',
    why: '用一张手写数字看清一层网络在算什么。',
    track: 'ai',
    platform: 'YouTube',
    href: 'https://www.youtube.com/watch?v=aircAruvnKk',
    plays: '系列入门集，长期高播放',
  },
  {
    id: 'limu',
    title: '动手学深度学习',
    who: '李沐',
    why: '课和代码在一起，从多层网络讲到注意力。',
    track: 'ai',
    platform: 'B站',
    href: 'https://www.bilibili.com/video/BV18h411r7Z7/',
    plays: '公开页约 53 万播放',
  },
  {
    id: 'hylee',
    title: '生成式 AI 导论',
    who: '李宏毅',
    why: '从模型能做什么，讲到你自己怎么把它用起来。',
    track: 'ai',
    platform: 'B站',
    href: 'https://www.bilibili.com/video/BV1XS411w7qr/',
    plays: '公开页约 31 万播放',
  },
  {
    id: 'atguigu-react',
    title: 'React 教程',
    who: '尚硅谷',
    why: '全栈先把界面这一层学扎实：组件、请求和路由。',
    track: 'fullstack',
    platform: 'B站',
    href: 'https://www.bilibili.com/video/BV1wy4y1D7JT/',
    plays: '公开页约 428 万播放',
  },
  {
    id: 'fcc-fullstack',
    title: 'Full Stack Developer Certificate',
    who: 'freeCodeCamp',
    why: '从页面做到接口和数据的一整条证书路径。',
    track: 'fullstack',
    platform: 'YouTube',
    href: 'https://www.youtube.com/playlist?list=PLHdCowjFIBmLn8RjqjQu_iWJI7j1iOHbU',
    plays: '官方播放列表',
  },
  {
    id: 'winston',
    title: 'How to Speak',
    who: 'Patrick Winston',
    why: '一小时讲清怎么准备、怎么讲、哪里会讲砸。',
    track: 'speech',
    platform: 'MIT',
    href: 'https://learn.mit.edu/video-playlist/7644/how-to-speak-by-patrick-winston',
    plays: 'MIT 公开课',
  },
  {
    id: 'winston-bili',
    title: '如何说话',
    who: 'Patrick Winston',
    why: '同一堂课，方便在 B 站看。',
    track: 'speech',
    platform: 'B站',
    href: 'https://www.bilibili.com/video/BV1Cu4m1u7dY/',
    plays: 'MIT 课的公开搬运',
  },
  {
    id: 'liuyuanyuan',
    title: '演讲快速精通教程',
    who: '刘媛媛',
    why: '结构、脱稿、即兴，以及上台前的紧张。',
    track: 'speech',
    platform: 'B站',
    href: 'https://www.bilibili.com/video/BV1Jt421K7Vq/',
    plays: '31 讲公开课',
  },
  {
    id: 'sikun',
    title: '321 表达法',
    who: '寺昆',
    why: '汇报、面试和会上怎么把一件事说完。',
    track: 'speech',
    platform: 'B站',
    href: 'https://www.bilibili.com/video/BV1G7411v7ss/',
    plays: '职场表达公开课',
  },
  {
    id: 'tangzhi',
    title: '关于说话的一切',
    who: '汤质',
    why: '把紧张、把话说清楚、把回应练开。打开后可能要购买。',
    track: 'speech',
    platform: 'B站',
    href: 'https://www.bilibili.com/cheese/play/ep34835',
    plays: '公开页约 356 万播放',
  },
  {
    id: 'charisma',
    title: '对话和社交',
    who: 'Charisma on Command',
    why: '练怎么把话说得让人愿意听完，以及怎么开一场对话。',
    track: 'speech',
    platform: 'YouTube',
    href: 'https://www.youtube.com/@Charismaoncommand',
    plays: '频道订阅约 676 万',
  },
]

export function sectionById(id: SectionId) {
  return SECTIONS.find((section) => section.id === id) ?? SECTIONS[0]
}

export function domainById(id: DomainId) {
  const domain = DOMAINS.find((item) => item.id === id)
  if (!domain) throw new Error(`unknown domain ${id}`)
  return domain
}
