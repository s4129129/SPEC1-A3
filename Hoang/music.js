/*
  Organic background music for the climate boid scene.
  Adapted from the Spec1-A2-test11 Web Audio scheduler, but pushed toward
  low body resonance and slow swells instead of buzzy digital noise.
*/
(function () {
  const ROOTS = [82.41, 98.0, 110.0, 123.47, 146.83];
  const SCALE = [1, 1.125, 1.2, 1.333, 1.5, 1.6875, 2];
  const BPM = 42 + Math.floor(Math.random() * 9);
  const BEAT = 60 / BPM;
  const ROOT = ROOTS[Math.floor(Math.random() * ROOTS.length)];
  const DEFAULT_VOLUME = 0.24;

  let ctx = null;
  let masterGain = null;
  let filter = null;
  let delay = null;
  let delayGain = null;
  let compressor = null;
  let isPlaying = false;
  let lookaheadId = null;
  let nextStepTime = 0;
  let stepIndex = 0;
  let musicVol = 0;
  let musicLocked = false;
  let droneNodes = [];

  function makeNotePool() {
    const notes = [];
    for (const interval of SCALE) {
      notes.push(ROOT * interval);
      notes.push(ROOT * interval * 0.5);
      notes.push(ROOT * interval * 2);
    }
    return notes;
  }

  const NOTE_POOL = makeNotePool();
  const RESONANCE_POOL = [0, 3, 5, 1, 6, 4, 2, 7].map(
    (offset) => NOTE_POOL[offset % NOTE_POOL.length],
  );

  function initCtx() {
    if (ctx) {
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    filter = ctx.createBiquadFilter();
    delay = ctx.createDelay(1.2);
    delayGain = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();

    masterGain.gain.value = musicVol;
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.24;
    delay.delayTime.value = BEAT * 1.8;
    delayGain.gain.value = 0.07;
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 2.5;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.35;

    filter.connect(compressor);
    compressor.connect(masterGain);
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(filter);
    masterGain.connect(ctx.destination);
  }

  function connectVoice(node) {
    if (!filter) {
      return;
    }
    node.connect(filter);
  }

  function scheduleOrganicPulse(freq, time, dur) {
    if (!ctx) {
      return;
    }

    const body = ctx.createOscillator();
    const warmth = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const bodyFilter = ctx.createBiquadFilter();

    body.type = "sine";
    warmth.type = "sine";
    body.frequency.setValueAtTime(freq * 0.5, time);
    body.frequency.exponentialRampToValueAtTime(freq * 0.495, time + dur);
    warmth.frequency.setValueAtTime(freq * 0.251, time);
    warmth.detune.value = Math.random() * 5 - 2.5;
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.value = 260;
    bodyFilter.Q.value = 0.25;
    bodyGain.gain.setValueAtTime(0, time);
    bodyGain.gain.linearRampToValueAtTime(0.045, time + 0.42);
    bodyGain.gain.exponentialRampToValueAtTime(0.002, time + dur * 1.35);

    body.connect(bodyFilter);
    warmth.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    connectVoice(bodyGain);

    body.start(time);
    warmth.start(time);
    body.stop(time + dur * 1.38);
    warmth.stop(time + dur * 1.38);
  }

  function scheduleLowPulse(freq, time) {
    if (!ctx) {
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const voiceFilter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 0.25, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.235, time + BEAT * 2.6);
    voiceFilter.type = "lowpass";
    voiceFilter.frequency.value = 240;
    voiceFilter.Q.value = 0.45;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.085, time + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.003, time + BEAT * 3.2);

    osc.connect(voiceFilter);
    voiceFilter.connect(gain);
    connectVoice(gain);
    osc.start(time);
    osc.stop(time + BEAT * 3.25);
  }

  function scheduleAir(time) {
    if (!ctx || Math.random() > 0.18) {
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const duration = 1.1 + Math.random() * 1.8;

    osc.type = "sine";
    osc.frequency.setValueAtTime(ROOT * (0.375 + Math.random() * 0.125), time);
    osc.detune.value = Math.random() * 8 - 4;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.012, time + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.002, time + duration);

    osc.connect(gain);
    connectVoice(gain);
    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  function startDrone() {
    if (!ctx || droneNodes.length > 0) {
      return;
    }

    const now = ctx.currentTime;
    for (const multiplier of [0.25, 0.5, 0.75]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = ROOT * multiplier;
      lfo.type = "sine";
      lfo.frequency.value = 0.035 + Math.random() * 0.035;
      lfoGain.gain.value = 4 + Math.random() * 5;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.026, now + 3.2);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      osc.connect(gain);
      connectVoice(gain);
      osc.start(now);
      lfo.start(now);
      droneNodes.push({ osc, gain, lfo });
    }
  }

  function stopDrone() {
    if (!ctx) {
      droneNodes = [];
      return;
    }

    const now = ctx.currentTime;
    for (const node of droneNodes) {
      node.gain.gain.cancelScheduledValues(now);
      node.gain.gain.setValueAtTime(node.gain.gain.value, now);
      node.gain.gain.linearRampToValueAtTime(0, now + 0.4);
      node.osc.stop(now + 0.45);
      node.lfo.stop(now + 0.45);
    }
    droneNodes = [];
  }

  function scheduleLoop() {
    if (!isPlaying || !ctx) {
      return;
    }

    while (nextStepTime < ctx.currentTime + 0.18) {
      const resonanceFreq =
        RESONANCE_POOL[
          (stepIndex + Math.floor(Math.random() * 3)) % RESONANCE_POOL.length
        ];
      const stepBeats = stepIndex % 4 === 0 ? 1.5 : 0.75 + Math.random() * 0.75;
      const dur = BEAT * stepBeats * (1.8 + Math.random() * 1.2);

      if (Math.random() > 0.38) {
        scheduleOrganicPulse(resonanceFreq, nextStepTime, dur);
      }

      if (stepIndex % 10 === 0) {
        scheduleLowPulse(ROOT, nextStepTime);
      }

      scheduleAir(nextStepTime + BEAT * (0.2 + Math.random() * 0.8));
      nextStepTime += BEAT * stepBeats;
      stepIndex += 1;
    }

    lookaheadId = window.setTimeout(scheduleLoop, 35);
  }

  function startMusic() {
    initCtx();
    if (!ctx) {
      return;
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    if (isPlaying) {
      return;
    }

    isPlaying = true;
    stepIndex = 0;
    nextStepTime = ctx.currentTime + 0.08;
    startDrone();
    scheduleLoop();
  }

  function stopMusic() {
    isPlaying = false;
    if (lookaheadId !== null) {
      window.clearTimeout(lookaheadId);
      lookaheadId = null;
    }
    stopDrone();
  }

  function setMusicVol(value) {
    if (musicLocked && value > 0) {
      value = 0;
    }

    musicVol = Math.max(0, Math.min(1, value));
    if (masterGain && ctx) {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(musicVol, now + 0.12);
    }

    if (musicVol > 0 && !isPlaying) {
      startMusic();
    } else if (musicVol <= 0 && isPlaying) {
      stopMusic();
    }
  }

  function updateControlReadout() {
    const button = document.getElementById("music-toggle");
    const slider = document.getElementById("vol-music");
    const readout = document.getElementById("vol-music-num");
    const value = Math.round(musicVol * 100);

    if (slider) {
      slider.value = String(value);
      slider.disabled = musicLocked;
    }

    if (readout) {
      readout.textContent = String(value);
    }

    if (button) {
      button.setAttribute("data-state", musicVol > 0 ? "on" : "off");
      button.disabled = musicLocked;
    }
  }

  function fadeOutAndLock(durationMs = 1100) {
    musicLocked = true;

    if (!ctx || !masterGain) {
      setMusicVol(0);
      updateControlReadout();
      return;
    }

    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
    musicVol = 0;
    updateControlReadout();
    window.setTimeout(stopMusic, durationMs + 80);
  }

  function unlock() {
    musicLocked = false;
    updateControlReadout();
  }

  function setupControls() {
    const button = document.getElementById("music-toggle");
    const panel = document.getElementById("sound-panel");
    const cluster = document.getElementById("sound-cluster");
    const slider = document.getElementById("vol-music");
    const readout = document.getElementById("vol-music-num");

    if (!button || !panel || !cluster || !slider || !readout) {
      return;
    }

    let closeTimer = null;

    function syncButton() {
      button.setAttribute("data-state", musicVol > 0 ? "on" : "off");
    }

    function setSliderFromVolume() {
      const value = Math.round(musicVol * 100);
      slider.value = String(value);
      readout.textContent = String(value);
      syncButton();
    }

    function openPanel(open) {
      panel.classList.toggle("open", open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
    }

    function scheduleClose() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }
      closeTimer = window.setTimeout(() => openPanel(false), 900);
    }

    function cancelClose() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    button.addEventListener("click", () => {
      if (musicLocked) {
        return;
      }

      const nextVol = musicVol > 0 ? 0 : DEFAULT_VOLUME;
      setMusicVol(nextVol);
      setSliderFromVolume();
      openPanel(true);
    });

    slider.addEventListener("input", () => {
      if (musicLocked) {
        slider.value = "0";
        readout.textContent = "0";
        return;
      }

      const nextVol = Number.parseFloat(slider.value) / 100;
      setMusicVol(nextVol);
      readout.textContent = String(Math.round(nextVol * 100));
      syncButton();
    });

    cluster.addEventListener("mouseenter", cancelClose);
    cluster.addEventListener("mouseleave", scheduleClose);
    button.addEventListener("focus", () => openPanel(true));
    slider.addEventListener("focus", () => openPanel(true));
    syncButton();
  }

  window.OrganicMusic = {
    fadeOutAndLock,
    unlock,
  };

  window.addEventListener("DOMContentLoaded", setupControls);
})();
