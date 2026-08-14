/**
 * Hub Component
 *
 * The landing screen: pick a student to start a session, or add a new one.
 * Each student is a folder on disk; selecting one creates a session rooted
 * there and navigates to /pair, where the rest of the chat lifecycle lives.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { defineMessages, useIntl } from '../i18n';
import {
  createStudent,
  deleteStudent,
  getWorkspaceRoot,
  isWorkspaceSetUp,
  listStudents,
  sanitizeStudentName,
  scaffoldWorkspace,
  type StudentEntry,
} from './hub/tutorWorkspace';
import { AppEvents } from '../constants/events';
import LiraLogo from '../images/lira-logo.png';
import { ChatState } from '../types/chatState';
import 'react-toastify/dist/ReactToastify.css';
import { View, ViewOptions } from '../utils/navigationUtils';
import { useConfig } from './ConfigContext';
import { createSession } from '../sessions';
import LoadingGoose from './LoadingGoose';

const i18n = defineMessages({
  goodMorning: { id: 'hub.goodMorning', defaultMessage: 'Good morning' },
  goodAfternoon: { id: 'hub.goodAfternoon', defaultMessage: 'Good afternoon' },
  goodEvening: { id: 'hub.goodEvening', defaultMessage: 'Good evening' },
});

type WorkspaceState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'needs-setup'; root: string }
  | { status: 'ready'; root: string; students: StudentEntry[] };

/** First message sent when opening a session for an existing student. */
const sessionKickoff = (name: string) =>
  `Starting a session with ${name}. Read their profile.md and the recent session log, then help me get started.`;

/** First message sent right after a new student binder is created. */
const onboardingKickoff = (name: string) =>
  `I just added ${name} as a new student. Their profile.md is empty — walk me through onboarding them.`;

function useClock(): { time: string; meridiem: string; hour: number } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  const minutes = now.getMinutes();
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const displayHour = ((hour + 11) % 12) + 1;
  const time = `${displayHour}:${String(minutes).padStart(2, '0')}`;
  return { time, meridiem, hour };
}

