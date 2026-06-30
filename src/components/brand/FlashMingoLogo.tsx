import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  /** 'dark' = dark text (for light bg), 'light' = white text (for dark bg, default) */
  variant?: 'light' | 'dark';
  /** 'sm' = compact, 'md' = standard (default) */
  size?: 'sm' | 'md';
}

export function FlashMingoLogo({
  className,
  showText = true,
  variant = 'light',
  size = 'md',
}: LogoProps) {
  const iconSize = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';
  const textSize = size === 'sm' ? '14px' : '15px';
  const textColor = variant === 'dark' ? 'text-foreground' : 'text-white';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0', iconSize)}
        aria-label="FlashMingo logo"
        role="img"
      >
        <rect width="32" height="32" rx="8" fill="#F59E0B" />
        <path
          d="M19 5L9 18h8L13 27l14-16h-9L19 5z"
          fill="white"
          fillOpacity="0.95"
        />
      </svg>

      {showText && (
        <span
          className={cn('font-display font-bold', textColor)}
          style={{ fontSize: textSize, letterSpacing: '-0.02em' }}
        >
          FlashMingo
        </span>
      )}
    </div>
  );
}
