'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Heart, Sparkles, ExternalLink, Hash, CheckCircle2, ChevronRight } from 'lucide-react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export interface SampleMember {
  id: string;
  slug: string;
  displayName: string;
  username: string;
  avatar: string;
  primaryRole: string;
  roleColor: string;
  isSupporter: boolean;
  supporterTier?: string;
  customTitle?: string;
  joinedAt: string;
  bio: string;
  accentColor: string;
  tags: string[];
  links: { label: string; url: string }[];
}

const SAMPLE_MEMBERS: SampleMember[] = [
  {
    id: '1',
    slug: 'necookie',
    displayName: 'necookie',
    username: 'necookie',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    primaryRole: 'Community Lead',
    roleColor: '#5865f2',
    isSupporter: true,
    supporterTier: 'Tier 3 Booster',
    customTitle: 'Guild Founder & Architect',
    joinedAt: 'January 2023',
    bio: 'Building community platforms and open-source tools. Passionate about digital identity, distributed systems, and modern web design.',
    accentColor: '#5865f2',
    tags: ['Next.js', 'Rust', 'TypeScript', 'Infrastructure'],
    links: [
      { label: 'GitHub', url: 'https://github.com' },
      { label: 'Website', url: 'https://necookie.dev' },
    ],
  },
  {
    id: '2',
    slug: 'astra',
    displayName: 'Astra',
    username: 'astravox',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    primaryRole: 'Bot Engineer',
    roleColor: '#00b0f4',
    isSupporter: true,
    supporterTier: 'Tier 2 Booster',
    customTitle: 'Gateway Sync Specialist',
    joinedAt: 'March 2023',
    bio: 'Maintaining real-time Discord synchronization bots and libSQL databases. Always hacking on event architectures.',
    accentColor: '#00b0f4',
    tags: ['Discord.js', 'libSQL', 'Node.js', 'DevOps'],
    links: [
      { label: 'GitHub', url: 'https://github.com' },
      { label: 'Twitter', url: 'https://twitter.com' },
    ],
  },
  {
    id: '3',
    slug: 'vortex',
    displayName: 'Vortex',
    username: 'vortex_art',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
    primaryRole: 'Creative Director',
    roleColor: '#ec48bd',
    isSupporter: true,
    supporterTier: 'Tier 3 Booster',
    customTitle: 'Visual Systems & 3D Artist',
    joinedAt: 'June 2023',
    bio: 'Crafting UI motion tokens, community brand assets, and 3D icons. Coffee enthusiast and procedural graphics explorer.',
    accentColor: '#ec48bd',
    tags: ['UI/UX', 'Figma', 'Blender', 'Generative Art'],
    links: [
      { label: 'ArtStation', url: 'https://artstation.com' },
      { label: 'Portfolio', url: 'https://dribbble.com' },
    ],
  },
  {
    id: '4',
    slug: 'pixelcat',
    displayName: 'PixelCat',
    username: 'pixelcat',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=240&auto=format&fit=crop&q=80',
    primaryRole: 'Staff Moderator',
    roleColor: '#35ed7e',
    isSupporter: false,
    customTitle: 'Community Guardian',
    joinedAt: 'September 2023',
    bio: 'Keeping the community safe and welcoming. Loves indie games, mechanical keyboards, and retro pixel art.',
    accentColor: '#35ed7e',
    tags: ['Community Safety', 'Indie Games', 'Keyboards'],
    links: [
      { label: 'Steam', url: 'https://steamcommunity.com' },
    ],
  },
];

export function InteractiveCommunityShowcase() {
  const [selectedSlug, setSelectedSlug] = React.useState('necookie');
  const reduceMotion = useReducedMotion();
  const activeMember = SAMPLE_MEMBERS.find((m) => m.slug === selectedSlug) || SAMPLE_MEMBERS[0];

  return (
    <div className="w-full space-y-6">
      {/* Selector Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mr-2">
          Preview Profiles:
        </span>
        {SAMPLE_MEMBERS.map((member) => {
          const isActive = member.slug === activeMember.slug;
          return (
            <m.button
              key={member.id}
              type="button"
              onClick={() => setSelectedSlug(member.slug)}
              aria-pressed={isActive}
              className={`relative isolate inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer overflow-hidden ${
                isActive
                  ? 'text-ink'
                  : 'bg-surface-indigo/80 text-ink-secondary hover:text-ink hover:bg-surface-hover border border-border'
              }`}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            >
              {isActive && (
                <m.span
                  layoutId="active-profile-selector"
                  className="absolute inset-0 -z-10 rounded-full bg-primary shadow-md shadow-primary/25"
                  transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: EASE_OUT_EXPO }}
                />
              )}
              <div className="w-4 h-4 rounded-full overflow-hidden relative shrink-0">
                <Image
                  src={member.avatar}
                  alt={member.displayName}
                  fill
                  className="object-cover"
                  sizes="16px"
                />
              </div>
              <span>{member.displayName}</span>
              {member.isSupporter && (
                <Heart className="w-3 h-3 text-[#ec48bd] fill-[#ec48bd]" />
              )}
            </m.button>
          );
        })}
      </div>

      {/* Profile Card Container with Smooth Transition */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={activeMember.id}
            className="rounded-2xl bg-surface-indigo border border-border p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 18, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.32, ease: EASE_OUT_EXPO }}
          >
          {/* Subtle Top Ambient Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
            style={{ backgroundColor: activeMember.accentColor }}
          />

          <div className="flex flex-col sm:flex-row items-start gap-6 pt-2">
            {/* Avatar & Badges */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 shadow-lg relative"
                style={{ borderColor: activeMember.accentColor }}
              >
                <Image
                  src={activeMember.avatar}
                  alt={activeMember.displayName}
                  fill
                  className="object-cover"
                  sizes="112px"
                  priority
                />
              </div>

              {/* Supporter Badge Icon */}
              {activeMember.isSupporter && (
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface-indigo border-2 border-[#ec48bd] flex items-center justify-center text-[#ec48bd] shadow-md"
                  title={activeMember.supporterTier || 'Supporter'}
                >
                  <Heart className="w-4 h-4 fill-[#ec48bd]" />
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h3 className="text-2xl font-bold text-ink tracking-tight">
                    {activeMember.displayName}
                  </h3>
                  <span className="text-sm text-slate-400 font-mono">
                    @{activeMember.username}
                  </span>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>

                {activeMember.customTitle && (
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mt-1"
                    style={{ color: activeMember.accentColor }}
                  >
                    {activeMember.customTitle}
                  </p>
                )}
              </div>

              {/* Role & Tenure Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border shadow-xs"
                  style={{
                    backgroundColor: `${activeMember.roleColor}18`,
                    color: activeMember.roleColor,
                    borderColor: `${activeMember.roleColor}35`,
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {activeMember.primaryRole}
                </span>

                {activeMember.supporterTier && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#ec48bd]/15 text-[#ec48bd] border border-[#ec48bd]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {activeMember.supporterTier}
                  </span>
                )}

                <span className="text-xs text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-surface-hover border border-border">
                  Joined {activeMember.joinedAt}
                </span>
              </div>

              {/* Bio */}
              <p className="text-sm text-ink-secondary leading-relaxed max-w-xl">
                {activeMember.bio}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {activeMember.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-ink-secondary bg-surface-hover border border-border hover:border-border transition-colors"
                  >
                    <Hash className="w-3 h-3 text-slate-500" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Links & Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  {activeMember.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00b0f4] hover:text-ink transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {link.label}
                    </a>
                  ))}
                </div>

                <Link
                  href={`/${activeMember.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:text-primary transition-colors"
                >
                  <span>View Public Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
