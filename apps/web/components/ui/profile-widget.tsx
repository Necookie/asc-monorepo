import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProfileWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function ProfileWidget({
  title,
  icon,
  action,
  children,
  className,
  ...props
}: ProfileWidgetProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface-indigo border border-white/[0.08] p-6 transition-colors',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-primary-soft">{icon}</span>}
            {title && (
              <h3 className="text-base font-semibold text-ink font-[var(--font-display)]">
                {title}
              </h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="text-ink-secondary">{children}</div>
    </div>
  );
}
