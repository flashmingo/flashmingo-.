import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-8 w-full rounded-lg border border-border bg-white px-3 py-1.5',
        'text-sm text-foreground placeholder:text-muted-foreground',
        'transition-colors duration-150',
        'hover:border-slate-300',
        'focus-visible:outline-none focus-visible:border-primary/60',
        'focus-visible:shadow-[0_0_0_3px_hsl(217_91%_54%/0.1)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
export default Input;
