import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCachedPublicProfileBySlug } from '@/lib/queries/profiles';
import { ProfileDisplay } from '@/components/identity/profile-display';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCachedPublicProfileBySlug(slug);
  if (!result.profile) return { title: 'Profile Not Found', description: 'The requested community member profile could not be found.' };
  const { user, profile } = result.profile;
  const title = `${user.displayName} (@${user.username})`;
  const description = profile.customTitle || profile.bio || `View ${user.displayName}'s verified community profile on ASC.`;
  return { title, description, openGraph: { title: `${title} | ASC`, description, images: user.avatar ? [user.avatar] : [] } };
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getCachedPublicProfileBySlug(slug);
  if (result.redirect) redirect(`/${result.redirect}`);
  if (result.notFound || !result.profile) notFound();
  return <ProfileDisplay data={result.profile} />;
}
