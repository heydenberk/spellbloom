// src/main.js — wire engine + progress + audio + UI into the playable loop
import * as content from './content.js';
import { startSession, getCurrentSpell, registerAttempt } from './engine.js';
import { loadProgress, saveProgress, recordSpell, sceneBloomPercent, isSceneComplete } from './progress.js';
import { createAudio } from './audio.js';
import { renderScene, bloomElement } from './ui/sceneView.js';
import { renderSpell } from './ui/spellBuilder.js';
import { initSettings } from './ui/settings.js';
import { getScenes } from './content.js';

const sceneRoot = document.getElementById('scene');
const spellRoot = document.getElementById('spell');

let progress = loadProgress();
let audio = createAudio({ enabled: progress.settings.sound });
let session = startSession(progress, progress.currentScene, content);
let builder = null;

function sceneSpells() { return content.getSpellsForScene(session.sceneId); }
function bloomedElements() {
  return sceneSpells()
    .filter(s => (progress.spellStats[s.id]?.correct ?? 0) >= 1)
    .map(s => s.element);
}

function drawScene() {
  renderScene(sceneRoot, {
    scene: content.getScene(session.sceneId),
    bloomPercent: sceneBloomPercent(progress, sceneSpells()),
    stars: progress.stars,
    bloomedElements: bloomedElements(),
  });
}

function drawSpell() {
  const spell = getCurrentSpell(session, content);
  if (builder) builder.destroy();
  if (!spell) return showSceneComplete();
  audio.speak(spell.phrase); // read the spell aloud on arrival
  builder = renderSpell(spellRoot, {
    spell,
    inputMode: progress.settings.inputMode,
    audio,
    getMisses: () => session.misses,
    onAttempt: success => { if (!success) session = registerAttempt(session, false); },
    onCast: () => onCast(spell),
  });
}

function onCast(spell) {
  progress = recordSpell(progress, spell.id, true);
  saveProgress(progress, globalThis.localStorage);
  audio.sfx('chime');
  bloomElement(sceneRoot, spell.element);
  drawScene();
  session = registerAttempt(session, true);
  setTimeout(drawSpell, 1100); // let the bloom play before next spell
}

function showSceneComplete() {
  const done = isSceneComplete(progress, sceneSpells());
  const next = getScenes().find(s => content.getScene(session.sceneId).order + 1 === s.order);
  spellRoot.innerHTML = `<div class="scene-complete">
    <h2>✨ The ${content.getScene(session.sceneId).name} is restored! ✨</h2>
    ${done && next ? `<button id="next-scene">Travel to ${next.name} →</button>` : ''}
  </div>`;
  if (done && next) {
    document.getElementById('next-scene').addEventListener('click', () => {
      progress = { ...progress, currentScene: next.id };
      saveProgress(progress, globalThis.localStorage);
      session = startSession(progress, next.id, content);
      drawScene(); drawSpell();
    });
  }
}

initSettings({
  button: document.getElementById('settings-btn'),
  getSettings: () => progress.settings,
  onChange: s => {
    progress = { ...progress, settings: s };
    saveProgress(progress, globalThis.localStorage);
    audio.setEnabled(s.sound);
    drawSpell(); // re-render so inputMode change takes effect
  },
  onReset: () => {
    globalThis.localStorage.removeItem('spellbloom.progress.v1');
    progress = loadProgress();
    audio.setEnabled(progress.settings.sound);
    session = startSession(progress, progress.currentScene, content);
    drawScene(); drawSpell();
  },
});

drawScene();
drawSpell();
