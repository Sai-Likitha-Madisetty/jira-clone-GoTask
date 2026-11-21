import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { TaskStatus } from "@/features/tasks/types"

import { cn } from "@/lib/utils"


const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-navy text-ivory shadow-none hover:bg-navy/90",
        secondary:
          "border-navy/10 bg-navy/5 text-navy/75 hover:bg-navy/10",
        destructive:
          "border-navy/20 bg-navy/10 text-navy hover:bg-navy/15",
        outline: "border-navy/15 text-navy/75",
        [TaskStatus.TODO]: 
          "border-navy/10 bg-navy/5 text-navy/75 hover:bg-navy/10",
        [TaskStatus.IN_PROGRESS]:
          "border-champagne/35 bg-champagne/15 text-navy hover:bg-champagne/25",
        [TaskStatus.IN_REVIEW]:
          "border-champagne/25 bg-ivory text-navy/75 hover:bg-champagne/10",
        [TaskStatus.DONE]:
          "border-navy/20 bg-navy/10 text-navy hover:bg-navy/15",
        [TaskStatus.BACKLOG]:
          "border-navy/10 bg-ivory text-navy/55 hover:bg-navy/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
