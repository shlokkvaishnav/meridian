'use client';

export function TrustedBy() {
  // Placeholder company names - replace with actual logos/names
  const companies = [
    'TechCorp',
    'StartupXYZ',
    'ScaleUp Inc',
    'DevOps Pro',
    'CodeFlow',
    'BuildFast',
  ];

  return (
    <div className="py-12 border-y border-white/[0.06]">
      <div className="text-center mb-8">
        <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Trusted by engineering teams at</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
        {companies.map((company) => (
          <div
            key={company}
            className="text-slate-400 text-sm font-medium hover:text-slate-300 transition-colors"
          >
            {company}
          </div>
        ))}
      </div>
    </div>
  );
}
