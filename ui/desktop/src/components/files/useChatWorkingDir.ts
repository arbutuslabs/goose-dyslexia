import { useEffect, useState } from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import { acpGetSessionListItem } from '../../acp/sessions';
import { getInitialWorkingDir } from '../../utils/workingDir';

// The session's working dir can change mid-session (the user or agent can
// switch directories), so re-check it periodically while the panel is in use.
const REFRESH_INTERVAL_MS = 5000;

/**
 * The active chat's working directory, falling back to the window's initial
 * working dir when there is no session yet (e.g. the Hub screen).
 * Pass `active: false` to pause the periodic refresh (e.g. panel collapsed).
 */
export function useChatWorkingDir(active: boolean): string {
  const chatContext = useChatContext();
  const sessionId = chatContext?.chat.sessionId ?? '';
  const [sessionDir, setSessionDir] = useState('');

  useEffect(() => {
    setSessionDir('');
    if (!sessionId || !active) return;
    let cancelled = false;
    const fetchDir = async () => {
      try {
        const item = await acpGetSessionListItem(sessionId);
        if (!cancelled) setSessionDir(item.workingDir ?? '');
      } catch {
        // Session not loadable (yet); keep the fallback dir.
      }
    };
    void fetchDir();
    const interval = setInterval(fetchDir, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, active]);

  return sessionDir || getInitialWorkingDir();
}
