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
      <Loader2 className="w-9 h-9 text-primary animate-spin" />
      <p className="text-sm font-medium text-ink-secondary">{message}</p>
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
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-surface-indigo border border-border space-y-4',
        className
      )}
    >
      <div className="p-4 rounded-full bg-surface-hover text-primary">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-bold text-ink font-[var(--font-display)]">{title}</h3>
        {description && <p className="text-sm text-muted">{description}</p>}
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
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-surface-indigo border border-danger/30 space-y-4',
        className
      )}
    >
      <div className="p-4 rounded-full bg-danger/15 text-danger">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-bold text-ink font-[var(--font-display)]">{title}</h3>
        <p className="text-sm text-ink-secondary">{description}</p>
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
        'relative overflow-hidden flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-surface-indigo border border-magenta/30 space-y-4 asc-glow-supporter',
        className
      )}
    >
      <div className="p-3.5 rounded-full bg-gradient-to-tr from-primary to-magenta text-ink-dark">
        <Lock className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ec48bd]">
          <Sparkles className="w-3.5 h-3.5" />
          {perkName || 'Supporter Perk'}
        </div>
        <h3 className="text-lg font-bold text-ink font-[var(--font-display)]">{title}</h3>
        <p className="text-sm text-ink-secondary">{description}</p>
      </div>
    </div>
  );
}
