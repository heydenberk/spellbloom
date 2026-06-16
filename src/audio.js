// src/audio.js — speech + simple synthesized SFX, gated by a sound flag

const TONES = {
  chime:  { freq: 880, dur: 0.18, type: 'sine' },
  sparkle:{ freq: 1320, dur: 0.12, type: 'triangle' },
  bloop:  { freq: 220, dur: 0.12, type: 'square' },
};

export function createAudio({ enabled = true } = {}) {
  let on = enabled;
  let ctx = null;
  const synth = globalThis.speechSynthesis;

  function getCtx() {
    if (!ctx) {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      ctx = AC ? new AC() : null;
    }
    return ctx;
  }

  function utter(text, rate) {
    if (!on || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1.1;
    synth.speak(u);
  }

  return {
    setEnabled(v) { on = v; if (!v && synth) synth.cancel(); },
    isEnabled() { return on; },
    speak(text) { utter(text, 0.95); },
    speakWord(word) { utter(word.split('').join(' '), 0.6); }, // slow, sound-it-out
    sfx(name) {
      if (!on) return;
      const c = getCtx();
      const t = TONES[name];
      if (!c || !t) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = t.type;
      osc.frequency.value = t.freq;
      gain.gain.setValueAtTime(0.001, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t.dur);
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + t.dur);
    },
  };
}
