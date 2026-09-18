import { describe, it, expect } from 'vitest';
import {
  safeUrlSchema,
  hexColorSchema,
  updateBioSchema,
  profileLinkSchema,
  adminTagSchema,
} from '../index';

describe('Validation Schemas', () => {
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
});
