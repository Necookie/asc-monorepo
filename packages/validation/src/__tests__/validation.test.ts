import { describe, it, expect } from 'vitest';
import {
  safeUrlSchema,
  hexColorSchema,
  updateBioSchema,
  profileLinkSchema,
  adminTagSchema,
  updateAppearanceSchema,
  validateBotEnv,
  validateWebEnv,
  botEnvSchema,
  webEnvSchema,
} from '../index';

describe('Validation Schemas', () => {
  describe('profile studio appearance', () => {
    const base = { theme: 'canvas', accentColor: '#5865f2', layout: 'split' };
    it('accepts bounded curated choices and HTTPS artwork', () => {
      expect(updateAppearanceSchema.safeParse({ ...base, supporterLayout: 'arcade', typography: 'playful', avatarFrame: 'crest', coverTreatment: 'artwork', coverPosition: 100, motion: 'lively', backgroundUrl: 'https://example.com/art.jpg' }).success).toBe(true);
    });
    it('rejects unknown layouts, out of range positions, and non-HTTPS covers', () => {
      expect(updateAppearanceSchema.safeParse({ ...base, supporterLayout: 'custom' }).success).toBe(false);
      expect(updateAppearanceSchema.safeParse({ ...base, coverPosition: 101 }).success).toBe(false);
      expect(updateAppearanceSchema.safeParse({ ...base, coverPosition: -1 }).success).toBe(false);
      expect(updateAppearanceSchema.safeParse({ ...base, backgroundUrl: 'http://example.com/art.jpg' }).success).toBe(false);
    });
  });
  describe('safeUrlSchema', () => {
    it('accepts valid https URLs', () => {
      expect(safeUrlSchema.safeParse('https://github.com/necookie').success).toBe(true);
      expect(safeUrlSchema.safeParse('https://asc.necookie.dev').success).toBe(true);
      expect(safeUrlSchema.safeParse('https://example.com/path?foo=bar#hash').success).toBe(true);
    });

    it('rejects dangerous schemes', () => {
      expect(safeUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
      expect(safeUrlSchema.safeParse('data:text/html,<script>alert(1)</script>').success).toBe(false);
      expect(safeUrlSchema.safeParse('file:///etc/passwd').success).toBe(false);
      expect(safeUrlSchema.safeParse('vbscript:msgbox(1)').success).toBe(false);
    });

    it('rejects malformed strings', () => {
      expect(safeUrlSchema.safeParse('not-a-url').success).toBe(false);
      expect(safeUrlSchema.safeParse('htp://missing-t').success).toBe(false);
    });
  });

  describe('hexColorSchema', () => {
    it('accepts valid 3 and 6 character hex colors', () => {
      expect(hexColorSchema.safeParse('#5865f2').success).toBe(true);
      expect(hexColorSchema.safeParse('#fff').success).toBe(true);
      expect(hexColorSchema.safeParse('#35ed7e').success).toBe(true);
    });

    it('rejects invalid color strings', () => {
      expect(hexColorSchema.safeParse('red').success).toBe(false);
      expect(hexColorSchema.safeParse('5865f2').success).toBe(false); // missing #
      expect(hexColorSchema.safeParse('#12345').success).toBe(false); // 5 digits
      expect(hexColorSchema.safeParse('#gggggg').success).toBe(false); // non-hex
    });
  });

  describe('updateBioSchema', () => {
    it('accepts valid bio and title', () => {
      const res = updateBioSchema.safeParse({
        bio: 'Hello world from ASC community!',
        customTitle: 'Lead Architect',
      });
      expect(res.success).toBe(true);
    });

    it('rejects bio longer than 500 characters', () => {
      const longBio = 'a'.repeat(501);
      const res = updateBioSchema.safeParse({ bio: longBio });
      expect(res.success).toBe(false);
    });

    it('rejects title longer than 64 characters', () => {
      const longTitle = 'a'.repeat(65);
      const res = updateBioSchema.safeParse({ customTitle: longTitle });
      expect(res.success).toBe(false);
    });
  });

  describe('profileLinkSchema', () => {
    it('accepts valid label and url', () => {
      const res = profileLinkSchema.safeParse({
        label: 'GitHub',
        url: 'https://github.com/necookie',
        displayOrder: 1,
      });
      expect(res.success).toBe(true);
    });

    it('rejects empty label', () => {
      const res = profileLinkSchema.safeParse({
        label: '',
        url: 'https://github.com/necookie',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('adminTagSchema', () => {
    it('accepts valid slug and name', () => {
      const res = adminTagSchema.safeParse({
        name: 'TypeScript',
        slug: 'typescript',
        color: '#5865f2',
        isActive: true,
      });
      expect(res.success).toBe(true);
    });

    it('rejects uppercase or invalid slug characters', () => {
      const res = adminTagSchema.safeParse({
        name: 'TypeScript',
        slug: 'TypeScript_Tag',
        color: '#5865f2',
        isActive: true,
      });
      expect(res.success).toBe(false);
    });
  });

  describe('startup environment validation', () => {
    const validBotEnv = {
      TURSO_DATABASE_URL: 'libsql://test.turso.io',
      DISCORD_TOKEN: 'test_token',
      DISCORD_CLIENT_ID: '1234567890',
      DISCORD_GUILD_ID: '9876543210',
      SYNC_INTERVAL: '30000',
    };

    const validWebEnv = {
      TURSO_DATABASE_URL: 'libsql://test.turso.io',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      CLERK_SECRET_KEY: 'sk_test_456',
      NEXT_PUBLIC_APP_URL: 'https://asc.necookie.dev',
    };

    it('accepts valid bot configuration and transforms SYNC_INTERVAL', () => {
      const parsed = validateBotEnv(validBotEnv);
      expect(parsed.SYNC_INTERVAL).toBe(30000);
      expect(parsed.NODE_ENV).toBe('development');
    });

    it('defaults SYNC_INTERVAL when omitted in bot configuration', () => {
      const { SYNC_INTERVAL, ...envWithoutInterval } = validBotEnv;
      const parsed = validateBotEnv(envWithoutInterval);
      expect(parsed.SYNC_INTERVAL).toBe(43200000);
    });

    it('rejects invalid or non-positive SYNC_INTERVAL in bot configuration', () => {
      expect(() => validateBotEnv({ ...validBotEnv, SYNC_INTERVAL: '-500' })).toThrow(
        /SYNC_INTERVAL/
      );
      expect(() => validateBotEnv({ ...validBotEnv, SYNC_INTERVAL: '0' })).toThrow(
        /SYNC_INTERVAL/
      );
      expect(() => validateBotEnv({ ...validBotEnv, SYNC_INTERVAL: 'not_a_number' })).toThrow(
        /SYNC_INTERVAL/
      );
    });

    it('fails fast on missing bot environment variables without leaking secrets', () => {
      expect(() => validateBotEnv({})).toThrowError(
        /invalid or missing environment variables \[TURSO_DATABASE_URL, DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID\]/
      );
    });

    it('accepts valid web configuration', () => {
      const parsed = validateWebEnv(validWebEnv);
      expect(parsed.NEXT_PUBLIC_APP_URL).toBe('https://asc.necookie.dev');
    });

    it('fails fast on missing web environment variables without leaking values', () => {
      expect(() => validateWebEnv({})).toThrowError(
        /invalid or missing environment variables \[TURSO_DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY\]/
      );
    });
  });
});
