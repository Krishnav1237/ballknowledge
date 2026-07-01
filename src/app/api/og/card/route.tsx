import { ImageResponse } from 'next/og';

export const runtime = 'edge';

function safeParam(url: URL, key: string, fallback: string, max = 80) {
  return (url.searchParams.get(key) || fallback).slice(0, max);
}

function rarityColor(rarity: string) {
  if (rarity === 'LEGENDARY') return '#F59E0B';
  if (rarity === 'EPIC') return '#A855F7';
  if (rarity === 'RARE') return '#3B82F6';
  return '#E11D48';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = safeParam(url, 'user', 'Tactical Manager');
  const verdict = safeParam(url, 'verdict', 'VAR VERDICT CARD');
  const fixture = safeParam(url, 'fixture', 'World Cup 2026');
  const rarity = safeParam(url, 'rarity', 'COMMON', 20).toUpperCase();
  const rating = safeParam(url, 'rating', '88', 3);
  const accent = rarityColor(rarity);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          color: 'white',
          background: `radial-gradient(circle at 70% 20%, ${accent}44 0, transparent 34%), linear-gradient(135deg, #030712 0%, #090D16 52%, #17030A 100%)`,
          fontFamily: 'Arial',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 6 }}>BALLKNOWLEDGE</div>
          <div style={{ border: `2px solid ${accent}`, borderRadius: 999, padding: '12px 22px', fontSize: 22, fontWeight: 800 }}>
            {rarity}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 42, alignItems: 'center' }}>
          <div
            style={{
              width: 190,
              height: 250,
              borderRadius: 28,
              border: `5px solid ${accent}`,
              boxShadow: `0 0 50px ${accent}66`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#050A12',
            }}
          >
            <div style={{ fontSize: 82, fontWeight: 900, lineHeight: 1 }}>{rating}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: accent }}>OVR</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#CBD5E1', marginBottom: 18 }}>{fixture}</div>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.02 }}>{verdict}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: accent, marginTop: 26 }}>{user}</div>
          </div>
        </div>
        <div style={{ fontSize: 25, color: '#CBD5E1', fontWeight: 700 }}>
          Football IQ, predictions, hot takes, and collectible verdict cards.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
