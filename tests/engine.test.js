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
