import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IpcRendererEvent } from 'electron';
import { Outlet, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { FolderTree, Menu, PanelLeft } from 'lucide-react';
import { defineMessages, useIntl } from '../../i18n';
import { Button } from '../ui/button';
import ChatSessionsContainer from '../ChatSessionsContainer';
import { useChatContext } from '../../contexts/ChatContext';
import { NavigationProvider, useNavigationContext } from './NavigationContext';
import { Navigation } from './NavigationPanel';
import FilesPanel from '../files/FilesPanel';
import { useChatWorkingDir } from '../files/useChatWorkingDir';
import { Z_INDEX } from './constants';
import { cn } from '../../utils';
import { UserInput } from '../../types/message';

const i18n = defineMessages({
  openNavigation: {
    id: 'appLayout.openNavigation',
    defaultMessage: 'Open navigation',
  },
  collapseNavigation: {
    id: 'appLayout.collapseNavigation',
    defaultMessage: 'Collapse navigation',
  },
  openFiles: {
    id: 'appLayout.openFiles',
    defaultMessage: 'Open files panel',
  },
});

// Files side panel sizing; persisted like the nav panel's width. The max is
// generous so the editor can be used as a real writing pane, not just a peek.
const MIN_FILES_PANEL_WIDTH = 200;
const MAX_FILES_PANEL_WIDTH = 800;
const DEFAULT_FILES_PANEL_WIDTH = 260;

interface AppLayoutContentProps {
  activeSessions: Array<{
    sessionId: string;
    initialMessage?: UserInput;
    noAutoSubmit?: boolean;
  }>;
}

const AppLayoutContent: React.FC<AppLayoutContentProps> = ({ activeSessions }) => {
  const intl = useIntl();
  const location = useLocation();
  const safeIsMacOS = (window?.electron?.platform || 'darwin') === 'darwin';
  const chatContext = useChatContext();
  const isOnPairRoute = location.pathname === '/pair';

  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!safeIsMacOS) return;
    window.electron
      .getIsFullScreen()
      .then(setIsFullScreen)
      .catch(() => {});
    const handler = (_event: IpcRendererEvent, ...args: unknown[]) => {
      setIsFullScreen(Boolean(args[0]));
    };
    window.electron.on('fullscreen-change', handler);
    return () => window.electron.off('fullscreen-change', handler);
  }, [safeIsMacOS]);

  const { isNavExpanded, setIsNavExpanded, navWidth, setNavWidth } = useNavigationContext();
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = navWidth;
      setIsDragging(true);
      e.preventDefault();
    },
    [navWidth]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      setNavWidth(startWidth.current + (e.clientX - startX.current));
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        setIsDragging(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setNavWidth]);

  // Files side panel: expanded state + width, mirroring the nav panel's
  // hand-rolled persistence and drag-resize pattern above.
  const [isFilesExpanded, setIsFilesExpanded] = useState<boolean>(
    () => localStorage.getItem('files_panel_expanded') === 'true'
  );
  const toggleFilesPanel = useCallback(() => {
    setIsFilesExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('files_panel_expanded', String(next));
      return next;
    });
  }, []);
  const [filesWidth, setFilesWidthState] = useState<number>(() => {
    const parsed = parseInt(localStorage.getItem('files_panel_width') ?? '', 10);
    return !isNaN(parsed) && parsed >= MIN_FILES_PANEL_WIDTH && parsed <= MAX_FILES_PANEL_WIDTH
      ? parsed
      : DEFAULT_FILES_PANEL_WIDTH;
  });
  const setFilesWidth = useCallback((width: number) => {
    const clamped = Math.min(MAX_FILES_PANEL_WIDTH, Math.max(MIN_FILES_PANEL_WIDTH, width));
    setFilesWidthState(clamped);
    localStorage.setItem('files_panel_width', String(clamped));
  }, []);
  const [isFilesDragging, setIsFilesDragging] = useState(false);
  const isFilesResizing = useRef(false);
  const filesStartX = useRef(0);
  const filesStartWidth = useRef(0);

  const handleFilesResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isFilesResizing.current = true;
      filesStartX.current = e.clientX;
      filesStartWidth.current = filesWidth;
      setIsFilesDragging(true);
      e.preventDefault();
    },
    [filesWidth]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isFilesResizing.current) return;
      // Panel sits on the right, handle on its left edge: dragging left widens it.
      setFilesWidth(filesStartWidth.current - (e.clientX - filesStartX.current));
    };
    const handleMouseUp = () => {
      if (isFilesResizing.current) {
        isFilesResizing.current = false;
        setIsFilesDragging(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setFilesWidth]);

  const filesRootDir = useChatWorkingDir(isFilesExpanded);

  if (!chatContext) {
    throw new Error('AppLayoutContent must be used within ChatProvider');
  }

  const { setChat } = chatContext;

  const needsTrafficLightInset = safeIsMacOS && !isFullScreen;
  const headerPadding = needsTrafficLightInset ? 'pl-[96px]' : 'pl-4';
  const headerTop = needsTrafficLightInset ? 'top-[14px]' : 'top-[11px]';
  const navToggleTitle = intl.formatMessage(
    isNavExpanded ? i18n.collapseNavigation : i18n.openNavigation
  );
  const filesToggleTitle = intl.formatMessage(i18n.openFiles);

  return (
    <div className="flex flex-1 w-full h-full relative animate-fade-in bg-background-primary flex-row">
      <div
        style={{ zIndex: Z_INDEX.HEADER }}
        className={cn('absolute flex items-center gap-1', headerPadding, headerTop, 'ml-1.5')}
      >
        <Button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          className="no-drag hover:!bg-background-tertiary"
          variant="ghost"
          size="xs"
          title={navToggleTitle}
          aria-label={navToggleTitle}
        >
          {isNavExpanded ? <PanelLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Files panel opener, top-right above where the panel appears. Only
          shown while collapsed — the open panel carries its own collapse
          button in its header. */}
      {!isFilesExpanded && (
        <div
          style={{ zIndex: Z_INDEX.HEADER }}
          className={cn('absolute right-4 flex items-center', headerTop)}
        >
          <Button
            onClick={toggleFilesPanel}
            className="no-drag hover:!bg-background-tertiary"
            variant="ghost"
            size="xs"
            title={filesToggleTitle}
            aria-label={filesToggleTitle}
          >
            <FolderTree className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Main content with navigation. Shared white canvas; the sidebar is a
          rounded outlined card floating on it with breathing room. */}
      <div className="flex flex-1 w-full h-full min-h-0 flex-row">
        <motion.div
          key="nav"
          initial={false}
          animate={{ width: isNavExpanded ? navWidth : 0 }}
          transition={
            isDragging ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 40 }
          }
          style={{ height: '100%' }}
          className="relative flex-shrink-0 overflow-hidden h-full p-2"
        >
          <div className="w-full h-full overflow-hidden rounded-xl border border-border-primary">
            <Navigation />
          </div>
          {isNavExpanded && (
            <div
              className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-border-primary/30 transition-colors"
              onMouseDown={handleResizeMouseDown}
            />
          )}
        </motion.div>

        {/* Main content — no border / no card; just flows on the canvas. */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Outlet />
          {/* Always render ChatSessionsContainer to keep SSE connections alive.
              When navigating away from /pair, hide it with CSS */}
          <div className={isOnPairRoute ? 'contents' : 'hidden'}>
            <ChatSessionsContainer setChat={setChat} activeSessions={activeSessions} />
          </div>
        </div>

        {/* Files side panel, right of the chat: same floating-card pattern as
            the nav. Kept mounted so tree/editor state survives toggling;
            polling pauses while collapsed via the `active` prop. */}
        <motion.div
          key="files-panel"
          initial={false}
          animate={{ width: isFilesExpanded ? filesWidth : 0 }}
          transition={
            isFilesDragging ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 40 }
          }
          style={{ height: '100%' }}
          className="relative flex-shrink-0 overflow-hidden h-full p-2"
        >
          <div className="w-full h-full overflow-hidden rounded-xl border border-border-primary">
            <FilesPanel
              rootDir={filesRootDir}
              active={isFilesExpanded}
              onCollapse={toggleFilesPanel}
            />
          </div>
          {isFilesExpanded && (
            <div
              className="absolute left-0 top-0 h-full w-2 cursor-col-resize hover:bg-border-primary/30 transition-colors"
              onMouseDown={handleFilesResizeMouseDown}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

interface AppLayoutProps {
  activeSessions: Array<{
    sessionId: string;
    initialMessage?: UserInput;
    noAutoSubmit?: boolean;
  }>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeSessions }) => {
  return (
    <NavigationProvider>
      <AppLayoutContent activeSessions={activeSessions} />
    </NavigationProvider>
  );
};
