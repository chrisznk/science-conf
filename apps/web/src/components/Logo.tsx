'use client'

export function Logo({ size = 'normal' }: { size?: 'small' | 'normal' | 'large' }) {
  const widths = { small: 100, normal: 140, large: 200 }
  const w = widths[size]

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <img
        src="/logo-sv-wide.jpg"
        alt="Science & Vie"
        style={{ width: w, height: 'auto', objectFit: 'contain' }}
        draggable={false}
      />
    </div>
  )
}
