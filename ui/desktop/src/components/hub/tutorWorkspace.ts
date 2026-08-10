/**
 * The tutor workspace: a folder tree on the OS desktop, materialized from
 * templates bundled with the app.
 *
 *   Lira Tutor/
 *     _guide/            agent-facing skill files (lesson planning, onboarding)
 *     Students/<Name>/   one binder per student (.goosehints, profile, log)
 *
 * All state lives on disk; this module is just conventions + scaffolding.
 */
import studentHints from '../../templates/student.goosehints?raw';
import profileTemplate from '../../templates/profile.md?raw';
import sessionLogTemplate from '../../templates/session-log.md?raw';
import lessonPlanningGuide from '../../templates/guide/lesson-planning.md?raw';
import onboardingGuide from '../../templates/guide/onboarding.md?raw';
import fileRulesGuide from '../../templates/guide/file-rules.md?raw';

export interface StudentEntry {
  name: string;
  path: string;
}

const WORKSPACE_DIR_NAME = 'Lira Tutor';

// Forward slashes are fine on Windows for Node fs calls in the main process.
const join = (...parts: string[]) => parts.join('/');

export async function getWorkspaceRoot(): Promise<string> {
  const desktop = await window.electron.getDesktopPath();
  return join(desktop, WORKSPACE_DIR_NAME);
}

export const getStudentsDir = (root: string) => join(root, 'Students');

/** Set up = the guide files exist. */
export async function isWorkspaceSetUp(root: string): Promise<boolean> {
  const files = await window.electron.listFiles(join(root, '_guide'));
  return files.length > 0;
}

export async function scaffoldWorkspace(root: string): Promise<void> {
  await window.electron.ensureDirectory(join(root, '_guide'));
  await window.electron.ensureDirectory(getStudentsDir(root));
  const guideFiles: Record<string, string> = {
    'lesson-planning.md': lessonPlanningGuide,
    'onboarding.md': onboardingGuide,
    'file-rules.md': fileRulesGuide,
  };
  for (const [name, content] of Object.entries(guideFiles)) {
    await window.electron.writeFile(join(root, '_guide', name), content);
  }
}

export async function listStudents(root: string): Promise<StudentEntry[]> {
  const entries = await window.electron.listDirectory(getStudentsDir(root));
  return entries
    .filter((entry) => entry.isDirectory)
    .map((entry) => ({ name: entry.name, path: entry.path }));
}

/** Strip characters that are unsafe in folder names on any platform. */
export function sanitizeStudentName(raw: string): string {
  return raw
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/^\.+/, '')
    .slice(0, 60)
    .trim();
}

/**
 * Create a student binder from templates. Refuses to touch an existing
 * folder so a duplicate name can never overwrite a real profile.
 */
export async function createStudent(root: string, name: string): Promise<StudentEntry> {
  const dir = join(getStudentsDir(root), name);
  const existing = await window.electron.listFiles(dir);
  if (existing.length > 0) {
    throw new Error(`A student named "${name}" already exists.`);
  }
  await window.electron.ensureDirectory(join(dir, 'materials'));
  await window.electron.writeFile(join(dir, '.goosehints'), studentHints);
  await window.electron.writeFile(join(dir, 'profile.md'), profileTemplate);
  await window.electron.writeFile(join(dir, 'session-log.md'), sessionLogTemplate);
  return { name, path: dir };
}

/**
 * Move a student's binder to the OS trash. Deliberately not a hard delete:
 * this folder holds the only copy of that student's records.
 */
export async function deleteStudent(student: StudentEntry): Promise<boolean> {
  return window.electron.trashItem(student.path);
}
