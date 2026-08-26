import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gym-primary focus:ring-offset-2',
        {
          'border-transparent bg-gym-primary text-gym-bg hover:bg-gym-primary-dim':
            variant === 'default',
          'border-transparent bg-gym-surface text-gym-text hover:bg-gym-border':
            variant === 'secondary',
          'border-transparent bg-gym-accent text-gym-bg hover:bg-gym-accent/90':
            variant === 'destructive',
          'text-gym-primary border-gym-primary bg-transparent hover:bg-gym-primary/10':
            variant === 'outline',
          'border-transparent bg-green-500/20 text-green-400':
            variant === 'success',
          'border-transparent bg-amber-500/20 text-amber-400':
            variant === 'warning',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }