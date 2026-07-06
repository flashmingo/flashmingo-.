import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** iOS home-screen icon — same brand mark as icon.svg, rendered at 180×180. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F59E0B',
          borderRadius: 40,
        }}
      >
        <svg width="124" height="124" viewBox="0 0 32 32">
          <path d="M19 5L9 18h8L13 27l14-16h-9L19 5z" fill="white" fillOpacity="0.95" />
        </svg>
      </div>
    ),
    size,
  );
}
