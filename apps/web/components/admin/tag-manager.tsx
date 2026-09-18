'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminManageTagAction } from '@/lib/actions/admin';
import type { AdminTagItem } from '@/lib/queries/admin';
import { Tag as TagIcon, Plus, Edit2, Check, AlertCircle, Sparkles } from 'lucide-react';

export interface TagManagerProps {
  initialTags: AdminTagItem[];
}

export function TagManager({ initialTags }: TagManagerProps) {
  const router = useRouter();
  const [tagsList, setTagsList] = React.useState<AdminTagItem[]>(initialTags);
  const [editingTag, setEditingTag] = React.useState<AdminTagItem | null>(null);

  // Form fields
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState('#5865f2');
  const [isActive, setIsActive] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const resetForm = () => {
    setEditingTag(null);
    setName('');
    setSlug('');
    setDescription('');
    setColor('#5865f2');
    setIsActive(true);
  };

  const handleStartEdit = (tag: AdminTagItem) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setDescription(tag.description || '');
    setColor(tag.color);
    setIsActive(tag.isActive);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await adminManageTagAction({
        tagId: editingTag?.id,
        name,
        slug: slug.toLowerCase().trim(),
        description: description.trim() ? description.trim() : null,
        color,
        isActive,
      });

      if (!res.success) throw new Error(res.error);

      setStatusMsg({
        type: 'success',
        text: editingTag
          ? `Tag "${name}" updated successfully!`
          : `Tag "${name}" created successfully!`,
      });

      resetForm();
      router.refresh();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Operation failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 animate-in fade-in duration-200 ${
            statusMsg.type === 'success'
              ? 'bg-[#35ed7e]/15 border border-[#35ed7e]/30 text-[#84f7b2]'
              : 'bg-[#ed4245]/15 border border-[#ed4245]/30 text-[#ff8f91]'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 text-[#35ed7e]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ed4245]" />
          )}
          <span className="font-semibold">{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-[#0e1245]/80 border-[rgba(88,101,242,0.2)] p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-[#ec48bd]" />
                {editingTag ? `Edit Tag: ${editingTag.name}` : 'Create Community Tag'}
              </CardTitle>
              <CardDescription className="text-xs text-[#8b92d6]">
                Tags are community-wide skills and badges members can pin to profiles.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white">Tag Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingTag) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '')
                      );
                    }
                  }}
                  placeholder="e.g. Full-Stack Developer"
                  className="w-full px-3 py-2 rounded-xl bg-[#141943] border border-[rgba(88,101,242,0.25)] text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#ec48bd]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white">Slug (URL Safe)</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. full-stack-developer"
                  className="w-full px-3 py-2 rounded-xl bg-[#141943] border border-[rgba(88,101,242,0.25)] text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#ec48bd]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short explanation of this tag..."
                  className="w-full px-3 py-2 rounded-xl bg-[#141943] border border-[rgba(88,101,242,0.25)] text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#ec48bd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">Badge Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-[#8b92d6]">{color}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white">Active Status</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[#ec48bd] focus:ring-[#ec48bd]"
                    />
                    <label htmlFor="isActive" className="text-xs text-[#c7c9e5] cursor-pointer">
                      Enabled
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 text-xs"
                >
                  {isLoading ? 'Saving...' : editingTag ? 'Save Changes' : 'Create Tag'}
                </Button>
                {editingTag && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-[#8b92d6]"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Tags List Table */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-[#0e1245]/80 border-[rgba(88,101,242,0.2)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141943] text-[#8b92d6] uppercase tracking-wider text-[10px] border-b border-[rgba(88,101,242,0.15)]">
                  <tr>
                    <th className="py-3 px-4">Tag</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Members</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(88,101,242,0.1)]">
                  {initialTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-[#141943]/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-bold text-white">{tag.name}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#8b92d6]">{tag.slug}</td>

                      <td className="py-3 px-4 text-[#c7c9e5] font-semibold">
                        {tag.memberCount} members
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tag.isActive
                              ? 'bg-[#35ed7e]/15 text-[#84f7b2] border border-[#35ed7e]/30'
                              : 'bg-[#ed4245]/15 text-[#ff8f91] border border-[#ed4245]/30'
                          }`}
                        >
                          {tag.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(tag)}
                          className="inline-flex items-center gap-1 text-xs text-[#5865f2] hover:text-[#7983f5] font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {initialTags.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#8b92d6]">
                        No community tags found. Create your first tag on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
