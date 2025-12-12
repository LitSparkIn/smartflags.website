import * as React from "react"
import * as ToggleSectionPrimitive from "@radix-ui/react-toggle-section"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleSectionContext = React.createContext({
  size: "default",
  variant: "default",
})

const ToggleSection = React.forwardRef(({ className, variant, size, children, ...props }, ref) => (
  <ToggleSectionPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}>
    <ToggleSectionContext.Provider value={{ variant, size }}>
      {children}
    </ToggleSectionContext.Provider>
  </ToggleSectionPrimitive.Root>
))

ToggleSection.displayName = ToggleSectionPrimitive.Root.displayName

const ToggleSectionItem = React.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleSectionContext)

  return (
    <ToggleSectionPrimitive.Item
      ref={ref}
      className={cn(toggleVariants({
        variant: context.variant || variant,
        size: context.size || size,
      }), className)}
      {...props}>
      {children}
    </ToggleSectionPrimitive.Item>
  );
})

ToggleSectionItem.displayName = ToggleSectionPrimitive.Item.displayName

export { ToggleSection, ToggleSectionItem }
