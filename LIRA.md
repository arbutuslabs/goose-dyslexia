# What Lira changes in goose

This fork sits 21 commits on top of upstream goose. To see all of it:

```bash
git diff $(git merge-base upstream/main HEAD)..HEAD --stat
```

## Progress messages (Rust to React)

goose already had a `ProgressMessage` notification that travels over ACP into the renderer's `progressMessage` state, but it was only used for compaction and local model loading. Lira reuses it for normal tool calls.

- `crates/goose/src/agents/state_machine/ops_toolcalling.rs`: `progress_message_for_tool_call()` maps the file a tool call touches to a phrase, and the dispatch loop emits it just before each tool runs. Only the phrase crosses to the UI. The tool name and arguments do not.
- `ui/desktop/src/components/LoadingGoose.tsx`: a real message always wins. When none is active, the loader rotates four generic phrases every 5 seconds.

There are 9 phrases in total: 5 tied to a real file (known sounds, sight words, student profile, recent lessons, writing the plan) and 4 generic fallbacks.

## Prompting

- `crates/goose/src/prompts/system.md`: decodability as the top rule, the known-flag as the only authority on what a student can read, and the student folder layout. Also tells the agent to read large reference files selectively, because one full read of `sounds.md` stayed in context for the whole session.
- `ui/desktop/src/templates/guide/`: the lesson-planning and onboarding guides the agent reads before writing.
- `ui/desktop/src/templates/`: student profile, `sounds.md`, `sight-words.md`, `student.goosehints` and the lesson plan template.

## Tutor-facing UI

- `ui/desktop/src/hooks/useShowToolCalls.ts` and `GooseMessage.tsx`: hide tool calls and thinking by default. Tool calls awaiting approval or that failed are always shown.
- Student picker and workspace scaffolding replace the chat hub. A per-chat files panel shows the student folder.
- Navigation and startup noise trimmed for non-technical users.

## Export

- `ui/desktop/src/templates/export/`: a LaTeX template and `export-pdf.sh` that fill a lesson form from the plan's YAML header.

## Packaging

- `lira://` protocol scheme, macOS bundle id, wordmark and icons.
- `ui/desktop/src/utils/autoUpdater.ts` and `githubUpdater.ts`: auto-update checks this fork's releases, not upstream's.

## Cost tooling

- `tools/log-model-tests.sh` walks goose's `sessions.db` after a round of trials, asks for a rating and thinking effort per session, and appends to a CSV.
- `tools/model-test-log.template.csv` is the column layout.

goose records per-turn `timeToFirstTokenMs` and `elapsedMs` in each assistant message's `metadata_json`, so latency comparisons need no extra instrumentation.
