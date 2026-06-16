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
