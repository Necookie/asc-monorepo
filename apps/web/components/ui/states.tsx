import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertCircle, Lock, Sparkles, Inbox, Loader2 } from 'lucide-react';

export function LoadingState({
  message = 'Loading ASC data...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center space-y-4 min-h-[220px]',
        className
      )}
    >
      <Loader2 className="w-9 h-9 text-[#5865f2] animate-spin" />
      <p className="text-sm font-medium text-[#c7c9e5]">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No items found',
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#1e2353]/60 border border-[rgba(88,101,242,0.15)] space-y-4',
        className
      )}
    >
      <div className="p-4 rounded-full bg-[rgba(88,101,242,0.15)] text-[#5865f2]">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-bold text-white font-[var(--font-display)]">{title}</h3>
        {description && <p className="text-sm text-[#9498bd]">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while processing this request.',
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#1e2353]/80 border border-[#ed4245]/30 space-y-4',
        className
      )}
    >
      <div className="p-4 rounded-full bg-[#ed4245]/15 text-[#ed4245]">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-bold text-white font-[var(--font-display)]">{title}</h3>
        <p className="text-sm text-[#c7c9e5]">{description}</p>
      </div>
      {onRetry && (
        <Button variant="ghost" size="md" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function LockedState({
  title = 'Supporter Feature',
  description = 'This customization feature is exclusively available to community supporters.',
  perkName,
  className,
}: {
  title?: string;
  description?: string;
  perkName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#1e2353]/90 border border-[rgba(236,72,189,0.3)] space-y-4 asc-glow-supporter',
        className
      )}
    >
      <div className="p-3.5 rounded-full bg-gradient-to-tr from-[#5865f2] to-[#ec48bd] text-white">
        <Lock className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ec48bd]">
          <Sparkles className="w-3.5 h-3.5" />
          {perkName || 'Supporter Perk'}
        </div>
        <h3 className="text-lg font-bold text-white font-[var(--font-display)]">{title}</h3>
        <p className="text-sm text-[#c7c9e5]">{description}</p>
      </div>
    </div>
  );
}
