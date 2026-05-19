/* ===========================================================
   music.js — Background music synthesis + Sound control panel.
   
   Two independent things live here:
   
   1) PUNK MUSIC GENERATOR
      - A vanilla Web Audio synth that builds a unique punk riff
        every page load (random tempo, random root, random
        pattern). No echo/reverb tail (sustain=0 envelopes).
      - Master volume is controlled by the "music" slider.
   
   2) SOUND CONTROL PANEL
      - Click #music-toggle to open the panel (#sound-panel).
      - Two sliders inside: "music" (drives this synth) and
        "effects" (drives sound.js SFX volume).
      - Panel fades out when the cursor leaves it (with delay
        so dragging sliders won't dismiss it accidentally).
      - Both default to OFF (volume=0). Music is OFF until the
        slider is moved. SFX likewise.
      - Changing either slider also flips the global #music-toggle
        data-state used by sound.js, so SFX gating still works.
   =========================================================== */

(function(){

  // ─── Music synth — random parameters per load ───────────────
  const BPM   = 100 + Math.floor(Math.random() * 60);   // 100–160
  const BEAT  = 60 / BPM;
  const ROOTS = [110, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00];
  const ROOT  = ROOTS[Math.floor(Math.random() * ROOTS.length)];
  const INTERVALS = [1, 1.189, 1.335, 1.498, 1.782, 2.0];

  function makePool(){
    const pool = [];
    for (const iv of INTERVALS){
      pool.push(ROOT * iv);
      pool.push(ROOT * iv * 0.5);
    }
    return pool;
  }
  const NOTE_POOL = makePool();
  const DETUNE_CENTS = (Math.random() * 14) - 7;

  function generateRiff(){
    const len  = 8 + Math.floor(Math.random() * 9);   // 8–16 steps
    const riff = [];
    const DURATIONS = [0.25, 0.5, 0.5, 0.5, 0.75, 1.0];
    let prev = -1;
    for (let i = 0; i < len; i++){
      let idx;
      do { idx = Math.floor(Math.random() * NOTE_POOL.length); }
      while (idx === prev && NOTE_POOL.length > 1);
      prev = idx;
      const dur = DURATIONS[Math.floor(Math.random() * DURATIONS.length)];
      riff.push([NOTE_POOL[idx], dur]);
    }
    return riff;
  }
  const RIFF = generateRiff();

  // ─── AudioContext lazy init (autoplay policy) ───────────────
  let ctx          = null;
  let masterGain   = null;     // controls music volume only
  let isPlaying    = false;
  let stepIndex    = 0;
  let nextStepTime = 0;
  let lookaheadId  = null;
  let musicVol     = 0;        // 0–1, set by slider
  let sfxVol       = 0;        // 0–1, mirrored to sound.js

  function initCtx(){
    if (ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = musicVol;
    masterGain.connect(ctx.destination);
  }

  // ─── Single note synthesis ──────────────────────────────────
  function scheduleNote(freq, time, durSec){
    if (!ctx) return;
    const stop = time + durSec * 0.85;

    // ADSR: sustain=0 to kill the echo tail
    const ATTACK = 0.004, DECAY = 0.06, RELEASE = 0.04;

    function makeOsc(type, frequency){
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + ATTACK);
      gain.gain.linearRampToValueAtTime(0, time + ATTACK + DECAY);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(stop + RELEASE);
    }

    makeOsc('square',   freq);
    makeOsc('sawtooth', freq * 0.5 * Math.pow(2, DETUNE_CENTS / 1200));
  }

  function scheduleKick(time){
    if (!ctx) return;
    // Only on beat boundaries
    const beatPos = Math.round(time / BEAT);
    if (Math.abs(time - beatPos * BEAT) >= 0.025) return;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.10);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.75, time + 0.001);
    gain.gain.linearRampToValueAtTime(0, time + 0.12);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(time); osc.stop(time + 0.15);
  }

  function scheduleHat(time, beats){
    if (!ctx) return;
    // White noise burst, twice per beat
    const hats = beats * 2;
    for (let i = 0; i < hats; i++){
      const t = time + i * (BEAT / 2);
      const buffer = ctx.createBuffer(1, 1024, ctx.sampleRate);
      const data   = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
      const noise  = ctx.createBufferSource();
      noise.buffer = buffer; noise.loop = true;
      const gain   = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.001);
      gain.gain.linearRampToValueAtTime(0, t + 0.02);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 6000;
      noise.connect(hp); hp.connect(gain); gain.connect(masterGain);
      noise.start(t); noise.stop(t + 0.03);
    }
  }

  // ─── Lookahead scheduler ────────────────────────────────────
  function scheduleLoop(){
    if (!isPlaying || !ctx) return;
    const AHEAD = 0.10;
    while (nextStepTime < ctx.currentTime + AHEAD){
      const [freq, beats] = RIFF[stepIndex % RIFF.length];
      const dur = beats * BEAT;
      scheduleNote(freq, nextStepTime, dur);
      scheduleKick(nextStepTime);
      scheduleHat(nextStepTime, beats);
      nextStepTime += dur;
      stepIndex++;
    }
    lookaheadId = setTimeout(scheduleLoop, 25);
  }

  function startMusic(){
    initCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (isPlaying) return;
    isPlaying    = true;
    stepIndex    = 0;
    nextStepTime = ctx.currentTime + 0.05;
    scheduleLoop();
  }
  function stopMusic(){
    isPlaying = false;
    if (lookaheadId !== null){ clearTimeout(lookaheadId); lookaheadId = null; }
  }

  function setMusicVol(v){
    musicVol = Math.max(0, Math.min(1, v));
    if (masterGain) masterGain.gain.value = musicVol;
    if (musicVol > 0 && !isPlaying) startMusic();
    else if (musicVol === 0 && isPlaying) stopMusic();
  }

  // ─── Public MUSIC API for cross-script coordination ─────────
  // Used by nanagenart.js to auto-mute the background music when the
  // user enters the fullscreen generative art experience and restore
  // it when they exit. The pause saves the *current* slider value and
  // ramps audio to 0 WITHOUT touching the slider DOM, so the user's
  // chosen volume is remembered transparently. If the user manually
  // moves the slider while genart is open, that breaks the temporary
  // pause — resume() then becomes a no-op so we don't fight the user.
  let pausedSavedVol = null;     // null = not paused; number = vol to restore
  function pauseMusicTemporarily(){
    if (pausedSavedVol !== null) return;       // already paused
    pausedSavedVol = musicVol;                 // remember current vol
    if (masterGain) masterGain.gain.value = 0; // mute audio only
    if (isPlaying) stopMusic();                // free up CPU while muted
  }
  function resumeMusic(){
    if (pausedSavedVol === null) return;       // not paused
    const savedVol = pausedSavedVol;
    pausedSavedVol = null;
    // If the user manually changed the slider during the pause, the
    // current slider value won't match what we saved. Trust the user:
    // restore from the slider DOM, not from saved vol.
    const sliderNow = musicSlider ? readSlider(musicSlider) : savedVol;
    setMusicVol(sliderNow);
  }
  window.MUSIC = {
    pauseTemporarily: pauseMusicTemporarily,
    resume:           resumeMusic,
  };

  function setSfxVol(v){
    sfxVol = Math.max(0, Math.min(1, v));
    if (window.SFX && typeof window.SFX.setMasterVol === 'function'){
      window.SFX.setMasterVol(sfxVol);
    }
  }

  // ─── Wire up the toggle button + slider panel ───────────────
  const btn   = document.getElementById('music-toggle');
  const panel = document.getElementById('sound-panel');
  const cluster = document.getElementById('sound-cluster');
  const musicSlider = document.getElementById('vol-music');
  const sfxSlider   = document.getElementById('vol-sfx');
  const musicNum    = document.getElementById('vol-music-num');
  const sfxNum      = document.getElementById('vol-sfx-num');

  if (!btn || !panel) return;

  // Click button → toggle panel visibility
  // Also flip data-state so sound.js mute logic stays in sync.
  btn.addEventListener('click', () => {
    const willOpen = !panel.classList.contains('open');
    panel.classList.toggle('open', willOpen);
    panel.setAttribute('aria-hidden', willOpen ? 'false' : 'true');

    // data-state for sound.js: "on" iff either volume > 0
    syncBtnState();
  });

  // Fade panel out when cursor leaves the cluster (with grace
  // period so a slider drag that briefly leaves the panel doesn't
  // dismiss it).
  let closeTimer = null;
  function scheduleClose(){
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }, 600);
  }
  function cancelClose(){
    if (closeTimer){ clearTimeout(closeTimer); closeTimer = null; }
  }
  cluster.addEventListener('mouseleave', scheduleClose);
  cluster.addEventListener('mouseenter', cancelClose);

  // Slider behaviour — both sliders need a user gesture to start
  // the AudioContext, which `change`/`input` events satisfy.
  function readSlider(slider){
    return Math.max(0, Math.min(1, parseFloat(slider.value) / 100));
  }

  musicSlider.addEventListener('input', () => {
    const v = readSlider(musicSlider);
    setMusicVol(v);
    musicNum.textContent = Math.round(v * 100);
    syncBtnState();
  });
  sfxSlider.addEventListener('input', () => {
    const v = readSlider(sfxSlider);
    setSfxVol(v);
    sfxNum.textContent = Math.round(v * 100);
    syncBtnState();
  });

  // Reflect overall sound state on the button (data-state = "on"
  // if either slider is non-zero, otherwise "off"). sound.js
  // observes this attribute via MutationObserver to gate SFX.
  function syncBtnState(){
    const anyOn = musicVol > 0 || sfxVol > 0;
    btn.setAttribute('data-state', anyOn ? 'on' : 'off');
  }

  // ── Apply HTML default slider values on page load ──
  // The HTML defaults are music=0, sfx=80 so SFX work out of the
  // box without the user having to open the panel. Without this
  // init step the slider DOM values would be set but the audio
  // pipeline (setSfxVol → window.SFX.setMasterVol) would never
  // hear about them — only user input events propagate volume.
  setMusicVol(readSlider(musicSlider));
  setSfxVol(readSlider(sfxSlider));
  musicNum.textContent = Math.round(musicVol * 100);
  sfxNum.textContent   = Math.round(sfxVol   * 100);
  syncBtnState();

})();