import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'hsl(240, 10%, 3.9%)',
          borderRadius: 6,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <path
            d="M5 22 Q16 15 27 22"
            stroke="hsl(263, 70%, 58%)"
            strokeOpacity="0.5"
            strokeWidth="1.25"
            fill="none"
          />
          <path
            d="M8 22V10L16 18L24 10V22"
            stroke="hsl(263, 70%, 58%)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
