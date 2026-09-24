'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { RoleChip } from '@/components/identity/role-chip';
import { TagChip } from '@/components/identity/tag-chip';
import { SupporterBadge } from '@/components/identity/supporter-badge';
import {
  updateProfileBioAction,
  updateProfileAppearanceAction,
  updateProfileLinksAction,
  updateProfilePrivacyAction,
  updateMemberTagsAction,
} from '@/lib/actions/profile';
import type { DashboardData } from '@/lib/queries/dashboard';
import {
  User,
  Palette,
  Tag as TagIcon,
  Link as LinkIcon,
  Shield,
  Save,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Lock,
  Sparkles,
} from 'lucide-react';

const PRESET_ACCENTS = [
  '#5865f2', // Blurple
  '#35ed7e', // Neon Emerald
  '#ec48bd', // Magenta Glow
  '#f59e0b', // Radiant Amber
  '#06b6d4', // Electric Cyan
  '#a855f7', // Violet
  '#f43f5e', // Rose
  '#ffffff', // Pure White
];

export interface ProfileCustomizerProps {
  initialData: DashboardData;
  defaultTab?: 'profile' | 'appearance' | 'tags' | 'links' | 'privacy';
}

export function ProfileCustomizer({
  initialData,
  defaultTab = 'profile',
}: ProfileCustomizerProps) {
  const router = useRouter();
  const { member, availableTags, entitlements } = initialData;

  // Active section tab
  const [activeTab, setActiveTab] = React.useState<
    'profile' | 'appearance' | 'tags' | 'links' | 'privacy'
  >(defaultTab);

  // Form states (Local live state)
  const [bio, setBio] = React.useState(member.profile.bio || '');
  const [customTitle, setCustomTitle] = React.useState(member.profile.customTitle || '');
  const [theme, setTheme] = React.useState<'canvas' | 'indigo' | 'onyx'>(
    member.profile.theme || 'canvas'
  );
  const [accentColor, setAccentColor] = React.useState(
    member.profile.accentColor || '#5865f2'
  );
  const [backgroundUrl, setBackgroundUrl] = React.useState(
    member.profile.backgroundUrl || ''
  );

  const [links, setLinks] = React.useState<
    Array<{ id: string; label: string; url: string; displayOrder: number }>
  >(
    initialData.links.map((l, idx) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      displayOrder: l.displayOrder ?? idx,
    }))
  );

  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>(
    initialData.selectedTagIds
  );

  const [privacy, setPrivacy] = React.useState({
    isPrivate: member.profile.isPrivate,
    showRoles: member.profile.showRoles,
    showMembershipDate: member.profile.showMembershipDate,
    showTags: member.profile.showTags,
    showLinks: member.profile.showLinks,
  });

  // Saving states
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Link form input
  const [newLinkLabel, setNewLinkLabel] = React.useState('');
  const [newLinkUrl, setNewLinkUrl] = React.useState('');

  // Handle Save based on active tab
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      if (activeTab === 'profile') {
        const res = await updateProfileBioAction({
          bio,
          customTitle: customTitle.trim() ? customTitle.trim() : null,
        });
        if (!res.success) throw new Error(res.error);
        setSaveMessage({ type: 'success', text: 'Biography and title saved successfully!' });
      } else if (activeTab === 'appearance') {
        const res = await updateProfileAppearanceAction({
          theme,
          accentColor,
          backgroundUrl: backgroundUrl.trim() ? backgroundUrl.trim() : null,
        });
        if (!res.success) throw new Error(res.error);
        setSaveMessage({ type: 'success', text: 'Appearance settings saved successfully!' });
      } else if (activeTab === 'tags') {
        const res = await updateMemberTagsAction({
          tagIds: selectedTagIds,
        });
        if (!res.success) throw new Error(res.error);
        setSaveMessage({ type: 'success', text: 'Community tags saved successfully!' });
      } else if (activeTab === 'links') {
        const res = await updateProfileLinksAction({
          links: links.map((l, idx) => ({
            label: l.label,
            url: l.url,
            displayOrder: idx,
          })),
        });
        if (!res.success) throw new Error(res.error);
        setSaveMessage({ type: 'success', text: 'Outbound links saved successfully!' });
      } else if (activeTab === 'privacy') {
        const res = await updateProfilePrivacyAction(privacy);
        if (!res.success) throw new Error(res.error);
        setSaveMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
      }
      router.refresh();
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add Link
  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    if (links.length >= entitlements.maxLinks) {
      setSaveMessage({
        type: 'error',
        text: `You have reached the limit of ${entitlements.maxLinks} links for your tier.`,
      });
      return;
    }
    const cleanUrl = newLinkUrl.trim();
    if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
      setSaveMessage({
        type: 'error',
        text: 'Link URL must start with https:// or http://',
      });
      return;
    }

    setLinks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newLinkLabel.trim(),
        url: cleanUrl,
        displayOrder: prev.length,
      },
    ]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  // Remove Link
  const handleRemoveLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  // Toggle Tag
  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
    } else {
      if (selectedTagIds.length >= entitlements.maxTags) {
        setSaveMessage({
          type: 'error',
          text: `You can select up to ${entitlements.maxTags} tags.`,
        });
        return;
      }
      setSelectedTagIds((prev) => [...prev, tagId]);
    }
  };

  // Resolved selected tags objects for live preview
  const previewTags = availableTags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <div className="space-y-6">
      {/* Top Section / Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
            Profile Customization
          </h1>
          <p className="text-sm text-muted mt-1">
            Customize how you appear across the ASC community surface.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {member.primarySlug && (
            <Link
              href={`/${member.primarySlug}`}
              target="_blank"
              className="hidden sm:inline-flex"
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted">
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Profile
              </Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 font-bold shadow-lg"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save Status Alert */}
      {saveMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in duration-200 ${
            saveMessage.type === 'success'
              ? 'bg-[#35ed7e]/15 border border-[#35ed7e]/30 text-[#84f7b2]'
              : 'bg-[#ed4245]/15 border border-[#ed4245]/30 text-[#ff8f91]'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <Check className="w-5 h-5 shrink-0 text-[#35ed7e]" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-[#ed4245]" />
          )}
          <span className="font-medium">{saveMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Left Editor + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Navigation Tabs & Editor Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-indigo border border-border rounded-xl overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-primary text-ink-dark shadow-md'
                  : 'text-muted hover:text-ink hover:bg-surface-indigo/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Bio & Title
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'bg-primary text-ink-dark shadow-md'
                  : 'text-muted hover:text-ink hover:bg-surface-indigo/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'tags'
                  ? 'bg-primary text-ink-dark shadow-md'
                  : 'text-muted hover:text-ink hover:bg-surface-indigo/60'
              }`}
            >
              <TagIcon className="w-3.5 h-3.5" />
              Tags ({selectedTagIds.length}/{entitlements.maxTags})
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'links'
                  ? 'bg-primary text-ink-dark shadow-md'
                  : 'text-muted hover:text-ink hover:bg-surface-indigo/60'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Links ({links.length}/{entitlements.maxLinks})
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-primary text-ink-dark shadow-md'
                  : 'text-muted hover:text-ink hover:bg-surface-indigo/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Privacy
            </button>
          </div>

          {/* TAB 1: Profile Bio & Title */}
          {activeTab === 'profile' && (
            <Card className="bg-surface-indigo/80 border-border p-6 space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-bold text-ink">Biography & Title</CardTitle>
                <CardDescription className="text-xs text-muted">
                  Express your digital identity, skills, and community interests.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-5">
                {/* Custom Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      Custom Title
                      {!entitlements.canCustomTitle && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                          <Lock className="w-3 h-3" /> Supporter Perk
                        </span>
                      )}
                    </label>
                    <span className="text-xs text-muted">{customTitle.length}/64</span>
                  </div>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value.slice(0, 64))}
                    disabled={!entitlements.canCustomTitle}
                    placeholder={
                      entitlements.canCustomTitle
                        ? 'e.g. Lead Core Contributor'
                        : 'Unlock custom titles with community supporter status'
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-onyx border border-border text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
                  />
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-ink">About Me</label>
                    <span className="text-xs text-muted">{bio.length}/500</span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 500))}
                    rows={5}
                    placeholder="Tell the community about yourself, your projects, or your interests..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-onyx border border-border text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  />
                  <p className="text-[11px] text-muted">
                    Plain text only. Max 500 characters. Live preview updates on the right.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: Appearance */}
          {activeTab === 'appearance' && (
            <Card className="bg-surface-indigo/80 border-border p-6 space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-bold text-ink">Theme & Appearance</CardTitle>
                <CardDescription className="text-xs text-muted">
                  Personalize the accent color and theme styling for your profile.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-6">
                {/* Theme Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-ink">Profile Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'canvas', name: 'Deep Indigo', desc: 'Standard ASC atmosphere' },
                      { id: 'indigo', name: 'Vibrant Mesh', desc: 'Rich multi-gradient glow' },
                      { id: 'onyx', name: 'Onyx Dark', desc: 'Pure midnight aesthetic' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setTheme(th.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          theme === th.id
                            ? 'bg-primary/20 border-primary ring-2 ring-primary/40 text-ink'
                            : 'bg-surface-onyx border-border text-ink-secondary hover:border-border'
                        }`}
                      >
                        <div className="font-semibold text-xs text-ink">{th.name}</div>
                        <div className="text-[10px] text-muted mt-0.5">{th.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-ink">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border-strong"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="text-xs font-mono text-muted">{accentColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {PRESET_ACCENTS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAccentColor(color)}
                        className={`w-9 h-9 rounded-xl transition-transform ${
                          accentColor.toLowerCase() === color.toLowerCase()
                            ? 'scale-110 ring-2 ring-white shadow-lg'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}

                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-muted">Custom:</span>
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-24 px-2 py-1 text-xs rounded-lg bg-surface-onyx border border-border text-ink font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Supporter Background URL */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      Supporter Background Image
                      {!entitlements.canCustomBackground && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                          <Lock className="w-3 h-3" /> Supporter Perk
                        </span>
                      )}
                    </label>
                  </div>
                  <input
                    type="url"
                    value={backgroundUrl}
                    onChange={(e) => setBackgroundUrl(e.target.value)}
                    disabled={!entitlements.canCustomBackground}
                    placeholder={
                      entitlements.canCustomBackground
                        ? 'https://example.com/banner.png'
                        : 'Unlock custom profile backgrounds with ASC supporter status'
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-onyx border border-border text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted">
                    External HTTPS URL only. Never proxies or stores binary data. Gracefully falls back if image fails.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Community Tags */}
          {activeTab === 'tags' && (
            <Card className="bg-surface-indigo/80 border-border p-6 space-y-6">
              <CardHeader className="p-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-ink">Community Tags</CardTitle>
                  <CardDescription className="text-xs text-muted">
                    Select up to {entitlements.maxTags} admin-approved tags to display on your profile.
                  </CardDescription>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-muted border border-primary/30">
                  {selectedTagIds.length} / {entitlements.maxTags} Selected
                </span>
              </CardHeader>

              <CardContent className="p-0">
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-primary text-ink-dark border-primary shadow-md ring-2 ring-primary/30'
                            : 'bg-surface-onyx text-muted border-border hover:border-primary/50 hover:text-ink'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: External Links */}
          {activeTab === 'links' && (
            <Card className="bg-surface-indigo/80 border-border p-6 space-y-6">
              <CardHeader className="p-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-ink">Outbound Links</CardTitle>
                  <CardDescription className="text-xs text-muted">
                    Add verified links to your website, GitHub, Twitter, or portfolio.
                  </CardDescription>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-muted border border-primary/30">
                  {links.length} / {entitlements.maxLinks} Links
                </span>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                {/* Existing Links List */}
                <div className="space-y-2.5">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-onyx border border-border"
                    >
                      <div className="space-y-0.5 truncate pr-3">
                        <div className="text-xs font-bold text-ink">{link.label}</div>
                        <div className="text-[11px] text-muted truncate font-mono">
                          {link.url}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-[#ed4245] hover:bg-[#ed4245]/10 transition-colors"
                        title="Remove link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {links.length === 0 && (
                    <div className="p-6 text-center rounded-xl bg-surface-onyx/50 border border-dashed border-border text-xs text-muted">
                      No links added yet. Add your first external link below.
                    </div>
                  )}
                </div>

                {/* Add New Link Box */}
                {links.length < entitlements.maxLinks && (
                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="text-xs font-semibold text-ink">Add New Link</div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <input
                        type="text"
                        value={newLinkLabel}
                        onChange={(e) => setNewLinkLabel(e.target.value.slice(0, 32))}
                        placeholder="Label (e.g. GitHub)"
                        className="sm:col-span-4 px-3 py-2 rounded-xl bg-surface-onyx border border-border text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="sm:col-span-6 px-3 py-2 rounded-xl bg-surface-onyx border border-border text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddLink}
                        className="sm:col-span-2 gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 5: Privacy */}
          {activeTab === 'privacy' && (
            <Card className="bg-surface-indigo/80 border-border p-6 space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-bold text-ink">Privacy Controls</CardTitle>
                <CardDescription className="text-xs text-muted">
                  Configure what information is visible on your public profile. Hidden fields are stripped server-side.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4">
                {[
                  {
                    key: 'isPrivate',
                    title: 'Private Profile',
                    desc: 'Hide your profile from the public directory and disable the public URL.',
                  },
                  {
                    key: 'showRoles',
                    title: 'Display Community Roles',
                    desc: 'Show your verified Discord roles and badges on your profile.',
                  },
                  {
                    key: 'showMembershipDate',
                    title: 'Display Community Tenure',
                    desc: 'Show when you joined the ASC community.',
                  },
                  {
                    key: 'showTags',
                    title: 'Display Community Tags',
                    desc: 'Show your selected profile skill tags.',
                  },
                  {
                    key: 'showLinks',
                    title: 'Display Outbound Links',
                    desc: 'Show your social and external links to the public.',
                  },
                ].map((item) => {
                  const val = privacy[item.key as keyof typeof privacy];
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-surface-onyx border border-border"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="text-xs font-bold text-ink">{item.title}</div>
                        <div className="text-[11px] text-muted">{item.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPrivacy((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof prev],
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          val ? 'bg-primary' : 'bg-surface-indigo'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            val ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Sticky Live Interactive Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Live Interactive Preview
            </div>
            <span className="text-xs text-muted">Updates in real time</span>
          </div>

          {/* Simulated Public Profile View */}
          <div
            className="rounded-3xl border border-border bg-surface-onyx shadow-2xl overflow-hidden transition-all"
            style={{ borderColor: accentColor }}
          >
            {/* Header / Supporter Banner Preview */}
            <div
              className="relative h-28 w-full bg-surface-indigo bg-cover bg-center"
              style={{
                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-surface-onyx via-transparent to-black/20" />
            </div>

            {/* Content Body */}
            <div className="p-6 -mt-12 relative z-10 space-y-5">
              {/* Identity Row */}
              <div className="flex items-start justify-between">
                <Avatar
                  src={member.user.avatar}
                  alt={member.user.displayName}
                  size={64}
                  fallbackText={member.user.displayName.slice(0, 2).toUpperCase()}
                  className="ring-4 ring-surface-onyx shadow-xl"
                />
                {member.isSupporter && <SupporterBadge />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-ink font-[var(--font-display)]">
                    {member.user.displayName}
                  </h2>
                  {customTitle && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-ink shadow-sm"
                      style={{ backgroundColor: accentColor }}
                    >
                      {customTitle}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted">@{member.user.username}</div>
              </div>

              {/* Roles */}
              {privacy.showRoles && member.roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {member.roles.map((role) => (
                    <RoleChip
                      key={role.id}
                      name={role.name}
                      color={role.color}
                      isAdmin={role.isAdmin}
                    />
                  ))}
                </div>
              )}

              {/* Bio */}
              {bio ? (
                <div className="text-xs text-ink-secondary leading-relaxed whitespace-pre-wrap bg-surface-indigo/60 p-3 rounded-xl border border-border">
                  {bio}
                </div>
              ) : (
                <div className="text-sm text-muted italic bg-surface-indigo p-3 rounded-xl">
                  No biography provided yet.
                </div>
              )}

              {/* Tags */}
              {privacy.showTags && previewTags.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {previewTags.map((t) => (
                      <TagChip key={t.id} name={t.name} />
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {privacy.showLinks && links.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Links
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {links.map((link) => (
                      <span
                        key={link.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-indigo border border-border text-xs text-ink-secondary"
                      >
                        <ExternalLink className="w-3 h-3 text-primary" />
                        {link.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Warning in Preview */}
              {privacy.isPrivate && (
                <div className="p-3 rounded-xl bg-[#ed4245]/15 border border-[#ed4245]/30 text-[11px] text-[#ff8f91]">
                  Private Profile enabled: Your profile is hidden from the public directory.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
