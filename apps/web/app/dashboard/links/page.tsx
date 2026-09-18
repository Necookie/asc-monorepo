import { Metadata } from 'next';
import { requireAuthenticatedMember } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/queries/dashboard';
import { ProfileCustomizer } from '@/components/dashboard/profile-customizer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard — Outbound Links',
  description: 'Manage verified outbound links to your portfolio, GitHub, and social channels.',
};

export default async function LinksPage() {
  const member = await requireAuthenticatedMember();
  const data = await getDashboardData(member);

  return <ProfileCustomizer initialData={data} defaultTab="links" />;
}
