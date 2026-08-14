# Onboarding a student

<!-- PROPOSED. Read this when creating a new student, or whenever a paper
     checklist arrives and the Known flags need updating. -->

Read this when a student folder is new or empty, when the tutor says they have a new student, or when a paper checklist is uploaded.

## What already exists

The app has already created the student's folder from `_new-student-template/`, containing their profile (named for the student), `sounds.md`, `sight-words.md`, and an empty `lesson-plans/`. Do not create or copy these files — they are there.

The `sounds.md` and `sight-words.md` it copied ship with **every row `false`**, so the starting assumption is that nothing is known and each concept must be explicitly marked.

Your job is to fill in the profile and mark what the student already knows.

## Filling in the profile

The profile file (`<StudentName>.md`) has five sections. Fill them by interviewing the tutor — one question at a time, not as a form. If the tutor doesn't know an answer, leave the placeholder and move on; it can be filled in over the first few sessions.

- **Interests** — what the student likes: animals, sports, games, shows, hobbies. This drives word choice and the oral reading passage. "(not yet recorded)" is fine to start.
- **Current Lesson Topic(s)** — what is being worked on right now, and what is explicitly NOT yet taught, so content stays inside the student's known sounds. Record the "Not yet taught (avoid in content)" list: the traps that matter for this student — e.g. drop-silent-e rule, schwa, y2 (candy /ē/), prefixes, r-controlled, vowel teams.
- **Concept sequence (most recent last)** — one line per lesson, newest at the bottom, using absolute dates. **This list is the authority on recency, not the row order in `sounds.md`.** If the tutor can recall the last few concepts taught and in what order, record them now; it is what the review sections depend on.
- **Recent Errors** — one line per error: date, reading or spelling, the word, what the student produced, and WHY. The "why" is what drives the next lesson's blending minimal pairs, so name the confusion, not just the word.
- **Notes** — anything that affects content generation but isn't captured by the sounds/sight-word files: inconsistencies between marked-known concepts, accommodations, pacing, things to re-check.

## Marking what the student knows

In `sounds.md`, flip `Known` to `true` for everything the student has already mastered. In `sight-words.md`, flip `Known` to `true` for the sight words the student reads on sight. Everything starts `false`.

**Never infer what a student knows from row position.** `sounds.md` row order is the DEFAULT teaching sequence, not a record of what any given student was actually taught. The `Known` flag is the only authority. A student may have VCe `true` while VCCV is still `false`, or the reverse.

## Updating sounds.md from a paper checklist

The real record of what a student has mastered lives on a **paper checklist**, which gets uploaded as a photo or scan. `sounds.md` is downstream of that paper — when a checklist arrives, transcribe it into the `Known` flags.

**The paper is less granular than `sounds.md`.** One checked box on paper often covers many rows in the file. Expand one-to-many when the mapping is unambiguous:

| A checked paper item like… | …maps to |
| --- | --- |
| "blends" / "initial blends" | `Concept: Initial blends` + every `initial blend` row |
| "final blends" | `Concept: Final blends` + every `final blend` row |
| "digraphs" | `Concept: Digraph` + sh, th1, th2, ch, wh |
| "VCe" / "silent e" / "magic e" | the whole flex-marked VCe block — a-e, i-e, o-e, u-e ×2, e-e, y-e, s2, Silent e, VCe Syllable, Long vowel sounds |
| "suffixes" | `Concept: Suffix` + the individual `Anglo Saxon suffix` rows, but NOT the doubling / drop-silent-e rules unless separately checked |
| "open syllable" | `Open Syllable` + e (secret), o (pony), a (baby), i (spider), u (music/ruby) |
| "r-controlled" | `R controlled syllable` + er, ar, or, ir, ur |

**Rules for the transcription:**

- **Over-marking is the dangerous direction.** A concept wrongly set to `true` produces lesson content the student cannot read; wrongly `false` only makes a lesson easier than it needed to be. When genuinely unsure, leave it `false` and ask.
- **Ask rather than guess on ambiguous items.** Paper checklists rarely distinguish things the file separates — e.g. `soft c1` (ce ending) vs `soft c2` (c before e/i/y), `y2` (candy) vs `y` (cyclone), `oo` (food) vs `oo` (book), the two-stage `ed` sounds. List the ambiguous ones and ask, rather than picking one.
- **Never silently downgrade.** If the paper does not mention something currently marked `true`, do not flip it to `false` — the paper may just be a partial update. Flag it and ask.
- **Always report the diff.** After updating, list exactly which rows changed and in which direction, so it can be checked against the paper. Include a count.
- **Update the profile too.** If the checklist shows concepts taught since the last profile update, add them to the profile's **Concept sequence (most recent last)**, since that list is the authority on recency.
