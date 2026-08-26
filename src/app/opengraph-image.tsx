import { ImageResponse } from 'next/og'

export const alt = 'FX Gym – Transform Your Body, Elevate Your Mind'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Rendered per-request on the Edge runtime: avoids static-prerender issues
// with @vercel/og's Node binary on some platforms (notably Windows) and
// always reflects current branding.
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          position: 'relative',
        }}
      >
        {/* Neon orbs */}
        <div
          style={{
            position: 'absolute',
            top: -140,
            left: -100,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(0,255,136,0.4), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            right: -80,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(0,212,255,0.35), transparent 70%)',
          }}
        />

        {/* Brand pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 30px',
            background: '#ecfdf5',
            border: '2px solid #059669',
            borderRadius: 9999,
            marginBottom: 36,
          }}
        >
          <span style={{ fontSize: 34 }}>💪</span>
          <span style={{ color: '#059669', fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>
            FX GYM
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, color: '#f0f0f5' }}>
          Transform Your Body,
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            backgroundImage: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            backgroundClip: 'text',
            color: 'transparent',
            marginTop: 6,
          }}
        >
          Elevate Your Mind
        </div>

        {/* Chips */}
        <div style={{ display: 'flex', gap: 22, marginTop: 48 }}>
          {['24/7 ACCESS', '50+ CLASSES', 'EXPERT COACHES'].map((chip) => (
            <div
              key={chip}
              style={{
                display: 'flex',
                padding: '10px 26px',
                border: '1px solid #00d4ff55',
                borderRadius: 12,
                color: '#00d4ff',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}