'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminUpdateSiteSettingsAction } from '@/lib/actions/admin';
import { Settings, AlertTriangle, Megaphone, Check, AlertCircle, Save } from 'lucide-react';

export interface SiteSettingsPanelProps {
  initialSettings: {
    maintenanceMode: boolean;
    announcement: string;
  };
}

export function SiteSettingsPanel({ initialSettings }: SiteSettingsPanelProps) {
  const router = useRouter();
  const [maintenanceMode, setMaintenanceMode] = React.useState(
    initialSettings.maintenanceMode
  );
  const [announcement, setAnnouncement] = React.useState(
    initialSettings.announcement
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await adminUpdateSiteSettingsAction({
        maintenanceMode,
        announcement: announcement.trim() ? announcement.trim() : null,
      });

      if (!res.success) throw new Error(res.error);

      setStatusMsg({
        type: 'success',
        text: 'Site settings updated successfully and recorded in the audit log.',
      });
      router.refresh();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
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

      {/* Maintenance Mode Card */}
      <Card className="bg-[#0e1245]/80 border-[rgba(88,101,242,0.2)] p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            Maintenance Mode
          </CardTitle>
          <CardDescription className="text-xs text-[#8b92d6]">
            When enabled, public mutations are temporarily paused for routine database maintenance.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141943] border border-[rgba(88,101,242,0.15)]">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Enable Maintenance Mode</div>
              <div className="text-[11px] text-[#8b92d6]">
                Only administrators will be permitted to access dashboard editors.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                maintenanceMode ? 'bg-[#f59e0b]' : 'bg-[#1e2353]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* System Announcement Banner Card */}
      <Card className="bg-[#0e1245]/80 border-[rgba(88,101,242,0.2)] p-6 space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#5865f2]" />
            Community Announcement Banner
          </CardTitle>
          <CardDescription className="text-xs text-[#8b92d6]">
            Display a global broadcast announcement message at the top of all public pages.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-2 space-y-3">
          <textarea
            rows={3}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value.slice(0, 255))}
            placeholder="e.g. Welcome to ASC v1.0! Check out the newly synchronized member directory."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#141943] border border-[rgba(88,101,242,0.25)] text-sm text-white placeholder:text-[#a3a6c2] focus:outline-none focus:ring-2 focus:ring-[#5865f2] resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-[#8b92d6]">
            <span>Leave empty to hide the global banner.</span>
            <span>{announcement.length} / 255</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        variant="primary"
        size="md"
        type="submit"
        disabled={isLoading}
        className="gap-2 font-bold text-xs"
      >
        <Save className="w-4 h-4" />
        {isLoading ? 'Saving...' : 'Save Site Settings'}
      </Button>
    </form>
  );
}
