import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300',
        success:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
        warning:
          'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
        destructive:
          'border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300',
        outline:
          'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
