import { db } from './client';
import {
  users,
  profiles,
  profileSlugs,
  membershipPeriods,
  communityRoles,
  memberRoles,
  tags,
  memberTags,
  profileLinks,
  entitlements,
  siteSettings,
} from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase(targetDb = db) {
  console.log('Seeding database with deterministic community fixtures...');

  // 1. Roles
  const [adminRole] = await targetDb
    .insert(communityRoles)
    .values({
      externalRoleId: '100000000000000001',
      name: 'Founder',
      color: '#ed4245',
      position: 100,
      isSupporter: true,
      isAdmin: true,
      isModerator: true,
    })
    .onConflictDoNothing()
    .returning();

  const [modRole] = await targetDb
    .insert(communityRoles)
    .values({
      externalRoleId: '100000000000000002',
      name: 'Staff',
      color: '#35ed7e',
      position: 50,
      isSupporter: false,
      isAdmin: false,
      isModerator: true,
    })
    .onConflictDoNothing()
    .returning();

  const [supporterRole] = await targetDb
    .insert(communityRoles)
    .values({
      externalRoleId: '100000000000000003',
      name: 'Server Booster',
      color: '#ec48bd',
      position: 25,
      isSupporter: true,
      isAdmin: false,
      isModerator: false,
    })
    .onConflictDoNothing()
    .returning();

  const [memberRole] = await targetDb
    .insert(communityRoles)
    .values({
      externalRoleId: '100000000000000004',
      name: 'Community Member',
      color: '#5865f2',
      position: 1,
      isSupporter: false,
      isAdmin: false,
      isModerator: false,
    })
    .onConflictDoNothing()
    .returning();

  // 2. Tags
  const tagList = [
    { name: 'TypeScript', slug: 'typescript', color: '#3178c6', description: 'Typed JavaScript at Any Scale' },
    { name: 'Design', slug: 'design', color: '#ec48bd', description: 'UI/UX and visual craft' },
    { name: 'Next.js', slug: 'nextjs', color: '#ffffff', description: 'The React framework for the web' },
    { name: 'AI & Agents', slug: 'ai-agents', color: '#35ed7e', description: 'Autonomous agents and LLM tooling' },
    { name: 'Open Source', slug: 'open-source', color: '#5865f2', description: 'Public collaboration and OSS' },
    { name: 'Sound & Music', slug: 'sound-music', color: '#f0b232', description: 'Audio production & melodies' },
  ];

  const createdTags = [];
  for (const t of tagList) {
    const [inserted] = await targetDb
      .insert(tags)
      .values(t)
      .onConflictDoNothing()
      .returning();
    if (inserted) createdTags.push(inserted);
  }

  // 3. Site Settings
  await targetDb
    .insert(siteSettings)
    .values([
      { key: 'maintenanceMode', value: 'false' },
      { key: 'announcement', value: 'Welcome to ASC! The community identity platform.' },
    ])
    .onConflictDoNothing();

  // Helper to upsert a user with profile
  async function createMemberFixture({
    externalUserId,
    username,
    displayName,
    nickname,
    avatar,
    status = 'ACTIVE' as const,
    firstJoinedAt = new Date('2024-01-01'),
    leftAt = null as Date | null,
    bio,
    customTitle,
    accentColor = '#5865f2',
    theme = 'canvas' as const,
    backgroundUrl = null as string | null,
    links = [] as Array<{ label: string; url: string; order: number }>,
    assignedRoles = [] as Array<typeof adminRole>,
    tagSlugs = [] as string[],
    pastSlug = null as string | null,
  }) {
    const existing = await targetDb
      .select()
      .from(users)
      .where(eq(users.externalUserId, externalUserId))
      .get();

    let userId = existing?.id;

    if (!existing) {
      const [newUser] = await targetDb
        .insert(users)
        .values({
          externalUserId,
          username,
          displayName,
          nickname,
          avatar,
          membershipStatus: status,
          firstJoinedAt,
          leftAt,
          lastSyncedAt: new Date(),
        })
        .returning();
      userId = newUser.id;

      // Membership Period
      await targetDb.insert(membershipPeriods).values({
        userId: newUser.id,
        joinedAt: firstJoinedAt,
        leftAt,
      });

      // Primary Slug
      await targetDb.insert(profileSlugs).values({
        userId: newUser.id,
        slug: username.toLowerCase(),
        isPrimary: true,
      });

      // Historical Slug Alias if provided
      if (pastSlug) {
        await targetDb.insert(profileSlugs).values({
          userId: newUser.id,
          slug: pastSlug.toLowerCase(),
          isPrimary: false,
          releasedAt: new Date('2024-06-01'),
        });
      }

      // Profile
      const [newProfile] = await targetDb
        .insert(profiles)
        .values({
          userId: newUser.id,
          bio,
          customTitle,
          accentColor,
          theme,
          backgroundUrl,
          isPrivate: false,
          showRoles: true,
          showMembershipDate: true,
          showTags: true,
          showLinks: true,
        })
        .returning();

      // Profile Links
      for (const l of links) {
        await targetDb.insert(profileLinks).values({
          profileId: newProfile.id,
          label: l.label,
          url: l.url,
          displayOrder: l.order,
        });
      }

      // Entitlements
      const isSupporter = assignedRoles.some((r) => r && r.isSupporter);
      if (isSupporter) {
        await targetDb.insert(entitlements).values([
          {
            userId: newUser.id,
            key: 'profile.background',
            value: 'true',
            source: 'ROLE_SUPPORTER',
          },
          {
            userId: newUser.id,
            key: 'profile.custom_title',
            value: 'true',
            source: 'ROLE_SUPPORTER',
          },
          {
            userId: newUser.id,
            key: 'profile.gradient',
            value: 'true',
            source: 'ROLE_SUPPORTER',
          },
        ]);
      }
    }

    // Assign Roles
    for (const r of assignedRoles) {
      if (!r || !userId) continue;
      await targetDb
        .insert(memberRoles)
        .values({
          userId,
          roleId: r.id,
        })
        .onConflictDoNothing();
    }

    // Assign Tags
    const allDbTags = await targetDb.select().from(tags).all();
    for (const slug of tagSlugs) {
      const match = allDbTags.find((t) => t.slug === slug);
      if (match && userId) {
        await targetDb
          .insert(memberTags)
          .values({
            userId,
            tagId: match.id,
          })
          .onConflictDoNothing();
      }
    }
  }

  // Seed Member 1: Necookie (Founder, Supporter, Admin)
  await createMemberFixture({
    externalUserId: '100000000000000010',
    username: 'necookie',
    displayName: 'Necookie',
    nickname: 'Lead Architect',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    status: 'ACTIVE',
    firstJoinedAt: new Date('2023-11-01'),
    bio: 'Building ASC, software systems, and community tools. Passionate about design systems and autonomous engineering.',
    customTitle: 'ASC Founder & Architect',
    accentColor: '#5865f2',
    theme: 'canvas',
    backgroundUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    links: [
      { label: 'GitHub', url: 'https://github.com/Necookie', order: 0 },
      { label: 'Website', url: 'https://necookie.dev', order: 1 },
      { label: 'Twitter', url: 'https://x.com/necookie', order: 2 },
    ],
    assignedRoles: [adminRole, supporterRole],
    tagSlugs: ['typescript', 'nextjs', 'design'],
    pastSlug: 'dheyn', // Historical alias!
  });

  // Seed Member 2: Alice (Moderator & Supporter)
  await createMemberFixture({
    externalUserId: '100000000000000020',
    username: 'alice',
    displayName: 'Alice In Tech',
    nickname: 'Mod Alice',
    avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
    status: 'ACTIVE',
    firstJoinedAt: new Date('2024-02-15'),
    bio: 'Community moderator and open-source enthusiast. Always exploring new frontend architectures.',
    customTitle: 'Community Lead',
    accentColor: '#ec48bd',
    theme: 'indigo',
    backgroundUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
    links: [
      { label: 'GitHub', url: 'https://github.com/alice', order: 0 },
      { label: 'Blog', url: 'https://alice.dev', order: 1 },
    ],
    assignedRoles: [modRole, supporterRole],
    tagSlugs: ['ai-agents', 'open-source'],
  });

  // Seed Member 3: Bob (Regular Member)
  await createMemberFixture({
    externalUserId: '100000000000000030',
    username: 'bob',
    displayName: 'Bob The Builder',
    avatar: 'https://cdn.discordapp.com/embed/avatars/2.png',
    status: 'ACTIVE',
    firstJoinedAt: new Date('2024-05-10'),
    bio: 'General software tinkerer and full-stack developer.',
    accentColor: '#35ed7e',
    theme: 'onyx',
    links: [{ label: 'GitHub', url: 'https://github.com/bob', order: 0 }],
    assignedRoles: [memberRole],
    tagSlugs: ['typescript', 'open-source'],
  });

  // Seed Member 4: Charlie (Former Member, LEFT)
  await createMemberFixture({
    externalUserId: '100000000000000040',
    username: 'charlie',
    displayName: 'Charlie Wanderer',
    avatar: 'https://cdn.discordapp.com/embed/avatars/3.png',
    status: 'LEFT',
    firstJoinedAt: new Date('2023-12-01'),
    leftAt: new Date('2024-08-01'),
    bio: 'Exploring new communities. Preserved profile.',
    accentColor: '#5865f2',
    theme: 'canvas',
    assignedRoles: [],
    tagSlugs: ['sound-music'],
  });

  console.log('Seeding completed successfully.');
}

if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.endsWith('seed.ts'))) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
