interface LogoMarkProps {
  size?: number;
  className?: string;
  /** Set true when adjacent visible text already says "Meridian", so
   * screen readers don't announce the name twice. */
  decorative?: boolean;
}

/**
 * Static brand mark: an "M" zigzag crossed by a meridian arc.
 * This is the single source of truth for the logo shape — used in the
 * favicon (icon.tsx), marketing header, and dashboard header.
 */
export function LogoMark({ size = 28, className, decorative = false }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'Meridian' })}
    >
      <rect width="32" height="32" rx="8" className="fill-primary/20" />
      <path
        d="M5 22 Q16 15 27 22"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.25"
        fill="none"
      />
      <path
        d="M8 22V10L16 18L24 10V22"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
