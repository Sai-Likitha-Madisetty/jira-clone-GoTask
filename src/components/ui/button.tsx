import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-navy/15 font-sans text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-navy/5 disabled:from-navy/5 disabled:to-navy/5 disabled:text-navy/35 disabled:shadow-none active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "border-navy bg-navy text-primary-foreground shadow-navy/10 hover:border-navy/90 hover:bg-navy/90",
        destructive:
          "border-navy bg-navy text-destructive-foreground hover:border-navy/90 hover:bg-navy/90",
        outline:
          "border-navy/15 bg-ivory shadow-sm hover:border-champagne/65 hover:bg-champagne/10 hover:text-navy",
        secondary:
          "border-navy/10 bg-ivory text-navy hover:border-navy/20 hover:bg-navy/5",
        ghost: "border-transparent text-navy shadow-none hover:bg-navy/5 hover:text-navy",
        muted: "border-transparent bg-navy/5 text-navy/75 shadow-none hover:bg-navy/10",
        tertiary: "border-champagne/40 bg-champagne/10 text-navy shadow-none hover:bg-champagne/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        xs: "h-7 rounded-md px-2 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
