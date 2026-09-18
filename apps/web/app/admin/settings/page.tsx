import { Metadata } from 'next';
import { requireAdminMember } from '@/lib/auth/session';
import { getAdminSiteSettings } from '@/lib/queries/admin';
import { SiteSettingsPanel } from '@/components/admin/site-settings-panel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Site Settings',
  description: 'Manage platform maintenance mode and system announcement banners.',
};

export default async function AdminSettingsPage() {
  await requireAdminMember();
  const settings = await getAdminSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
          Site Settings
        </h1>
        <p className="text-sm text-[#8b92d6] mt-1">
          Configure system maintenance mode, global announcement banners, and operational controls.
        </p>
      </div>

      <SiteSettingsPanel initialSettings={settings} />
    </div>
  );
}
