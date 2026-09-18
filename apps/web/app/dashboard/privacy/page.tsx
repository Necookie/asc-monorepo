import { Metadata } from 'next';
import { requireAuthenticatedMember } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/queries/dashboard';
import { ProfileCustomizer } from '@/components/dashboard/profile-customizer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard — Privacy Settings',
  description: 'Control the visibility of your roles, joined date, tags, and profile surface.',
};

export default async function PrivacyPage() {
  const member = await requireAuthenticatedMember();
  const data = await getDashboardData(member);

  return <ProfileCustomizer initialData={data} defaultTab="privacy" />;
}
