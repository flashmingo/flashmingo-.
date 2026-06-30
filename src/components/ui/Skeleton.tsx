import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted',
        'after:absolute after:inset-0 after:translate-x-[-100%]',
        'after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent',
        'after:animate-shimmer after:[background-size:200%_100%]',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;
