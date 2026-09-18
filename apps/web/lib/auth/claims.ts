/**
 * ASC — Discord OAuth Claims Extraction
 *
 * Extracts and validates the immutable Discord Snowflake from Clerk external account claims.
 * Adheres strictly to docs/IDENTITY_AND_AUTH.md and docs/SECURITY.md:
 * - Immutable Discord Snowflake is the only canonical member identity anchor.
 * - Never match by username, email, or display name.
 */

export interface ExternalAccountClaim {
  provider?: string | null;
  externalId?: string | null;
  providerUserId?: string | null;
  username?: string | null;
}

export interface ClerkUserClaims {
  id: string;
  externalAccounts?: ExternalAccountClaim[] | null;
}

const DISCORD_SNOWFLAKE_REGEX = /^\d{17,20}$/;

/**
 * Validates whether a given string is a valid Discord Snowflake format
 * (17 to 20 numeric digits).
 */
export function isValidDiscordSnowflake(snowflake: unknown): snowflake is string {
  if (typeof snowflake !== 'string') {
    return false;
  }
  return DISCORD_SNOWFLAKE_REGEX.test(snowflake);
}

/**
 * Extracts the verified Discord Snowflake from Clerk user claims.
 *
 * Returns the Discord Snowflake string if a verified Discord OAuth provider
 * account is present and properly formatted, or null otherwise.
 */
export function extractDiscordSnowflake(
  clerkUser: ClerkUserClaims | null | undefined
): string | null {
  if (!clerkUser || !Array.isArray(clerkUser.externalAccounts)) {
    return null;
  }

  // Look for Discord OAuth account in externalAccounts
  const discordAccount = clerkUser.externalAccounts.find((account) => {
    if (!account || !account.provider) return false;
    const provider = account.provider.toLowerCase();
    return provider === 'oauth_discord' || provider === 'discord';
  });

  if (!discordAccount) {
    return null;
  }

  // Clerk stores the provider user ID in `providerUserId` or `externalId`
  const candidateId = discordAccount.providerUserId || discordAccount.externalId;

  if (isValidDiscordSnowflake(candidateId)) {
    return candidateId;
  }

  return null;
}
