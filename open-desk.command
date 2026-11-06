#!/bin/zsh
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo "需要先安装 Node.js：https://nodejs.org"
  read -r _
  exit 1
fi
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev
