# 工台

桌面端个人工作台，给同时看全栈、后端、Web3 和 AI 的日常开发用。打开后先写今天要完成的一件事，再扫四个方向的信号和入口。

## 打开

```bash
npm install
npm run dev
```

浏览器会打开 http://localhost:5173 。也可以在访达里双击 `open-desk.command`。

## 快捷方式

- `1` 到 `9`：切换分区（与左侧导航一致）
- `/`：聚焦顶部过滤框
- `Esc`：清空过滤并收起焦点

## 部署到自有 Linux（Nginx，`/var/www/work-tai`）

在开发机打包静态资源：

```bash
npm ci
npm run build
```

`dist/` 目录即为站点根目录内容。同步到服务器（把 `user` 和 `server` 换成你的 SSH 登录）：

```bash
ssh user@server "sudo mkdir -p /var/www/work-tai && sudo chown -R \"\$USER:\$USER\" /var/www/work-tai"
rsync -avz --delete dist/ user@server:/var/www/work-tai/
```

在服务器上安装 Nginx 后，使用仓库里的示例配置：

- 参考 `deploy/nginx-work-tai.example.conf`，将 `server_name` 改为你的域名，保存为如 `/etc/nginx/sites-available/work-tai`，再：

```bash
sudo ln -sf /etc/nginx/sites-available/work-tai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

若需要 HTTPS，在服务器上安装 certbot 后执行：`sudo certbot --nginx -d your-domain.com`。

## 分区

- 今日：一句话意图、待办、专注计时、四个方向各一条热帖
- 全栈 / 后端 / Web3 / AI：全栈按界面、契约、数据、权限、交付展开；其余方向是本周关注、信号、文档入口和速记
- 图书馆：工程书，以及技能、人文、文学、社会、思维、成长书单，外加可做完的项目
- 题库：自己添加的待学题目，以及 AI、全栈、口才社交的公开课
- 工具：可复制命令，开工检查每天重置
- 专注：25 分钟、50 分钟，或 5 分钟休息

待办、意图、速记、阅读进度、题目、专注和检查保存在这台浏览器里。热帖来自 Hacker News（约 10 分钟缓存）；各板块的「推荐 / 图书馆 / 公开课 / 工具」来自 **GitHub 搜索 + YouTube（Piped）+ B 站**，约 **6 小时**缓存，可点「重新拉取」。

## 按键

- `/` 过滤当前分区
- `1` 到 `9` 切换分区
- `Esc` 清除过滤
