import { useEffect, useState } from 'react';

/** Fired by the settings toggle so open chats update without a reload. */
export const SHOW_TOOL_CALLS_CHANGED = 'showToolCallsChanged';

/**
 * Whether Lira's working — tool calls and thinking blocks — should be shown in
 * the conversation.
 *
 * Defaults to false: tutors want the conversation, not the mechanics. Tool
 * calls that are awaiting approval or that failed are shown regardless — see
 * GooseMessage, which decides per tool call.
 */
export function useShowToolCalls(): boolean {
  const [showToolCalls, setShowToolCalls] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const read = () => {
      window.electron
        .getSetting('showToolCalls')
        .then((value) => {
          if (!cancelled) setShowToolCalls(Boolean(value));
        })
        .catch(() => {});
    };

    read();
    window.addEventListener(SHOW_TOOL_CALLS_CHANGED, read);
    return () => {
      cancelled = true;
      window.removeEventListener(SHOW_TOOL_CALLS_CHANGED, read);
    };
  }, []);

  return showToolCalls;
}
