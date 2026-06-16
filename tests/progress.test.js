import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress, recordSpell, sceneBloomPercent, isSceneComplete, loadProgress, saveProgress } from '../src/progress.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
  };
}

test('emptyProgress has defaults', () => {
  const p = emptyProgress();
  assert.equal(p.stars, 0);
  assert.equal(p.currentScene, 'glade');
  assert.deepEqual(p.spellStats, {});
  assert.deepEqual(p.settings, { sound: true, inputMode: 'tiles', startScene: 'glade' });
});

test('recordSpell on success adds star, correct, streak', () => {
  const p = recordSpell(emptyProgress(), 'glade-vine', true);
  assert.equal(p.stars, 1);
  assert.deepEqual(p.spellStats['glade-vine'], { attempts: 1, correct: 1, correctStreak: 1 });
});

test('recordSpell on failure counts attempt, resets streak, no star', () => {
  let p = recordSpell(emptyProgress(), 'glade-vine', true);
  p = recordSpell(p, 'glade-vine', false);
  assert.equal(p.stars, 1);
  assert.deepEqual(p.spellStats['glade-vine'], { attempts: 2, correct: 1, correctStreak: 0 });
});

test('bloom percent and completion count spells with >=1 correct', () => {
  const spells = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  let p = emptyProgress();
  p = recordSpell(p, 'a', true);
  assert.equal(sceneBloomPercent(p, spells), 25);
  assert.equal(isSceneComplete(p, spells), false);
  for (const id of ['b', 'c', 'd']) p = recordSpell(p, id, true);
  assert.equal(sceneBloomPercent(p, spells), 100);
  assert.equal(isSceneComplete(p, spells), true);
});

test('save/load round-trips and tolerates empty/bad storage', () => {
  const store = fakeStorage();
  assert.equal(loadProgress(store).stars, 0);              // empty → defaults
  const p = recordSpell(emptyProgress(), 'a', true);
  saveProgress(p, store);
  assert.equal(loadProgress(store).stars, 1);
  store.setItem('spellbloom.progress.v1', 'not json');
  assert.equal(loadProgress(store).stars, 0);              // bad → defaults
});
