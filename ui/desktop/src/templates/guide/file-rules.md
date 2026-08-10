# How this workspace is organized

Read this when you're unsure where something lives or how to edit a file.

```
Lira Tutor/
  _guide/            ← these instructions. Never edit them.
  Students/
    <Name>/          ← one folder per student, created by the app
      .goosehints    ← per-student rules. Never edit.
      profile.md     ← what the student knows. Edit only on confirmation.
      session-log.md ← append-only history.
      materials/     ← everything you generate, one dated file each.
```

Editing rules, in one place:

- **profile.md** — headings are a fixed schema; other tools depend on
  them. Add/remove bullets, never headings. Move an item from "Working
  on" to "Known sounds" only when the tutor confirms mastery.
- **session-log.md** — append at the bottom, dated. Never rewrite
  history; if a past entry was wrong, add a correcting note in today's
  entry.
- **materials/** — never overwrite an existing file; new version means
  new dated file.
- Don't create new top-level files or folders in a student's binder
  unless the tutor asks.

The tutor sees these files in the panel beside the chat. Keep them clean,
short, and readable — they are the tutor's records, not your scratch
space.
