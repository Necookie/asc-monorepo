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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-[var(--font-display)]">
          Audit Log
        </h1>
        <p className="text-sm text-[#8b92d6] mt-1">
          Chronological, tamper-evident records of all administrative actions, profile moderations, and system configuration updates.
        </p>
      </div>

      <Card className="bg-[#0e1245]/80 border-[rgba(88,101,242,0.2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141943] text-[#8b92d6] uppercase tracking-wider text-[10px] border-b border-[rgba(88,101,242,0.15)]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Details / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(88,101,242,0.1)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#141943]/50 transition-colors">
                  <td className="py-3 px-4 text-[#8b92d6] whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#5865f2]/20 text-[#8b92d6] border border-[#5865f2]/30">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[#c7c9e5] text-xs">
                    {log.actorId.slice(0, 8)}...
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-white">{log.targetType}: </span>
                    <span className="font-mono text-[#8b92d6] text-[11px]">{log.targetId.slice(0, 8)}...</span>
                  </td>

                  <td className="py-3 px-4 text-[#c7c9e5] max-w-xs truncate text-[11px]">
                    {log.metadata ? (
                      <span className="font-mono text-[#8b92d6]">{log.metadata}</span>
                    ) : (
                      <span className="text-muted italic">None</span>
                    )}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#8b92d6]">
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
