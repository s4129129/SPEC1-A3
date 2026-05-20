/* ===========================================================
   sound.js — Central sound-effects manager.
   - Loads small .wav files from /sounds/ and pools Audio instances
     so rapid triggers (e.g. hover + click) don't cut each other off.
   - Respects the existing #music-toggle state: when the Sound button
     is OFF, all SFX are muted too. When it's ON, SFX play.
   - Auto-wires .draggable assets, nav links, and buttons for click
     + hover sounds. Other modules call window.SFX.play('name').
   =========================================================== */

(function(){

  // ── Registry of available sounds ─────────────────────────
  // `pool` = how many Audio instances to preload; higher = more
  // overlapping triggers possible without clipping the previous.
  // Click and hover use variant lists so each interaction can pick a
  // fresh file instead of reusing one page-load choice.
  const clickVariants = Array.from(
    { length: 7 },
    (_, index) => `sounds/web_click${index + 1}.wav`
  );
  const hoverVariants = Array.from(
    { length: 8 },
    (_, index) => `sounds/web_hover${index + 1}.wav`
  );

  const SOUNDS = {
    click:       { srcs: clickVariants,                         pool: 4, vol: 0.55 },
    hover:       { srcs: hoverVariants,                         pool: 6, vol: 0.30 },
    pageturn:    { src: 'sounds/web_pageturn.wav',           pool: 2, vol: 0.60 },
    burn:        { src: 'sounds/nanagenart_burn.wav',        pool: 5, vol: 0.70 },
    gartHover:   { src: 'sounds/nanagenart_hover.wav',       pool: 4, vol: 0.35 },
    gartScroll:  { src: 'sounds/nanagenart_scroll.wav',      pool: 3, vol: 0.40 },
    // Drag sound — looped/repeated during a sustained drag in
    // narrative state 8. Pool of 3 so quick consecutive triggers
    // don't clip each other.
    gartDrag:    { src: 'sounds/nanagenart_drag.wav',        pool: 3, vol: 0.45 },
    // Sew sound — fires once per snap-to-home event.
    gartSew:     { src: 'sounds/nanagenart_sew.wav',         pool: 4, vol: 0.65 },
    // Genart-specific click — overrides the generic web_click only
    // for clicks inside the genart overlay (shape burns).
    gartClick:   { src: 'sounds/nanagenart_click.wav',       pool: 5, vol: 0.55 },
    gartText:    { src: '../Hoang/designed-sounds/text-popup.wav', pool: 3, vol: 0.76 },
  };

  // ── State ────────────────────────────────────────────────
  const pools = {};                    // name → [Audio, Audio, ...]
  const rr    = {};                    // name → round-robin index
  let soundOn = false;                 // synced with #music-toggle data-state
  let masterVol = 1.0;                 // 0–1 multiplier driven by SFX slider

  // Hover-debounce state per category to avoid machine-gunning
  // when the cursor grazes edges of many elements in quick succession.
  const hoverCooldowns = {
    asset:     { lastFire: 0, minGap: 60 },   // UI hover sounds
    gartShape: { lastFire: 0, minGap: 45 },   // genart shape hover
    gartScroll:{ lastFire: 0, minGap: 120 },  // genart scroll — steady paced
    gartDrag:  { lastFire: 0, minGap: 220 },  // drag — slower repeat
  };

  // ── Build pools ──────────────────────────────────────────
  for (const name in SOUNDS) {
    const cfg = SOUNDS[name];
    const srcs = Array.isArray(cfg.srcs) ? cfg.srcs : [cfg.src];

    if (srcs.length > 1) {
      pools[name] = srcs.map(src => buildAudioPool(src, cfg));
      rr[name] = srcs.map(() => 0);
    } else {
      pools[name] = buildAudioPool(srcs[0], cfg);
      rr[name] = 0;
    }
  }

  function buildAudioPool(src, cfg) {
    const pool = [];
    for (let i = 0; i < cfg.pool; i++) {
      const a = new Audio(src);
      a.preload = 'auto';
      a.volume = cfg.vol;
      pool.push(a);
    }
    return pool;
  }

  // ── Core play function ───────────────────────────────────
  // Round-robins through the pool — if instance N is still playing
  // we grab N+1 instead of killing it. Handles the browser "play()
  // returned a rejected promise" case silently.
  function play(name) {
    if (!soundOn) return;
    const cfg = SOUNDS[name];
    let pool = pools[name];
    if (!pool) return;

    let rrBucket = rr[name];
    let variantIndex = null;
    if (Array.isArray(cfg && cfg.srcs) && Array.isArray(pool[0])) {
      variantIndex = Math.floor(Math.random() * pool.length);
      pool = pool[variantIndex];
      rrBucket = rr[name][variantIndex];
    }

    const idx = rrBucket;
    if (variantIndex === null) {
      rr[name] = (idx + 1) % pool.length;
    } else {
      rr[name][variantIndex] = (idx + 1) % pool.length;
    }

    const a = pool[idx];
    try {
      a.currentTime = 0;
      // Apply master volume scale to the per-sound base volume.
      a.volume = SOUNDS[name].vol * masterVol;
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) { /* ignore */ }
  }

  // Debounced hover — returns true if the sound actually fired.
  function hover(name, category) {
    if (!soundOn) return false;
    const cd = hoverCooldowns[category];
    if (cd) {
      const now = performance.now();
      if (now - cd.lastFire < cd.minGap) return false;
      cd.lastFire = now;
    }
    play(name);
    return true;
  }

  // ── Ambient looping audio ────────────────────────────────
  // Separate from the pooled one-shots — a single long Audio element
  // that loops continuously while the genart overlay is open. Not
  // part of SOUNDS because it's not pooled or round-robined.
  // Declared BEFORE syncFromBtn so that the initial sync call can
  // safely invoke applyAmbientGate without hitting a temporal dead
  // zone on ambientWantedOn.
  const ambient = new Audio('sounds/nanagenart_ambient.wav');
  ambient.preload = 'auto';
  ambient.loop    = true;
  const AMBIENT_BASE_VOL = 0.30;   // gentle, sits behind the SFX
  ambient.volume = AMBIENT_BASE_VOL;
  let ambientWantedOn = false;     // set by startAmbient/stopAmbient

  function applyAmbientGate(){
    // Ambient is gated by BOTH the user's "wanted on" flag (genart
    // overlay open/closed) AND the global soundOn master gate. If
    // either is false, ambient pauses; if both true, ambient plays.
    if (ambientWantedOn && soundOn) {
      // Apply current master vol to ambient base
      ambient.volume = AMBIENT_BASE_VOL * masterVol;
      const p = ambient.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      ambient.pause();
    }
  }
  function startAmbient(){
    ambientWantedOn = true;
    applyAmbientGate();
  }
  function stopAmbient(){
    ambientWantedOn = false;
    applyAmbientGate();
    // Rewind so the next start begins from the top of the loop.
    try { ambient.currentTime = 0; } catch (e) {}
  }

  // ── Sync with the #music-toggle button ──────────────────
  // That button already exists (music.js toggles it between
  // data-state="on" and "off"). We observe both the initial state
  // and any future changes via a MutationObserver so we never fall
  // out of sync.
  const toggleBtn = document.getElementById('music-toggle');
  function syncFromBtn() {
    if (!toggleBtn) return;
    soundOn = toggleBtn.getAttribute('data-state') === 'on';
    // Re-apply ambient gate so it pauses/resumes with the master toggle.
    applyAmbientGate();
  }
  if (toggleBtn) {
    syncFromBtn();
    new MutationObserver(syncFromBtn).observe(toggleBtn, {
      attributes: true,
      attributeFilter: ['data-state'],
    });
  }

  // ── Auto-wire UI assets for click + hover ────────────────
  // Targets: anything the user naturally treats as interactive.
  // We use event delegation on the document so new elements
  // (e.g. dynamically generated letters) also get sounds.
  const INTERACTIVE_SELECTOR = [
    '.draggable',
    'nav.topnav a',
    '.progress-dots li',
    '.music-toggle',
    '.letter',            // sketch.js title letters
    '.genart-zoom',
    '#genart-regen',
    '#genart-close',
    '.genart-card-body',
  ].join(',');

  // Click delegation — fires on ANY click that hits an interactive target
  document.addEventListener('click', e => {
    const t = e.target.closest(INTERACTIVE_SELECTOR);
    if (!t) return;
    play('click');
  });

  // Hover delegation via pointerover — fires when pointer enters a new
  // interactive target (pointerover bubbles; mouseenter does not).
  // We track lastEntered to dedupe if the cursor moves through child
  // elements of the same asset.
  let lastEnteredAsset = null;
  document.addEventListener('pointerover', e => {
    const t = e.target.closest(INTERACTIVE_SELECTOR);
    if (!t || t === lastEnteredAsset) return;
    lastEnteredAsset = t;
    hover('hover', 'asset');
  });
  document.addEventListener('pointerout', e => {
    const t = e.target.closest(INTERACTIVE_SELECTOR);
    if (t === lastEnteredAsset && !e.relatedTarget?.closest?.(INTERACTIVE_SELECTOR)) {
      lastEnteredAsset = null;
    }
  });

  // ── Public API ───────────────────────────────────────────
  // Other scripts (pages.js, genart.js) call:
  //   window.SFX.play('pageturn')
  //   window.SFX.play('burn')
  //   window.SFX.hover('gartHover', 'gartShape')
  //   window.SFX.setMasterVol(0.7)   ← driven by the Effects slider
  //   window.SFX.startAmbient()      ← genart open
  //   window.SFX.stopAmbient()       ← genart close
  window.SFX = {
    play,
    hover,
    isOn() { return soundOn; },
    setMasterVol(v){
      masterVol = Math.max(0, Math.min(1, v));
      // Re-apply to ambient too if it's currently playing.
      if (ambientWantedOn) applyAmbientGate();
    },
    startAmbient,
    stopAmbient,
  };

})();
