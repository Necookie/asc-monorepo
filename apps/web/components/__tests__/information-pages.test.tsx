import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import PrivacyPage from '../../app/privacy/page';
import TermsPage from '../../app/terms/page';
import { Footer } from '../layout/footer';
import { SystemAnnouncementBanner } from '../layout/system-announcement';

describe('Public Information Pages & Announcement Banner', () => {
  describe('Privacy Policy Page', () => {
    it('renders policy sections, trust kicker, and back link', () => {
      const html = renderToString(<PrivacyPage />);
      expect(html).toContain('Privacy Policy');
      expect(html).toContain('ASC Trust &amp; Safety');
      expect(html).toContain('1. Identity &amp; Synchronization');
      expect(html).toContain('2. Authentication &amp; Verification');
      expect(html).toContain('3. Member Privacy Controls');
      expect(html).toContain('4. Departure &amp; Data Retention');
      expect(html).toContain('5. External Links &amp; Media');
      expect(html).toContain('Back to Home');
    });
  });

  describe('Terms of Service Page', () => {
    it('renders terms sections, community kicker, and guidelines', () => {
      const html = renderToString(<TermsPage />);
      expect(html).toContain('Terms of Service');
      expect(html).toContain('Community Guidelines');
      expect(html).toContain('1. Membership &amp; Platform Scope');
      expect(html).toContain('2. Acceptable Use &amp; Conduct');
      expect(html).toContain('3. Entitlements &amp; Recognition Perks');
      expect(html).toContain('4. Content Moderation &amp; Auditing');
      expect(html).toContain('Back to Home');
    });
  });

  describe('Footer Navigation', () => {
    it('includes Legal column linking to /privacy and /terms', () => {
      const html = renderToString(<Footer />);
      expect(html).toContain('Legal');
      expect(html).toContain('href="/privacy"');
      expect(html).toContain('Privacy Policy');
      expect(html).toContain('href="/terms"');
      expect(html).toContain('Terms of Service');
    });
  });

  describe('System Announcement Banner', () => {
    it('renders active announcement message with dismiss button', () => {
      const html = renderToString(
        <SystemAnnouncementBanner announcement="Scheduled maintenance at midnight UTC" />
      );
      expect(html).toContain('Scheduled maintenance at midnight UTC');
      expect(html).toContain('aria-label="System Announcement"');
      expect(html).toContain('aria-label="Dismiss announcement"');
    });

    it('renders nothing when announcement is null or empty', () => {
      const htmlNull = renderToString(<SystemAnnouncementBanner announcement={null} />);
      expect(htmlNull).toBe('');

      const htmlEmpty = renderToString(<SystemAnnouncementBanner announcement="" />);
      expect(htmlEmpty).toBe('');
    });
  });
});
