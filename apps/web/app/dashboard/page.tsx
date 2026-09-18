import { Metadata } from 'next';
import { requireAuthenticatedMember } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/queries/dashboard';
import { ProfileCustomizer } from '@/components/dashboard/profile-customizer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard — Profile Customization',
  description: 'Customize your ASC community profile biography, title, and appearance.',
};

export default async function DashboardPage() {
  const member = await requireAuthenticatedMember();
  const data = await getDashboardData(member);

  return <ProfileCustomizer initialData={data} defaultTab="profile" />;
}
