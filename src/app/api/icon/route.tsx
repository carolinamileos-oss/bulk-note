import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const raw = parseInt(req.nextUrl.searchParams.get('size') ?? '192')
  const size = isNaN(raw) ? 192 : Math.min(512, Math.max(32, raw))

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #407255 0%, #5a9470 100%)',
          borderRadius: size * 0.2,
          gap: size * 0.04,
        }}
      >
        {/* Circle background for letter */}
        <div
          style={{
            width: size * 0.44,
            height: size * 0.44,
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
              fontSize: size * 0.28,
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              lineHeight: 1,
            }}
          >
            B
          </span>
        </div>
        {/* App name */}
        <span
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: size * 0.09,
            fontWeight: 600,
            letterSpacing: '0.08em',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          BULK NOTE
        </span>
      </div>
    ),
    { width: size, height: size }
  )
}
