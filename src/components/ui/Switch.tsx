'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id ?? React.useId();
    return (
      <div className="flex items-center justify-between gap-4">
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label htmlFor={switchId} className="text-sm font-medium text-foreground cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <SwitchPrimitive.Root
          ref={ref}
          id={switchId}
          className={cn(
            'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted',
            className
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0',
              'transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
            )}
          />
        </SwitchPrimitive.Root>
      </div>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
