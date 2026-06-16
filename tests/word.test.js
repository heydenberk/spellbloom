import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTileSet, shuffle, isCorrect, isComplete, nextCorrectIndex } from '../src/word.js';

// deterministic RNG: always returns 0.99 so Fisher-Yates indices always equal i (stable order)
const noShuffle = () => 0.99;

test('buildTileSet has one tile per letter plus distractors, unique ids', () => {
  const tiles = buildTileSet('vine', ['o', 's'], noShuffle);
  assert.equal(tiles.length, 6);
  assert.deepEqual(tiles.map(t => t.letter), ['v', 'i', 'n', 'e', 'o', 's']);
  assert.equal(new Set(tiles.map(t => t.id)).size, 6);
});

test('shuffle is deterministic with injected rng', () => {
  const arr = [1, 2, 3, 4];
  assert.deepEqual(shuffle([...arr], () => 0.99), [1, 2, 3, 4]);
  assert.deepEqual(shuffle([...arr], () => 0), [2, 3, 4, 1]);
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
