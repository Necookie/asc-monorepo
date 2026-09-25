import * as React from 'react';
import { IdentityCard } from './identity-card';
import { TagChip } from './tag-chip';
import { ProfileWidget } from '@/components/ui/profile-widget';
import type { PublicProfileData } from '@/lib/queries/profiles';
import { isValidHttpUrl } from '@asc/validation';
import { ExternalLink, Link2, Lock, Sparkles, Tag, User } from 'lucide-react';

export function ProfileDisplay({ data, preview = false }: { data: PublicProfileData; preview?: boolean }) {
  const { user, profile, roles, tags, links, isSupporter } = data;
  const cover = profile.coverTreatment === 'artwork' && profile.backgroundUrl && isValidHttpUrl(profile.backgroundUrl) && profile.backgroundUrl.startsWith('https:')
    ? new URL(profile.backgroundUrl).toString()
    : null;
  const style = { '--studio-accent': profile.accentColor, '--studio-cover-position': `${profile.coverPosition}%`, ...(cover ? { '--studio-cover': `url("${cover}")` } : {}) } as React.CSSProperties;

  return (
    <div className={`profile-studio${preview ? ' profile-studio--preview' : ''}`} data-layout={profile.activeLayout} data-theme={profile.theme} data-typography={profile.typography} data-cover={profile.coverTreatment} data-motion={profile.motion} style={style}>
      <div className="profile-studio__cover" aria-hidden="true">
        <span className="profile-studio__cover-label">ASC / MEMBER PROFILE</span>
      </div>
      <div className="profile-studio__grid">
        <div className="profile-studio__identity">
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
            avatarFrame={profile.avatarFrame}
          />
        </div>
        <div className="profile-studio__content">
          {profile.isPrivate ? (
            <ProfileWidget title="Private Profile" icon={<Lock className="h-5 w-5" />}>
              <p className="text-base font-semibold text-ink">This profile is private.</p>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">@{user.username} has chosen to keep their biography, tags, and links private.</p>
            </ProfileWidget>
          ) : (
            <>
              <ProfileWidget title="About" icon={<User className="h-5 w-5" />} action={profile.customTitle ? <span className="profile-studio__title"><Sparkles className="h-4 w-4" />{profile.customTitle}</span> : undefined}>
                <p className="whitespace-pre-wrap text-base leading-7 text-ink-secondary">{profile.bio || 'No biography provided yet.'}</p>
              </ProfileWidget>
              {tags.length > 0 && <ProfileWidget title="Community Tags" icon={<Tag className="h-5 w-5" />}><div className="flex flex-wrap gap-2">{tags.map((tag) => <TagChip key={tag.id} name={tag.name} />)}</div></ProfileWidget>}
              {links.length > 0 && <ProfileWidget title="Links" icon={<Link2 className="h-5 w-5" />}><div className="grid gap-3 sm:grid-cols-2">{links.map((link) => <a key={link.id} href={isValidHttpUrl(link.url) ? link.url : '#'} target="_blank" rel="noopener noreferrer" className="profile-studio__link"><span>{link.label}</span><ExternalLink className="h-4 w-4 shrink-0" /></a>)}</div></ProfileWidget>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
