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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865f2] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary: 'bg-[#5865f2] text-white hover:bg-[#4752c4] shadow-sm',
      green: 'bg-[#35ed7e] text-black font-semibold hover:bg-[#2ecc71] shadow-sm',
      white: 'bg-white text-black font-semibold hover:bg-[#e0e1e5] shadow-sm',
      ghost: 'bg-[#1e2353] text-[#ffffff] hover:bg-[#292f68] hover:text-white',
      danger: 'bg-[#ed4245] text-white hover:bg-[#c03537] shadow-sm',
      outline:
        'border border-[rgba(88,101,242,0.4)] text-[#c7c9e5] hover:bg-[rgba(88,101,242,0.15)] hover:text-white hover:border-[#5865f2]',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-xl min-h-[36px]',
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
