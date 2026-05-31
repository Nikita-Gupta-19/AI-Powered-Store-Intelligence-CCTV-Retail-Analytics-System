import { cn } from '@/lib/utils';

export function Badge({
  children,
  variant = 'default',
  className
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'secondary';
  className?: string;
}) {
  const v = {
    default: 'bg-blue-500/15 text-blue-200',
    success: 'bg-green-500/15 text-green-200',
    warning: 'bg-amber-500/15 text-amber-200',
    danger: 'bg-red-500/15 text-red-200',
    secondary: 'bg-slate-500/15 text-slate-200'
  }[variant];

  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', v, className)}>
      {children}
    </span>
  );
}
