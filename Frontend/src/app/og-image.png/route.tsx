import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #12121f 50%, #0a0a0f 100%)',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background:
            'radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: '100px',
          padding: '8px 24px',
          marginBottom: '32px',
        }}
      >
        <span
          style={{
            color: '#818cf8',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          🚀 The Future of Tech Education — 100% Free
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: '72px',
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: '24px',
          maxWidth: '900px',
        }}
      >
        Learn Coding. <span style={{ color: '#818cf8' }}>Get Hired.</span>
      </div>

      {/* Subtext */}
      <div
        style={{
          fontSize: '24px',
          color: 'rgba(255,255,255,0.65)',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.5,
          marginBottom: '48px',
        }}
      >
        Free Python, JavaScript, React, System Design & more. AI quizzes · Hackathons · Verified
        Certificates
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '48px' }}>
        {[
          { value: '50,000+', label: 'Learners' },
          { value: '500+', label: 'Free Courses' },
          { value: '1,200+', label: 'Challenges' },
        ].map((s) => (
          <div
            key={s.label}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#818cf8' }}>{s.value}</span>
            <span
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '4px',
                letterSpacing: '0.1em',
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Brand */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          fontSize: '18px',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.05em',
        }}
      >
        bluelearnerhub.com
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
