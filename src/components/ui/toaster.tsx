'use client'

import { Toaster as SonnerToaster } from 'sonner'

/**
 * App-wide toast styling tuned to the FX Gym dark/neon theme.
 * Loading toasts also get an auto-spinner so buttons never appear "hung".
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      gap={10}
      offset={16}
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: '#12121a',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f0f0f5',
          borderRadius: '14px',
          boxShadow: '0 10px 35px rgba(0,0,0,0.45)',
          fontFamily: 'inherit',
        },
        classNames: {
          toast: '!font-sans',
          title: '!text-sm !font-semibold !text-gym-text',
          description: '!text-xs !text-gym-text-muted',
          closeButton:
            '!bg-gym-bg !border-gym-border !text-gym-text-muted hover:!bg-gym-bg hover:!text-gym-text',
          actionButton: '!bg-gym-primary !text-gym-bg',
          cancelButton: '!bg-gym-bg !text-gym-text-muted',
          success: '!border-l-4 !border-l-green-500',
          error: '!border-l-4 !border-l-gym-accent',
          info: '!border-l-4 !border-l-gym-secondary',
          warning: '!border-l-4 !border-l-amber-500',
          loading: '!border-l-4 !border-l-gym-primary',
        },
      }}
    />
  )
}