'use client';

import Image from 'next/image';

const stack = [
  { name: 'GitHub', slug: 'github' },
  { name: 'Next.js', slug: 'nextdotjs' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'Prisma', slug: 'prisma' },
  { name: 'Anthropic', slug: 'anthropic' },
];

export function TrustedBy() {
  return (
    <div className="py-12 border-y border-foreground/[0.06]">
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">Built on</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
        {stack.map((item) => (
          <Image
            key={item.slug}
            src={`https://cdn.simpleicons.org/${item.slug}/71717a`}
            alt={item.name}
            width={28}
            height={28}
            unoptimized
            className="h-7 w-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
          />
        ))}
      </div>
    </div>
  );
}
