import * as React from "react"
import * as RadioSectionPrimitive from "@radix-ui/react-radio-section"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioSection = React.forwardRef(({ className, ...props }, ref) => {
  return (<RadioSectionPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />);
})
RadioSection.displayName = RadioSectionPrimitive.Root.displayName

const RadioSectionItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioSectionPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <RadioSectionPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioSectionPrimitive.Indicator>
    </RadioSectionPrimitive.Item>
  );
})
RadioSectionItem.displayName = RadioSectionPrimitive.Item.displayName

export { RadioSection, RadioSectionItem }
