import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, SPELLS, getScenes, getScene, getSpellsForScene, getSpell } from '../src/content.js';

test('scenes are in journey order', () => {
  assert.deepEqual(getScenes().map(s => s.id), ['glade', 'pond', 'sky', 'castle']);
});

test('glade has at least 8 spells', () => {
  assert.ok(getSpellsForScene('glade').length >= 8);
});

test('every spell is internally valid', () => {
  const ids = new Set();
  for (const s of SPELLS) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.ok(s.phrase.includes(s.word), `${s.id}: word not in phrase`);
    assert.ok(s.word.length >= 3, `${s.id}: word too short`);
    assert.ok(getScene(s.scene), `${s.id}: unknown scene`);
    for (const d of s.distractors) {
      assert.match(d, /^[a-z]$/, `${s.id}: distractor not a single lowercase letter`);
      assert.ok(!s.word.includes(d), `${s.id}: distractor ${d} already in word`);
    }
  }
});

test('getSpell returns the matching spell or undefined', () => {
  const first = SPELLS[0];
  assert.equal(getSpell(first.id).word, first.word);
  assert.equal(getSpell('nope'), undefined);
});

test('every scene has at least 8 spells', () => {
  for (const scene of getScenes()) {
    assert.ok(getSpellsForScene(scene.id).length >= 8, `${scene.id} has too few spells`);
  }
});

test('every spell element has a glyph', async () => {
  const { ELEMENT_GLYPH } = await import('../src/ui/sceneView.js');
  for (const s of SPELLS) {
    assert.ok(ELEMENT_GLYPH[s.element], `no glyph for ${s.element}`);
  }
});
