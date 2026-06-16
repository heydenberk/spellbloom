# Spellbloom Reading Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build *Spellbloom*, a no-build single-page web game where a 7-year-old reads a short spell phrase, builds the key word from letter tiles, and casts it to bring a magical scene to life.

**Architecture:** Pure-logic ES modules (content, word/tile logic, session queue, progress) are unit-tested with Node's built-in test runner; thin DOM/audio modules render the flat-vector UI and are verified manually in the browser. `main.js` wires them into the round loop. State persists to `localStorage`. No bundler, no dependencies — served as static files.

**Tech Stack:** Plain HTML/CSS/JavaScript (ES modules), `node --test` for logic tests, Web Speech API + Web Audio for sound, `localStorage` for persistence. Dev served via `python3 -m http.server`.

---

## File Structure

```
reading-game/
├── index.html                 # app shell, root containers, module entry
├── styles.css                 # flat-vector theme, layout, animations
├── package.json               # type:module, test + serve scripts
├── src/
│   ├── content.js             # spell + scene DATA and accessors (pure)
│   ├── word.js                # tile-set build, shuffle, word validation, hint index (pure)
│   ├── queue.js               # per-session spell ordering + spaced re-queue (pure)
│   ├── progress.js            # progress state transitions + localStorage adapter
│   ├── engine.js              # session state machine: scene → queue → current spell → misses (pure)
│   ├── audio.js               # speech synthesis + SFX, gated by sound setting
│   ├── main.js                # wiring: engine + progress + UI + persistence
│   └── ui/
│       ├── sceneView.js       # render scene, bloom meter, stars, bloom animation
│       ├── spellBuilder.js    # scroll/phrase/🔊, slots, drag+type tiles, hints, cast
│       └── settings.js        # press-and-hold grown-up panel
└── tests/
    ├── content.test.js
    ├── word.test.js
    ├── queue.test.js
    ├── progress.test.js
    └── engine.test.js
```

Pure modules (`content`, `word`, `queue`, `progress`, `engine`) hold all game rules and are fully tested. UI modules are thin DOM glue verified manually. This keeps logic in context-sized, testable files and the untestable DOM/audio surface minimal.

---

### Task 0: Project scaffold & dev server

**Goal:** A served page that loads the module entry point and a green `node --test` run with one smoke test.

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `styles.css`
- Create: `src/main.js`
- Create: `tests/smoke.test.js`
- Create: `README.md`

**Acceptance Criteria:**
- [ ] `npm test` runs Node's test runner and passes.
- [ ] `npm run serve` serves the app; opening `http://localhost:8000` shows the title "Spellbloom" with no console errors.

**Verify:** `npm test` → `tests 1 / pass 1`; then `npm run serve` and load the page.

**Steps:**

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "spellbloom",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --test",
    "serve": "python3 -m http.server 8000"
  }
}
```

- [ ] **Step 2: Write a smoke test**

```js
// tests/smoke.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('node test runner works', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 3: Run the test, expect pass**

Run: `npm test`
Expected: output includes `# pass 1` and exit code 0.

- [ ] **Step 4: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Spellbloom</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main id="app">
    <header id="hud">
      <span id="stars" aria-label="stars">⭐ 0</span>
      <span id="scene-name">Enchanted Glade</span>
      <span id="bloom-label">0% bloomed</span>
      <button id="settings-btn" aria-label="grown-up settings">⚙️</button>
    </header>
    <section id="scene"></section>
    <section id="spell"></section>
  </main>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create base `styles.css`**

```css
:root {
  --bg-top: #5e60d8; --bg-bottom: #9b6be0;
  --ink: #2a1b4d; --cream: #fff7e6; --gold: #ffd76a; --leaf: #3fa66a;
  --radius: 16px; font-size: 18px;
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; -webkit-user-select: none; user-select: none;
  touch-action: manipulation; font-family: system-ui, -apple-system, sans-serif; }
#app { min-height: 100%; display: flex; flex-direction: column;
  background: linear-gradient(180deg, var(--bg-top), var(--bg-bottom)); color: #fff; }
#hud { display: flex; align-items: center; gap: 12px; padding: 12px 18px; font-weight: 700; }
#hud #scene-name { margin-inline: auto; }
#settings-btn { background: none; border: none; font-size: 22px; cursor: pointer; }
h1, h2 { text-align: center; }
```

- [ ] **Step 6: Create `src/main.js` stub**

```js
// src/main.js — wiring entry point (filled in Task 10)
document.getElementById('scene-name').textContent = 'Enchanted Glade';
console.info('Spellbloom loaded');
```

- [ ] **Step 7: Create `README.md`**

```markdown
# Spellbloom

A magical reading game. Read the spell, build the word, bring the world to life.

## Run it
- `npm run serve` then open http://localhost:8000 (Mac).
- On the iPad: open `http://<your-mac-ip>:8000` while the Mac server runs,
  or deploy the folder to any static host.

## Test the game logic
- `npm test`
```

- [ ] **Step 8: Commit**

```bash
git add package.json index.html styles.css src/main.js tests/smoke.test.js README.md
git commit -m "feat: scaffold Spellbloom app shell, dev server, test runner"
```

---

### Task 1: Content data module

**Goal:** The spell/scene data with the Enchanted Glade fully populated, plus pure accessors, validated by tests.

**Files:**
- Create: `src/content.js`
- Test: `tests/content.test.js`

**Acceptance Criteria:**
- [ ] Four scenes defined in journey order: glade, pond, sky, castle.
- [ ] Glade has at least 8 spells; every spell is internally valid (word appears in phrase, distractors are single new letters, ids unique).
- [ ] `getScenes`, `getScene`, `getSpellsForScene`, `getSpell` behave per tests.

**Verify:** `node --test tests/content.test.js` → all pass.

**Steps:**

- [ ] **Step 1: Write failing tests**

```js
// tests/content.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, SPELLS, getScenes, getScene, getSpellsForScene, getSpell } from '../src/content.js';

test('scenes are in journey order', () => {
  assert.deepEqual(getScenes().map(s => s.id), ['glade', 'pond', 'sky', 'castle']);
});

test('glade has at least 8 spells', () => {
  assert.ok(getSpellsForScene('glade').length >= 8);
});

test('every spell is internally valid', () => {
  const ids = new Set();
  for (const s of SPELLS) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.ok(s.phrase.includes(s.word), `${s.id}: word not in phrase`);
    assert.ok(s.word.length >= 3, `${s.id}: word too short`);
    assert.ok(getScene(s.scene), `${s.id}: unknown scene`);
    for (const d of s.distractors) {
      assert.match(d, /^[a-z]$/, `${s.id}: distractor not a single lowercase letter`);
      assert.ok(!s.word.includes(d), `${s.id}: distractor ${d} already in word`);
    }
  }
});

