import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'neon'
    size?: 'default' | 'sm' | 'lg' | 'icon'
  }
>(({ className, asChild = false, variant = 'default', size = 'default', ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gym-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gym-bg disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-gym-primary text-gym-bg hover:bg-gym-primary-dim shadow-neon-primary':
            variant === 'default',
          'bg-gym-accent text-gym-bg hover:bg-gym-accent/90 shadow-neon-accent':
            variant === 'destructive',
          'border border-gym-border bg-transparent hover:bg-gym-surface hover:text-gym-text':
            variant === 'outline',
          'bg-gym-surface text-gym-text hover:bg-gym-border':
            variant === 'secondary',
          'hover:bg-gym-surface hover:text-gym-text':
            variant === 'ghost',
          'text-gym-primary underline-offset-4 hover:underline':
            variant === 'link',
          'bg-transparent border-2 border-gym-primary text-gym-primary hover:bg-gym-primary hover:text-gym-bg shadow-neon-primary':
            variant === 'neon',
          'h-10 px-4 py-2': size === 'default',
          'h-9 rounded-md px-3': size === 'sm',
          'h-11 rounded-md px-8': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button }