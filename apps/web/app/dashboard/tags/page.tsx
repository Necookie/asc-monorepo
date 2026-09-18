import { Metadata } from 'next';
import { requireAuthenticatedMember } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/queries/dashboard';
import { ProfileCustomizer } from '@/components/dashboard/profile-customizer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard — Community Tags',
  description: 'Select community skill and interest tags to display on your ASC profile.',
};

export default async function TagsPage() {
  const member = await requireAuthenticatedMember();
  const data = await getDashboardData(member);

  return <ProfileCustomizer initialData={data} defaultTab="tags" />;
}
