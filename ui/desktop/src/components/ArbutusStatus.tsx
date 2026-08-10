import statusGlyph from '../images/status-glyph.png';

interface ArbutusStatusProps {
  className?: string;
}

/**
 * Arbutus Labs mark shown as the status icon while goose is working.
 * Gentle pulse via motion-safe so reduced-motion users get a static icon.
 * The artwork is black line art on transparency, so invert it in dark mode.
 * To change the artwork, replace images/status-glyph.png (64x64).
 */
export default function ArbutusStatus({ className = '' }: ArbutusStatusProps) {
  return (
    <img
      src={statusGlyph}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`h-4 w-4 select-none motion-safe:animate-pulse dark:invert ${className}`}
    />
  );
}
