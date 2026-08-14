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
});

// The wordmark loader is the busy indicator for every working state. Idle
// keeps the small static logo — a drawing animation with nothing happening
// behind it would be a lie.
const STATE_ICONS: Record<ChatState, React.ReactNode> = {
  [ChatState.LoadingConversation]: <LiraLoader />,
  [ChatState.Thinking]: <LiraLoader />,
  [ChatState.Streaming]: <LiraLoader />,
  [ChatState.WaitingForUserInput]: <LiraLoader />,
  [ChatState.Compacting]: <LiraLoader />,
  [ChatState.Idle]: <GooseLogo size="small" hover={false} />,
  [ChatState.RestartingAgent]: <LiraLoader />,
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
  const displayMessage = message || intl.formatMessage(i18n[STATE_MESSAGE_KEYS[chatState]]);
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
