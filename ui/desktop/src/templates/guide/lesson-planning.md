# Writing a lesson plan

<!-- PROPOSED. Read this before writing any lesson plan. Text is carried over
     from the original agents.md unchanged except where a heading moved. -->

## Before creating anything

Look in the student's folder and read:

1. **The student's profile file** (e.g. `Students/Maya/Maya.md`) — their interests, recent errors,  and current lesson topics
2. **The student's `sounds.md`** — the catalog of sound patterns and which ones are marked known.
3. **The student's `sight-words.md`** — the list of sight words and which ones are marked known.
4. **The student's recent lesson plans** in `lesson-plans/` — see "Check previous lesson plans" below. This is not optional; a lesson written without reading the last few will repeat words and concepts.

## Check previous lesson plans

Before writing a new plan, read the **last 3 lesson plans** in the student's `lesson-plans/` folder (by date in the filename). They tell you three things you cannot get anywhere else:

1. **Which words are burnt.** Do not reuse a content word that appeared in any of the last 3 lessons. The no-reuse rule inside a single lesson (see below) extends ACROSS lessons at this range — a student who sees "shed" four lessons running is memorizing it, not decoding it. Common function words and known sight words are exempt, as always.
2. **What was actually taught, in order.** The most recent plan's focus is the **previous concept**, which the review sections must keep warm. Cross-check it against the profile's Concept sequence; if they disagree, the lesson plans are the record of what happened and the profile needs updating.
3. **What the review has been skewing toward.** If the last two lessons both built their review grid mostly from closed+vce, deliberately rebalance this one toward the other division types the student knows. Same for the oral reading passage — check the previous titles and topics so the new passage is genuinely different, not a third story about the same animal.

When a student has fewer than 3 lesson plans, read all of them. When the folder is empty, this is their first lesson: say so, and build the review sections from the earliest concepts marked known.

### Teaching order is not fixed

`sounds.md` row order is the DEFAULT sequence, not a rule about what any given student was actually taught. The file has a **Sequence** column marking where the order legitimately varies:

- `flex: may precede VCCV` — the 1-syllable VCe block (a-e, i-e, o-e, u-e, e-e, y-e, s2, Silent e, VCe Syllable, Long vowel sounds). Many teachers introduce 1-syllable VCe BEFORE moving to 2-syllable VCCV work; either order is valid.
- `flex point — VCe may precede` — marks VCCV Syllabication, the row the VCe block may jump ahead of.
- `needs VCCV + VCe` — the merge point (VCCV VCCCV closed+vce / vce+closed). It requires BOTH, whichever was taught first, so it is never available until both are `true`.

**Two consequences, both mandatory:**

1. **Never infer what a student knows from row position.** The `Known` flag is the only authority on what is allowed in content. A student may have VCe `true` while VCCV is still `false` — that student reads 1-syllable VCe words (safe, brine, home) and NO 2-syllable words at all, because no division type is known yet. The reverse is equally possible.
2. **For RECENCY — what counts as "the previous concept" and "most recently taught" — the student profile's "Concept sequence (most recent last)" is the authority, NOT sounds.md row order.** Read the profile's sequence list first and use its last entry as the previous concept. Only fall back to sounds.md order if the profile has no sequence recorded. This matters for the review sections, which must keep the genuinely previous concept warm.

## How to write the plan out

Save the finished plan to the student's `lesson-plans/` folder as
`YYYY-MM-DD-concept.md`, built from `lesson-plan-template.md` at the workspace root.

**The plan is YAML, not prose.** The template's front matter is the school's
printed form: every key is a field on the page, and the field names must match
`_export/school-template.tex` exactly. Do not rename, add, or remove keys — a
renamed key silently prints as a blank line.

- Fill a key with the content for that field. Multiple words go in one string,
  comma-separated, unless the form gives numbered slots.
- **Quote every value.** Auditory drill entries contain a colon
  (`aud1: "e: e, ee, ea"`), and an unquoted colon is invalid YAML — pandoc then
  fails on the whole file rather than that one field. Double quotes are safest;
  escape any double quote inside a value as `\"`.
- Keep entries short. Fields are fixed-width cells on a printed form; a long
  string overflows the cell and is clipped rather than wrapped.
- The numbered slots take one item each: `sp1`–`sp9` (review spelling),
  `nsp1`–`nsp9` (new-concept spelling), `aud1`–`aud12` (auditory drill, written
  without slashes).
- Leave a key empty when the tutor fills that field in by hand. Empty prints as
  a blank line, which is correct — do not invent content to fill space.
