import type { SectionId } from '../types'

export function RailIcon({ id }: { id: SectionId }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (id === 'today') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.5L15 15" />
      </svg>
    )
  }
  if (id === 'frontend') {
    return (
      <svg {...props}>
        <path d="M12 3.5 20 8 12 12.5 4 8z" />
        <path d="M4 12 12 16.5 20 12" />
        <path d="M4 16 12 20.5 20 16" />
      </svg>
    )
  }
  if (id === 'backend') {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="16" height="6" rx="1.5" />
        <rect x="4" y="14" width="16" height="6" rx="1.5" />
        <path d="M7 7h.01M7 17h.01" />
      </svg>
    )
  }
  if (id === 'web3') {
    return (
      <svg {...props}>
        <path d="M12 3 20 8v8l-8 5-8-5V8z" />
        <path d="M12 12 20 8M12 12v9M12 12 4 8" />
      </svg>
    )
  }
  if (id === 'ai') {
    return (
      <svg {...props}>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  }
  if (id === 'library') {
    return (
      <svg {...props}>
        <path d="M4 5.5h6a2 2 0 0 1 2 2V20H6.5A2.5 2.5 0 0 0 4 22.5z" />
        <path d="M20 5.5h-6a2 2 0 0 0-2 2V20h5.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </svg>
    )
  }
  if (id === 'tools') {
    return (
      <svg {...props}>
        <path d="M14.5 6.5a4 4 0 0 0-5.7 5.2L4 16.5 7.5 20l4.8-4.8a4 4 0 0 0 5.2-5.7l-2.4 2.4-2.2-2.2z" />
      </svg>
    )
  }
  if (id === 'study') {
    return (
      <svg {...props}>
        <path d="M6 4.5h12v15H6z" />
        <path d="M9 8.5h6M9 12h6M9 15.5h3" />
      </svg>
    )
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
