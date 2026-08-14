import { useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { EDITABLE_TEMPLATES, getWorkspaceRoot } from '../../hub/tutorWorkspace';

type SaveState = 'clean' | 'dirty' | 'saving' | 'saved' | 'error';

/**
 * Tutor-facing settings: edit the workspace templates that shape generated
 * lesson plans and new student folders.
 *
 * The agent instructions in `_guide/` are deliberately NOT editable here —
 * those encode the teaching method, and a tutor editing them changes how every
 * lesson is built.
 */
export default function TemplateSettings() {
  const [root, setRoot] = useState<string | null>(null);
  const [selected, setSelected] = useState(EDITABLE_TEMPLATES[0].relativePath);
  const [content, setContent] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('clean');
  const [missing, setMissing] = useState(false);

  const active = EDITABLE_TEMPLATES.find((t) => t.relativePath === selected);

  useEffect(() => {
    getWorkspaceRoot().then(setRoot).catch(() => setRoot(null));
  }, []);

  const load = useCallback(async () => {
    if (!root) return;
    const response = await window.electron.readFile(`${root}/${selected}`);
    setMissing(!response.found);
    setContent(response.found ? response.file : '');
    setSaveState('clean');
  }, [root, selected]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!root) return;
    setSaveState('saving');
    const ok = await window.electron.writeFile(`${root}/${selected}`, content);
    setSaveState(ok ? 'saved' : 'error');
  };

  if (!root) {
    return (
      <div className="p-4 text-sm text-text-muted">Loading your workspace…</div>
    );
  }

  const statusLabel = {
    clean: '',
    dirty: 'Unsaved changes',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Could not save',
  }[saveState];

  return (
    <div className="space-y-4 pb-8">
      <Card className="rounded-lg">
        <CardHeader className="pb-0">
          <CardTitle className="mb-1">Templates</CardTitle>
          <CardDescription>
            These shape the lesson plans Lira writes and the files each new student starts
            with. Changes apply to lessons and students created from now on.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 px-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {EDITABLE_TEMPLATES.map((template) => (
              <button
                key={template.relativePath}
                onClick={() => setSelected(template.relativePath)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selected === template.relativePath
                    ? 'border-border-primary bg-background-tertiary/60 text-text-primary'
                    : 'border-border-subtle text-text-secondary hover:bg-background-tertiary/60'
                }`}
              >
                {template.label}
              </button>
            ))}
          </div>

          {active && <p className="mb-3 text-xs text-text-secondary">{active.description}</p>}

          {missing ? (
            <div className="rounded-lg border border-border-subtle p-4 text-sm text-text-muted">
              This file isn&apos;t in your workspace yet. It is created when you set up the
              workspace from the Students screen.
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setSaveState('dirty');
                }}
                spellCheck={false}
                className="h-[420px] w-full resize-y rounded-lg border border-border-subtle bg-background-primary p-3 font-mono text-xs text-text-primary outline-none focus:border-border-primary"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button onClick={handleSave} disabled={saveState === 'saving'} size="sm">
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void load()} title="Discard changes">
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Revert
                </Button>
                <span className="text-xs text-text-muted">{statusLabel}</span>
                <span className="ml-auto truncate text-xs text-text-muted" title={`${root}/${selected}`}>
                  {selected}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
