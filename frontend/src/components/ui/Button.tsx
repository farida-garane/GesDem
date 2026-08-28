import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm';

    const variants = {
      primary:
        'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white focus:ring-gray-900 shadow-gray-900/10 active:scale-[0.98]',
      secondary:
        'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-400 active:scale-[0.98]',
      outline:
        'border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-50 text-gray-700 hover:text-gray-900 focus:ring-gray-400 active:scale-[0.98]',
      ghost:
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 focus:ring-gray-300 shadow-none',
      danger:
        'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-600/20 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
