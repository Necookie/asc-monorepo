import { currentUser } from '@clerk/nextjs/server';
import { redirect, unstable_rethrow } from 'next/navigation';
import { extractDiscordSnowflake } from './claims';
import { resolveMemberByIdentity } from './identity';
import type { AuthenticatedMember, IdentityResolutionResult } from '@asc/types';
import { db, type ASCDatabase } from '@asc/db';
import { cache } from 'react';

/**
 * Retrieves the currently authenticated community member from the active Clerk session.
 *
 * Resolves the user by extracting the verified Discord snowflake claim and linking
 * the Clerk user ID to the canonical ASC user in the database.
 * Returns null if the user is unauthenticated or has no valid community member record.
 */
export async function getAuthenticatedMember(
  database: ASCDatabase = db
): Promise<AuthenticatedMember | null> {
  const result = await resolveCurrentSession(database);
  return result?.status === 'RESOLVED' ? result.member : null;
}

export type SessionResolution = IdentityResolutionResult | { status: 'UNAVAILABLE' };

/**
 * Detailed identity resolution for the current session.
 * Useful for login callback / error handling when a user needs guidance
 * (e.g. not a community member yet).
 */
export const resolveCurrentSession = cache(async function resolveCurrentSession(
  database: ASCDatabase = db
): Promise<SessionResolution | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const discordSnowflake = extractDiscordSnowflake(clerkUser);
    if (!discordSnowflake) {
      return {
        status: 'UNLINKED_DISCORD',
        clerkUserId: clerkUser.id,
      };
    }

    return await resolveMemberByIdentity({
      clerkUserId: clerkUser.id,
      discordSnowflake,
      database,
      // Private metadata comes from Clerk's authenticated Backend API, never browser input.
      isClerkOwner: clerkUser.privateMetadata?.role === 'owner',
    });
  } catch (error) {
    unstable_rethrow(error);
    // An outage is distinct from a signed-out session. Do not expose provider errors.
    console.error('[ASC auth] Unable to resolve the member session.');
    return { status: 'UNAVAILABLE' };
  }
});

/**
 * Enforces that a request comes from an authenticated community member.
 * Redirects to /login if unauthenticated, or /not-a-member if the user
 * has a Discord account that is not yet in the community.
 */
export async function requireAuthenticatedMember(
  database: ASCDatabase = db
): Promise<AuthenticatedMember> {
  const sessionResult = await resolveCurrentSession(database);

  if (!sessionResult) {
    redirect('/login');
  }

  if (sessionResult.status === 'UNAVAILABLE') {
    redirect('/login?error=service_unavailable');
  }

  if (sessionResult.status === 'UNLINKED_DISCORD') {
    redirect('/login?error=discord_required');
  }

  if (sessionResult.status === 'NOT_FOUND') {
    redirect('/not-a-member');
  }

  return sessionResult.member;
}

/**
 * Enforces that a request comes from an authenticated community member
 * with administrative privileges. Redirects to /dashboard if unauthorized.
 */
export async function requireAdminMember(
  database: ASCDatabase = db
): Promise<AuthenticatedMember> {
  const member = await requireAuthenticatedMember(database);

  if (!member.isAdmin) {
    redirect('/dashboard');
  }

  return member;
}

export async function requireModeratorMember(database: ASCDatabase = db): Promise<AuthenticatedMember> {
  const member = await requireAuthenticatedMember(database);
  if (!member.isAdmin && !member.isModerator) redirect('/dashboard');
  return member;
}

export async function requireOwnerMember(database: ASCDatabase = db): Promise<AuthenticatedMember> {
  const member = await requireAuthenticatedMember(database);
  if (member.isOwner !== true) redirect('/dashboard');
  return member;
}
