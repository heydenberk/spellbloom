// src/ui/settings.js — press-and-hold grown-up settings overlay
import { getScenes } from '../content.js';

const HOLD_MS = 700;

export function initSettings({ button, getSettings, onChange, onReset }) {
  let timer = null;
  const start = () => { timer = setTimeout(open, HOLD_MS); };
  const cancel = () => { clearTimeout(timer); };
  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', cancel);
  button.addEventListener('pointerleave', cancel);

  function open() {
    const s = getSettings();
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <div class="settings-card">
        <h2>Grown-up settings</h2>
        <label>Start scene
          <select data-key="startScene">
            ${getScenes().map(sc => `<option value="${sc.id}" ${sc.id === s.startScene ? 'selected' : ''}>${sc.name}</option>`).join('')}
          </select>
        </label>
        <label>Input
          <select data-key="inputMode">
            <option value="tiles" ${s.inputMode === 'tiles' ? 'selected' : ''}>Drag tiles</option>
            <option value="type" ${s.inputMode === 'type' ? 'selected' : ''}>Type on keyboard</option>
          </select>
        </label>
        <label class="row"><input type="checkbox" data-key="sound" ${s.sound ? 'checked' : ''}/> Sound</label>
        <button class="reset-btn">Reset progress</button>
        <button class="close-btn">Done</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('[data-key]').forEach(ctrl => {
      ctrl.addEventListener('change', () => {
        const key = ctrl.dataset.key;
        const value = ctrl.type === 'checkbox' ? ctrl.checked : ctrl.value;
        onChange({ ...getSettings(), [key]: value });
      });
    });
    overlay.querySelector('.reset-btn').addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) { onReset(); overlay.remove(); }
    });
    overlay.querySelector('.close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }
}
