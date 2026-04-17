import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #407255 0%, #5a9470 100%)',
          borderRadius: 7,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
          }}
        >
          B
        </span>
      </div>
    ),
    { ...size }
  )
}
