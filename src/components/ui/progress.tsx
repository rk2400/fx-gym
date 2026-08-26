"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
}

function Progress({ className, value, max = 100, ...props }: ProgressProps) {
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gym-border",
        className
      )}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-gym-primary to-gym-secondary transition-all duration-500 ease-out"
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  )
}

export { Progress }