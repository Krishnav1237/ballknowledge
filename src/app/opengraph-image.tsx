import { ImageResponse } from 'next/og';

export const alt = 'BallKnowledge — Take #1';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: 'white',
          background: 'linear-gradient(160deg, #030712 0%, #0B0F19 52%, #17030A 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 6 }}>BALLKNOWLEDGE</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#E11D48' }}>PL 26/27</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#9CA3AF' }}>Rank is the OVR.</div>
          <div style={{ fontSize: 92, fontWeight: 900, color: '#E11D48', lineHeight: 1.02 }}>Take #1.</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#CBD5E1' }}>
          Call the next fixture. Climb the board.
        </div>
      </div>
    ),
    { ...size },
  );
}
