import React from 'react'

interface MarkProps {
  size?: number
  className?: string
}

export const Mark: React.FC<MarkProps> = ({ size = 32, className }) => {
  return (
    <span
      className={['mark-orbit', className].filter(Boolean).join(' ')}
      style={{ fontSize: size }}
    >
      <svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
        <circle className="ring ring-1" cx="0" cy="0" r="42" />
        <g className="ring ring-2">
          <circle
            cx="0"
            cy="0"
            r="32"
            fill="none"
            strokeWidth="0.6"
            strokeDasharray="2 6"
            style={{ stroke: 'var(--primary)' }}
          />
          <circle cx="32" cy="0" r="3" fill="var(--primary)" />
        </g>
        <g className="core">
          <path
            d="M -14 -14 L 14 -14 L 14 -8 L 4 -8 L 4 14 L -2 14 L -2 -8 L -14 -8 Z"
            fill="var(--primary)"
            transform="translate(0,0) scale(0.85)"
          />
        </g>
      </svg>
    </span>
  )
}
