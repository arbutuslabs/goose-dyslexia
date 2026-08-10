import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  PanelRight,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import MarkdownContent from '../MarkdownContent';
import { Button } from '../ui/button';

// Matches the shape returned by the 'list-directory' IPC handler in main.ts.
interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

// Only open files we can safely treat as text; clicking a binary in a tree
// is easy to do by accident and would freeze the renderer.
const TEXT_EXTENSIONS = new Set([
  'md', 'markdown', 'txt', 'json', 'yaml', 'yml', 'toml', 'csv', 'log',
  'ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'css', 'html', 'sh',
]);

const isTextFile = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return TEXT_EXTENSIONS.has(ext);
};

const isMarkdown = (name: string) => /\.(md|markdown)$/i.test(name);

// How often we re-check the disk so agent/external edits show up without a manual refresh.
const POLL_INTERVAL_MS = 2000;
const SAVE_DEBOUNCE_MS = 600;

interface TreeNodeProps {
  entry: DirectoryEntry;
  depth: number;
  onSelectFile: (entry: DirectoryEntry) => void;
  refreshTick: number;
}

function TreeNode({ entry, depth, onSelectFile, refreshTick }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<DirectoryEntry[]>([]);

  useEffect(() => {
    if (!entry.isDirectory || !expanded) return;
    let cancelled = false;
    window.electron.listDirectory(entry.path).then((entries) => {
      if (!cancelled) setChildren(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [entry.isDirectory, entry.path, expanded, refreshTick]);

  return (
    <div>
      <button
        className="flex w-full items-center gap-1 rounded px-2 py-1 text-left text-sm truncate hover:bg-background-muted"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => (entry.isDirectory ? setExpanded((e) => !e) : onSelectFile(entry))}
        title={entry.path}
      >
        {entry.isDirectory ? (
          <>
            {expanded ? (
              <ChevronDown className="h-3 w-3 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
            )}
            {expanded ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0" />
            )}
          </>
        ) : (
          <FileText className="ml-4 h-4 w-4 flex-shrink-0 opacity-70" />
        )}
        <span className="truncate">{entry.name}</span>
      </button>
      {entry.isDirectory && expanded && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              refreshTick={refreshTick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilesPanelProps {
  /** Directory the tree is rooted at, e.g. the active chat's working dir. */
  rootDir: string;
  /** When false (panel collapsed), disk polling pauses and pending edits are flushed. */
  active?: boolean;
  /** When set, renders a collapse button in the panel header (side-panel use). */
  onCollapse?: () => void;
  className?: string;
}

/**
 * Drill-in file browser: shows the directory tree, and clicking a file
 * replaces the tree with a viewer/editor plus a back button. Used both as
 * the chat side panel (AppLayout) and full-page at /files.
 */
export default function FilesPanel({
  rootDir,
  active = true,
  onCollapse,
  className = '',
}: FilesPanelProps) {
  const [view, setView] = useState<'tree' | 'file'>('tree');
  // Manual folder override via the chooser; cleared when the chat's dir changes.
  const [overrideDir, setOverrideDir] = useState<string | null>(null);
  const effectiveRoot = overrideDir ?? rootDir;

  const [rootEntries, setRootEntries] = useState<DirectoryEntry[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  const [openFile, setOpenFile] = useState<DirectoryEntry | null>(null);
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [status, setStatus] = useState<'clean' | 'dirty' | 'saving' | 'conflict'>('clean');

  // Last content we loaded from or wrote to disk; used to detect external changes.
  const diskContentRef = useRef('');
  const contentRef = useRef(content);
  contentRef.current = content;
  const statusRef = useRef(status);
  statusRef.current = status;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOverrideDir(null);
  }, [rootDir]);

  useEffect(() => {
    if (!effectiveRoot) return;
    let cancelled = false;
    window.electron.listDirectory(effectiveRoot).then((entries) => {
      if (!cancelled) setRootEntries(entries);
    });
    return () => {
      cancelled = true;
    };
  }, [effectiveRoot, refreshTick]);

  const handleSelectFile = useCallback(async (entry: DirectoryEntry) => {
    if (!isTextFile(entry.name)) return;
    const response = await window.electron.readFile(entry.path);
    if (!response.found) return;
    diskContentRef.current = response.file;
    setOpenFile(entry);
    setContent(response.file);
    setStatus('clean');
    setMode(isMarkdown(entry.name) ? 'preview' : 'edit');
    setView('file');
  }, []);

  const flushSave = useCallback(async (entry: DirectoryEntry | null) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (!entry || statusRef.current !== 'dirty') return;
    const ok = await window.electron.writeFile(entry.path, contentRef.current);
    if (ok) {
      diskContentRef.current = contentRef.current;
      setStatus('clean');
    }
  }, []);

  const handleBack = useCallback(async () => {
    await flushSave(openFile);
    setOpenFile(null);
    setStatus('clean');
    setView('tree');
    setRefreshTick((t) => t + 1);
  }, [flushSave, openFile]);

  // Flush pending edits when the panel is collapsed so nothing sits unsaved out of view.
  useEffect(() => {
    if (!active) void flushSave(openFile);
  }, [active, flushSave, openFile]);

  // Poll: keep the visible view in sync with the disk. Tree view refreshes the
  // listing; file view re-reads the open file when we have no unsaved edits,
  // and flags a conflict instead of clobbering when we do.
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(async () => {
      if (view === 'tree') {
        setRefreshTick((t) => t + 1);
        return;
      }
      if (!openFile) return;
      const response = await window.electron.readFile(openFile.path);
      if (!response.found || response.file === diskContentRef.current) return;
      if (statusRef.current === 'clean') {
        diskContentRef.current = response.file;
        setContent(response.file);
      } else {
        setStatus('conflict');
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [active, view, openFile]);

  const scheduleSave = useCallback((entry: DirectoryEntry, newContent: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setStatus('saving');
      const ok = await window.electron.writeFile(entry.path, newContent);
      if (ok) {
        diskContentRef.current = newContent;
        setStatus('clean');
      } else {
        setStatus('dirty');
      }
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const handleEdit = (newContent: string) => {
    if (!openFile) return;
    setContent(newContent);
    if (statusRef.current !== 'conflict') {
      setStatus('dirty');
      scheduleSave(openFile, newContent);
    }
  };

  const resolveConflict = async (keepMine: boolean) => {
    if (!openFile) return;
    if (keepMine) {
      setStatus('saving');
      const ok = await window.electron.writeFile(openFile.path, content);
      diskContentRef.current = content;
      setStatus(ok ? 'clean' : 'dirty');
    } else {
      const response = await window.electron.readFile(openFile.path);
      if (response.found) {
        diskContentRef.current = response.file;
        setContent(response.file);
      }
      setStatus('clean');
    }
  };

  const chooseDirectory = async () => {
    const result = await window.electron.directoryChooser();
    if (!result.canceled && result.filePaths.length > 0) {
      setOverrideDir(result.filePaths[0]);
    }
  };

  const statusLabel = {
    clean: 'Saved',
    dirty: 'Unsaved changes…',
    saving: 'Saving…',
    conflict: 'Changed on disk',
  }[status];

  const collapseButton = onCollapse ? (
    <Button variant="ghost" size="sm" onClick={onCollapse} title="Collapse files panel">
      <PanelRight className="h-4 w-4" />
    </Button>
  ) : null;

  if (view === 'file' && openFile) {
    return (
      <div className={`flex h-full min-h-0 flex-col ${className}`}>
        <div className="flex items-center gap-1 border-b border-border-subtle px-2 py-2">
          <Button variant="ghost" size="sm" onClick={handleBack} title="Back to files">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{openFile.name}</span>
          <span className="flex-shrink-0 text-xs text-text-muted">{statusLabel}</span>
          {isMarkdown(openFile.name) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode((m) => (m === 'edit' ? 'preview' : 'edit'))}
              title={mode === 'edit' ? 'Preview' : 'Edit'}
            >
              {mode === 'edit' ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
          )}
          {collapseButton}
        </div>
        {status === 'conflict' && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-background-muted px-3 py-2 text-xs">
            <span>Changed on disk while you were editing.</span>
            <Button variant="ghost" size="sm" onClick={() => resolveConflict(false)}>
              Load disk version
            </Button>
            <Button variant="ghost" size="sm" onClick={() => resolveConflict(true)}>
              Keep my edits
            </Button>
          </div>
        )}
        {mode === 'preview' && isMarkdown(openFile.name) ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <MarkdownContent content={content} />
          </div>
        ) : (
          <textarea
            className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text-primary outline-none"
            value={content}
            onChange={(e) => handleEdit(e.target.value)}
            spellCheck={isMarkdown(openFile.name)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex h-full min-h-0 flex-col ${className}`}>
      <div className="flex items-center justify-between gap-1 border-b border-border-subtle p-2">
        <button
          className="min-w-0 truncate text-xs text-text-muted hover:text-text-primary"
          onClick={chooseDirectory}
          title={effectiveRoot || 'Choose a folder'}
        >
          {effectiveRoot ? effectiveRoot.split(/[/\\]/).pop() : 'Choose a folder'}
        </button>
        <div className="flex flex-shrink-0 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRefreshTick((t) => t + 1)}
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          {collapseButton}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {rootEntries.map((entry) => (
          <TreeNode
            key={entry.path}
            entry={entry}
            depth={0}
            onSelectFile={handleSelectFile}
            refreshTick={refreshTick}
          />
        ))}
        {effectiveRoot && rootEntries.length === 0 && (
          <div className="px-3 py-2 text-xs text-text-muted">Empty folder</div>
        )}
      </div>
    </div>
  );
}
