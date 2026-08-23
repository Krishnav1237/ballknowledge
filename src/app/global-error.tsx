'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full bg-[#030712] text-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#E11D48]">Hold up</p>
          <h1 className="mb-3 font-display text-3xl font-black uppercase tracking-tight">Something broke</h1>
          <p className="mb-6 max-w-md text-sm text-gray-400">
            The pitch glitched. Hit retry and get back on the board.
            {error?.digest ? <span className="mt-2 block font-mono text-xs text-gray-600">Error ID: {error.digest}</span> : null}
          </p>
          <button
            onClick={reset}
            className="rounded-xl bg-[#881337] px-5 py-2.5 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
