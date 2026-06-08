import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn("uiSwitch", className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className="uiSwitchThumb" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
