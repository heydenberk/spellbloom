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
