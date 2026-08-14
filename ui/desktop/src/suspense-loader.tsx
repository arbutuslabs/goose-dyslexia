import React from 'react';
import LiraLoader from './components/LiraLoader';

/**
 * Shown while the app bundle loads, before anything else renders.
 *
 * The loader's default 3.2s cycle finishes drawing the word at 55% — 1.76s —
 * but the bundle resolves well before that, so the splash used to vanish with
 * only the book drawn. This instance runs at 1.2s, finishing the word at
 * ~660ms; renderer.tsx holds the splash just past that so the draw always
 * completes.
 */
export const SPLASH_DRAW_MS = 700;

export default function SuspenseLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden p-6 page-transition">
      <LiraLoader
        style={
          {
            '--mira-width': '260px',
            '--mira-duration': '1.2s',
          } as React.CSSProperties
        }
      />
    </div>
  );
}
