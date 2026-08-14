/**
 * The tutor workspace: a folder tree on the OS desktop, materialized from
 * templates bundled with the app.
 *
 *   Lira Tutor/
 *     _guide/                  agent instructions (onboarding, lesson planning)
 *     lesson-plan-template.md  the blank plan every lesson is built from
 *     Students/<Name>/         one binder: .goosehints, <Name>.md, sounds.md,
 *                              sight-words.md, lesson-plans/
 *
 * All state lives on disk; this module is just conventions + scaffolding.
 */
import studentHints from '../../templates/student.goosehints?raw';
import profileTemplate from '../../templates/STUDENT-NAME.md?raw';
import soundsTemplate from '../../templates/sounds.md?raw';
import sightWordsTemplate from '../../templates/sight-words.md?raw';
import lessonPlanTemplate from '../../templates/lesson-plan-template.md?raw';
import lessonPlanningGuide from '../../templates/guide/lesson-planning.md?raw';
import onboardingGuide from '../../templates/guide/onboarding.md?raw';

export interface StudentEntry {
  name: string;
  path: string;
}

const WORKSPACE_DIR_NAME = 'Lira Tutor';
const NEW_STUDENT_TEMPLATE_DIR = '_new-student-template';

/**
 * Files a tutor may edit from Settings. Deliberately excludes `_guide/` — the
 * teaching method and agent instructions are ours, not the tutor's.
 */
export const EDITABLE_TEMPLATES: { relativePath: string; label: string; description: string }[] = [
  {
    relativePath: 'lesson-plan-template.md',
    label: 'Lesson plan',
    description: 'The blank plan every lesson is built from. Change this to match your format.',
  },
  {
    relativePath: `${NEW_STUDENT_TEMPLATE_DIR}/STUDENT-NAME.md`,
    label: 'Student profile',
    description: 'The profile layout each new student starts with.',
  },
  {
    relativePath: `${NEW_STUDENT_TEMPLATE_DIR}/sounds.md`,
    label: 'Sounds catalog',
    description: 'The scope and sequence new students start from. Every row starts unknown.',
  },
  {
    relativePath: `${NEW_STUDENT_TEMPLATE_DIR}/sight-words.md`,
    label: 'Sight words',
    description: 'The sight-word list new students start from.',
  },
];

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
  };
  for (const [name, content] of Object.entries(guideFiles)) {
    await window.electron.writeFile(join(root, '_guide', name), content);
  }
  // The blank plan every lesson is built from; the guide files reference it.
  await window.electron.writeFile(join(root, 'lesson-plan-template.md'), lessonPlanTemplate);

  // New students are stamped from these files on disk, not from the bundle, so
  // a clinic can adapt the scope-and-sequence or profile layout to their own
  // practice and have it apply to everyone they add afterwards.
  const templateDir = join(root, NEW_STUDENT_TEMPLATE_DIR);
  await window.electron.ensureDirectory(templateDir);
  const seedFiles: Record<string, string> = {
    'STUDENT-NAME.md': profileTemplate,
    'sounds.md': soundsTemplate,
    'sight-words.md': sightWordsTemplate,
  };
  for (const [name, content] of Object.entries(seedFiles)) {
    await window.electron.writeFile(join(templateDir, name), content);
  }
}

/**
 * Read a workspace template, falling back to the version bundled with the app
 * if the tutor has deleted it.
 */
async function readTemplate(root: string, name: string, fallback: string): Promise<string> {
  const response = await window.electron.readFile(
    join(root, NEW_STUDENT_TEMPLATE_DIR, name)
  );
  return response.found && response.file.trim() ? response.file : fallback;
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
  // Profile filename tracks the student's name, matching the tutor's own
  // convention (maya/Maya.md). Sounds and sight words ship all-false: nothing
  // is assumed known until it is explicitly marked.
  await window.electron.ensureDirectory(join(dir, 'lesson-plans'));
  await window.electron.writeFile(join(dir, '.goosehints'), studentHints);
  await window.electron.writeFile(
    join(dir, `${name}.md`),
    await readTemplate(root, 'STUDENT-NAME.md', profileTemplate)
  );
  await window.electron.writeFile(
    join(dir, 'sounds.md'),
    await readTemplate(root, 'sounds.md', soundsTemplate)
  );
  await window.electron.writeFile(
    join(dir, 'sight-words.md'),
    await readTemplate(root, 'sight-words.md', sightWordsTemplate)
  );
  return { name, path: dir };
}

/**
 * Move a student's binder to the OS trash. Deliberately not a hard delete:
 * this folder holds the only copy of that student's records.
 */
export async function deleteStudent(student: StudentEntry): Promise<boolean> {
  return window.electron.trashItem(student.path);
}
