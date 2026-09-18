import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { extractDiscordSnowflake } from './claims';
import { resolveMemberByIdentity } from './identity';
import type { AuthenticatedMember, IdentityResolutionResult } from '@asc/types';
import { db, type ASCDatabase } from '@asc/db';

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
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    const discordSnowflake = extractDiscordSnowflake(clerkUser);
    if (!discordSnowflake) {
      return null;
    }

    const result = await resolveMemberByIdentity({
      clerkUserId: clerkUser.id,
      discordSnowflake,
      database,
    });

    if (result.status === 'RESOLVED') {
      return result.member;
    }

    return null;
  } catch {
    // If Clerk is not configured or an error occurs, gracefully return null
    return null;
  }
}

/**
 * Detailed identity resolution for the current session.
 * Useful for login callback / error handling when a user needs guidance
 * (e.g. not a community member yet).
 */
export async function resolveCurrentSession(
  database: ASCDatabase = db
): Promise<IdentityResolutionResult | null> {
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
    });
  } catch {
    return null;
  }
}

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
