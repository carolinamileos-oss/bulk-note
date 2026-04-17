import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #407255 0%, #5a9470 100%)',
          borderRadius: 36,
          gap: 6,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: 44,
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            }}
          >
            B
          </span>
        </div>
        <span
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.08em',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          BULK NOTE
        </span>
      </div>
    ),
    { ...size }
  )
}
