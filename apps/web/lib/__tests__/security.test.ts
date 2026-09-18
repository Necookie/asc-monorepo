import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';
import {
  isValidHttpUrl,
  sanitizeExternalUrl,
  validateProfileLink,
  validateBio,
  validateCustomTitle,
  validateSlug,
  updateLinksSchema,
  updateBioSchema,
} from '@asc/validation';
import { assertProfileOwnership } from '../auth/guards';

describe('ASC Security Hardening & Threat Mitigation', () => {
  describe('1. Next.js Security Headers & CSP', () => {
    it('configures strict HTTP security headers for all routes', async () => {
      expect(nextConfig.headers).toBeDefined();
      if (typeof nextConfig.headers !== 'function') {
        throw new Error('nextConfig.headers is not a function');
      }

      const headersConfig = await nextConfig.headers();
      expect(headersConfig).toHaveLength(1);

      const rootRoute = headersConfig[0];
      expect(rootRoute.source).toBe('/:path*');

      const headersMap = new Map(rootRoute.headers.map((h) => [h.key, h.value]));

      // 1. CSP
      const csp = headersMap.get('Content-Security-Policy');
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain('https://challenges.cloudflare.com');

      // 2. MIME sniffing protection
      expect(headersMap.get('X-Content-Type-Options')).toBe('nosniff');

      // 3. Clickjacking protection
      expect(headersMap.get('X-Frame-Options')).toBe('DENY');

      // 4. Referrer policy
      expect(headersMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');

      // 5. HSTS
      expect(headersMap.get('Strict-Transport-Security')).toContain('max-age=63072000');

      // 6. Permissions Policy
      const permPolicy = headersMap.get('Permissions-Policy');
      expect(permPolicy).toContain('camera=()');
      expect(permPolicy).toContain('microphone=()');
      expect(permPolicy).toContain('geolocation=()');
    });
  });

  describe('2. Dangerous Protocol & URL Scheme Sanitization', () => {
    it('accepts safe HTTPS and HTTP protocols', () => {
      expect(isValidHttpUrl('https://necookie.dev')).toBe(true);
      expect(isValidHttpUrl('https://github.com/necookie')).toBe(true);
      expect(isValidHttpUrl('http://localhost:3000')).toBe(true);
      expect(sanitizeExternalUrl('https://necookie.dev')).toBe('https://necookie.dev/');
    });

    it('rejects malicious schemes (XSS, local file access, protocol hijacking)', () => {
      const maliciousUrls = [
        'javascript:alert(document.cookie)',
        'javascript:void(0)',
        'JAVASCRIPT:alert(1)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
        'blob:https://example.com/uuid',
        'chrome://settings',
        'about:blank',
        'ftp://example.com/resource',
      ];

      for (const badUrl of maliciousUrls) {
        expect(isValidHttpUrl(badUrl)).toBe(false);
        expect(sanitizeExternalUrl(badUrl)).toBeNull();
        const validated = validateProfileLink({ label: 'Test', url: badUrl });
        expect(validated.success).toBe(false);
      }
    });

    it('validates profile links schema rejecting malicious payloads', () => {
      const result = updateLinksSchema.safeParse({
        links: [
          { label: 'GitHub', url: 'https://github.com/necookie' },
          { label: 'XSS Attack', url: 'javascript:alert(1)' },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('3. Length Limits & DOM Inflation Defenses', () => {
    it('enforces maximum length on user bio to prevent storage & DOM inflation', () => {
      const validBio = 'A'.repeat(500);
      expect(validateBio(validBio).success).toBe(true);

      const oversizeBio = 'A'.repeat(501);
      expect(validateBio(oversizeBio).success).toBe(false);
    });

    it('enforces length limit on custom title', () => {
      const validTitle = 'A'.repeat(64);
      expect(validateCustomTitle(validTitle).success).toBe(true);

      const oversizeTitle = 'A'.repeat(65);
      expect(validateCustomTitle(oversizeTitle).success).toBe(false);
    });

    it('enforces slug canonical formatting rejecting URL path traversal', () => {
      const safeSlugs = ['necookie', 'john-doe', 'alice_123'];
      const dangerousSlugs = [
        '../admin',
        '..%2fadmin',
        'necookie/profile',
        'slug with spaces',
        'bad@slug',
        '<script>',
      ];

      for (const slug of safeSlugs) {
        expect(validateSlug(slug).success).toBe(true);
      }

      for (const slug of dangerousSlugs) {
        expect(validateSlug(slug).success).toBe(false);
      }
    });
  });

  describe('4. Zero-Trust Ownership Guards', () => {
    it('strictly denies cross-profile ownership when Discord snowflake does not match', () => {
      expect(() => {
        assertProfileOwnership(
          {
            isAuthenticated: true,
            externalId: '100000000000000001',
            user: { id: 'usr-1', externalUserId: '100000000000000001' },
          } as any,
          { id: 'usr-2', externalUserId: '100000000000000002' }
        );
      }).toThrow('Cross-profile mutations are strictly forbidden');
    });

    it('permits profile mutation only when authenticated user matches target user id', () => {
      expect(() => {
        assertProfileOwnership(
          {
            isAuthenticated: true,
            externalId: '100000000000000001',
            user: { id: 'usr-1', externalUserId: '100000000000000001' },
          } as any,
          { id: 'usr-1', externalUserId: '100000000000000001' }
        );
      }).not.toThrow();
    });
  });
});
