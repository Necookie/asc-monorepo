'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { adminModerateProfileAction } from '@/lib/actions/admin';
import type { AdminMemberItem } from '@/lib/queries/admin';
import {
  ShieldAlert,
  EyeOff,
  Eye,
  RotateCcw,
  Image,
  Link as LinkIcon,
  Check,
  AlertCircle,
} from 'lucide-react';

export interface ProfileModerationPanelProps {
  members: AdminMemberItem[];
}

export function ProfileModerationPanel({ members }: ProfileModerationPanelProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = React.useState<string>(
    members[0]?.id || ''
  );
  const [reason, setReason] = React.useState('');
  const [statusMsg, setStatusMsg] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedMember = members.find((m) => m.id === selectedUserId);

  const handleModerate = async (
    action: 'HIDE_PROFILE' | 'UNHIDE_PROFILE' | 'RESET_BIO' | 'RESET_BACKGROUND' | 'RESET_LINKS'
  ) => {
    if (!selectedUserId) return;
    if (!reason.trim() || reason.trim().length < 3) {
      setStatusMsg({
        type: 'error',
        text: 'A valid reason (at least 3 characters) is required for moderation audit logs.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await adminModerateProfileAction({
        targetUserId: selectedUserId,
        action,
        reason: reason.trim(),
      });

      if (!res.success) throw new Error(res.error);

      setStatusMsg({
        type: 'success',
        text: `Successfully executed ${action} for @${selectedMember?.username}. Logged to audit trail.`,
      });
      setReason('');
      router.refresh();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Action failed',
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
        {/* Left Column: Select Member */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-surface-onyx/80 border-border p-5 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-bold text-ink">Select Target Member</CardTitle>
              <CardDescription className="text-xs text-muted">
                Choose a member to inspect or apply moderation actions.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedUserId(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedUserId === m.id
                      ? 'bg-primary/20 border-primary ring-1 ring-primary'
                      : 'bg-surface-indigo border-border hover:border-border'
                  }`}
                >
                  <Avatar
                    src={m.avatar}
                    alt={m.displayName}
                    size={32}
                    fallbackText={m.displayName.slice(0, 2).toUpperCase()}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-ink truncate">
                      {m.displayName}
                    </div>
                    <div className="text-[10px] text-muted truncate">@{m.username}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Moderation Actions */}
        <div className="lg:col-span-7 space-y-4">
          {selectedMember ? (
            <Card className="bg-surface-onyx/80 border-border p-6 space-y-6">
              <CardHeader className="p-0 pb-4 border-b border-border flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedMember.avatar}
                    alt={selectedMember.displayName}
                    size={40}
                    fallbackText={selectedMember.displayName.slice(0, 2).toUpperCase()}
                  />
                  <div>
                    <h2 className="text-base font-bold text-ink">
                      {selectedMember.displayName}
                    </h2>
                    <div className="text-xs text-muted">
                      @{selectedMember.username} · Snowflake: {selectedMember.externalUserId}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedMember.isPrivate
                      ? 'bg-[#ed4245]/15 text-[#ff8f91] border border-[#ed4245]/30'
                      : 'bg-[#35ed7e]/15 text-[#84f7b2] border border-[#35ed7e]/30'
                  }`}
                >
                  {selectedMember.isPrivate ? 'Hidden (Private)' : 'Public Profile'}
                </span>
              </CardHeader>

              {/* Mandatory Reason Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#ec48bd]" />
                  Moderation Reason (Required for Audit Logging)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Violation of community guidelines: offensive bio text"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-indigo border border-border text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[#ec48bd]"
                />
              </div>

              {/* Moderation Actions Grid */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted">
                  Available Moderation Actions
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedMember.isPrivate ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerate('UNHIDE_PROFILE')}
                      disabled={isLoading}
                      className="gap-2 text-xs border-[#35ed7e]/40 text-[#84f7b2] hover:bg-[#35ed7e]/10 justify-start"
                    >
                      <Eye className="w-4 h-4 text-[#35ed7e]" />
                      Unhide Profile
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerate('HIDE_PROFILE')}
                      disabled={isLoading}
                      className="gap-2 text-xs border-[#ed4245]/40 text-[#ff8f91] hover:bg-[#ed4245]/10 justify-start"
                    >
                      <EyeOff className="w-4 h-4 text-[#ed4245]" />
                      Hide Profile (Make Private)
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerate('RESET_BIO')}
                    disabled={isLoading}
                    className="gap-2 text-xs border-border text-ink-secondary hover:text-ink justify-start"
                  >
                    <RotateCcw className="w-4 h-4 text-[#f59e0b]" />
                    Reset Bio & Custom Title
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerate('RESET_BACKGROUND')}
                    disabled={isLoading}
                    className="gap-2 text-xs border-border text-ink-secondary hover:text-ink justify-start"
                  >
                    <Image className="w-4 h-4 text-[#ec48bd]" />
                    Reset Background Image
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerate('RESET_LINKS')}
                    disabled={isLoading}
                    className="gap-2 text-xs border-border text-ink-secondary hover:text-ink justify-start"
                  >
                    <LinkIcon className="w-4 h-4 text-[#06b6d4]" />
                    Reset Outbound Links
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-12 text-center text-xs text-muted">
              No member selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
