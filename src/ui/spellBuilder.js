// src/ui/spellBuilder.js — read-the-spell + build-the-word interaction
import { buildTileSet, isComplete, isCorrect, nextCorrectIndex } from '../word.js';

// renderSpell(root, { spell, wordGlyph, inputMode, audio, getMisses, onAttempt, onCast })
//   wordGlyph -> picture shown in place of the word she must spell (so she can't copy it)
//   onAttempt(success) -> called on every full-word attempt (updates engine/hints)
//   getMisses() -> current miss count (for hint escalation)
//   onCast() -> called once when the word is correct
export function renderSpell(root, opts) {
  const { spell, wordGlyph = '✨', inputMode, audio } = opts;
  const placed = new Array(spell.word.length).fill(null);
  let rng = Math.random;

  // Hide the target word in the scroll — show its picture instead — so she spells
  // from the sound (heard via 🔊 / read-aloud) rather than copying the letters.
  const maskedPhrase = spell.phrase.replace(
    new RegExp(`\\b${spell.word}\\b`),
    `<span class="word-pic" aria-label="${spell.word}">${wordGlyph}</span>`
  );

  root.innerHTML = `
    <div class="scroll">
      <span class="scroll-text">${maskedPhrase}</span>
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
    slot.textContent = letter; slot.classList.add('filled'); slot.classList.remove('glow');
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