- The oral reading passage goes in the body below the front matter, not in a
  key. The form has room only for `oral_title`. Write the passage out in full
  anyway; it is read from the file, not the PDF.

## Exporting to PDF

When the tutor asks for a PDF, or for the plan "on the school form", run:

```
bash _export/export-pdf.sh <the-lesson-plan.md> <output.pdf>
```

Paths are relative to the workspace root. Save the PDF beside the markdown in
the same `lesson-plans/` folder.

This needs `pandoc` and a LaTeX engine (`pdflatex` or `tectonic`) installed on
the machine. If the script reports one is missing, say so plainly and tell the
tutor what to install — do not try to produce the PDF another way, and do not
hand-write LaTeX. The markdown plan is still complete and usable without it.

## Lesson Plan Criteria:

**Focused Reteach :
Lesson focus is a concept that the student has already learned, but I am going to teach it like they don't know it. SO I don't want any content in the review sections to include that sound/concept. 

Blending uses nonsense words. At the 1 syllable level the student touches each sound then blend it into a word (s p l u n d). At the 2 syllable level the student read each syllable then blends into a word (splut tone). Nonsense words must adhere to regular english pattern and use commn splelling rules for example in English word do not end in a v so the nonsense word (t a v) would not be used but (v i t) is ok. Same with floss endings (v e f) is bad but (v e f f) is ok assumeing they know the floss rule. Always try to include the previous day's concept and error concepts into this section.

**Cover EVERY error concept in blending, not just some of them:** work through the student's recent errors one by one and make sure each one has at least one nonsense word built to target it — a blend they reduced, a vowel they swapped, a spelling choice they missed (soft c, VCe), a suffix they dropped. Where a vowel or sound was confused, give a MINIMAL PAIR so the contrast is explicit (sat→"sits" becomes vam / vim). It is fine — expected, even — for this section to run longer than the blanks on the template; add as many nonsense words as the error list requires, and group them with a short label saying which error each targets. Blending is where errors get isolated cleanly, since nonsense words cannot be guessed from context.

Make sentence interesting and use less predictable words (obscure words) but the sentence should still make  sense.

This applies to the WORD LISTS too, not just sentences: within the reading and spelling lists, favor less common, more obscure decodable words over the most predictable ones — e.g. prefer "membrane, compote, obtuse, mundane" over "cupcake, sunshine, explode"; "quince, brine, ruse, phlox" over "nose, go, home". Every word must still be fully decodable with the student's known sounds. Common little words are fine only when a concept genuinely offers nothing more interesting that is still decodable.

Vary the sentence structure within a set: no two sentences should start with the same word, and mix sentence types (statements, questions, commands). For example, rather than two sentences that both start with "You," turn one into a question — "Did you stretch to catch the batch?" Any word used to start or vary a sentence (Did, Can, Is, His, etc.) must still be decodable with the student's known sounds or be on their known sight-word list. Make the sentence interesting. Start with short sentences and the last 2 sentences should be longer.

**Spelling sentences must be SHORT and comma-free:** the student has to hold the whole sentence in memory while spelling it, so every sentence in a spelling section (cumulative review spelling AND new-concept spelling) must be about 5 words long and contain NO commas. Simple subject-verb-object. Reading sentences are the opposite — those can and should be longer, with commas and clauses, since the student is looking at the text.

**Every sentence must actually make sense:** do not force a target word into a slot where it does not belong. A sentence can be perfectly decodable and still be nonsense ("a hosted band strolled to the pond", "a rigid tomcat"). Check that each word is used in a real, idiomatic meaning — that adjectives genuinely fit their nouns and verbs genuinely fit their subjects. If a target word will not sit naturally in a sentence, use a different form or a different word rather than bending the sentence around it. This matters most when a concept has a small word pool, because that is exactly when the temptation to jam a word in is strongest.

**MEANING CHECK — say what each content word MEANS, then re-read the sentence:** decodability is checked letter by letter; meaning has to be checked word by word, and it is a SEPARATE pass. For every content word in every sentence and passage, name its actual dictionary meaning to yourself and substitute that meaning back into the sentence. If the sentence stops making sense with the real meaning plugged in, the sentence is broken — rewrite it.

