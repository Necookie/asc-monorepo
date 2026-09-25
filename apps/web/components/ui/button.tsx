import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'green' | 'white' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-[transform,background-color,border-color,color,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none motion-safe:active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-primary text-ink-dark hover:bg-primary-hover',
      green: 'bg-[#35ed7e] text-ink-dark font-semibold hover:bg-[#55f195]',
      white: 'bg-ink text-ink-dark font-semibold hover:bg-surface-hover',
      ghost: 'bg-surface-indigo text-ink hover:bg-surface-hover',
      danger: 'bg-[#ed4245] text-ink hover:bg-[#f05d60]',
      outline:
        'border border-border-strong text-ink-secondary hover:bg-surface-indigo hover:text-ink hover:border-border-strong',
    };

    const sizes = {
      sm: 'h-11 px-3.5 text-sm rounded-xl min-h-[44px]',
      md: 'h-11 px-5 text-sm rounded-xl min-h-[44px]',
      lg: 'h-13 px-7 text-base rounded-2xl min-h-[48px]',
      icon: 'h-10 w-10 rounded-xl min-h-[40px] min-w-[40px] p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
