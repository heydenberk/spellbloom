// src/ui/sceneView.js — flat-vector scene rendering + bloom animation

// Each scene element is drawn as a positioned emoji-on-vector badge.
// (Flat-vector look comes from CSS shapes + the gradient backdrop in styles.css.)
export const ELEMENT_GLYPH = {
  fern: '🌿', frog: '🐸', log: '🪵', nest: '🪺', bug: '🐞',
  web: '🕸️', moss: '🍀', twig: '🌱', pond: '💧', vine: '🍃',
  // pond
  fish: '🐟', shell: '🐚', duck: '🦆', ship: '⛵', reed: '🌾', swan: '🦢', crab: '🦀', moth: '🦋',
  // sky
  moon: '🌙', star: '⭐', kite: '🪁', rain: '🌧️', cloud: '☁️', comet: '☄️', snow: '❄️', leaf: '🍂',
  // castle
  dragon: '🐉', crown: '👑', torch: '🔥', gate: '🚪', key: '🗝️', flag: '🚩', cloak: '🧥', spell: '✨',
};

export function renderScene(root, { scene, bloomPercent, stars, bloomedElements = [] }) {
  document.getElementById('scene-name').textContent = scene.name;
  document.getElementById('stars').textContent = `⭐ ${stars}`;
  document.getElementById('bloom-label').textContent = `${bloomPercent}% bloomed`;

  root.className = `scene scene--${scene.id}`;
  root.innerHTML = `
    <div class="scene-sky"></div>
    <div class="scene-ground"></div>
    <div class="bloom-bar"><div class="bloom-fill" style="width:${bloomPercent}%"></div></div>
    <div class="scene-elements"></div>
  `;
  const layer = root.querySelector('.scene-elements');
  for (const id of bloomedElements) layer.appendChild(makeElement(id, false));
}

function makeElement(elementId, animate) {
  const el = document.createElement('div');
  el.className = 'scene-element' + (animate ? ' scene-element--pop' : '');
  el.dataset.element = elementId;
  el.textContent = ELEMENT_GLYPH[elementId] ?? '✨';
  return el;
}

export function updateStatus(root, { stars, bloomPercent }) {
  document.getElementById('stars').textContent = `⭐ ${stars}`;
  document.getElementById('bloom-label').textContent = `${bloomPercent}% bloomed`;
  const fill = root.querySelector('.bloom-fill');
  if (fill) fill.style.width = `${bloomPercent}%`;
}

export function bloomElement(root, elementId) {
  const layer = root.querySelector('.scene-elements');
  if (!layer || layer.querySelector(`[data-element="${elementId}"]`)) return;
  const el = makeElement(elementId, true);
  layer.appendChild(el);
  // sparkle burst
  const spark = document.createElement('div');
  spark.className = 'sparkle';
  spark.textContent = '✨';
  el.appendChild(spark);
  spark.addEventListener('animationend', () => spark.remove());
}
