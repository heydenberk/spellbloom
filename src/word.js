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
