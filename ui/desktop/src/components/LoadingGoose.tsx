import GooseLogo from './GooseLogo';
import ArbutusStatus from './ArbutusStatus';
import { ChatState } from '../types/chatState';
import { defineMessages, useIntl } from '../i18n';

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
    defaultMessage: 'arbutus labs is thinking…',
  },
  streaming: {
    id: 'loadingGoose.streaming',
    defaultMessage: 'arbutus labs is working on it…',
  },
  waiting: {
    id: 'loadingGoose.waiting',
    defaultMessage: 'arbutus labs is waiting…',
  },
  compacting: {
    id: 'loadingGoose.compacting',
    defaultMessage: 'arbutus labs is compacting the conversation...',
  },
  idle: {
    id: 'loadingGoose.idle',
    defaultMessage: 'arbutus labs is working on it…',
  },
  restartingAgent: {
    id: 'loadingGoose.restartingAgent',
    defaultMessage: 'restarting session...',
  },
});

const STATE_ICONS: Record<ChatState, React.ReactNode> = {
  [ChatState.LoadingConversation]: <ArbutusStatus className="flex-shrink-0" />,
  [ChatState.Thinking]: <ArbutusStatus className="flex-shrink-0" />,
  [ChatState.Streaming]: <ArbutusStatus className="flex-shrink-0" />,
  [ChatState.WaitingForUserInput]: <ArbutusStatus className="flex-shrink-0" />,
  [ChatState.Compacting]: <ArbutusStatus className="flex-shrink-0" />,
  [ChatState.Idle]: <GooseLogo size="small" hover={false} />,
  [ChatState.RestartingAgent]: <ArbutusStatus className="flex-shrink-0" />,
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

  return (
    <div className="w-full animate-fade-slide-up">
      <div
        data-testid="loading-indicator"
        className="flex items-center gap-2 text-xs text-text-primary py-2"
      >
        {icon}
        {displayMessage}
      </div>
    </div>
  );
};

export default LoadingGoose;
