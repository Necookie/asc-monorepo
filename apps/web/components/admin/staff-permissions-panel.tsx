'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setStaffAccessAction } from '@/lib/actions/staff-access';
import type { StaffAccessItem, StaffAccessRole } from '@/lib/actions/staff-access-service';

export function StaffPermissionsPanel({ members }: { members: StaffAccessItem[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState(members.find(member => !member.isCurrentOwner)?.id ?? '');
  const selected = members.find(member => member.id === selectedId && !member.isCurrentOwner);
  const [role, setRole] = React.useState<StaffAccessRole>(selected?.role ?? 'NONE');
  const [reason, setReason] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ success: boolean; text: string } | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || pending) return;
    setPending(true); setMessage(null);
    try {
      const result = await setStaffAccessAction({ targetUserId: selected.id, role, expectedRole: selected.role, reason });
      setMessage({ success: result.success, text: result.success ? `Saved access for @${selected.username}.` : result.error });
      if (result.success) { setReason(''); router.refresh(); }
    } catch { setMessage({ success: false, text: 'Could not save access. Please try again.' }); }
    finally { setPending(false); }
  }

  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section aria-label="Community members" className="min-w-0">
      <h2 className="text-lg font-bold text-ink">Choose a member</h2>
      <p className="mt-1 text-sm text-muted">Search above to find members beyond this list.</p>
      <ul className="mt-4 max-h-[32rem] overflow-y-auto divide-y divide-border rounded-xl border border-border">
        {members.map(member => <li key={member.id}>
          <button type="button" disabled={pending || member.isCurrentOwner} aria-pressed={selectedId === member.id}
            onClick={() => { setSelectedId(member.id); setRole(member.role); setReason(''); setMessage(null); }}
            className={`flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${selectedId === member.id ? 'bg-surface-indigo' : 'hover:bg-surface-onyx'} disabled:cursor-default`}>
            <span className="min-w-0"><span className="block truncate font-semibold text-ink">{member.displayName}</span><span className="block truncate text-sm text-muted">@{member.username}</span></span>
            <span className="shrink-0 text-xs font-semibold text-muted">{member.isCurrentOwner ? 'Owner · Clerk' : member.role === 'NONE' ? 'Member' : member.role === 'ADMIN' ? 'Admin' : 'Moderator'}</span>
          </button>
        </li>)}
      </ul>
      {!members.length && <p className="py-8 text-sm text-muted">No matching members. Try another name or Discord ID.</p>}
    </section>
    <section className="min-w-0">
      {selected ? <form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-surface-onyx p-5 sm:p-6" aria-label="Manage staff access">
        <div><h2 className="text-xl font-bold text-ink">Access for {selected.displayName}</h2><p className="mt-1 break-all text-sm text-muted">Discord ID: {selected.externalUserId}</p><p className="mt-1 text-sm text-muted">Membership: {selected.membershipStatus.toLowerCase()}</p></div>
        <div className="space-y-2"><label htmlFor="staff-role" className="block text-sm font-semibold text-ink">Website access</label>
          <select id="staff-role" value={role} onChange={event => setRole(event.target.value as StaffAccessRole)} disabled={pending} className="min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-ink">
            <option value="NONE">Member, no staff access</option>
            <option value="MODERATOR" disabled={selected.membershipStatus !== 'ACTIVE'}>Moderator</option>
            <option value="ADMIN" disabled={selected.membershipStatus !== 'ACTIVE'}>Admin</option>
          </select>
          <p className="text-sm text-muted">Moderators hide and restore profiles. Admins also manage members, tags, customization perks, settings, audit history, and content resets.</p>
          <p className="text-sm text-muted">Neither level can change staff permissions or become an owner.</p>
        </div>
        <div className="space-y-2"><label htmlFor="staff-reason" className="block text-sm font-semibold text-ink">Reason for this change</label>
          <textarea id="staff-reason" value={reason} onChange={event => setReason(event.target.value)} required minLength={3} maxLength={255} disabled={pending} rows={3} className="w-full rounded-xl border border-border bg-canvas p-3 text-ink" />
          <p className="text-sm text-muted">Saved with your identity in the audit history.</p>
        </div>
        {message && <p role={message.success ? 'status' : 'alert'} className="text-sm text-ink">{message.text}</p>}
        <Button type="submit" disabled={pending || role === selected.role || reason.trim().length < 3}>{pending ? 'Saving…' : role === 'NONE' ? 'Revoke staff access' : 'Save staff access'}</Button>
      </form> : <p className="rounded-xl border border-border p-6 text-sm text-muted">Choose a member to manage access. Your owner status is managed in Clerk.</p>}
    </section>
  </div>;
}