- The failure mode is picking a word for its SOUND and then treating it as a generic noun/verb. Example caught in a real lesson: "The bash in the hut had a big pot of jam" — *bash* was chosen because it ends in `sh`, then used as if it meant a container or a room. A **bash is a party**, and a party cannot "have a pot of jam." Substituting the real meaning ("The party in the hut had a big pot of jam…") exposes it immediately.
- Watch especially for words with a meaning NARROWER than the slot you put them in: *bash* (party, or a hard hit), *shim* (thin wedge), *sham* (a fake), *fen* (marsh), *hob* (stove shelf), *rut* (groove), *cud* (chewed food), *vim* (energy), *jib* (sail), *compote*, *ruse*, *phlox*. These are exactly the obscure words the lesson plan asks for, which is precisely why they need the meaning check — the instruction to favor less-common words CREATES this risk rather than avoiding it.
- **Never let an obscure word into a sentence unless you can state its meaning.** If you cannot define it confidently, do not use it — put it in a WORD LIST (where it stands alone and only has to be decoded) or drop it. Word lists tolerate obscure words; sentences do not, because a sentence asserts a relationship between meanings.
- Also check the verb/subject and adjective/noun pairing against the real meaning, not just the part of speech: an inanimate noun cannot "have," "want," or "hold" in the human sense; an event cannot contain objects; an abstract noun cannot be physically moved.
- This check applies to the Oral Reading passage too, sentence by sentence — a passage is where forced words hide most easily behind narrative momentum.

Sentences must match the student's reading level, not sit below it: when a student reads multisyllabic words, the sentences (reading, spelling, and the oral passage) must include a solid share of 2-syllable words too — do NOT fill sentences with only 1-syllable words, which makes the reading far too easy. Since sentence words cannot reuse the lists, pull in FRESH decodable 2-syllable words for the sentences (e.g. reptile, costume, windmill, tadpole, bandit, pinecone, muskrat). The 1-syllable focus words (in a focus/reteach) can carry the target sound while a 2-syllable word carries the reading level in the same sentence.

Do NOT reuse any word across the lesson-plan sections. Blending, syllable/morpheme division, reading words, reading sentences, spelling words, and spelling sentences should each use fresh words, so a given content word appears only ONCE in the whole lesson (e.g. a word in the reading list must not reappear in its own sentences, the spelling list, or the spelling sentences). The ONLY exception is the Oral Reading decodable passage, which MAY reuse words from earlier sections. This applies to content (decodable target) words; common function/glue words and the student's known sight words (the, a, of, to, in, on, at, by, and, when, did, can, she, they …) may recur as needed.

Try not to use the  exact error word, but a similar word with the part of the word that the kids got wrong. For example if they read bread and dread, add a word like "brand".

All syllables must match allowed types. Be careful not to add vowel teams or r-comtroled syllables if not taught. 

**Each phonogram must actually say its taught sound in the word:** it is not enough that a word is spelled with known phonograms — sounding it out with the student's learned sounds must produce the correct pronunciation. Reject words where a known pattern is pronounced irregularly. Most common trap: VCe that does NOT make the vowel long — i-e saying /ē/ (pristine, machine, marine, sardine, routine, cuisine), i-e/a-e/o-e that stays short or schwa (give, live, olive, engine, promise, opposite, definite), or -ile/- ine/-ate endings that reduce (fragile, granite, climate, senate, pirate). If a decodable-looking word would be mis-sounded by a student applying the regular phonogram sounds, do not use it — pick a word that plays fair (e.g. use "brine, spine, incline" instead of "pristine, machine").

Try to use every know suffix and/or prefix throughout the lesson plan.

**Multisyllable tch words:** Only build 2-syllable tch words from a known base word + a known suffix (match + ing = matching, catch + es = catches, stitch + ing = stitching) or a known prefix + base (un + latch = unlatch — only if that prefix is marked known). Do NOT use words where tch sits buried inside a base morpheme (kitchen, ratchet, satchel, hatchet), and do NOT use words that break the short-vowel + tch generalization (e.g. attach — schwa, not a clear short vowel, and doubled t). This keeps every tch inside a base that transparently follows the "single short vowel + tch" rule. The same base + known-affix logic applies to multisyllable ch words (bench + es = benches, munch + ing = munching).

If a student knows VCCV be sure the content includes at least 80% 2 syllable words.

**Match review words to the student's known syllable + division types — and actually SAMPLE across all of them:** Once a student knows VCCV they can read 2-syllable words, so review lists and sentences should be built mainly from 2-syllable words — but ONLY words where every syllable is a known TYPE and the split they need is a known DIVISION. The sounds.md file is ordered simple → complex, but that order is only the DEFAULT sequence — see "Teaching order is not fixed" above for how to determine what was actually taught most recently. The review must reflect the student's most RECENTLY taught concepts and must NOT default to closed or closed+vce. Each concept the student adds unlocks a category (later stages include the earlier ones):

