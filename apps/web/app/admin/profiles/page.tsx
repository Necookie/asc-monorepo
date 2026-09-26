import { Metadata } from 'next';
import { requireModeratorMember } from '@/lib/auth/session';
import { getAdminMembers } from '@/lib/queries/admin';
import { ProfileModerationPanel } from '@/components/admin/profile-moderation-panel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Profile Moderation',
  description: 'Moderate community profiles, hide inappropriate accounts, and reset unsafe bios or links.',
};

export default async function AdminProfilesPage() {
  const member = await requireModeratorMember();
  const members = await getAdminMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
          Profile Moderation
        </h1>
        <p className="text-sm text-muted mt-1">
          Hide or restore profiles with a recorded reason. Administrators can also reset inappropriate content. Every change is recorded in the audit history.
        </p>
      </div>

      <ProfileModerationPanel members={members} canResetContent={member.isAdmin} />
    </div>
  );
}
