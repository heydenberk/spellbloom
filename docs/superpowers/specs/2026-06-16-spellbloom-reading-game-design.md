# Spellbloom — Reading Game Design Spec

- **Date:** 2026-06-16
- **Status:** Approved (ready for implementation planning)
- **Working title:** Spellbloom (final name TBD)

## Overview

A web-based educational reading game for a 7-year-old who reads simple sentences
and is working on trickier spelling patterns (blends, digraphs, silent-e, vowel
teams). The player is a young mage restoring magic to a sleeping world. To cast a
spell, she **reads a short spell phrase** and then **builds the key word from
letter tiles**. Correct spells bring a magical scene back to life.

The game is one polished activity with a single core mechanic, wrapped in a
fantasy theme with colorful, animated graphics. It is designed to be buildable
quickly and easy to expand later.

## Target Learner

- Age 7, reads simple sentences and short books; knows many sight words.
- Working edge: silent-e (`vine`, `kite`), digraphs (`sh/ch/th`), blends
  (`st/tr/spl`), and vowel teams (`ai/ee/oa`).
- Trains **both** reading (decoding the spell phrase) and spelling/encoding
  (building the key word) — the encoding is the primary skill workout.

## Core Mechanic

Each round:

1. **Spell appears** on a scroll, e.g. *"grow the vine."* The game warmly invites
   her to read it aloud: *"Say the magic words!"*
2. She reads the phrase. A 🔊 button reads it (and individual words) aloud on
   demand if she's stuck — always available, no penalty.
3. **She builds the whole key word** (`v-i-n-e`) by dragging letter tiles into
   slots. The tile tray holds the word's letters plus 2–3 plausible distractor
   letters, shuffled.
   - Default input: **drag-and-drop tiles** (identical UX on iPad and Mac).
   - Optional input: **keyboard typing**, enabled via the grown-up settings panel
     (intended for Mac sessions).
4. **Cast:** when the word is correct, the spell fires — the scene element
   animates to life (the vine blooms) with sparkles + a chime, and she earns a ⭐.

## Meta-Progression

The player restores magic to a series of scenes. Each correct spell fills a
scene's **bloom meter** (~8–10 spells per scene). Completing a scene unlocks the
next, giving a sense of journey:

🌿 Enchanted Glade → 🪷 Moonlit Pond → 🌙 Starry Sky → 🏰 Crystal Castle

- Stars (⭐) accumulate across the game.
- Cosmetic rewards (a pet sprite, wand colors) are a **future** addition once the
  core loop is fun — not in v1 scope.

## Content Model

Content is **data-driven** so new words/scenes are added by editing a data file,
not game code. Each spell entry is roughly:

```
{
  phrase:      "grow the vine",   // what she reads
  word:        "vine",            // what she builds
  scene:       "glade",           // which scene it belongs to
  element:     "vine",            // which scene element animates in
  patternTag:  "silent-e",        // for spaced-repetition targeting
  distractors: ["o", "s"]         // extra tiles in the tray
}
```

Spells are grouped by scene, increasing in difficulty:

| Scene        | Spelling focus               | Example spells                              |
|--------------|------------------------------|---------------------------------------------|
| 🌿 Glade     | short words, simple blends   | grow the fern, wake the frog, light the log |
| 🪷 Pond      | digraphs (sh/ch/th), blends  | splash the fish, ring the shell, swim the duck |
| 🌙 Sky       | vowel teams, silent-e        | shine the moon, fly the kite, light the star |
| 🏰 Castle    | longer / trickier words      | wake the dragon, open the throne, cast the spell |

## Difficulty & Adaptivity (gentle)

- No timers, no lives, no losable score.
- Missed words quietly re-enter the queue later (spaced repetition, keyed on
  `patternTag` and word).
- Mastered words don't nag.
- Grown-up settings let an adult set the starting scene/difficulty.

## "Always Safe to Try" Feedback

Confidence is the top priority. There is no harsh failure state.

- Wrong tile → soft *bloop*, tile floats gently back to the tray. Never a buzzer
  or red X.
- After 1–2 misses → 🔊 sounds the word out slowly, and the next correct slot
  gets a soft glow (a hint, not a giveaway).
- Hints escalate until she succeeds — **every** spell ends in sparkles and a ⭐.
  She should never feel stuck or "wrong," only helped.

## Audio

- **Speech:** browser built-in Web Speech API (`speechSynthesis`) reads spell
  phrases and individual words. Powers the 🔊 helper and the read-aloud nudge.
- **SFX:** playful sparkle / chime / soft bloop cues.
- **Music:** optional gentle ambient background track.
- A sound on/off toggle lives in the grown-up settings panel.

## Art Direction

**Flat vector storybook** style — clean, bold, rounded illustrations (in the
spirit of Khan Academy Kids / Duolingo), drawn entirely in code (CSS/SVG).

- Cohesive and polished without external art files or an artist.
- Scales crisply on any screen; supports smooth animation (growth, sparkle,
  glow, particle effects).
- A painterly / AI-illustrated upgrade is a possible **future** swap-in and is
  out of scope for v1.

## Technical Architecture

- **Single-page web app**: plain HTML/CSS/JavaScript, **no build step**. Runs by
  opening `index.html` or a one-line local static server on both Mac and iPad.
  No app store, no accounts.
- **Persistence:** `localStorage` stores stars, restored scenes, and the
  missed-word queue across sessions.
- **Modules** (each independently understandable and testable):
  - `content` — spell + scene data (the editable word list).
  - `engine` — round flow, scoring/stars, scene progression, spaced-repetition
    queue.
  - `spell-builder` — the read + tile-building interaction (drag-drop + optional
    typing, validation, hints).
  - `scene` — the flat-vector scene rendering and bloom animations.
  - `audio` — speech synthesis + SFX + music, behind the sound toggle.
  - `settings` — grown-up panel (press-and-hold to open) for difficulty, input
    mode, sound, reset.

## Grown-up Settings Panel

Tucked behind a press-and-hold gesture so the child can't easily wander into it:

- Starting scene / difficulty.
- Input mode: tiles (default) vs keyboard typing.
- Sound on/off.
- Reset progress.

## Out of Scope (v1) / Future

- Speech recognition / "say it aloud" verification (encouraged but never
  validated by mic in v1).
- Cosmetic collectibles (pet sprite, wand colors).
- Painterly / AI-generated art.
- Additional scenes beyond the first four.
- Multiple player profiles / accounts.

## Success Criteria

- She can play independently on the iPad and the Mac with no adult setup beyond
  launching it.
- A full spell round (read → build → cast) feels smooth and rewarding, with no
  frustrating failure states.
- She regularly produces correct spellings of target-pattern words and wants to
  come back to restore the next scene.
- Adding a new spell is a one-line edit to the content data file.

## Open Questions

- Final game name (working title: *Spellbloom*).
```
