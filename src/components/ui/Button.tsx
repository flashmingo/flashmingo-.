import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
    'text-sm font-medium rounded-lg',
    'transition-all duration-150',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'select-none cursor-pointer',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white shadow-sm hover:bg-blue-700 active:scale-[0.98]',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]',
        outline:
          'border border-border bg-white text-foreground shadow-xs hover:bg-muted active:scale-[0.98]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70 active:scale-[0.98]',
        ghost:
          'text-foreground hover:bg-muted active:bg-secondary',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto shadow-none',
        /* Study answer variants */
        'answer-again':
          'border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 active:scale-[0.97]',
        'answer-hard':
          'border border-orange-200 bg-white text-orange-600 hover:bg-orange-50 hover:border-orange-300 active:scale-[0.97]',
        'answer-good':
          'border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-300 active:scale-[0.97]',
        'answer-easy':
          'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.97]',
      },
      size: {
        sm:      'h-7 px-3 text-xs rounded-md gap-1',
        default: 'h-8 px-3.5',
        lg:      'h-9 px-5 text-[13px]',
        xl:      'h-11 px-6 text-sm rounded-xl',
        icon:    'h-8 w-8',
        'icon-sm': 'h-6 w-6 rounded-md [&_svg]:size-3.5',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;
