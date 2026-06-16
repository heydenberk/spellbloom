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
  { id: 'castle-dragon', phrase: 'wake the dragon', word: 'dragon', scene: 'castle', element: 'dragon', pattern: 'two-syll',   distractors: ['e', 's'] },
  { id: 'castle-crown',  phrase: 'lift the crown',  word: 'crown',  scene: 'castle', element: 'crown',  pattern: 'vowel-ow',   distractors: ['a', 'e'] },
  { id: 'castle-torch',  phrase: 'light the torch', word: 'torch',  scene: 'castle', element: 'torch',  pattern: 'digraph-ch', distractors: ['a', 'e'] },
  { id: 'castle-gate',   phrase: 'open the gate',   word: 'gate',   scene: 'castle', element: 'gate',   pattern: 'silent-e',   distractors: ['o', 's'] },
  { id: 'castle-key',    phrase: 'turn the key',    word: 'key',    scene: 'castle', element: 'key',    pattern: 'vowel-ey',   distractors: ['a', 'p'] },
  { id: 'castle-flag',   phrase: 'raise the flag',  word: 'flag',   scene: 'castle', element: 'flag',   pattern: 'blend-fl',   distractors: ['e', 'o'] },
  { id: 'castle-cloak',  phrase: 'mend the cloak',  word: 'cloak',  scene: 'castle', element: 'cloak',  pattern: 'vowel-oa',   distractors: ['e', 's'] },
  { id: 'castle-spell',  phrase: 'cast the spell',  word: 'spell',  scene: 'castle', element: 'spell',  pattern: 'blend-sp',   distractors: ['a', 'o'] },
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
