import React, { useEffect, useState } from 'react';
import LiraLoader from './components/LiraLoader';

/**
 * Boot splash: the wordmark draws once, holds, then fades to reveal the app.
 *
 * It renders as an overlay *on top of* the app rather than in place of it. A
 * Suspense fallback is swapped out for its children, which always leaves a
 * frame where neither is painted — that gap is what flashed the window's own
 * background. Overlaying means the app is already painted underneath before
 * the splash starts fading, so there is nothing to flash through to.
 */
export const SPLASH_DRAW_MS = 2000;
export const SPLASH_HOLD_MS = 1000;
export const SPLASH_FADE_MS = 500;
export const SPLASH_TOTAL_MS = SPLASH_DRAW_MS + SPLASH_HOLD_MS + SPLASH_FADE_MS;

/** Plain themed screen, used while the bundle itself is still loading. */
export function SplashBackdrop() {
  return <div className="fixed inset-0 z-[9999] bg-background-primary" />;
}

export default function BootSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), SPLASH_TOTAL_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="splash-fade pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-background-primary"
      style={
        {
          '--splash-fade': `${SPLASH_FADE_MS}ms`,
          '--splash-fade-delay': `${SPLASH_DRAW_MS + SPLASH_HOLD_MS}ms`,
        } as React.CSSProperties
      }
    >
      <LiraLoader
        variant="once"
        style={
          {
            '--mira-width': '280px',
            '--mira-duration': `${SPLASH_DRAW_MS}ms`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
