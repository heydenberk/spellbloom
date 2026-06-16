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
