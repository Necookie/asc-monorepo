import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { getPublicProfileBySlug } from '@/lib/queries/profiles';
import { IdentityCard } from '@/components/identity/identity-card';
import { ProfileWidget } from '@/components/ui/profile-widget';
import { TagChip } from '@/components/identity/tag-chip';
import { isValidHttpUrl } from '@asc/validation';
import { ExternalLink, User, Tag, Link2, Sparkles, Lock } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProfileBySlug(slug);

  if (!result || result.notFound || !result.profile) {
    return {
      title: 'Profile Not Found',
      description: 'The requested community member profile could not be found.',
    };
  }

  const { user, profile } = result.profile;
  const title = `${user.displayName} (@${user.username})`;
  const description =
    profile.customTitle ||
    profile.bio ||
    `View ${user.displayName}'s verified community profile on ASC.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ASC`,
      description,
      images: user.avatar ? [user.avatar] : [],
    },
  };
}

export default async function MemberProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicProfileBySlug(slug);

  if (result.redirect) {
    redirect(`/${result.redirect}`);
  }

  if (result.notFound || !result.profile) {
    notFound();
  }

  const { user, profile, roles, tags, links, isSupporter } = result.profile;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Custom Supporter Background (if entitled and configured) */}
      {profile.backgroundUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${profile.backgroundUrl})` }}
          aria-hidden="true"
        >
          {/* Contrast scrim overlay */}
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-xs" />
        </div>
      )}

      {/* Main Profile Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Authoritative Identity Card */}
          <div className="lg:col-span-5 space-y-6">
            <IdentityCard
              className="profile-identity-stage"
              avatar={user.avatar}
              displayName={user.displayName}
              username={user.username}
              nickname={user.nickname}
              roles={roles}
              isSupporter={isSupporter}
              joinedAt={user.firstJoinedAt}
              membershipStatus={user.membershipStatus}
              accentColor={profile.accentColor}
            />
          </div>

          {/* Right Column: Expressive Profile Customization */}
          <div className="lg:col-span-7 space-y-6">
            {profile.isPrivate ? (
              <ProfileWidget title="Private Profile" icon={<Lock className="w-5 h-5" />}>
                <div className="py-6 text-center space-y-2">
                  <p className="text-base font-semibold text-ink">This profile is private.</p>
                  <p className="text-sm text-muted">
                    @{user.username} has chosen to keep their biography, tags, and links private.
                  </p>
                </div>
              </ProfileWidget>
            ) : (
              <>
                {/* About / Bio Widget */}
                <ProfileWidget
                  title="About"
                  icon={<User className="w-5 h-5" />}
                  action={
                    profile.customTitle ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-[#ec48bd] text-ink shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        {profile.customTitle}
                      </span>
                    ) : undefined
                  }
                >
                  {profile.bio ? (
                    <p className="text-sm sm:text-base leading-relaxed text-ink-secondary whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted">
                      No biography provided yet.
                    </p>
                  )}
                </ProfileWidget>

                {/* Community Interests / Tags Widget */}
                {tags.length > 0 && (
                  <ProfileWidget title="Community Tags" icon={<Tag className="w-5 h-5" />}>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <TagChip key={tag.id} name={tag.name} />
                      ))}
                    </div>
                  </ProfileWidget>
                )}

                {/* External Verified Links Widget */}
                {links.length > 0 && (
                  <ProfileWidget title="Links" icon={<Link2 className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {links.map((link) => {
                        const safeUrl = isValidHttpUrl(link.url) ? link.url : '#';
                        return (
                          <a
                            key={link.id}
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3.5 rounded-xl bg-canvas/60 border border-border hover:border-primary hover:bg-surface-indigo text-ink transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {link.label}
                            </span>
                            <ExternalLink className="w-4 h-4 text-muted group-hover:text-ink shrink-0 ml-2" />
                          </a>
                        );
                      })}
                    </div>
                  </ProfileWidget>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
