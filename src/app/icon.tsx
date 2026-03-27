import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #f5632a 0%, #e03070 50%, #8b3aad 100%)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: '15px',
          fontWeight: 900,
          fontFamily: 'sans-serif',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        SP
      </span>
    </div>,
    { ...size },
  );
}
