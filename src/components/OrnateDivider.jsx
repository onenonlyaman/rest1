export default function OrnateDivider({ className = 'text-ghee my-4', width = 240 }) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 400 40"
        fill="none"
        style={{ width: `${width}px`, maxWidth: '100%' }}
        className="h-auto opacity-80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Center Diamond and Flourish */}
          <polygon points="200,10 208,20 200,30 192,20" fill="currentColor" fillOpacity="0.25" />
          <circle cx="200" cy="20" r="2.5" fill="currentColor" />

          {/* Left Scrollwork */}
          <path d="M190 20 C175 12 160 12 145 20 C130 28 115 28 100 20 L40 20" />
          <path d="M165 16 C170 8 180 8 185 14 C188 18 185 24 178 24 C172 24 168 20 172 16" />
          <path d="M135 24 C130 32 120 32 115 26 C112 22 115 16 122 16 C128 16 132 20 128 24" />
          <circle cx="30" cy="20" r="3" fill="currentColor" />
          <path d="M20 20 L5 20" />

          {/* Right Scrollwork (Mirrored) */}
          <path d="M210 20 C225 12 240 12 255 20 C270 28 285 28 300 20 L360 20" />
          <path d="M235 16 C230 8 220 8 215 14 C212 18 215 24 222 24 C228 24 232 20 228 16" />
          <path d="M265 24 C270 32 280 32 285 26 C288 22 285 16 278 16 C272 16 268 20 272 24" />
          <circle cx="370" cy="20" r="3" fill="currentColor" />
          <path d="M380 20 L395 20" />
        </g>
      </svg>
    </div>
  )
}
