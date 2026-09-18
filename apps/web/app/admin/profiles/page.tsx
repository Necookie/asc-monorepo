import { Metadata } from 'next';
import { requireAdminMember } from '@/lib/auth/session';
import { getAdminMembers } from '@/lib/queries/admin';
import { ProfileModerationPanel } from '@/components/admin/profile-moderation-panel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Profile Moderation',
  description: 'Moderate community profiles, hide inappropriate accounts, and reset unsafe bios or links.',
};

export default async function AdminProfilesPage() {
  await requireAdminMember();
  const members = await getAdminMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
          Profile Moderation
        </h1>
        <p className="text-sm text-[#8b92d6] mt-1">
          Review community profiles, hide non-compliant pages, or reset offensive bios, titles, and links. All actions require a reason and are logged to the tamper-evident audit trail.
        </p>
      </div>

      <ProfileModerationPanel members={members} />
    </div>
  );
}
