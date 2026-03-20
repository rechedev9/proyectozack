import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SocialPro — Agencia Gaming & Esports';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gradient accent bar top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #f5632a 0%, #e03070 35%, #c42880 62%, #8b3aad 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Brand name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: '-2px',
              display: 'flex',
            }}
          >
            <span style={{ color: '#f5632a' }}>SOCIAL</span>
            <span style={{ color: '#ffffff' }}>PRO</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            Agencia Gaming & Esports
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 48,
              marginTop: 32,
            }}
          >
            {[
              { value: '+13', label: 'AÑOS' },
              { value: '+15M', label: 'VIEWS/MES' },
              { value: '+100', label: 'CREADORES' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #f5632a, #e03070, #8b3aad)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '2px',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* URL bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 18,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '1px',
          }}
        >
          socialpro.es
        </div>
      </div>
    ),
    { ...size },
  );
}
