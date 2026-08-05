export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Header skeleton */}
      <header className="border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 animate-pulse" />
            <div className="h-4 w-20 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="glass-card p-6 space-y-3"
            >
              <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
              <div className="h-8 w-16 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="glass-card p-6 space-y-4"
            >
              <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
              <div className="h-48 rounded-lg bg-white/[0.02] animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="glass-card p-6 space-y-4">
          <div className="h-4 w-40 rounded bg-white/5 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3 border-b border-white/[0.04]"
            >
              <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 rounded bg-white/5 animate-pulse" />
                <div className="h-2 w-24 rounded bg-white/5 animate-pulse" />
              </div>
              <div className="h-6 w-12 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
