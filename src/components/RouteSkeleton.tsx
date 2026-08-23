export default function RouteSkeleton({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-[calc(100dvh-var(--nav-h))] bg-[#030712] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-3 h-3 w-36 rounded-full skel" />
        <div className="mb-8 h-10 w-64 max-w-full rounded-lg skel" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="h-72 rounded-3xl border border-white/8 bg-[#0B0F19]/60 skel lg:col-span-7" />
          <div className="h-72 rounded-3xl border border-white/8 bg-[#0B0F19]/60 skel lg:col-span-5" />
        </div>
        <p className="sr-only">{label}</p>
      </div>
    </div>
  );
}
