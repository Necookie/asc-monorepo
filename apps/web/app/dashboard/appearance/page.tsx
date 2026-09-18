import { Metadata } from 'next';
import { requireAuthenticatedMember } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/queries/dashboard';
import { ProfileCustomizer } from '@/components/dashboard/profile-customizer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard — Appearance & Theme',
  description: 'Customize your profile accent colors, theme, and supporter background image.',
};

export default async function AppearancePage() {
  const member = await requireAuthenticatedMember();
  const data = await getDashboardData(member);

  return <ProfileCustomizer initialData={data} defaultTab="appearance" />;
}