export default function Hub({
  setView,
}: {
  setView: (view: View, viewOptions?: ViewOptions) => void;
}) {
  const intl = useIntl();
  const { extensionsList } = useConfig();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const { time, meridiem, hour } = useClock();

  const greeting = useMemo(() => {
    if (hour < 12) return intl.formatMessage(i18n.goodMorning);
    if (hour < 18) return intl.formatMessage(i18n.goodAfternoon);
    return intl.formatMessage(i18n.goodEvening);
  }, [intl, hour]);

  // Tutor workspace: student folders under Desktop/Lira Tutor.
  const [workspace, setWorkspace] = useState<WorkspaceState>({ status: 'loading' });
  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);

  const refreshWorkspace = useCallback(async () => {
    try {
      const root = await getWorkspaceRoot();
      if (await isWorkspaceSetUp(root)) {
        setWorkspace({ status: 'ready', root, students: await listStudents(root) });
      } else {
        setWorkspace({ status: 'needs-setup', root });
      }
    } catch (error) {
      console.error('Failed to load tutor workspace:', error);
      setWorkspace({ status: 'error', message: 'Could not load your workspace folder.' });
    }
  }, []);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  /** Create a session rooted in a student's folder and open it with a kickoff message. */
  const startSessionInDir = async (dir: string, kickoff: string) => {
    if (isCreatingSession) return;
    setIsCreatingSession(true);
    try {
      const session = await createSession(dir, { allExtensions: extensionsList });
      window.dispatchEvent(new CustomEvent(AppEvents.SESSION_CREATED));
      window.dispatchEvent(
        new CustomEvent(AppEvents.ADD_ACTIVE_SESSION, {
          detail: { sessionId: session.id, initialMessage: { msg: kickoff, images: [] } },
        })
      );
      setView('pair', {
        disableAnimation: true,
        resumeSessionId: session.id,
        initialMessage: { msg: kickoff, images: [] },
      });
    } catch (error) {
      console.error('Failed to create session:', error);
      setIsCreatingSession(false);
    }
  };

  const handleSetupWorkspace = async () => {
    if (workspace.status !== 'needs-setup') return;
    try {
      await scaffoldWorkspace(workspace.root);
      await refreshWorkspace();
    } catch (error) {
      console.error('Failed to set up workspace:', error);
      setWorkspace({ status: 'error', message: 'Could not create the workspace folder.' });
    }
  };

  const handleDeleteStudent = async (student: StudentEntry) => {
    const { response } = await window.electron.showMessageBox({
      type: 'warning',
      title: 'Remove student',
      message: `Remove ${student.name}?`,
      detail:
        `Their profile, session log, and all materials will be moved to the Trash. ` +
        `You can put them back from there if this was a mistake.`,
      buttons: ['Cancel', 'Move to Trash'],
      defaultId: 0,
    });
    if (response !== 1) return;

    const ok = await deleteStudent(student);
    if (!ok) {
      setStudentError(`Could not remove ${student.name}.`);
      return;
    }
    await refreshWorkspace();
  };

  const handleCreateStudent = async () => {
    if (workspace.status !== 'ready') return;
    const name = sanitizeStudentName(newStudentName);
    if (!name) {
      setStudentError('Please enter a name.');
      return;
    }
    if (workspace.students.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setStudentError(`You already have a student named ${name}.`);
      return;
    }
    try {
      const student = await createStudent(workspace.root, name);
      setAddingStudent(false);
      setNewStudentName('');
      setStudentError(null);
      await startSessionInDir(student.path, onboardingKickoff(student.name));
    } catch (error) {
      setStudentError(error instanceof Error ? error.message : 'Could not create the student.');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 items-center justify-center px-6 relative">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-6xl font-light text-text-primary tracking-tight tabular-nums">
                {time}
              </span>
              <span className="text-2xl font-light text-text-secondary">{meridiem}</span>
            </div>
            <p className="text-xl text-text-secondary">{greeting}</p>
          </div>
          {/* Artwork is white-on-transparent, made for dark backgrounds, so
              invert it in light mode and leave it alone in dark. */}
          <img
            src={LiraLogo}
            alt="Lira"
            draggable={false}
            className="h-10 w-auto flex-shrink-0 select-none opacity-90 invert dark:invert-0"
          />
        </div>

        {workspace.status === 'error' && (
          <p className="mb-6 text-sm text-text-muted">{workspace.message}</p>
        )}

        {workspace.status === 'needs-setup' && (
          <button
            onClick={handleSetupWorkspace}
            className="mb-6 w-full rounded-xl border border-border-primary p-5 text-left transition-colors hover:bg-background-tertiary/60"
          >
            <div className="mb-1 text-base font-medium text-text-primary">
              Set up your workspace
            </div>
            <div className="text-sm text-text-muted">
              Creates a folder called &quot;Lira Tutor&quot; on your desktop. Each student gets a
              folder inside it with their profile, the sounds and sight words they know, and
              every lesson plan you make.
            </div>
          </button>
        )}

        {workspace.status === 'ready' && (
          <div className="mb-6">
            <p className="mb-3 text-sm text-text-muted">
              {workspace.students.length > 0
                ? 'Who are you working with?'
                : 'Add your first student to get started.'}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {workspace.students.map((student) => (
                <div key={student.path} className="group relative">
                  <button
                    disabled={isCreatingSession}
                    onClick={() =>
                      void startSessionInDir(student.path, sessionKickoff(student.name))
                    }
                    className="flex w-full items-center gap-2 rounded-xl border border-border-primary p-4 pr-9 text-left transition-colors hover:bg-background-tertiary/60 disabled:opacity-50"
                    title={student.path}
                  >
                    <GraduationCap className="h-5 w-5 flex-shrink-0 text-text-muted" />
                    <span className="truncate text-sm font-medium text-text-primary">
                      {student.name}
                    </span>
                  </button>
                  <button
                    onClick={() => void handleDeleteStudent(student)}
                    aria-label={`Remove ${student.name}`}
                    title={`Remove ${student.name}`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-muted opacity-0 transition-all hover:bg-background-tertiary/60 hover:text-text-primary focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {addingStudent ? (
                <form
                  className="col-span-2 flex items-center gap-2 rounded-xl border border-border-primary p-3 sm:col-span-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleCreateStudent();
                  }}
                >
                  <input
                    autoFocus
                    value={newStudentName}
                    onChange={(e) => {
                      setNewStudentName(e.target.value);
                      setStudentError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setAddingStudent(false);
                        setNewStudentName('');
                        setStudentError(null);
                      }
                    }}
                    placeholder="Student's name"
                    className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 text-sm font-medium text-text-primary hover:opacity-80"
                  >
                    Add
                  </button>
                </form>
              ) : (
                <button
                  disabled={isCreatingSession}
                  onClick={() => setAddingStudent(true)}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border-primary p-4 text-left text-text-muted transition-colors hover:bg-background-tertiary/60 hover:text-text-primary disabled:opacity-50"
                >
                  <Plus className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">New student</span>
                </button>
              )}
            </div>
            {studentError && <p className="mt-2 text-sm text-text-muted">{studentError}</p>}
          </div>
        )}

      </div>

      {isCreatingSession && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <LoadingGoose chatState={ChatState.LoadingConversation} />
        </div>
      )}
    </div>
  );
}
