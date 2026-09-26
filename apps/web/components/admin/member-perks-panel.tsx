'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { setMemberPerksAction } from '@/lib/actions/perks';
import type { PerksMember } from '@/lib/actions/perks-service';

export function MemberPerksPanel({ members }: { members: PerksMember[] }) {
  const router = useRouter();
  const [id, setId] = React.useState(members[0]?.id ?? '');
  const member = members.find(item => item.id === id);
  const [reason, setReason] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ success: boolean; text: string } | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!member || pending) return;
    setPending(true); setMessage(null);
    try {
      const result = await setMemberPerksAction({ targetUserId: member.id, enabled: !member.enabled, expectedEnabled: member.enabled, reason });
      setMessage({ success: result.success, text: result.success ? 'Customization perks updated.' : result.error });
      if (result.success) { setReason(''); router.refresh(); }
    } catch { setMessage({ success: false, text: 'Could not update perks. Please try again.' }); }
    finally { setPending(false); }
  }
  if (!members.length) return <p className="text-sm text-muted">No matching members. Try another name or Discord ID.</p>;
  return <form onSubmit={submit} className="max-w-2xl space-y-5 rounded-2xl border border-border bg-surface-onyx p-5 sm:p-6">
    <div><label htmlFor="perk-member" className="mb-2 block text-sm font-semibold text-ink">Member</label><select id="perk-member" value={id} disabled={pending} onChange={event => { setId(event.target.value); setReason(''); setMessage(null); }} className="min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-ink">{members.map(item => <option key={item.id} value={item.id}>{item.displayName} (@{item.username})</option>)}</select></div>
    <p className="text-sm text-ink">Website customization grant: <strong>{member?.enabled ? 'Enabled' : 'Not granted'}</strong></p>
    <p className="text-sm text-muted">Adds profile studio, background artwork, a custom title, and up to 10 links and tags. Revoking this grant preserves saved styling and perks earned through Discord roles.</p>
    <div><label htmlFor="perk-reason" className="mb-2 block text-sm font-semibold text-ink">Reason for this change</label><textarea id="perk-reason" value={reason} disabled={pending} onChange={event => setReason(event.target.value)} required minLength={3} maxLength={255} rows={3} className="w-full rounded-xl border border-border bg-canvas p-3 text-ink" /></div>
    {message && <p role={message.success ? 'status' : 'alert'} className="text-sm text-ink">{message.text}</p>}
    <Button type="submit" disabled={pending || !member || reason.trim().length < 3 || (!member.enabled && member.membershipStatus !== 'ACTIVE')}>{pending ? 'Saving…' : member?.enabled ? 'Revoke website perks' : 'Grant customization perks'}</Button>
  </form>;
}
