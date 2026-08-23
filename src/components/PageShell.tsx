import Image from 'next/image';

type Atmosphere = 'none' | 'stadium' | 'pitch' | 'locker';
type Width = 'board' | 'wide' | 'full';

const WIDTH: Record<Width, string> = {
  board: 'mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8',
  wide: 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8',
  full: 'w-full',
};

const ART: Record<Exclude<Atmosphere, 'none'>, string> = {
  stadium: '/images/stadium_bg.webp',
  pitch: '/images/match_details_bg.webp',
  locker: '/images/locker_room_auth.webp',
};

export default function PageShell({
  children,
  atmosphere = 'none',
  width = 'wide',
  className = '',
}: {
  children: React.ReactNode;
  atmosphere?: Atmosphere;
  width?: Width;
  className?: string;
}) {
  const art = atmosphere === 'none' ? null : ART[atmosphere];

  return (
    <div className={`relative isolate min-h-[calc(100dvh-var(--nav-h))] bg-[#030712] text-white ${className}`}>
      {art && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <Image
            src={art}
            alt=""
            fill
            className="object-cover object-center opacity-[0.28]"
            sizes="100vw"
            priority={atmosphere === 'stadium'}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/88 via-[#030712]/72 to-[#030712]" />
        </div>
      )}
      <div className={WIDTH[width]}>{children}</div>
    </div>
  );
}
