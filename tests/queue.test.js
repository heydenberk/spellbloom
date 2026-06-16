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