- VCCV + closed → pic·nic, bas·ket, nap·kin (closed + closed)
- + VCe → cos·tume, com·pete, base·ball (closed + vce, or vce + closed compound)
- + known suffixes / Morpheme Division → base + a KNOWN suffix: rest·ing, box·es, dust·ed, help·ful, sad·ness, glad·ly, wind·y (use only suffixes the student knows; these practice morpheme division)
- + V.CV + open → ho·tel, si·lent, ro·bot, pi·lot, ba·sin (open + closed)
- + VC.V → prof·it, cam·el, rab·bit, lem·on, plan·et (single-consonant split that keeps the first vowel short)
- + consonant-le (cle) division → bub·ble, can·dle, lit·tle

**Representation requirement:** do NOT let one category (especially closed+vce) dominate. A ~25-word review grid must include at least 2–3 words from EACH division/syllable type the student has recently learned — so if the student knows suffixes, several words must carry a suffix; if they know V.CV/open, several must be open-first; if they know VC.V, several must be that split; if they know cle, include cle words. A grid that is all closed+vce is WRONG when the student also knows suffixes and V.CV/VC.V. A word is only fair game if ALL its syllable types and the division it needs are known (do not use "hotel"/"camel" before V.CV/VC.V, or "candle" before cle). If the last lesson skewed to one type, deliberately rebalance.

**Keep the previous concept warm in review:** the review spelling list should include at least 2 words that use the previous lesson's concept, and every cumulative review sentence (reading review AND spelling review) should contain at least one previous-concept word. (The New Concept / focus sentences feature the focus sound instead, not the previous concept.)

If a student has not learned the 1-1-1 doubling rule or drop the silent e avoid words like: swimming or waking.

**Auditory Drill:** Format each entry as a target sound followed by its spellings, listing ONLY the spellings the student already knows. Example: /e/: e, e-e, ee, ea, ie, ei, y, y-e (# based on student's known concepts). /s/: s, c  (ss is redundant and not needed) 

The drill has two kinds of entries:
- **Error-based sounds:** the specific sound patterns the student missed in recent lessons (from their profile's Recent Errors / Current Lesson Topics). Always include these so the student re-practices what they just got wrong. These may be single phonograms, blends (e.g. spl, dr), or suffixes (e.g. -ing).
- **Review sounds:** a rotating set of other previously-taught sounds to keep them warm.

For a Focused Reteach, still exclude the focus sound/concept from the drill (as with all review sections), but error-based sounds from OTHER concepts should stay in..

The focus or focus reteach should use mostly 1 syllable words (if possible) for the target concept words but other words can be multisylabic if appropriate).

**Reading and spelling must sit at the SAME level:** the reading word list and the spelling word list must have a comparable mix of 1-syllable and multisyllable words. Do NOT load all the 1-syllable base words into reading and all the 2-syllable suffixed words into spelling (or the reverse) — a student who reads 2-syllable words must also spell them. When a concept has a small word pool (e.g. oll/ost/olt, which has only ~15 base words in English) and you extend it by adding known suffixes, distribute the base forms AND the suffixed forms across BOTH lists so each list ends up roughly balanced (about half 1-syllable, half 2-syllable). The same applies to the reading sentences vs the spelling sentences.

Syllable types: 
closed: vowel sounds short: cat, at, job
vce: silent e make vowel long: date, bone, care, store 
open syllable: no, she, he, my
r-controlled: bird, car, for, barn\
vowel team: (sometimes called diphthong) sight, play, stew, see, bread, boil, toad, 
cle: (2 syllable words that end in consonant  le): candle, pickle, humble

examples: burger: VC.CV (r-controlled. r-controlled), teacup V.CV (underline the 2 vowels) (vowel team. closed), robot V.CV (open. closed), table (cle count back 3 scoop) open. cle, waffle (cle count back 3 scoop) closed.cle, camel VC.V closed. closed, haggard VC.CV closed, r-controlled, quiet VV open.closed (VV could be a vowel team- syllable division is not a perfect science but a tool to help students decode)

You can combine syllable/morpheme division: impactful closed.closed.suffix, remember prefix. closed.r-controlled, windy closed.suffix

If a student knows VCCV and closed and vce syllable types then they can syllable divide words like: nap.kin or com.pute. If they know VCCV and V.CV and open and  r-controlled syllable types then they can syllable divide words like: ti.ger. or ar.son.  Always try to include the previous concept and error's from the previous lesson in syllable division. 

Each lesson should be unique. Read the last 3 lesson plans in the student's `lesson-plans/` folder and choose different words — see "Check previous lesson plans" above for what to look for. 

**Sight Words (Non-phonetic Words section):** Every lesson, list 3 review sight words drawn ONLY from the student's known sight-word list (prefer ones that actually appear in the lesson's sentences/passage), and suggest 1 new sight word to teach — the next sensible high-frequency word from their not-yet-known list (favor one that connects to what they know, e.g. teach "do" when "does" is already known). Mark the new word clearly as a suggestion.

