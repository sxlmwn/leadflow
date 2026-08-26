import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        success:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        warning:
          'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
        destructive:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
        outline:
          'text-slate-950 dark:text-slate-200 border-slate-200 dark:border-slate-800',
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
