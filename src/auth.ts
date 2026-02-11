import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { db } from '@/lib/db';

/**
 * Simple slugify for tenant slugs.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

async function ensureDefaultTenantForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const existingMemberships = await db.membership.findMany({
    where: { userId },
    take: 1,
  });

  if (existingMemberships.length > 0) {
    return;
  }

  const baseSlugSource =
    user.githubLogin ??
    (user.email ? user.email.split('@')[0] : undefined) ??
    `team-${userId.slice(0, 8)}`;

  const baseSlug = slugify(baseSlugSource);

  // Ensure slug uniqueness
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.tenant.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${suffix++}`;
  }

  const tenant = await db.tenant.create({
    data: {
      name: user.name || baseSlugSource,
      slug,
      memberships: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  return tenant;
}

const authConfig = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Attach user id
      (session.user as any).id = user.id;

      // Load memberships to expose tenant context to the client
      const memberships = await db.membership.findMany({
        where: { userId: user.id },
        include: { tenant: true },
      });

      (session as any).memberships = memberships.map((m) => ({
        tenantId: m.tenantId,
        role: m.role,
        tenant: {
          id: m.tenant.id,
          name: m.tenant.name,
          slug: m.tenant.slug,
        },
      }));

      // For now, default to the first tenant as active
      if ((session as any).memberships.length > 0) {
        (session as any).activeTenantId = (session as any).memberships[0].tenantId;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Ensure the user has at least one tenant on first sign-in
      await ensureDefaultTenantForUser(user.id);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export const { auth, signIn, signOut } = authConfig;
export const { GET, POST } = authConfig.handlers;