known sight words can be used to create sentences and decodable passages, but prioritize decodable words. For example, if the student know the sight word "they" the sentences : "They went to the store" is ok but "Grant and Mike went to the store." is better unless they need explicit practice with the sight word they. 

**Oral Reading:** Always write out a full decodable passage in the Oral Reading section — never leave a placeholder or just a title. The passage should feature the lesson's focus concept (and, where it fits, the previous concept and error concepts), stay fully decodable using only the student's known sounds and known sight words, follow the base + known-affix rule for any multisyllable words, and vary sentence structure (no two sentences starting with the same word; mix statements, questions, and commands). Give it a title. Aim for 1-2 short pages. Each passage should be unique and interesting for the student.

**MANDATORY FINAL CHECK — every word, not just the target words:** Before finishing any lesson plan, re-read EVERY section word by word and check each word against the student's sounds.md. The one rule applies to ordinary connector words exactly as much as to focus and content words. Errors almost never appear in the target words — they slip in through short, familiar-feeling words in sentences and passages ("sat DOWN", "a CART", "COUNT them", "a HASTY note"). Do not let a word pass just because it looks simple.

Check every word against these high-frequency traps before it goes in:

- **r-controlled (if r-controlled is not known):** car, cart, part, star, hard, farm, dark, sharp, for, born, corn, short, horse, her, term, bird, girl, first, turn, burn, work, word, world, water, after, over, under, other, another, never, ever, better, letter, dinner, sister, brother, father, mother, corner, winter, summer, garden, morning, order, person, market, party
- **vowel teams (if vowel teams are not known):** down, town, now, how, out, about, around, house, mouse, found, sound, our, day, play, way, say, may, stay, rain, wait, train, see, need, keep, feel, three, tree, green, week, look, book, took, good, food, soon, room, moon, boat, road, coat, snow, know, show, low, grow, slow, light, night, right, might, high, sigh, new, few, grew, saw, draw, boy, toy, boil, join
- **y saying /ē/ (if y2 "candy" is not known):** hasty, funny, happy, silly, very, many, only, party, story, family, city, baby, lady, tiny, empty, plenty, ready, twenty — and this also blocks the -y and -ly suffixes even when those suffixes are marked known, because the y must say /ē/
- **silent-e + suffix (if drop-the-silent-e is not known):** making, taking, hoping, riding, driving, smiling, using, closed, hoped, shined
- **doubling (if the 1-1-1 doubling rule is not known):** swimming, running, stopping, sitting, hopping, getting, bigger, hotter
- **"old" family words (if oll/ost/olt/old/ind/ild are not known):** old, cold, told, sold, gold, hold, bold, most, post, host, roll, bolt, kind, find, mind, child, wild
- **irregular-VCe traps (always):** give, live, have, love, come, some, done, one, gone, engine, promise, olive — these look decodable but break the VCe sound
- **soft c / soft g STAGE 2 (if `soft c2` / `soft g2` are not known):** city, cent, cell, cyst, ice-less positions, gem, giant, gym, gel, germ, ginger, magic, digit — a student who knows only `soft c1` / `soft g1` has learned the **ce / ge ENDING of a vce syllable** (pace, ice, page, cage) and nothing more. They have NOT learned that c says /s/ and g says /j/ before e, i, y generally, so any word where soft c or soft g appears anywhere other than a final ce/ge is off-limits. Sounding out "city" with `soft c1` alone yields /k/ — the student will read "kitty."

Any word not decodable must be either on the student's KNOWN sight-word list or replaced. If a needed word is not decodable and not a known sight word, rewrite the sentence rather than bending the rule.

**Then run the SECOND final pass — meaning.** Decodable is only half the check. Go back through every sentence and every line of the passage and apply the MEANING CHECK above: state what each content word actually means and confirm the sentence still holds with that meaning in place. A lesson is not finished until BOTH passes are clean — a sentence the student can sound out perfectly but that describes something impossible is still a defect, and it is the kind the student will notice.

Update the student's info as they learn accordingly.
