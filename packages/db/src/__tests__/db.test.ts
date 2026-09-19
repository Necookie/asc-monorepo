import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDb, type ASCDatabase } from '../client';
import {
  users,
  profiles,
  profileSlugs,
  membershipPeriods,
  communityRoles,
  memberRoles,
} from '../schema';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

describe('Database Schema & Invariants', () => {
  let testDb: ASCDatabase & { $client: any };

  beforeEach(async () => {
    testDb = createDb(':memory:');
    const migrationsFolder = path.resolve(__dirname, '../../drizzle');
    await migrate(testDb, { migrationsFolder });
  });

  afterEach(() => {
    try {
      testDb.$client.close();
    } catch {}
  });

  it('enforces unique constraint on users.external_user_id', async () => {
    await testDb.insert(users).values({
      externalUserId: '999999999999999999',
      username: 'user1',
      displayName: 'User One',
      firstJoinedAt: new Date(),
      lastSyncedAt: new Date(),
    });

    // Inserting duplicate external_user_id must throw
    await expect(
      testDb.insert(users).values({
        externalUserId: '999999999999999999',
        username: 'user1_duplicate',
        displayName: 'User One Duplicate',
        firstJoinedAt: new Date(),
        lastSyncedAt: new Date(),
      })
    ).rejects.toThrow();
  });

  it('enforces unique constraint on profile_slugs.slug', async () => {
    const [user1] = await testDb
      .insert(users)
      .values({
        externalUserId: '100000000000000001',
        username: 'necookie',
        displayName: 'Necookie',
        firstJoinedAt: new Date(),
        lastSyncedAt: new Date(),
      })
      .returning();

    const [user2] = await testDb
      .insert(users)
      .values({
        externalUserId: '100000000000000002',
        username: 'other',
        displayName: 'Other',
        firstJoinedAt: new Date(),
        lastSyncedAt: new Date(),
      })
      .returning();

    await testDb.insert(profileSlugs).values({
      userId: user1.id,
      slug: 'necookie',
      isPrimary: true,
    });

    // Inserting same slug for user2 must throw
    await expect(
      testDb.insert(profileSlugs).values({
        userId: user2.id,
        slug: 'necookie',
        isPrimary: true,
      })
    ).rejects.toThrow();
  });

  it('cascades deletion of user to profile and slugs', async () => {
    const [newUser] = await testDb
      .insert(users)
      .values({
        externalUserId: '111122223333444455',
        username: 'temporary',
        displayName: 'Temporary User',
        firstJoinedAt: new Date(),
        lastSyncedAt: new Date(),
      })
      .returning();

    await testDb.insert(profiles).values({
      userId: newUser.id,
      bio: 'Test bio',
    });

    await testDb.insert(profileSlugs).values({
      userId: newUser.id,
      slug: 'temporary',
      isPrimary: true,
    });

    // Verify records exist
    const profileBefore = await testDb
      .select()
      .from(profiles)
      .where(eq(profiles.userId, newUser.id))
      .get();
    expect(profileBefore).toBeDefined();

    // Delete user
    await testDb.delete(users).where(eq(users.id, newUser.id));

    // Profile and slug should be cascaded
    const profileAfter = await testDb
      .select()
      .from(profiles)
      .where(eq(profiles.userId, newUser.id))
      .get();
    expect(profileAfter).toBeUndefined();

    const slugAfter = await testDb
      .select()
      .from(profileSlugs)
      .where(eq(profileSlugs.userId, newUser.id))
      .get();
    expect(slugAfter).toBeUndefined();
  });

  it('supports tracking multiple sequential membership periods for a user', async () => {
    const [user] = await testDb
      .insert(users)
      .values({
        externalUserId: '777777777777777777',
        username: 'rejoiner',
        displayName: 'Rejoiner',
        firstJoinedAt: new Date('2023-01-01'),
        lastSyncedAt: new Date(),
      })
      .returning();

    // Period 1: Jan 2023 to June 2023
    await testDb.insert(membershipPeriods).values({
      userId: user.id,
      joinedAt: new Date('2023-01-01'),
      leftAt: new Date('2023-06-01'),
    });

    // Period 2: Dec 2023 to ongoing (leftAt: null)
    await testDb.insert(membershipPeriods).values({
      userId: user.id,
      joinedAt: new Date('2023-12-01'),
      leftAt: null,
    });

    const periods = await testDb
      .select()
      .from(membershipPeriods)
      .where(eq(membershipPeriods.userId, user.id))
      .all();

    expect(periods).toHaveLength(2);
    expect(periods[0].leftAt).not.toBeNull();
    expect(periods[1].leftAt).toBeNull();
  });
});
