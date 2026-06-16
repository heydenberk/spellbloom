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