test('getSpell returns the matching spell or undefined', () => {
  const first = SPELLS[0];
  assert.equal(getSpell(first.id).word, first.word);
  assert.equal(getSpell('nope'), undefined);
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `node --test tests/content.test.js`
Expected: FAIL — `Cannot find module '../src/content.js'`.

- [ ] **Step 3: Implement `src/content.js`**

```js
// src/content.js — spell + scene data and pure accessors

export const SCENES = [
  { id: 'glade',  name: 'Enchanted Glade', emoji: '🌿', order: 0 },
  { id: 'pond',   name: 'Moonlit Pond',    emoji: '🪷', order: 1 },
  { id: 'sky',    name: 'Starry Sky',      emoji: '🌙', order: 2 },
  { id: 'castle', name: 'Crystal Castle',  emoji: '🏰', order: 3 },
];

// pattern: phonics focus tag (for future targeting). distractors: extra tray letters.
export const SPELLS = [
  { id: 'glade-fern', phrase: 'grow the fern', word: 'fern', scene: 'glade', element: 'fern', pattern: 'r-controlled', distractors: ['a', 'o'] },
  { id: 'glade-frog', phrase: 'wake the frog', word: 'frog', scene: 'glade', element: 'frog', pattern: 'blend-fr',     distractors: ['e', 'u'] },
  { id: 'glade-log',  phrase: 'light the log', word: 'log',  scene: 'glade', element: 'log',  pattern: 'cvc',          distractors: ['a', 'p'] },
  { id: 'glade-nest', phrase: 'mend the nest', word: 'nest', scene: 'glade', element: 'nest', pattern: 'blend-st',     distractors: ['a', 'd'] },
  { id: 'glade-bug',  phrase: 'wake the bug',  word: 'bug',  scene: 'glade', element: 'bug',  pattern: 'cvc',          distractors: ['o', 'd'] },
  { id: 'glade-web',  phrase: 'spin the web',  word: 'web',  scene: 'glade', element: 'web',  pattern: 'cvc',          distractors: ['a', 'd'] },
  { id: 'glade-moss', phrase: 'grow the moss', word: 'moss', scene: 'glade', element: 'moss', pattern: 'double-s',     distractors: ['a', 'n'] },
  { id: 'glade-twig', phrase: 'snap the twig', word: 'twig', scene: 'glade', element: 'twig', pattern: 'blend-tw',     distractors: ['e', 'p'] },
  { id: 'glade-pond', phrase: 'fill the pond', word: 'pond', scene: 'glade', element: 'pond', pattern: 'blend-nd',     distractors: ['a', 'm'] },
  { id: 'glade-vine', phrase: 'grow the vine', word: 'vine', scene: 'glade', element: 'vine', pattern: 'silent-e',     distractors: ['o', 's'] },
];

export function getScenes() {
  return [...SCENES].sort((a, b) => a.order - b.order);
}
export function getScene(id) {
  return SCENES.find(s => s.id === id);
}
export function getSpellsForScene(sceneId) {
  return SPELLS.filter(s => s.scene === sceneId);
}
export function getSpell(id) {
  return SPELLS.find(s => s.id === id);
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `node --test tests/content.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/content.js tests/content.test.js
git commit -m "feat: spell/scene content data with validated accessors"
```

---

### Task 2: Word & tile logic

**Goal:** Pure helpers to build a shuffled tile set, validate a built word, and find the next correct slot for hints.

**Files:**
- Create: `src/word.js`
- Test: `tests/word.test.js`

**Acceptance Criteria:**
- [ ] `buildTileSet` returns one tile per word letter plus each distractor, each with a unique `id`.
- [ ] `shuffle` is deterministic given an injected RNG.
- [ ] `isComplete`/`isCorrect`/`nextCorrectIndex` behave per tests.

**Verify:** `node --test tests/word.test.js` → all pass.

**Steps:**

- [ ] **Step 1: Write failing tests**

```js
// tests/word.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTileSet, shuffle, isCorrect, isComplete, nextCorrectIndex } from '../src/word.js';

// deterministic RNG: always returns 0 so Fisher-Yates is a no-op (stable order)
const noShuffle = () => 0;

test('buildTileSet has one tile per letter plus distractors, unique ids', () => {
  const tiles = buildTileSet('vine', ['o', 's'], noShuffle);
  assert.equal(tiles.length, 6);
  assert.deepEqual(tiles.map(t => t.letter), ['v', 'i', 'n', 'e', 'o', 's']);
  assert.equal(new Set(tiles.map(t => t.id)).size, 6);
});

test('shuffle is deterministic with injected rng', () => {
  const arr = [1, 2, 3, 4];
  assert.deepEqual(shuffle([...arr], () => 0), [1, 2, 3, 4]);
  assert.deepEqual(shuffle([...arr], () => 0.99), [2, 3, 4, 1]);
});

test('isComplete is true only when every slot is filled', () => {
  assert.equal(isComplete('vine', ['v', 'i', 'n', 'e']), true);
  assert.equal(isComplete('vine', ['v', 'i', null, 'e']), false);
});

test('isCorrect requires full and exact match', () => {
  assert.equal(isCorrect('vine', ['v', 'i', 'n', 'e']), true);
  assert.equal(isCorrect('vine', ['v', 'i', 'e', 'n']), false);
  assert.equal(isCorrect('vine', ['v', 'i', 'n', null]), false);
});

test('nextCorrectIndex returns first wrong/empty slot, -1 when done', () => {
  assert.equal(nextCorrectIndex('vine', [null, null, null, null]), 0);
  assert.equal(nextCorrectIndex('vine', ['v', 'i', null, null]), 2);
  assert.equal(nextCorrectIndex('vine', ['v', 'i', 'n', 'e']), -1);
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `node --test tests/word.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/word.js`**

```js
// src/word.js — pure tile + word-validation helpers

// Fisher-Yates using an injected rng (defaults to Math.random) for testability.
export function shuffle(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// tile = { id, letter }
export function buildTileSet(word, distractors = [], rng = Math.random) {
  const letters = [...word.split(''), ...distractors];
  const tiles = letters.map((letter, i) => ({ id: `t${i}-${letter}`, letter }));
  return shuffle(tiles, rng);
}

// placed: array of letters or null, length === word.length
export function isComplete(word, placed) {
  return placed.length === word.length && placed.every(l => l != null);
}

export function isCorrect(word, placed) {
  return isComplete(word, placed) && placed.join('') === word;
}

// first slot whose letter doesn't match the target (for hint glow); -1 if all correct
export function nextCorrectIndex(word, placed) {
  for (let i = 0; i < word.length; i++) {
    if (placed[i] !== word[i]) return i;
  }
  return -1;
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `node --test tests/word.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/word.js tests/word.test.js
git commit -m "feat: pure tile-set and word-validation helpers"
```

---

### Task 3: Session spell queue

**Goal:** Pure functions that order a scene's spells into a session queue and re-queue missed spells to the back; mastered spells are excluded.

**Files:**
- Create: `src/queue.js`
- Test: `tests/queue.test.js`

**Acceptance Criteria:**
- [ ] `isMastered` is true after a correct streak ≥ 2.
- [ ] `buildQueue` lists unmastered spell ids in scene order.
- [ ] `onResult` removes a spell on success and appends it to the back on failure.

**Verify:** `node --test tests/queue.test.js` → all pass.

**Steps:**

- [ ] **Step 1: Write failing tests**

```js
// tests/queue.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMastered, buildQueue, nextSpell, onResult } from '../src/queue.js';

const spells = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

test('isMastered requires a correct streak of 2', () => {
  assert.equal(isMastered({ spellStats: { a: { correctStreak: 1 } } }, 'a'), false);
  assert.equal(isMastered({ spellStats: { a: { correctStreak: 2 } } }, 'a'), true);
  assert.equal(isMastered({ spellStats: {} }, 'a'), false);
});

test('buildQueue lists unmastered spells in order', () => {
  const progress = { spellStats: { b: { correctStreak: 2 } } };
  assert.deepEqual(buildQueue(spells, progress), ['a', 'c']);
});

test('nextSpell returns head or null', () => {
  assert.equal(nextSpell(['a', 'b']), 'a');
  assert.equal(nextSpell([]), null);
});

test('onResult removes on success, re-queues to back on failure', () => {
  assert.deepEqual(onResult(['a', 'b', 'c'], 'a', true), ['b', 'c']);
  assert.deepEqual(onResult(['a', 'b', 'c'], 'a', false), ['b', 'c', 'a']);
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `node --test tests/queue.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/queue.js`**

```js
// src/queue.js — pure per-session spell ordering

const MASTERY_STREAK = 2;

export function isMastered(progress, spellId) {
  const st = progress.spellStats?.[spellId];
  return !!st && (st.correctStreak ?? 0) >= MASTERY_STREAK;
}

export function buildQueue(spells, progress) {
  return spells.filter(s => !isMastered(progress, s.id)).map(s => s.id);
}

export function nextSpell(queue) {
  return queue.length ? queue[0] : null;
}

export function onResult(queue, spellId, success) {
  const rest = queue.filter(id => id !== spellId);
  return success ? rest : [...rest, spellId];
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `node --test tests/queue.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/queue.js tests/queue.test.js
git commit -m "feat: pure session spell queue with spaced re-queue"
```

---

### Task 4: Progress state & persistence

**Goal:** Pure progress transitions (stars, per-spell stats, bloom %, scene completion) plus a `localStorage` adapter using injectable storage.

**Files:**
- Create: `src/progress.js`
- Test: `tests/progress.test.js`

**Acceptance Criteria:**
- [ ] `emptyProgress` returns the default shape with sound on and tiles input.
- [ ] `recordSpell` increments attempts always, and stars/correct/streak on success; resets streak on failure.
- [ ] `sceneBloomPercent` and `isSceneComplete` count spells with ≥1 correct.
- [ ] `loadProgress`/`saveProgress` round-trip through an injected fake storage and tolerate bad/empty data.

**Verify:** `node --test tests/progress.test.js` → all pass.

**Steps:**

- [ ] **Step 1: Write failing tests**

```js
// tests/progress.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, recordSpell, sceneBloomPercent, isSceneComplete, loadProgress, saveProgress } from '../src/progress.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
}

test('emptyProgress has defaults', () => {
  const p = emptyProgress();
  assert.equal(p.stars, 0);
  assert.equal(p.currentScene, 'glade');
  assert.deepEqual(p.spellStats, {});
  assert.deepEqual(p.settings, { sound: true, inputMode: 'tiles', startScene: 'glade' });
});

test('recordSpell on success adds star, correct, streak', () => {
  const p = recordSpell(emptyProgress(), 'glade-vine', true);
  assert.equal(p.stars, 1);
  assert.deepEqual(p.spellStats['glade-vine'], { attempts: 1, correct: 1, correctStreak: 1 });
});

test('recordSpell on failure counts attempt, resets streak, no star', () => {
  let p = recordSpell(emptyProgress(), 'glade-vine', true);
  p = recordSpell(p, 'glade-vine', false);
  assert.equal(p.stars, 1);
  assert.deepEqual(p.spellStats['glade-vine'], { attempts: 2, correct: 1, correctStreak: 0 });
});

test('bloom percent and completion count spells with >=1 correct', () => {
  const spells = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  let p = emptyProgress();
  p = recordSpell(p, 'a', true);
  assert.equal(sceneBloomPercent(p, spells), 25);
  assert.equal(isSceneComplete(p, spells), false);
  for (const id of ['b', 'c', 'd']) p = recordSpell(p, id, true);
  assert.equal(sceneBloomPercent(p, spells), 100);
  assert.equal(isSceneComplete(p, spells), true);
});

test('save/load round-trips and tolerates empty/bad storage', () => {
  const store = fakeStorage();
  assert.equal(loadProgress(store).stars, 0);              // empty → defaults
  const p = recordSpell(emptyProgress(), 'a', true);
  saveProgress(p, store);
  assert.equal(loadProgress(store).stars, 1);
  store.setItem('spellbloom.progress.v1', 'not json');
  assert.equal(loadProgress(store).stars, 0);              // bad → defaults
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `node --test tests/progress.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/progress.js`**

```js
// src/progress.js — progress state transitions + storage adapter

const KEY = 'spellbloom.progress.v1';

export function emptyProgress() {
  return {
    stars: 0,
    currentScene: 'glade',
    spellStats: {},
    settings: { sound: true, inputMode: 'tiles', startScene: 'glade' },
  };
}

export function recordSpell(progress, spellId, success) {
  const prev = progress.spellStats[spellId] ?? { attempts: 0, correct: 0, correctStreak: 0 };
  const stat = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (success ? 1 : 0),
    correctStreak: success ? prev.correctStreak + 1 : 0,
  };
  return {
    ...progress,
    stars: progress.stars + (success ? 1 : 0),
    spellStats: { ...progress.spellStats, [spellId]: stat },
  };
}

function bloomedCount(progress, sceneSpells) {
  return sceneSpells.filter(s => (progress.spellStats[s.id]?.correct ?? 0) >= 1).length;
}

export function sceneBloomPercent(progress, sceneSpells) {
  if (!sceneSpells.length) return 0;
  return Math.round((bloomedCount(progress, sceneSpells) / sceneSpells.length) * 100);
}

export function isSceneComplete(progress, sceneSpells) {
  return sceneSpells.length > 0 && bloomedCount(progress, sceneSpells) === sceneSpells.length;
}

export function loadProgress(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    return { ...emptyProgress(), ...parsed,
      settings: { ...emptyProgress().settings, ...(parsed.settings ?? {}) } };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
  try { storage?.setItem(KEY, JSON.stringify(progress)); } catch { /* ignore quota/denied */ }
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `node --test tests/progress.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/progress.js tests/progress.test.js
git commit -m "feat: progress transitions, bloom tracking, localStorage adapter"
```

---

### Task 5: Session engine

**Goal:** A pure session state machine that starts a scene, exposes the current spell, escalates miss count for hints, and advances on success.

**Files:**
- Create: `src/engine.js`
- Test: `tests/engine.test.js`

**Acceptance Criteria:**
- [ ] `startSession` builds a session from progress + scene content with the first spell loaded.
- [ ] `getCurrentSpell` returns the spell object or null when the queue is empty.
- [ ] `registerAttempt(false)` increments `misses`; `registerAttempt(true)` advances and resets `misses`.

**Verify:** `node --test tests/engine.test.js` → all pass.

**Steps:**

- [ ] **Step 1: Write failing tests**

```js
// tests/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startSession, getCurrentSpell, registerAttempt } from '../src/engine.js';
import { emptyProgress } from '../src/progress.js';

const content = {
  getSpellsForScene: () => [{ id: 'a' }, { id: 'b' }],
  getSpell: id => ({ id, word: id === 'a' ? 'fern' : 'frog' }),
};

test('startSession loads first spell', () => {
  const s = startSession(emptyProgress(), 'glade', content);
  assert.deepEqual(s.queue, ['a', 'b']);
  assert.equal(s.spellId, 'a');
  assert.equal(s.misses, 0);
  assert.equal(getCurrentSpell(s, content).word, 'fern');
});

test('failed attempt increments misses, keeps spell', () => {
  let s = startSession(emptyProgress(), 'glade', content);
  s = registerAttempt(s, false);
  assert.equal(s.misses, 1);
  assert.equal(s.spellId, 'a');
});

test('successful attempt advances and resets misses', () => {
  let s = startSession(emptyProgress(), 'glade', content);
  s = registerAttempt(s, false);
  s = registerAttempt(s, true);
  assert.equal(s.spellId, 'b');
  assert.equal(s.misses, 0);
});

test('advancing past the last spell yields null current spell', () => {
  let s = startSession(emptyProgress(), 'glade', content);
  s = registerAttempt(s, true);
  s = registerAttempt(s, true);
  assert.equal(s.spellId, null);
  assert.equal(getCurrentSpell(s, content), null);
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `node --test tests/engine.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/engine.js`**

```js
// src/engine.js — pure session/round state machine
import { buildQueue, nextSpell, onResult } from './queue.js';

export function startSession(progress, sceneId, content) {
  const queue = buildQueue(content.getSpellsForScene(sceneId), progress);
  return { sceneId, queue, spellId: nextSpell(queue), misses: 0 };
}

export function getCurrentSpell(session, content) {
  return session.spellId ? content.getSpell(session.spellId) : null;
}

export function registerAttempt(session, success) {
  if (!success) return { ...session, misses: session.misses + 1 };
  const queue = onResult(session.queue, session.spellId, true);
  return { ...session, queue, spellId: nextSpell(queue), misses: 0 };
}
```

- [ ] **Step 4: Run tests, expect pass**

Run: `node --test tests/engine.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine.js tests/engine.test.js
git commit -m "feat: pure session engine for scene/queue/miss flow"
```

---

### Task 6: Audio module

**Goal:** A sound module that reads spell text aloud (Web Speech API) and plays SFX (Web Audio), all gated by the current sound setting. Logic is browser-only; verify manually.

**Files:**
- Create: `src/audio.js`

**Acceptance Criteria:**
- [ ] `createAudio({ enabled })` exposes `speak(text)`, `speakWord(word)`, `sfx(name)`, and `setEnabled(bool)`.
- [ ] When disabled, no speech and no tones are produced.
- [ ] `speakWord` speaks more slowly than `speak` (for sounding-out help).

**Verify (manual, browser):** Add a temporary button to `index.html` calling `audio.speak('grow the vine')` and `audio.sfx('chime')`; confirm you hear speech and a tone, and that toggling `setEnabled(false)` silences both. Remove the temporary button after.

**Steps:**

- [ ] **Step 1: Implement `src/audio.js`**

```js
// src/audio.js — speech + simple synthesized SFX, gated by a sound flag

const TONES = {
  chime:  { freq: 880, dur: 0.18, type: 'sine' },
  sparkle:{ freq: 1320, dur: 0.12, type: 'triangle' },
  bloop:  { freq: 220, dur: 0.12, type: 'square' },
};

export function createAudio({ enabled = true } = {}) {
  let on = enabled;
  let ctx = null;
  const synth = globalThis.speechSynthesis;

  function getCtx() {
    if (!ctx) {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      ctx = AC ? new AC() : null;
    }
    return ctx;
  }

  function utter(text, rate) {
    if (!on || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1.1;
    synth.speak(u);
  }

  return {
    setEnabled(v) { on = v; if (!v && synth) synth.cancel(); },
    isEnabled() { return on; },
    speak(text) { utter(text, 0.95); },
    speakWord(word) { utter(word.split('').join(' '), 0.6); }, // slow, sound-it-out
    sfx(name) {
      if (!on) return;
      const c = getCtx();
      const t = TONES[name];
      if (!c || !t) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = t.type;
      osc.frequency.value = t.freq;
      gain.gain.setValueAtTime(0.001, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t.dur);
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + t.dur);
    },
  };
}
```

- [ ] **Step 2: Manual verification**

Run `npm run serve`, open the page, and in the browser console:
```js
const { createAudio } = await import('./src/audio.js');
const a = createAudio({ enabled: true });
a.speak('grow the vine');   // hear phrase
a.speakWord('vine');         // hear "v i n e" slowly
a.sfx('chime');              // hear a tone
a.setEnabled(false); a.sfx('chime'); a.speak('quiet'); // silence
```
Expected: speech + tones audible when enabled, silent when disabled.

- [ ] **Step 3: Commit**

```bash
git add src/audio.js
git commit -m "feat: audio module with gated speech and synthesized SFX"
```

---

### Task 7: Scene view UI

**Goal:** Render the flat-vector scene for the Glade with a bloom meter and star count, and animate an element blooming in. Verify manually.

**Files:**
- Create: `src/ui/sceneView.js`
- Modify: `styles.css` (scene + bloom styles, append)

**Acceptance Criteria:**
- [ ] `renderScene(root, { scene, bloomPercent, stars, bloomedElements })` draws the scene background, the HUD values, and any already-bloomed elements.
- [ ] `bloomElement(root, elementId)` animates a single element appearing with a sparkle.

**Verify (manual, browser):** Temporarily call `renderScene` with the glade and a couple of bloomed elements, then `bloomElement` for a new one; confirm the scene fills with color, the meter/stars update, and the new element pops in with a sparkle.

**Steps:**

- [ ] **Step 1: Implement `src/ui/sceneView.js`**

```js
// src/ui/sceneView.js — flat-vector scene rendering + bloom animation

// Each scene element is drawn as a positioned emoji-on-vector badge.
// (Flat-vector look comes from CSS shapes + the gradient backdrop in styles.css.)
const ELEMENT_GLYPH = {
  fern: '🌿', frog: '🐸', log: '🪵', nest: '🪺', bug: '🐞',
  web: '🕸️', moss: '🍀', twig: '🌱', pond: '💧', vine: '🍃',
};

export function renderScene(root, { scene, bloomPercent, stars, bloomedElements = [] }) {
  document.getElementById('scene-name').textContent = scene.name;
  document.getElementById('stars').textContent = `⭐ ${stars}`;
  document.getElementById('bloom-label').textContent = `${bloomPercent}% bloomed`;

  root.className = `scene scene--${scene.id}`;
  root.innerHTML = `
    <div class="scene-sky"></div>
    <div class="scene-ground"></div>
    <div class="bloom-bar"><div class="bloom-fill" style="width:${bloomPercent}%"></div></div>
    <div class="scene-elements"></div>
  `;
  const layer = root.querySelector('.scene-elements');
  for (const id of bloomedElements) layer.appendChild(makeElement(id, false));
}

function makeElement(elementId, animate) {
  const el = document.createElement('div');
  el.className = 'scene-element' + (animate ? ' scene-element--pop' : '');
  el.dataset.element = elementId;
  el.textContent = ELEMENT_GLYPH[elementId] ?? '✨';
  return el;
}

export function bloomElement(root, elementId) {
  const layer = root.querySelector('.scene-elements');
  if (!layer || layer.querySelector(`[data-element="${elementId}"]`)) return;
  const el = makeElement(elementId, true);
  layer.appendChild(el);
  // sparkle burst
  const spark = document.createElement('div');
  spark.className = 'sparkle';
  spark.textContent = '✨';
  el.appendChild(spark);
  spark.addEventListener('animationend', () => spark.remove());
}
```

- [ ] **Step 2: Append scene styles to `styles.css`**

```css
/* --- scene view --- */
#scene { position: relative; flex: 1; min-height: 280px; overflow: hidden; }
.scene-sky { position: absolute; inset: 0; background: radial-gradient(circle at 70% 20%, rgba(255,225,150,.35), transparent 50%); }
.scene-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 42%;
  background: var(--leaf); border-radius: 50% 50% 0 0 / 60% 60% 0 0; }
.scene--pond .scene-ground { background: #2e7d9e; }
.scene--sky .scene-ground { background: #2b2660; }
.scene--castle .scene-ground { background: #6b5a8c; }
.bloom-bar { position: absolute; top: 10px; left: 5%; right: 5%; height: 12px;
  background: rgba(0,0,0,.25); border-radius: 999px; overflow: hidden; }
.bloom-fill { height: 100%; background: var(--gold); transition: width .5s ease; }
.scene-elements { position: absolute; inset: 0; display: flex; flex-wrap: wrap;
  align-items: flex-end; justify-content: center; gap: 14px; padding: 0 16px 8%; }
.scene-element { font-size: 44px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.3)); position: relative; }
.scene-element--pop { animation: pop .5s ease; }
@keyframes pop { 0% { transform: scale(0) rotate(-15deg); opacity: 0; }
  70% { transform: scale(1.25); } 100% { transform: scale(1); opacity: 1; } }
.sparkle { position: absolute; top: -10px; left: 50%; font-size: 24px; animation: sparkle .7s ease forwards; }
@keyframes sparkle { 0% { opacity: 0; transform: translate(-50%, 0) scale(.5); }
  40% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -30px) scale(1.4); } }
```

- [ ] **Step 3: Manual verification**

In the browser console on the served page:
```js
const { renderScene, bloomElement } = await import('./src/ui/sceneView.js');
const { getScene } = await import('./src/content.js');
const root = document.getElementById('scene');
renderScene(root, { scene: getScene('glade'), bloomPercent: 40, stars: 4, bloomedElements: ['fern', 'frog'] });
setTimeout(() => bloomElement(root, 'vine'), 800);
```
Expected: green glade with fern+frog, meter at 40%, stars ⭐ 4; the vine pops in with a sparkle.

- [ ] **Step 4: Commit**

```bash
git add src/ui/sceneView.js styles.css
git commit -m "feat: flat-vector scene view with bloom meter and bloom animation"
```

---

### Task 8: Spell builder UI

**Goal:** Render the spell scroll (phrase + 🔊), the answer slots, and a draggable/typable tile tray; handle wrong tiles gently, escalate hints, and fire a cast callback when the word is correct. Verify manually.

**Files:**
- Create: `src/ui/spellBuilder.js`
- Modify: `styles.css` (spell builder styles, append)

**Acceptance Criteria:**
- [ ] Shows the phrase; tapping 🔊 calls `audio.speak(phrase)`.
- [ ] Tiles can be placed into slots by pointer drag (touch + mouse) and, when `inputMode==='type'`, by key press.
- [ ] A wrong-position tile plays `bloop` and returns to the tray; it never shows a harsh error.
- [ ] After `misses>=1` the 🔊 helper pulses and `audio.speakWord` is offered; after `misses>=2` the next correct slot glows.
- [ ] When the placed letters equal the word, `onCast()` is called once.

**Verify (manual, browser):** Render a spell, build it correctly via drag (and via typing with inputMode 'type'); confirm cast fires, wrong tiles bounce back with a bloop, and hints escalate with misses.

**Steps:**

- [ ] **Step 1: Implement `src/ui/spellBuilder.js`**

```js
// src/ui/spellBuilder.js — read-the-spell + build-the-word interaction
import { buildTileSet, isComplete, isCorrect, nextCorrectIndex } from '../word.js';

// renderSpell(root, { spell, inputMode, audio, getMisses, onAttempt, onCast })
//   onAttempt(success) -> called on every full-word attempt (updates engine/hints)
//   getMisses() -> current miss count (for hint escalation)
//   onCast() -> called once when the word is correct
export function renderSpell(root, opts) {
  const { spell, inputMode, audio } = opts;
  const placed = new Array(spell.word.length).fill(null);
  let rng = Math.random;

  root.innerHTML = `
    <div class="scroll">
      <span class="scroll-text">${spell.phrase}</span>
      <button class="hear-btn" aria-label="hear the spell">🔊</button>
    </div>
    <div class="slots"></div>
    <div class="tray"></div>
    <p class="nudge">Say the magic words!</p>
  `;

  const slotsEl = root.querySelector('.slots');
  const trayEl = root.querySelector('.tray');
  const hearBtn = root.querySelector('.hear-btn');

  hearBtn.addEventListener('click', () => audio.speak(spell.phrase));

  // build slots
  spell.word.split('').forEach((_, i) => {
    const slot = document.createElement('div');
    slot.className = 'slot'; slot.dataset.index = i;
    slotsEl.appendChild(slot);
  });

  // build tray tiles
  const tiles = buildTileSet(spell.word, spell.distractors, rng);
  for (const tile of tiles) trayEl.appendChild(makeTile(tile));

  function makeTile(tile) {
    const el = document.createElement('button');
    el.className = 'tile'; el.textContent = tile.letter;
    el.dataset.letter = tile.letter; el.dataset.id = tile.id;
    enableDrag(el);
    return el;
  }

  // --- placement core ---
  function placeLetter(index, letter, tileEl) {
    if (placed[index] != null) return false;
    placed[index] = letter;
    const slot = slotsEl.querySelector(`.slot[data-index="${index}"]`);
    slot.textContent = letter; slot.classList.add('filled');
    slot.dataset.tileId = tileEl.dataset.id;
    tileEl.classList.add('used'); tileEl.disabled = true;
    audio.sfx('sparkle');
    afterPlacement();
    return true;
  }

  function rejectTile(tileEl) {
    audio.sfx('bloop');
    tileEl.classList.add('wrong');
    tileEl.addEventListener('animationend', () => tileEl.classList.remove('wrong'), { once: true });
  }

  function afterPlacement() {
    if (!isComplete(spell.word, placed)) { showHints(); return; }
    if (isCorrect(spell.word, placed)) {
      opts.onAttempt(true);
      root.querySelector('.nudge').textContent = '✨ Spell cast! ✨';
      opts.onCast();
    } else {
      // full but wrong: clear, count a miss, let her retry
      opts.onAttempt(false);
      clearSlots();
      showHints();
    }
  }

  function clearSlots() {
    placed.fill(null);
    slotsEl.querySelectorAll('.slot').forEach(s => {
      s.textContent = ''; s.classList.remove('filled', 'glow'); delete s.dataset.tileId;
    });
    trayEl.querySelectorAll('.tile').forEach(t => { t.classList.remove('used'); t.disabled = false; });
  }

  function showHints() {
    const misses = opts.getMisses();
    if (misses >= 1) {
      hearBtn.classList.add('pulse');
      audio.speakWord(spell.word);
    }
    if (misses >= 2) {
      const idx = nextCorrectIndex(spell.word, placed);
      const slot = slotsEl.querySelector(`.slot[data-index="${idx}"]`);
      if (slot) slot.classList.add('glow');
    }
  }

  // --- input: pointer drag (touch + mouse) ---
  function enableDrag(tileEl) {
    tileEl.addEventListener('pointerdown', e => {
      if (tileEl.disabled) return;
      e.preventDefault();
      const ghost = tileEl.cloneNode(true);
      ghost.className = 'tile ghost';
      document.body.appendChild(ghost);
      const move = ev => { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; };
      move(e);
      const up = ev => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        ghost.remove();
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const slot = target?.closest('.slot');
        if (slot && !slot.classList.contains('filled')) {
          const idx = Number(slot.dataset.index);
          // correct letter for this slot? place; else gentle reject
          if (spell.word[idx] === tileEl.dataset.letter) placeLetter(idx, tileEl.dataset.letter, tileEl);
          else { rejectTile(tileEl); opts.onAttempt(false); showHints(); }
        }
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }

  // --- input: typing (Mac) ---
  function keyHandler(e) {
    if (inputMode !== 'type') return;
    const letter = e.key.toLowerCase();
    if (!/^[a-z]$/.test(letter)) return;
    const idx = nextCorrectIndex(spell.word, placed);
    if (idx < 0) return;
    const tileEl = [...trayEl.querySelectorAll('.tile')]
      .find(t => !t.disabled && t.dataset.letter === letter);
    if (spell.word[idx] === letter && tileEl) placeLetter(idx, letter, tileEl);
    else { audio.sfx('bloop'); opts.onAttempt(false); showHints(); }
  }
  if (inputMode === 'type') document.addEventListener('keydown', keyHandler);

  // cleanup handle for main.js to call before rendering the next spell
  return { destroy() { document.removeEventListener('keydown', keyHandler); } };
}
```

- [ ] **Step 2: Append spell-builder styles to `styles.css`**

```css
/* --- spell builder --- */
#spell { padding: 14px 16px 26px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.scroll { background: var(--cream); color: var(--ink); font-weight: 800; font-size: 26px;
  padding: 12px 22px; border-radius: 14px; box-shadow: 0 5px 0 rgba(0,0,0,.2);
  transform: rotate(-1.5deg); display: flex; align-items: center; gap: 12px; }
.hear-btn { font-size: 20px; background: var(--gold); border: none; border-radius: 50%;
  width: 38px; height: 38px; cursor: pointer; }
.hear-btn.pulse { animation: pulse 1s ease infinite; }
@keyframes pulse { 50% { transform: scale(1.2); } }
.slots { display: flex; gap: 10px; }
.slot { width: 48px; height: 56px; border: 3px dashed rgba(255,255,255,.7); border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: var(--ink); }
.slot.filled { background: #fff; border-style: solid; }
.slot.glow { box-shadow: 0 0 0 3px var(--gold), 0 0 18px var(--gold); border-color: var(--gold); }
.tray { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
  background: rgba(0,0,0,.18); border-radius: 18px; padding: 10px 14px; max-width: 520px; }
.tile { width: 44px; height: 52px; border: none; border-radius: 9px; background: var(--gold);
  color: var(--ink); font-size: 24px; font-weight: 800; box-shadow: 0 3px 0 rgba(0,0,0,.25); cursor: grab; touch-action: none; }
.tile.used { visibility: hidden; }
.tile.wrong { animation: shake .3s; }
@keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.tile.ghost { position: fixed; transform: translate(-50%, -50%); pointer-events: none; z-index: 99; opacity: .9; }
.nudge { font-size: 15px; opacity: .85; }
```

- [ ] **Step 3: Manual verification**

Serve the app, then in the console:
```js
const { renderSpell } = await import('./src/ui/spellBuilder.js');
const { createAudio } = await import('./src/audio.js');
const { getSpell } = await import('./src/content.js');
let misses = 0;
renderSpell(document.getElementById('spell'), {
  spell: getSpell('glade-vine'), inputMode: 'tiles', audio: createAudio({ enabled: true }),
  getMisses: () => misses, onAttempt: ok => { if (!ok) misses++; },
  onCast: () => console.log('CAST!'),
});
```
Expected: drag `v,i,n,e` into the slots → "Spell cast!" + `CAST!` logged; a wrong tile shakes back with a bloop; after misses you hear the word spelled slowly and (≥2) the next slot glows. Repeat with `inputMode: 'type'` and type the letters.

- [ ] **Step 4: Commit**

```bash
git add src/ui/spellBuilder.js styles.css
git commit -m "feat: spell builder UI with drag/type tiles, gentle errors, escalating hints"
```

---

### Task 9: Grown-up settings panel

**Goal:** A settings overlay opened by press-and-hold on the ⚙️ button, controlling start scene, input mode, sound, and reset. Verify manually.

**Files:**
- Create: `src/ui/settings.js`
- Modify: `styles.css` (settings overlay styles, append)

**Acceptance Criteria:**
- [ ] The panel opens only after a ~700ms press-and-hold on ⚙️ (a quick tap does nothing).
- [ ] Changing a control calls `onChange(settings)` with the new settings object.
- [ ] A "Reset progress" button calls `onReset()` behind a confirm step.

**Verify (manual, browser):** Press-and-hold ⚙️ → panel opens; quick tap → nothing. Toggle sound/input/scene → `onChange` fires with updated values. Reset → confirm → `onReset` fires.

**Steps:**

- [ ] **Step 1: Implement `src/ui/settings.js`**

```js
// src/ui/settings.js — press-and-hold grown-up settings overlay
import { getScenes } from '../content.js';

const HOLD_MS = 700;

export function initSettings({ button, getSettings, onChange, onReset }) {
  let timer = null;
  const start = () => { timer = setTimeout(open, HOLD_MS); };
  const cancel = () => { clearTimeout(timer); };
  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', cancel);
  button.addEventListener('pointerleave', cancel);

  function open() {
    const s = getSettings();
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <div class="settings-card">
        <h2>Grown-up settings</h2>
        <label>Start scene
          <select data-key="startScene">
            ${getScenes().map(sc => `<option value="${sc.id}" ${sc.id === s.startScene ? 'selected' : ''}>${sc.name}</option>`).join('')}
          </select>
        </label>
        <label>Input
          <select data-key="inputMode">
            <option value="tiles" ${s.inputMode === 'tiles' ? 'selected' : ''}>Drag tiles</option>
            <option value="type" ${s.inputMode === 'type' ? 'selected' : ''}>Type on keyboard</option>
          </select>
        </label>
        <label class="row"><input type="checkbox" data-key="sound" ${s.sound ? 'checked' : ''}/> Sound</label>
        <button class="reset-btn">Reset progress</button>
        <button class="close-btn">Done</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('[data-key]').forEach(ctrl => {
      ctrl.addEventListener('change', () => {
        const key = ctrl.dataset.key;
        const value = ctrl.type === 'checkbox' ? ctrl.checked : ctrl.value;
        onChange({ ...getSettings(), [key]: value });
      });
    });
    overlay.querySelector('.reset-btn').addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) { onReset(); overlay.remove(); }
    });
    overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }
}
```

- [ ] **Step 2: Append settings styles to `styles.css`**

```css
/* --- settings --- */
.settings-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center; z-index: 50; }
.settings-card { background: #fff; color: var(--ink); border-radius: 16px; padding: 22px;
  width: min(340px, 86vw); display: flex; flex-direction: column; gap: 14px; }
.settings-card label { display: flex; flex-direction: column; gap: 4px; font-weight: 700; }
.settings-card label.row { flex-direction: row; align-items: center; gap: 8px; }
.settings-card select { padding: 8px; font-size: 16px; border-radius: 8px; }
.settings-card button { padding: 10px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
.reset-btn { background: #f3d2d2; }
.close-btn { background: var(--gold); }
```

- [ ] **Step 3: Manual verification**

Serve the app, then in the console:
```js
const { initSettings } = await import('./src/ui/settings.js');
let settings = { startScene: 'glade', inputMode: 'tiles', sound: true };
initSettings({
  button: document.getElementById('settings-btn'),
  getSettings: () => settings,
  onChange: s => { settings = s; console.log('settings', s); },
  onReset: () => console.log('RESET'),
});
```
Expected: quick tap on ⚙️ → nothing; press-and-hold ~1s → panel opens; changing controls logs updated settings; Reset → confirm → logs `RESET`.

- [ ] **Step 4: Commit**

```bash
git add src/ui/settings.js styles.css
git commit -m "feat: press-and-hold grown-up settings panel"
```

---

### Task 10: Wire the full loop

**Goal:** Connect engine + progress + audio + UI in `main.js` into a playable end-to-end Glade: load progress, render scene + spell, cast → bloom + star + save, advance, and complete the scene. Verify manually.

**Files:**
- Modify: `src/main.js` (replace stub)

**Acceptance Criteria:**
- [ ] On load, progress is read from `localStorage` and the current scene renders with already-bloomed elements.
- [ ] Casting a spell blooms its element, increments stars, saves progress, and advances to the next spell.
- [ ] Completing all Glade spells shows a "scene restored" message and unlocks the next scene.
- [ ] Settings changes (sound/input/reset) take effect.

**Verify (manual, browser):** Play the Glade end to end on the Mac; reload mid-way and confirm progress persisted; complete the scene and see the unlock message; toggle sound and input mode via settings.

**Steps:**

- [ ] **Step 1: Replace `src/main.js`**

```js
// src/main.js — wire engine + progress + audio + UI into the playable loop
import * as content from './content.js';
import { startSession, getCurrentSpell, registerAttempt } from './engine.js';
import { loadProgress, saveProgress, recordSpell, sceneBloomPercent, isSceneComplete } from './progress.js';
import { createAudio } from './audio.js';
import { renderScene, bloomElement } from './ui/sceneView.js';
import { renderSpell } from './ui/spellBuilder.js';
import { initSettings } from './ui/settings.js';
import { getScenes } from './content.js';

const sceneRoot = document.getElementById('scene');
const spellRoot = document.getElementById('spell');

let progress = loadProgress();
let audio = createAudio({ enabled: progress.settings.sound });
let session = startSession(progress, progress.currentScene, content);
let builder = null;

function sceneSpells() { return content.getSpellsForScene(session.sceneId); }
function bloomedElements() {
  return sceneSpells()
    .filter(s => (progress.spellStats[s.id]?.correct ?? 0) >= 1)
    .map(s => s.element);
}

function drawScene() {
  renderScene(sceneRoot, {
    scene: content.getScene(session.sceneId),
    bloomPercent: sceneBloomPercent(progress, sceneSpells()),
    stars: progress.stars,
    bloomedElements: bloomedElements(),
  });
}

function drawSpell() {
  const spell = getCurrentSpell(session, content);
  if (builder) builder.destroy();
  if (!spell) return showSceneComplete();
  audio.speak(spell.phrase); // read the spell aloud on arrival
  builder = renderSpell(spellRoot, {
    spell,
    inputMode: progress.settings.inputMode,
    audio,
    getMisses: () => session.misses,
    onAttempt: success => { if (!success) session = registerAttempt(session, false); },
    onCast: () => onCast(spell),
  });
}

function onCast(spell) {
  progress = recordSpell(progress, spell.id, true);
  saveProgress(progress, globalThis.localStorage);
  audio.sfx('chime');
  bloomElement(sceneRoot, spell.element);
  drawScene();
  session = registerAttempt(session, true);
  setTimeout(drawSpell, 1100); // let the bloom play before next spell
}

function showSceneComplete() {
  const done = isSceneComplete(progress, sceneSpells());
  const next = getScenes().find(s => content.getScene(session.sceneId).order + 1 === s.order);
  spellRoot.innerHTML = `<div class="scene-complete">
    <h2>✨ The ${content.getScene(session.sceneId).name} is restored! ✨</h2>
    ${done && next ? `<button id="next-scene">Travel to ${next.name} →</button>` : ''}
  </div>`;
  if (done && next) {
    document.getElementById('next-scene').addEventListener('click', () => {
      progress = { ...progress, currentScene: next.id };
      saveProgress(progress, globalThis.localStorage);
      session = startSession(progress, next.id, content);
      drawScene(); drawSpell();
    });
  }
}

initSettings({
  button: document.getElementById('settings-btn'),
  getSettings: () => progress.settings,
  onChange: s => {
    progress = { ...progress, settings: s };
    saveProgress(progress, globalThis.localStorage);
    audio.setEnabled(s.sound);
    drawSpell(); // re-render so inputMode change takes effect
  },
  onReset: () => {
    globalThis.localStorage.removeItem('spellbloom.progress.v1');
    progress = loadProgress();
    audio.setEnabled(progress.settings.sound);
    session = startSession(progress, progress.currentScene, content);
    drawScene(); drawSpell();
  },
});

drawScene();
drawSpell();
```

- [ ] **Step 2: Add scene-complete style to `styles.css`**

```css
/* --- scene complete --- */
.scene-complete { text-align: center; display: flex; flex-direction: column; gap: 14px; align-items: center; }
.scene-complete button { background: var(--gold); color: var(--ink); border: none;
  border-radius: 12px; padding: 12px 20px; font-size: 18px; font-weight: 800; cursor: pointer; }
```

- [ ] **Step 3: Full manual verification**

Run `npm run serve`, open `http://localhost:8000`:
- The Glade renders; the first spell is read aloud and shown.
- Build each word; each cast blooms an element, +1 ⭐, meter rises.
- Reload the page mid-scene → stars/bloomed elements persist.
- Finish all Glade spells → "Glade is restored!" + "Travel to Moonlit Pond" button.
- Press-and-hold ⚙️ → toggle sound off (silence) and switch to typing; confirm both take effect.
- No console errors throughout.

- [ ] **Step 4: Commit**

```bash
git add src/main.js styles.css
git commit -m "feat: wire full playable loop with persistence and scene completion"
```

---

### Task 11: Populate remaining scenes & ambient polish

**Goal:** Fill Pond, Sky, and Castle with spells and element glyphs, add per-scene backdrops (already styled in Task 7) and optional ambient music, so the full journey is playable. Logic additions are covered by the existing `content.test.js` validity test; verify play manually.

**Files:**
- Modify: `src/content.js` (add Pond/Sky/Castle spells + glyphs in `sceneView.js`)
- Modify: `src/ui/sceneView.js` (`ELEMENT_GLYPH` entries for new elements)
- Modify: `tests/content.test.js` (assert every scene has ≥8 spells)

**Acceptance Criteria:**
- [ ] Each of the four scenes has ≥8 valid spells targeting its phonics focus (Pond: digraphs; Sky: vowel teams/silent-e; Castle: longer words).
- [ ] Every spell's `element` has a glyph in `ELEMENT_GLYPH`.
- [ ] `content.test.js` passes with the stricter per-scene count.

**Verify:** `node --test tests/content.test.js` passes; then play all four scenes in the browser.

**Steps:**

- [ ] **Step 1: Strengthen the content test**

```js
// add to tests/content.test.js
test('every scene has at least 8 spells', () => {
  for (const scene of getScenes()) {
    assert.ok(getSpellsForScene(scene.id).length >= 8, `${scene.id} has too few spells`);
  }
});

test('every spell element has a glyph', async () => {
  const { ELEMENT_GLYPH } = await import('../src/ui/sceneView.js');
  for (const s of SPELLS) {
    assert.ok(ELEMENT_GLYPH[s.element], `no glyph for ${s.element}`);
  }
});
```

  Also export the glyph map for the test — in `src/ui/sceneView.js` change
  `const ELEMENT_GLYPH = {` to `export const ELEMENT_GLYPH = {`.
  (Note: this test imports a UI module in Node. It only reads a plain object literal — no DOM — so it runs fine under `node --test`.)

- [ ] **Step 2: Run test, expect failure**

Run: `node --test tests/content.test.js`
Expected: FAIL — pond/sky/castle have 0 spells.

- [ ] **Step 3: Add spells to `src/content.js`** (append to the `SPELLS` array)

```js
  // --- Moonlit Pond: digraphs (sh/ch/th) + blends ---
  { id: 'pond-fish',  phrase: 'splash the fish',  word: 'fish',  scene: 'pond', element: 'fish',  pattern: 'digraph-sh', distractors: ['a', 'o'] },
  { id: 'pond-shell', phrase: 'ring the shell',   word: 'shell', scene: 'pond', element: 'shell', pattern: 'digraph-sh', distractors: ['a', 'o'] },
  { id: 'pond-duck',  phrase: 'swim the duck',    word: 'duck',  scene: 'pond', element: 'duck',  pattern: 'blend-ck',   distractors: ['o', 'p'] },
  { id: 'pond-ship',  phrase: 'sail the ship',    word: 'ship',  scene: 'pond', element: 'ship',  pattern: 'digraph-sh', distractors: ['a', 'o'] },
  { id: 'pond-reed',  phrase: 'bend the reed',    word: 'reed',  scene: 'pond', element: 'reed',  pattern: 'vowel-ee',   distractors: ['a', 'p'] },
  { id: 'pond-swan',  phrase: 'wake the swan',    word: 'swan',  scene: 'pond', element: 'swan',  pattern: 'blend-sw',   distractors: ['e', 'p'] },
  { id: 'pond-crab',  phrase: 'find the crab',    word: 'crab',  scene: 'pond', element: 'crab',  pattern: 'blend-cr',   distractors: ['e', 'o'] },
  { id: 'pond-moth',  phrase: 'free the moth',    word: 'moth',  scene: 'pond', element: 'moth',  pattern: 'digraph-th', distractors: ['a', 'p'] },

  // --- Starry Sky: vowel teams + silent-e ---
  { id: 'sky-moon',  phrase: 'shine the moon',  word: 'moon',  scene: 'sky', element: 'moon',  pattern: 'vowel-oo', distractors: ['a', 'p'] },
  { id: 'sky-star',  phrase: 'light the star',  word: 'star',  scene: 'sky', element: 'star',  pattern: 'r-blend',  distractors: ['e', 'o'] },
  { id: 'sky-kite',  phrase: 'fly the kite',    word: 'kite',  scene: 'sky', element: 'kite',  pattern: 'silent-e', distractors: ['o', 's'] },
  { id: 'sky-rain',  phrase: 'make the rain',   word: 'rain',  scene: 'sky', element: 'rain',  pattern: 'vowel-ai', distractors: ['o', 's'] },
  { id: 'sky-cloud', phrase: 'puff the cloud',  word: 'cloud', scene: 'sky', element: 'cloud', pattern: 'vowel-ou', distractors: ['a', 'i'] },
  { id: 'sky-comet', phrase: 'send the comet',  word: 'comet', scene: 'sky', element: 'comet', pattern: 'two-syll', distractors: ['a', 'p'] },
  { id: 'sky-snow',  phrase: 'drift the snow',  word: 'snow',  scene: 'sky', element: 'snow',  pattern: 'vowel-ow', distractors: ['a', 'p'] },
  { id: 'sky-leaf',  phrase: 'blow the leaf',   word: 'leaf',  scene: 'sky', element: 'leaf',  pattern: 'vowel-ea', distractors: ['o', 'p'] },

  // --- Crystal Castle: longer / trickier words ---
  { id: 'castle-dragon', phrase: 'wake the dragon', word: 'dragon', scene: 'castle', element: 'dragon', pattern: 'two-syll', distractors: ['e', 's'] },
  { id: 'castle-crown',  phrase: 'lift the crown',  word: 'crown',  scene: 'castle', element: 'crown',  pattern: 'vowel-ow', distractors: ['a', 'e'] },
  { id: 'castle-torch',  phrase: 'light the torch', word: 'torch',  scene: 'castle', element: 'torch',  pattern: 'digraph-ch', distractors: ['a', 'e'] },
  { id: 'castle-gate',   phrase: 'open the gate',   word: 'gate',   scene: 'castle', element: 'gate',   pattern: 'silent-e', distractors: ['o', 's'] },
  { id: 'castle-key',    phrase: 'turn the key',    word: 'key',    scene: 'castle', element: 'key',    pattern: 'vowel-ey', distractors: ['a', 'p'] },
  { id: 'castle-flag',   phrase: 'raise the flag',  word: 'flag',   scene: 'castle', element: 'flag',   pattern: 'blend-fl', distractors: ['e', 'o'] },
  { id: 'castle-cloak',  phrase: 'mend the cloak',  word: 'cloak',  scene: 'castle', element: 'cloak',  pattern: 'vowel-oa', distractors: ['e', 's'] },
  { id: 'castle-spell',  phrase: 'cast the spell',  word: 'spell',  scene: 'castle', element: 'spell',  pattern: 'blend-sp', distractors: ['a', 'o'] },
```

- [ ] **Step 4: Add glyphs in `src/ui/sceneView.js`** (extend `ELEMENT_GLYPH`)

```js
  // pond
  fish: '🐟', shell: '🐚', duck: '🦆', ship: '⛵', reed: '🌾', swan: '🦢', crab: '🦀', moth: '🦋',
  // sky
  moon: '🌙', star: '⭐', kite: '🪁', rain: '🌧️', cloud: '☁️', comet: '☄️', snow: '❄️', leaf: '🍂',
  // castle
  dragon: '🐉', crown: '👑', torch: '🔥', gate: '🚪', key: '🗝️', flag: '🚩', cloak: '🧥', spell: '✨',
```

- [ ] **Step 5: Run all tests, expect pass**

Run: `npm test`
Expected: all suites pass, including the stricter per-scene count and glyph coverage.

- [ ] **Step 6: Manual verification**

Serve the app, use settings (press-and-hold ⚙️ → Start scene) to jump to Pond, Sky, and Castle in turn; confirm each renders its backdrop, spells read aloud, words build, and elements bloom.

- [ ] **Step 7: Commit**

```bash
git add src/content.js src/ui/sceneView.js tests/content.test.js
git commit -m "feat: populate pond/sky/castle scenes and element glyphs"
```

---

## Self-Review

- **Spec coverage:** core mechanic (Tasks 8, 10), read-aloud + 🔊 helper (6, 8), build-whole-word tiles + typing option (2, 8, 9), no-fail/hint escalation (8), meta-progression + scenes + stars + bloom (4, 7, 10, 11), spaced re-queue (3), data-driven content (1, 11), flat-vector art (7), Web Speech + SFX (6), localStorage persistence (4, 10), grown-up settings (9), no-build single-page app (0). All covered.
- **Placeholder scan:** no TBD/TODO; every code step shows real code; manual-verify steps give exact console snippets and expected results.
- **Type consistency:** `spellStats` entry shape `{attempts, correct, correctStreak}` consistent across `progress.js`, `queue.js`, tests. `tile = {id, letter}`, `placed` = letter|null array, and `session = {sceneId, queue, spellId, misses}` consistent across `word.js`, `engine.js`, `spellBuilder.js`, `main.js`. Settings shape `{sound, inputMode, startScene}` consistent across `progress.js`, `settings.js`, `main.js`.

## Out of Scope (per spec)

Speech recognition, cosmetic collectibles, painterly/AI art, multiple profiles. These are explicitly future work.
