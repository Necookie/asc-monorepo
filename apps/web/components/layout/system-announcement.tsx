'use client';

import * as React from 'react';
import { Megaphone, X } from 'lucide-react';

interface SystemAnnouncementBannerProps {
  announcement: string | null;
}

export function SystemAnnouncementBanner({ announcement }: SystemAnnouncementBannerProps) {
  const [dismissed, setDismissed] = React.useState(false);

  if (!announcement || dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="System Announcement"
      className="relative z-40 w-full border-b border-primary/30 bg-surface-onyx/95 backdrop-blur-md text-ink text-sm transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <p className="truncate text-xs sm:text-sm font-medium text-ink">
            {announcement}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-1 text-ink-secondary hover:text-ink hover:bg-surface-indigo focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
