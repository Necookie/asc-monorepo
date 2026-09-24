import { Metadata } from 'next';
import { requireAdminMember } from '@/lib/auth/session';
import { getAdminTags } from '@/lib/queries/admin';
import { TagManager } from '@/components/admin/tag-manager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Community Tags',
  description: 'Manage community skill tags, colors, and active availability for member profiles.',
};

export default async function AdminTagsPage() {
  await requireAdminMember();
  const tags = await getAdminTags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
          Community Tags
        </h1>
        <p className="text-sm text-muted mt-1">
          Create, customize, and deactivate community tags that members can pin to their public profile identity.
        </p>
      </div>

      <TagManager initialTags={tags} />
    </div>
  );
}
