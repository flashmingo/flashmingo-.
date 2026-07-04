import { ImageResponse } from 'next/og';

export const alt = 'FlashMingo — Learning that sticks';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 96,
          background: '#0F172A',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(30,64,175,0.35), transparent 55%), radial-gradient(circle at 80% 75%, rgba(13,148,136,0.28), transparent 55%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* bolt */}
            <svg width="44" height="44" viewBox="0 0 32 32">
              <path d="M19 5L9 18h8L13 27l14-16h-9L19 5z" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
            FlashMingo
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 88,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
          }}
        >
          Learning that sticks.
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: 'rgba(226,232,240,0.75)' }}>
          The flashcard platform built for schools.
        </div>
      </div>
    ),
    size,
  );
}
