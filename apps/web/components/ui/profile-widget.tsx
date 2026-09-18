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
        'rounded-2xl bg-[#1e2353]/88 backdrop-blur-xl border border-[rgba(88,101,242,0.2)] p-6 shadow-md transition-all',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(88,101,242,0.15)]">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-[#5865f2]">{icon}</span>}
            {title && (
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-[var(--font-display)]">
                {title}
              </h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="text-[#c7c9e5]">{children}</div>
    </div>
  );
}
