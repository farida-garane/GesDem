import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 font-medium transition-all duration-200 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 disabled:bg-slate-100 disabled:text-slate-500',
              leftIcon && 'pl-10',
              error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
