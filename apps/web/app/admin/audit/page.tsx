import { Metadata } from 'next';
import { requireAdminMember } from '@/lib/auth/session';
import { getAdminAuditLogsList } from '@/lib/queries/admin';
import { Card } from '@/components/ui/card';
import { FileText, Shield, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Audit Log',
  description: 'Tamper-evident audit trail recording all administrative mutations and moderation events.',
};

export default async function AdminAuditPage() {
  await requireAdminMember();
  const logs = await getAdminAuditLogsList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-[var(--font-display)]">
          Audit Log
        </h1>
        <p className="text-sm text-muted mt-1">
          Chronological, tamper-evident records of all administrative actions, profile moderations, and system configuration updates.
        </p>
      </div>

      <Card className="bg-surface-onyx/80 border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-indigo text-muted uppercase tracking-wider text-[10px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Details / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-indigo/50 transition-colors">
                  <td className="py-3 px-4 text-muted whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/20 text-muted border border-primary/30">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-ink-secondary text-xs">
                    {log.actorId.slice(0, 8)}...
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-ink">{log.targetType}: </span>
                    <span className="font-mono text-muted text-[11px]">{log.targetId.slice(0, 8)}...</span>
                  </td>

                  <td className="py-3 px-4 text-ink-secondary max-w-xs truncate text-[11px]">
                    {log.metadata ? (
                      <span className="font-mono text-muted">{log.metadata}</span>
                    ) : (
                      <span className="text-muted italic">None</span>
                    )}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted">
                    No audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
