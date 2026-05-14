import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'escalated' | 'delivering' | 'preparing' | 'completed' | 'failed' | 'refunding';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
    outline: 'text-foreground',
    success: 'border-transparent bg-green-100 text-green-800 border border-green-400',
    warning: 'border-transparent bg-yellow-100 text-yellow-800 border border-yellow-400',
    info: 'border-transparent bg-blue-200 text-blue-700 border border-blue-400',
    escalated: 'border-transparent bg-[#fff1f0] text-[#cf1322] border-[#ffa39e]',
    delivering: 'border-transparent bg-[#f6ffed] text-[#389e0d] border-[#b7eb8f]',
    preparing: 'border-transparent bg-[#f9f0ff] text-[#722ed1] border-[#d3adf7]',
    completed: 'border-transparent bg-[#f6ffed] text-[#389e0d] border-[#b7eb8f]',
    failed: 'border-transparent bg-[#fff1f0] text-[#cf1322] border-[#ffa39e]',
    refunding: 'border-transparent bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
