import { useState } from 'react'

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => window.setTimeout(() => reject(new Error('timeout')), 700)),
      ])
      return true
    }
  } catch {
    /* 剪贴板权限被拦住时，改用选区复制。 */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

export function CopyButton({ text }: { text: string }) {
  const [label, setLabel] = useState('复制')

  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        const ok = await writeClipboard(text)
        setLabel(ok ? '已复制' : '复制失败')
        window.setTimeout(() => setLabel('复制'), 1200)
      }}
    >
      {label}
    </button>
  )
}
