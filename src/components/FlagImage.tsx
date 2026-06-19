'use client';

import { useState } from 'react';
import { getFlagUrl, getCountryCode } from '@/lib/countries';

interface FlagImageProps {
  countryName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: { px: '16px', cdnWidth: 20 as const, textSize: 'text-xs' },
  sm: { px: '22px', cdnWidth: 40 as const, textSize: 'text-sm' },
  md: { px: '28px', cdnWidth: 40 as const, textSize: 'text-base' },
  lg: { px: '36px', cdnWidth: 80 as const, textSize: 'text-xl' },
  xl: { px: '48px', cdnWidth: 80 as const, textSize: 'text-2xl' },
};

// Unicode emoji fallback map
const FLAG_EMOJI: Record<string, string> = {
  ar: '🇦🇷', br: '🇧🇷', pt: '🇵🇹', fr: '🇫🇷',
  'gb-eng': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', de: '🇩🇪', es: '🇪🇸', nl: '🇳🇱',
  uy: '🇺🇾', ma: '🇲🇦', jp: '🇯🇵', sa: '🇸🇦',
  us: '🇺🇸', ca: '🇨🇦', mx: '🇲🇽', it: '🇮🇹',
  hr: '🇭🇷', be: '🇧🇪', sn: '🇸🇳', tn: '🇹🇳',
  eg: '🇪🇬', ir: '🇮🇷', kr: '🇰🇷', at: '🇦🇹',
  rs: '🇷🇸', ch: '🇨🇭', dk: '🇩🇰', pl: '🇵🇱',
  'gb-sct': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', al: '🇦🇱', cz: '🇨🇿', hu: '🇭🇺',
  sk: '🇸🇰', si: '🇸🇮', tr: '🇹🇷', ua: '🇺🇦',
  ro: '🇷🇴', ge: '🇬🇪', ng: '🇳🇬', gh: '🇬🇭',
  za: '🇿🇦', cm: '🇨🇲', ml: '🇲🇱', ci: '🇨🇮',
  dz: '🇩🇿', ao: '🇦🇴', co: '🇨🇴', ec: '🇪🇨',
  qa: '🇶🇦', jo: '🇯🇴', uz: '🇺🇿', au: '🇦🇺',
  id: '🇮🇩', cn: '🇨🇳', bh: '🇧🇭', iq: '🇮🇶',
  nz: '🇳🇿', py: '🇵🇾', cl: '🇨🇱', ve: '🇻🇪',
  pe: '🇵🇪', bo: '🇧🇴', pa: '🇵🇦', hn: '🇭🇳',
  cr: '🇨🇷', jm: '🇯🇲', sv: '🇸🇻', ht: '🇭🇹',
};

export default function FlagImage({ countryName, size = 'md', className = '' }: FlagImageProps) {
  const [imgError, setImgError] = useState(false);
  const config = SIZE_MAP[size];
  const code = getCountryCode(countryName);
  const url = code ? getFlagUrl(countryName, config.cdnWidth) : '';
  const emoji = code ? (FLAG_EMOJI[code] ?? '🏳️') : '🏳️';

  if (!url || imgError) {
    return (
      <span className={`${config.textSize} leading-none ${className}`} role="img" aria-label={countryName}>
        {emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`${countryName} flag`}
      width={config.cdnWidth}
      height={Math.round(config.cdnWidth * 0.75)}
      style={{ width: config.px, height: 'auto', objectFit: 'cover', display: 'inline-block' }}
      className={`rounded-sm shadow-sm ${className}`}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}
