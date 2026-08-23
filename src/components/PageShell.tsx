import Image from 'next/image';

type Atmosphere = 'none' | 'arena' | 'pitch' | 'locker';
type Width = 'board' | 'wide' | 'full';

const WIDTH: Record<Width, string> = {
  board: 'mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8',
  wide: 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8',
  full: 'w-full',
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
  return (
    <div className={`relative isolate min-h-[calc(100dvh-var(--nav-h))] bg-[#030712] text-white ${atmosphere === 'arena' || atmosphere === 'pitch' ? 'arena-pitch' : ''} ${className}`}>
      {atmosphere === 'locker' && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <Image
            src="/images/locker_room_auth.webp"
            alt=""
            fill
            className="object-cover object-center opacity-[0.28]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/88 via-[#030712]/72 to-[#030712]" />
        </div>
      )}
      <div className={WIDTH[width]}>{children}</div>
    </div>
  );
}
