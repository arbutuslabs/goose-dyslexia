import { useEffect, useState } from 'react';
import GooseLogo from './GooseLogo';
import LiraLoader from './LiraLoader';
import { ChatState } from '../types/chatState';
import { defineMessages, useIntl } from '../i18n';
import { cn } from '../utils';

interface LoadingGooseProps {
  message?: string;
  chatState?: ChatState;
}

const i18n = defineMessages({
  loadingConversation: {
    id: 'loadingGoose.loadingConversation',
    defaultMessage: 'loading conversation...',
  },
  thinking: {
    id: 'loadingGoose.thinking',
    defaultMessage: 'is thinking…',
  },
  streaming: {
    id: 'loadingGoose.streaming',
    defaultMessage: 'is working on it…',
  },
  waiting: {
    id: 'loadingGoose.waiting',
    defaultMessage: 'is waiting…',
  },
  compacting: {
    id: 'loadingGoose.compacting',
    defaultMessage: 'is compacting the conversation...',
  },
  idle: {
    id: 'loadingGoose.idle',
    defaultMessage: 'is working on it…',
  },
  restartingAgent: {
    id: 'loadingGoose.restartingAgent',
    defaultMessage: 'restarting session...',
  },
  fallbackStarting: {
    id: 'loadingGoose.fallbackStarting',
    defaultMessage: 'Starting your lesson plan…',
  },
  fallbackChecking: {
    id: 'loadingGoose.fallbackChecking',
    defaultMessage: 'Double-checking every word…',
  },
  fallbackFitting: {
    id: 'loadingGoose.fallbackFitting',
    defaultMessage: 'Making sure everything fits…',
  },
  fallbackPolishing: {
    id: 'loadingGoose.fallbackPolishing',
    defaultMessage: 'Polishing the sentences…',
  },
});

// Generic filler shown while Lira is working but hasn't reached a milestone
// with a real progress message (see agent.rs's progress_message_for_tool_call).
// Rotates on a timer so the indicator never sits static and silent.
const FALLBACK_MESSAGE_KEYS: Array<keyof typeof i18n> = [
  'fallbackStarting',
  'fallbackChecking',
  'fallbackFitting',
  'fallbackPolishing',
];
const FALLBACK_ROTATION_MS = 5000;

// Chat states where "no real progress message yet" should rotate through
// filler rather than sit on the static per-state label below.
const ROTATING_STATES: ReadonlySet<ChatState> = new Set([
  ChatState.Thinking,
  ChatState.Streaming,
]);

// Smaller than the 180px default (the boot splash in suspense-loader.tsx
// still uses that) — full size sits ~60px tall here and can overlap the
// chat text stacked right below it.
const CHAT_LOADER_STYLE = { '--mira-width': '110px' } as React.CSSProperties;

// The wordmark loader is the busy indicator for every working state. Idle
// keeps the small static logo — a drawing animation with nothing happening
// behind it would be a lie.
const STATE_ICONS: Record<ChatState, React.ReactNode> = {
  [ChatState.LoadingConversation]: <LiraLoader style={CHAT_LOADER_STYLE} />,
  [ChatState.Thinking]: <LiraLoader style={CHAT_LOADER_STYLE} />,
  [ChatState.Streaming]: <LiraLoader style={CHAT_LOADER_STYLE} />,
  [ChatState.WaitingForUserInput]: <LiraLoader style={CHAT_LOADER_STYLE} />,
  [ChatState.Compacting]: <LiraLoader style={CHAT_LOADER_STYLE} />,
  [ChatState.Idle]: <GooseLogo size="small" hover={false} />,
  [ChatState.RestartingAgent]: <LiraLoader style={CHAT_LOADER_STYLE} />,
};

const STATE_MESSAGE_KEYS: Record<ChatState, keyof typeof i18n> = {
  [ChatState.LoadingConversation]: 'loadingConversation',
  [ChatState.Thinking]: 'thinking',
  [ChatState.Streaming]: 'streaming',
  [ChatState.WaitingForUserInput]: 'waiting',
  [ChatState.Compacting]: 'compacting',
  [ChatState.Idle]: 'idle',
  [ChatState.RestartingAgent]: 'restartingAgent',
};

const LoadingGoose = ({ message, chatState = ChatState.Idle }: LoadingGooseProps) => {
  const intl = useIntl();
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Real progress messages (from tool-call milestones) always win. Filler
  // only rotates when there's nothing specific to say yet.
  const shouldRotateFallback = !message && ROTATING_STATES.has(chatState);

  useEffect(() => {
    if (!shouldRotateFallback) return undefined;
    setFallbackIndex(0);
    const intervalId = setInterval(() => {
      setFallbackIndex((i) => (i + 1) % FALLBACK_MESSAGE_KEYS.length);
    }, FALLBACK_ROTATION_MS);
    return () => clearInterval(intervalId);
  }, [shouldRotateFallback]);

  const displayMessage =
    message ||
    (shouldRotateFallback
      ? intl.formatMessage(i18n[FALLBACK_MESSAGE_KEYS[fallbackIndex]])
      : intl.formatMessage(i18n[STATE_MESSAGE_KEYS[chatState]]));
  const icon = STATE_ICONS[chatState];
  const isIdle = chatState === ChatState.Idle;

  return (
    <div className="w-full animate-fade-slide-up">
      <div
        data-testid="loading-indicator"
        className={cn(
          'py-2 text-xs text-text-primary',
          // The loader is a ~60px-tall wordmark, so it stacks above the label
          // rather than sitting beside it. Idle's small logo stays inline.
          isIdle ? 'flex items-center gap-2' : 'flex flex-col items-start gap-1'
        )}
      >
        {icon}
        {displayMessage}
      </div>
    </div>
  );
};

export default LoadingGoose;
