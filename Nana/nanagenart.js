/* ===========================================================
   genart.js — Fashion Waste × Ocean Damage generative art.
   Two instances:
     1. Small preview inside Section 3 (hover-only, no click burn).
     2. Fullscreen interactive version (scroll + hover + click burn).
   Opens fullscreen when user clicks the zoom icon. Close with ✕
   or ESC.
   =========================================================== */

(function(){

  // ═══════════════════════════════════════════════
  //  PALETTE  (kept identical to site CSS variables)
  // ═══════════════════════════════════════════════
  const C = {
    bg:     [14,  21, 120],    // darker blue background
    dark:   [ 0,   0,   0],
    pink:   [254, 21, 149],
    cyan:   [ 29,217, 219],
    yellow: [254,214,   2],
  };
  const FILL_POOL = [
    C.pink,   C.pink,   C.pink,
    C.cyan,   C.cyan,   C.cyan,
    C.yellow, C.yellow, C.yellow,
  ];

  // ═══════════════════════════════════════════════
  //  RNG
  // ═══════════════════════════════════════════════
  function makeRng() {
    let s = (Date.now() ^ Math.floor(Math.random()*1e9)) >>> 0;
    if (!s) s = 1;
    return function() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // ═══════════════════════════════════════════════
  //  GEOMETRY HELPERS
  //  V-cut + tip-notch for torn/cut paper edges.
  // ═══════════════════════════════════════════════
  function applyVCuts(pts, isHero, rng) {
    const range = (a,b) => a + rng() * (b - a);
    // Cut frequency and depth reduced so shards keep cleaner edges.
    // Previously cuts were dense and deep enough to make rectangles
    // look like jagged stars; now they're more like subtle paper-tear
    // detail. Hero shards keep slightly more character than rank-and-
    // file shards so the focal piece reads as more dramatic.
    const cutsPerEdge = isHero ? range(0.25, 0.7) : range(0.1, 0.4);
    const cutDepth    = isHero ? range(0.04, 0.10) : range(0.02, 0.06);

    // Centroid (for inward direction check)
    let scx = 0, scy = 0;
    for (const p of pts) { scx += p.ox; scy += p.oy; }
    scx /= pts.length; scy /= pts.length;

    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i+1) % pts.length];
      out.push({ ox: a.ox, oy: a.oy });
      if (rng() > cutsPerEdge) continue;

      const ex  = b.ox - a.ox, ey = b.oy - a.oy;
      const len = Math.sqrt(ex*ex + ey*ey);
      if (len < 20) continue;

      // Inward normal
      const nx = -(ey/len), ny = ex/len;
      const toC = { x: scx - (a.ox+b.ox)*.5, y: scy - (a.oy+b.oy)*.5 };
      const dot = nx*toC.x + ny*toC.y;
      const inx = dot >= 0 ? nx : -nx;
      const iny = dot >= 0 ? ny : -ny;

      const t  = range(0.25, 0.75);
      const mx = a.ox + ex*t, my = a.oy + ey*t;
      const vW = len * range(0.04, 0.11);
      const vD = len * cutDepth;

      const lx = mx - (ex/len)*vW, ly = my - (ey/len)*vW;
      const rx = mx + (ex/len)*vW, ry = my + (ey/len)*vW;
      const tip = { ox: mx + inx*vD, oy: my + iny*vD };
      out.push({ ox: lx, oy: ly }, tip, { ox: rx, oy: ry });
    }
    return notchTip(out, rng);
  }

  function notchTip(pts, rng) {
    if (pts.length < 3) return pts;
    const range = (a,b) => a + rng() * (b - a);

    let sharpIdx = 0, sharpCos = -Infinity;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i-1+pts.length) % pts.length];
      const b = pts[i];
      const c = pts[(i+1) % pts.length];
      const ux = a.ox-b.ox, uy = a.oy-b.oy;
      const vx = c.ox-b.ox, vy = c.oy-b.oy;
      const lu = Math.sqrt(ux*ux+uy*uy), lv = Math.sqrt(vx*vx+vy*vy);
      if (lu < .001 || lv < .001) continue;
      const cos = (ux*vx + uy*vy) / (lu*lv);
      if (cos > sharpCos) { sharpCos = cos; sharpIdx = i; }
    }
    if (sharpCos < 0.3) return pts;

    const a = pts[(sharpIdx-1+pts.length) % pts.length];
    const b = pts[sharpIdx];
    const c = pts[(sharpIdx+1) % pts.length];
    const abx = a.ox-b.ox, aby = a.oy-b.oy;
    const cbx = c.ox-b.ox, cby = c.oy-b.oy;
    const lab = Math.sqrt(abx*abx+aby*aby);
    const lcb = Math.sqrt(cbx*cbx+cby*cby);
    const ns  = Math.min(lab, lcb) * range(0.08, 0.18);
    const p1 = { ox: b.ox + (abx/lab)*ns, oy: b.oy + (aby/lab)*ns };
    const p2 = { ox: b.ox + (cbx/lcb)*ns, oy: b.oy + (cby/lcb)*ns };

    let scx2 = 0, scy2 = 0;
    for (const p of pts) { scx2 += p.ox; scy2 += p.oy; }
    scx2 /= pts.length; scy2 /= pts.length;
    const mcx = (p1.ox+p2.ox)*.5, mcy = (p1.oy+p2.oy)*.5;
    const inx2 = scx2-mcx, iny2 = scy2-mcy;
    const inL  = Math.sqrt(inx2*inx2 + iny2*iny2) || 1;
    const kick = range(0.02, 0.10) * ns;
    const mid  = { ox: mcx + (inx2/inL)*kick, oy: mcy + (iny2/inL)*kick };

    const out = [];
    for (let i = 0; i < pts.length; i++) {
      if (i === sharpIdx) out.push(p1, mid, p2);
      else out.push(pts[i]);
    }
    return out;
  }

  function ptInPoly(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x, yi = pts[i].y;
      const xj = pts[j].x, yj = pts[j].y;
      if (((yi > py) !== (yj > py)) &&
          (px < (xj-xi)*(py-yi)/(yj-yi) + xi)) inside = !inside;
    }
    return inside;
  }

  function lerpRgb(a, b, t) {
    return [
      (a[0]+(b[0]-a[0])*t)|0,
      (a[1]+(b[1]-a[1])*t)|0,
      (a[2]+(b[2]-a[2])*t)|0,
    ];
  }

  // ═══════════════════════════════════════════════
  //  GENERATOR FACTORY
  //  Creates a self-contained art instance bound to a canvas.
  //  Options toggle interactions for preview vs fullscreen.
  // ═══════════════════════════════════════════════
  function createArt(canvas, opts) {
    opts = Object.assign({
      interactive:  true,
      allowHover:   true,
      allowScroll:  true,
      allowClick:   true,
      onDamage:     null,     // callback(0..1) for external UI
      scaleCells:   1.0,      // <1 = more/smaller shapes in preview
      narrative:    false,    // true = run intro narrative on open
      onNarrativeChange: null,// callback(state, action) — DOM updates
    }, opts || {});

    const ctx = canvas.getContext('2d');
    let W, H;
    let shards      = [];
    let particles   = [];
    let grainCanvas = null;   // offscreen texture cache
    let mouse       = { x: -9999, y: -9999 };
    let scrollProg  = 0;
    let damageLevel = 0;
    let totalBurnt  = 0;
    let totalShards = 0;
    let rng         = makeRng();
    let running     = true;
    let rafId       = null;
    let autoScroll  = 0;     // preview slowly cycles scroll for life
    let _touchY     = null;

    // ── Narrative state ─────────────────────────────
    // PHASE 1 — INTRO (states 0–3, ends at 4 = interactive)
    // 0 = hero shape only + "This is a piece of cloth." (then the
    //     "(Click to continue)" hint fades in after a short delay)
    // 1 = others animating in (no quote text shown during this state)
    // 2 = all shapes visible + "They appear everywhere…" line
    //     (entered automatically when all shards finish floating in)
    // 3 = "Click to interact with them, and scroll to distort them"
    //     (entered when user clicks during state 2)
    // 4 = fully interactive — all gating released, click=burn, etc.
    //
    // PHASE 2 — REDEMPTION (states 5–10, triggered by 100% damage)
    // 5 = "Still want to hurt the surroundings more?"
    //     (auto-triggered when damageLevel reaches 1.0)
    // 6 = "Everything is destroyed. How could we bring it back?"
    // 7 = "Drag the cloth pieces to connect them."
    // 8 = drag-to-reconnect mode: burnt shards reappear at random
    //     offsets, user drags them home → they reconnect, colour
    //     returns (capped at ~40% saturation), bg lifts from black.
    //     (state 9 auto-triggers when most pieces are reconnected)
    // 9 = "Everything is not going to be the same."
    // 10= "Be mindful of what we are doing."
    //
    // PHASE 3 — FREE PLAY (state 11, terminal sandbox)
    // 11= no narrative box. Click-to-burn AND drag-to-reconnect both
    //     work simultaneously. Damage and recovery still affect colour
    //     in real time, but the world is permanently capped at ~40%
    //     saturation (it has been hurt — there's no full undo).
    let narrativeState = opts.narrative ? 0 : 4;
    let heroIdx        = -1;            // index of the central hero shard
    let revealStartedAt = 0;            // performance.now() for stagger base
    let recoveryLevel  = 0;             // 0..1 — how much colour has returned
    let totalRecovered = 0;             // count of reconnected burnt shards
    let dragShards     = [];            // ghost shards spawned in state 8+
    // Thin "thread" line particles spawned at sew-snap moments.
    // Each: {x,y,vx,vy,len,ang,angVel,life,decay,color}
    let threads        = [];
    // Once true, effectiveDamage is floored at 0.4 — the world is
    // permanently faded. Set when state 5 first triggers.
    let hasReachedRedemption = false;

    function range(a,b) { return a + rng() * (b - a); }
    function pick(arr)  { return arr[Math.floor(rng()*arr.length)]; }

    // ── Generation ─────────────────────────────────
    function generate() {
      rng       = makeRng();
      shards    = [];
      particles = [];
      threads   = [];

      const s = opts.scaleCells;
      const ANGLE     = 1.18;
      const SPINE_GAP = 130 * s;
      const SEG_H     = 160 * s;
      // Jitter reduced from (0.74, 0.40) to (0.42, 0.22) so spine
      // vertices don't drift far from their grid positions. Lower
      // jitter produces shards with more rectangular character
      // (sides stay parallel to the spine direction) and prevents
      // thin sliver triangles that form when adjacent vertices
      // jitter in opposing directions.
      const JX        = 0.42, JY = 0.22;

      const coverX = W + H*ANGLE;
      const startX = -(H*ANGLE) - SPINE_GAP*3;
      const spineN = Math.ceil(coverX/SPINE_GAP) + 6;
      const segN   = Math.ceil(H/SEG_H) + 4;

      const spines = [];
      for (let i = 0; i < spineN; i++) {
        const x0 = startX + (i/spineN) * (coverX + SPINE_GAP*6);
        const sp = [];
        for (let j = 0; j <= segN; j++) {
          const by = -SEG_H*2 + (j/segN)*(H + SEG_H*4);
          const bx = x0 + by*ANGLE;
          sp.push({
            ox: bx + (rng()-.5)*SPINE_GAP*JX,
            oy: by + (rng()-.5)*SEG_H*JY,
          });
        }
        spines.push(sp);
      }

      const maxI = spines.length - 1;
      const maxJ = spines[0].length - 1;
      const tag  = Array.from({length:maxI}, () => Array(maxJ).fill('n'));

      for (let i = 0; i < maxI; i++) {
        for (let j = 0; j < maxJ; j++) {
          if (tag[i][j] !== 'n') continue;
          const r = rng();
          const canBig = i<maxI-1 && j<maxJ-1 && tag[i+1][j]==='n' && tag[i][j+1]==='n' && tag[i+1][j+1]==='n';
          const canV3  = j<maxJ-2 && tag[i][j+1]==='n' && tag[i][j+2]==='n';
          const canH3  = i<maxI-2 && tag[i+1][j]==='n' && tag[i+2][j]==='n';
          const canV   = j<maxJ-1 && tag[i][j+1]==='n';
          const canH   = i<maxI-1 && tag[i+1][j]==='n';
          if      (r<.06 && canBig) { tag[i][j]='b';  tag[i+1][j]=tag[i][j+1]=tag[i+1][j+1]='x'; }
          else if (r<.11 && canV3)  { tag[i][j]='v3'; tag[i][j+1]=tag[i][j+2]='x'; }
          else if (r<.16 && canH3)  { tag[i][j]='h3'; tag[i+1][j]=tag[i+2][j]='x'; }
          else if (r<.24 && canV)   { tag[i][j]='v2'; tag[i][j+1]='x'; }
          else if (r<.32 && canH)   { tag[i][j]='h2'; tag[i+1][j]='x'; }
        }
      }

      for (let i = 0; i < maxI; i++) {
        for (let j = 0; j < maxJ; j++) {
          const t = tag[i][j]; if (t === 'x') continue;
          const sA = spines[i], sB = spines[i+1], sC = spines[i+2];
          const cl = (idx, arr) => Math.min(idx, arr.length-1);
          if      (t==='b'  && sB && sC) populateMerged(sA[j], sA[cl(j+2,sA)], sC[j], sC[cl(j+2,sC)]);
          else if (t==='v3' && sB)       populateMerged(sA[j], sA[cl(j+2,sA)], sB[j], sB[cl(j+2,sB)]);
          else if (t==='h3' && sC)       populateMerged(sA[j], sA[cl(j+1,sA)], sC[j], sC[cl(j+1,sC)]);
          else if (t==='v2' && sB)       populateMerged(sA[j], sA[cl(j+1,sA)], sB[j], sB[cl(j+1,sB)]);
          else if (t==='h2' && sB)       populateMerged(sA[j], sA[cl(j+1,sA)], sB[j], sB[cl(j+1,sB)]);
          else if (sB && j+1 <= maxJ)    populateCell(sA[j], sA[j+1], sB[j], sB[j+1]);
        }
      }
      totalShards = shards.length;

      // ── Narrative init ─────────────────────────────
      // If narrative mode is on, find the shard whose centroid is
      // closest to the canvas center — that becomes the "hero" piece
      // shown alone in state 0. All other shards are hidden until
      // state 1 staggers them in.
      if (opts.narrative && narrativeState < 4) {
        const cxCanvas = W / 2, cyCanvas = H / 2;
        let bestDist = Infinity;
        heroIdx = -1;
        for (let i = 0; i < shards.length; i++) {
          const s = shards[i];
          let cx = 0, cy = 0;
          for (const p of s.pts) { cx += p.ox; cy += p.oy; }
          cx /= s.pts.length; cy /= s.pts.length;
          // Penalize shards too far from center, but also prefer ones
          // that are reasonably sized (not huge, not tiny). Distance
          // alone is enough — the tessellation tends to produce
          // similar-sized shards in the center anyway.
          const d = (cx - cxCanvas) * (cx - cxCanvas) +
                    (cy - cyCanvas) * (cy - cyCanvas);
          if (d < bestDist) { bestDist = d; heroIdx = i; }
        }
        if (heroIdx >= 0) {
          // Hero is fully visible immediately
          shards[heroIdx].reveal   = 1.0;
          shards[heroIdx].revealAt = 0;
          // All others start hidden
          for (let i = 0; i < shards.length; i++) {
            if (i === heroIdx) continue;
            shards[i].reveal   = 0.0;
            shards[i].revealAt = -1;
          }
        }
      }
    }

    function populateMerged(a0, a1, b0, b1) {
      const r = rng();
      // Probability redistribution: previously 70% of merged cells
      // produced triangles (split quad → 2 triangles, single triangle
      // pick, midpoint-cut → 2 triangles). Bias HEAVILY toward the
      // single-quad branch so merged cells render as clean rectangles
      // most of the time, with only occasional triangular accents.
      if (r < .85) {
        // 85%: clean merged quad — the rectangular "main" shape.
        pushShape([a0,a1,b1,b0], 0.72, 0.84, true);
      } else if (r < .95) {
        // 10%: single triangle accent for variation.
        const tris = [[a0,a1,b1],[a0,a1,b0],[a1,b1,b0],[a0,b0,b1]];
        pushShape(tris[Math.floor(rng()*4)], 0.68, 0.80, true);
      } else {
        // 5%: midpoint-cut into 2 triangles (kept rare for character).
        const mL = { ox:(a0.ox+b0.ox)*.5+(rng()-.5)*10, oy:(a0.oy+b0.oy)*.5+(rng()-.5)*8 };
        const mH = { ox:(a1.ox+b1.ox)*.5+(rng()-.5)*10, oy:(a1.oy+b1.oy)*.5+(rng()-.5)*8 };
        pushShape([a0,a1,mH], 0.62, 0.74, true);
        pushShape([b0,b1,mL], 0.62, 0.74, true);
      }
    }

    function populateCell(a0, a1, b0, b1) {
      const r = rng();
      if (r < .08) return;
      // Same logic: bias toward clean quads. Previously ~64% of cells
      // were triangle splits. Now 80% are clean quads, 12% triangles.
      if (r < .80)      { pushShape([a0,a1,b1,b0], 0.62, 0.74, false); }
      else if (r < .92) {
        // Single triangle accent.
        const tris = [[a0,a1,b1],[a0,a1,b0],[a1,b1,b0],[a0,b0,b1]];
        pushShape(tris[Math.floor(rng()*4)], 0.58, 0.70, false);
      } else {
        // Diagonal split into 2 triangles — rare accent.
        const s = range(0.62, 0.74);
        if (rng() > .5) { pushShape([a0,a1,b1], s, s+.01, false); pushShape([a0,b0,b1], s, s+.01, false); }
        else            { pushShape([a0,a1,b0], s, s+.01, false); pushShape([a1,b1,b0], s, s+.01, false); }
      }
    }

    function pushShape(rawPts, scaleMin, scaleMax, isHero) {
      const xs = rawPts.map(p => p.ox), ys = rawPts.map(p => p.oy);
      const M = 40;
      if (Math.max(...xs) < -M || Math.min(...xs) > W+M ||
          Math.max(...ys) < -M || Math.min(...ys) > H+M) return;

      // Reject thin sliver shapes — those produced when adjacent
      // spine vertices happen to jitter in opposing directions.
      // A short-to-long-side ratio below 0.25 means the shape is
      // more sliver than shard and reads as visually wobbly.
      const bboxW = Math.max(...xs) - Math.min(...xs);
      const bboxH = Math.max(...ys) - Math.min(...ys);
      const minSide = Math.min(bboxW, bboxH);
      const maxSide = Math.max(bboxW, bboxH);
      if (maxSide > 0 && minSide / maxSide < 0.25) return;

      let cx = 0, cy = 0;
      for (const p of rawPts) { cx += p.ox; cy += p.oy; }
      cx /= rawPts.length; cy /= rawPts.length;

      const scale = range(scaleMin, scaleMax);
      let pts = rawPts.map(p => ({
        ox: cx + (p.ox - cx) * scale,
        oy: cy + (p.oy - cy) * scale,
      }));
      pts = applyVCuts(pts, isHero, rng);

      const fillRgb = pick(FILL_POOL);
      shards.push({
        pts, rgb: fillRgb, pattern: assignPattern(fillRgb),
        burn:0, burning:false, burnt:false,
        // sewn: 0 means no stitch overlay drawn. Set to 1e-3 in
        // snapGhost() to start the stitch-grow animation that
        // climbs to 1 over ~700ms and stays there permanently.
        sewn: 0,
        // Narrative reveal: when narrativeState is active, shapes other
        // than the hero start hidden and animate in. revealAt is the
        // performance.now() timestamp at which this shard should begin
        // its fade-in. -1 means "still hidden". reveal is the eased
        // 0..1 progress toward fully visible.
        revealAt: -1,
        reveal:   1.0,   // default: fully visible (overridden in narrative)
      });
    }

    // ── Narrative state machine ─────────────────────────────
    // Called when the user clicks during a click-advancing state.
    // Auto-advances are triggered from draw() (1→2 on float-in done,
    // 4→5 on damage hits 1.0, 8→9 on most pieces reconnected).
    function advanceNarrative() {
      if (!opts.narrative) return;
      if (narrativeState >= 11) return;       // 11 is terminal sandbox

      // Animation phases the user can't skip
      if (narrativeState === 1) return;       // float-in
      if (narrativeState === 8) return;       // drag-to-reconnect

      narrativeState++;

      if (narrativeState === 1) {
        // The user clicked on "(Click to continue)"
        // → trigger the floating-in of all other shards.
        // Stagger reveal start times by distance from hero, so the
        // animation radiates outward from the central piece.
        const now = performance.now();
        revealStartedAt = now;
        if (heroIdx >= 0) {
          const hero = shards[heroIdx];
          let hx = 0, hy = 0;
          for (const p of hero.pts) { hx += p.ox; hy += p.oy; }
          hx /= hero.pts.length; hy /= hero.pts.length;

          // Maximum distance from hero — used to normalize stagger.
          let maxD = 0;
          const dists = new Array(shards.length);
          for (let i = 0; i < shards.length; i++) {
            if (i === heroIdx) { dists[i] = 0; continue; }
            const s = shards[i];
            let cx = 0, cy = 0;
            for (const p of s.pts) { cx += p.ox; cy += p.oy; }
            cx /= s.pts.length; cy /= s.pts.length;
            const d = Math.sqrt((cx-hx)*(cx-hx) + (cy-hy)*(cy-hy));
            dists[i] = d;
            if (d > maxD) maxD = d;
          }
          const STAGGER_TOTAL = 1800;
          for (let i = 0; i < shards.length; i++) {
            if (i === heroIdx) continue;
            const t = maxD > 0 ? dists[i] / maxD : 0;
            const jitter = (rng() - 0.5) * 200;
            shards[i].revealAt = now + t * STAGGER_TOTAL + jitter;
          }
        }
      }

      // State 7 → 8: spawn drag-able ghost shards from all burnt ones.
      // Each ghost gets the burnt shard's polygon outline plus a random
      // offset from its home position. User drags the ghost back to home;
      // when within snap radius, the original shard "reconnects".
      if (narrativeState === 8) {
        spawnDragShards();
      }

      if (opts.onNarrativeChange) opts.onNarrativeChange(narrativeState);
    }

    // Build the draggable ghost shards used in state 8.
    // For each shard that was burnt (s.burnt === true), compute its
    // home centroid and create a ghost with a random scattered position.
    // Spawn a single drag-able ghost for the shard at index `idx`.
    // Used both by the bulk spawn (state 7→8) and by free-play
    // (state 11) when a shape is freshly burnt and needs an
    // immediately-draggable counterpart.
    function spawnGhostForShard(idx) {
      const s = shards[idx];
      let hx = 0, hy = 0;
      for (const p of s.pts) { hx += p.ox; hy += p.oy; }
      hx /= s.pts.length; hy /= s.pts.length;
      const angle  = rng() * Math.PI * 2;
      const radius = 100 + rng() * 180;
      const margin = 60;
      const sx = Math.max(margin, Math.min(W - margin, hx + Math.cos(angle) * radius));
      const sy = Math.max(margin, Math.min(H - margin, hy + Math.sin(angle) * radius));
      dragShards.push({
        shardIdx: idx,
        x: sx, y: sy,
        homeX: hx, homeY: hy,
        snapR: 80,
        dragging: false,
        snapped: false,
      });
    }

    // Bulk spawn — used at state 7→8 for every currently-burnt shard.
    function spawnDragShards() {
      dragShards = [];
      for (let i = 0; i < shards.length; i++) {
        if (!shards[i].burnt) continue;
        spawnGhostForShard(i);
      }
    }

    // Called from the outside (e.g. when fullscreen reopens) to
    // restart the narrative from the beginning.
    function resetNarrative() {
      if (!opts.narrative) return;
      narrativeState = 0;

      // Wipe all damage / redemption state too — a reset is a full
      // restart of the experience, not just a text rewind.
      damageLevel    = 0;
      totalBurnt     = 0;
      scrollProg     = 0;
      recoveryLevel  = 0;
      totalRecovered = 0;
      dragShards     = [];
      threads        = [];
      hasReachedRedemption = false;
      if (opts.onDamage) opts.onDamage(0);

      // Clear burn state on every shard so previously-burnt ones come
      // back to life on the canvas.
      for (let i = 0; i < shards.length; i++) {
        shards[i].burnt   = false;
        shards[i].burning = false;
        // Clear sewn-stitch overlay too — restart is fresh.
        shards[i].sewn    = 0;
        shards[i].burn    = 0;
      }

      // Re-pick hero and re-hide siblings (uses the existing shard
      // layout — no need to regenerate the tessellation).
      const cxCanvas = W / 2, cyCanvas = H / 2;
      let bestDist = Infinity;
      heroIdx = -1;
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        let cx = 0, cy = 0;
        for (const p of s.pts) { cx += p.ox; cy += p.oy; }
        cx /= s.pts.length; cy /= s.pts.length;
        const d = (cx - cxCanvas) * (cx - cxCanvas) +
                  (cy - cyCanvas) * (cy - cyCanvas);
        if (d < bestDist) { bestDist = d; heroIdx = i; }
      }
      for (let i = 0; i < shards.length; i++) {
        if (i === heroIdx) {
          shards[i].reveal = 1.0; shards[i].revealAt = 0;
        } else {
          shards[i].reveal = 0.0; shards[i].revealAt = -1;
        }
      }
      if (opts.onNarrativeChange) opts.onNarrativeChange(0);
    }

    // ~30% of shards get a pattern overlay. Pattern colour is always
    // a DIFFERENT palette colour from the shape's solid fill.
    // Strictly pink / cyan / yellow — no white, no black, no same as fill.
    const PATTERN_TYPES = ['dots', 'checks', 'stripes'];

    function assignPattern(fillRgb) {
      if (rng() > 0.30) return null;   // 70% stay solid
      const type = PATTERN_TYPES[Math.floor(rng() * PATTERN_TYPES.length)];
      // Exclude the shape's own fill colour (reference comparison works because
      // FILL_POOL entries are the same C.xxx objects reused everywhere).
      const candidates = [C.pink, C.cyan, C.yellow].filter(c => c !== fillRgb);
      const col = candidates[Math.floor(rng() * candidates.length)];
      return { type, col };
    }

    // Build a tiny offscreen tile canvas for a given pattern type + colour.
    // Returns a CanvasPattern (or null on failure).
    // The tile has the shape's OWN fill colour as background,
    // and the contrasting colour as the pattern marks — both fully opaque.
    // This matches the reference: bold, graphic, like pop-art fabric.
    function buildTile(patternType, bgCol, markCol) {
      const br = bgCol[0],   bg_ = bgCol[1],  bb = bgCol[2];
      const mr = markCol[0], mg  = markCol[1], mb = markCol[2];
      const oc = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(1, 1)
        : document.createElement('canvas');
      const gc = oc.getContext('2d');

      if (patternType === 'dots') {
        // Polka dots — 28×28 tile, 7px radius (smaller than before)
        const sz = 28, r = 7;
        oc.width = sz; oc.height = sz;
        gc.fillStyle = `rgb(${br},${bg_},${bb})`;
        gc.fillRect(0, 0, sz, sz);
        gc.fillStyle = `rgb(${mr},${mg},${mb})`;
        // Centre dot
        gc.beginPath(); gc.arc(sz*0.5, sz*0.5, r, 0, Math.PI*2); gc.fill();
        // Corner quarter-circles so the tile repeats seamlessly
        gc.beginPath(); gc.arc(0,  0,  r, 0, Math.PI*2); gc.fill();
        gc.beginPath(); gc.arc(sz, 0,  r, 0, Math.PI*2); gc.fill();
        gc.beginPath(); gc.arc(0,  sz, r, 0, Math.PI*2); gc.fill();
        gc.beginPath(); gc.arc(sz, sz, r, 0, Math.PI*2); gc.fill();

      } else if (patternType === 'checks') {
        // Checkerboard — 28×28 tile, each square 14×14 (smaller)
        const sz = 28, half = 14;
        oc.width = sz; oc.height = sz;
        gc.fillStyle = `rgb(${br},${bg_},${bb})`;
        gc.fillRect(0, 0, sz, sz);
        gc.fillStyle = `rgb(${mr},${mg},${mb})`;
        gc.fillRect(0,    0,    half, half);
        gc.fillRect(half, half, half, half);

      } else {
        // Stripes — solid diagonal bands at 45°.
        // Build from filled parallelograms so there are NO gaps or
        // line-cap artifacts — just clean alternating colour bands.
        // Band width = 10px along the axis perpendicular to 45°.
        // Tile size must be square and equal to 2× the band width so
        // the repeat lines up perfectly.
        const band = 10;          // width of each colour band (px)
        const sz   = band * 2;   // tile = 20×20
        oc.width = sz; oc.height = sz;

        // Fill background colour
        gc.fillStyle = `rgb(${br},${bg_},${bb})`;
        gc.fillRect(0, 0, sz, sz);

        // Fill mark colour as diagonal parallelogram bands.
        // At 45°, a band of width `band` has a horizontal run of `band`
        // pixels. We draw one band centred in the tile, plus fragments
        // at the edges that tile to form the adjacent bands.
        gc.fillStyle = `rgb(${mr},${mg},${mb})`;

        // A 45° stripe: for each row y, fill from x = y to x = y+band (mod sz)
        // We do this via clipping + large rect instead of per-pixel work.
        // Trick: draw a rotated rectangle using polygon fill.
        const drawBand = (offset) => {
          gc.beginPath();
          // Parallelogram corners for a 45° band shifted by `offset`
          gc.moveTo(offset,        0);
          gc.lineTo(offset + band, 0);
          gc.lineTo(offset + band + sz, sz);
          gc.lineTo(offset + sz,        sz);
          gc.closePath();
          gc.fill();
        };

        // Draw enough copies to cover the tile fully with wrapping
        for (let o = -sz; o <= sz * 2; o += sz) {
          drawBand(o);
        }
      }

      try { return ctx.createPattern(oc, 'repeat'); }
      catch(e) { return null; }
    }

    function spawnParticles(cx, cy, rgb) {
      for (let i = 0; i < 26; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 0.6 + Math.random() * 4.2;
        particles.push({
          x:  cx + (Math.random()-.5)*90,
          y:  cy + (Math.random()-.5)*65,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 2.6,
          life:  1,
          decay: .010 + Math.random()*.022,
          sz:    2.5 + Math.random()*10,
          r: rgb[0], g: rgb[1], b: rgb[2],
        });
      }
    }

    // ── Render ─────────────────────────────────
    function draw() {
      if (!running) return;
      const t = performance.now() / 1000;
      const tMs = performance.now();

      // Preview mode: gentle auto-animation on scroll state for life
      if (!opts.allowScroll && !opts.allowClick) {
        autoScroll += 0.0016;
        scrollProg = 0.18 + Math.sin(autoScroll) * 0.12;
      }
      const sw = scrollProg;

      // ── Narrative reveal animation update ─────────────
      // Advance per-shard reveal progress from 0 → 1 once revealAt
      // has been set (which only happens during state 1 transition).
      // Eases via simple cubic-out for smooth float-in.
      if (opts.narrative && narrativeState >= 1 && narrativeState < 4) {
        const FADE_MS = 700;
        let allDone = true;
        for (let i = 0; i < shards.length; i++) {
          const s = shards[i];
          if (s.revealAt < 0) { allDone = false; continue; }
          if (s.reveal >= 1) continue;
          const elapsed = tMs - s.revealAt;
          if (elapsed < 0) { allDone = false; continue; }
          const lin = Math.min(1, elapsed / FADE_MS);
          s.reveal = 1 - Math.pow(1 - lin, 3); // cubic ease-out
          if (s.reveal < 1) allDone = false;
        }
        // When all shards finish floating in, automatically advance
        // from state 1 → state 2 so the second quote line appears.
        // (User then clicks once more to reach 3, then 4.)
        if (allDone && narrativeState === 1) {
          narrativeState = 2;
          if (opts.onNarrativeChange) opts.onNarrativeChange(2);
        }
      }

      // ── Background — solid blue that lerps toward black with damage,
      // overlaid with a pre-generated grain texture (clouds + scratches
      // + sine-warped point swirls) for a paper / film feel.
      //
      // Once the user has reached state 5+ (redemption arc triggered),
      // `effectiveDamage` is permanently mapped into the [0.4 .. 1.0]
      // range — the world has been hurt and the floor is 40% darkness
      // (so colours never return past ~60% saturation). Within that
      // range, burning more still darkens proportionally and
      // reconnecting still lightens proportionally:
      //   damage 0   → effectiveDamage 0.4 (floor, fully reconnected)
      //   damage 0.5 → effectiveDamage 0.7 (5 shapes still burnt)
      //   damage 1   → effectiveDamage 1.0 (all burnt again)
      let effectiveDamage = damageLevel;
      if (hasReachedRedemption) effectiveDamage = 0.4 + damageLevel * 0.6;

      const bg = lerpRgb(C.bg, C.dark, Math.pow(effectiveDamage, 0.65));
      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
      ctx.fillRect(0, 0, W, H);

      // Grain texture — generated once per resize, blitted every frame.
      // Its overall opacity fades slightly as the environment darkens
      // so the background doesn't stay "busy" once everything is burnt.
      // Capped at 0.55 (was 1.0) so on large displays the accumulated
      // grain doesn't read as a uniform white wash.
      if (grainCanvas) {
        ctx.save();
        ctx.globalAlpha = Math.max(0.18, 0.55 - effectiveDamage * 0.35);
        ctx.drawImage(grainCanvas, 0, 0, W, H);
        ctx.restore();
      }

      const HR = 180, HF = 65;

      // ── Two-pass render for shapes ─────────────────────
      // Pass 1: compute displaced points for every shape and draw
      //         a hard-edged offset "shadow copy" underneath.
      //         Shadow colour lerps white → black with damage.
      //         This reads as a second paper layer behind the shape,
      //         not as a soft glow.
      // Pass 2: draw the actual coloured shape on top.
      const displaced = new Array(shards.length);

      // Shadow tint for this frame (uses effectiveDamage too)
      const shv = (255 * (1 - effectiveDamage)) | 0;
      const SHADOW_FILL = `rgb(${shv},${shv},${shv})`;
      const SHADOW_OX   = 8 * (window.devicePixelRatio > 1 ? 2 : 1);
      const SHADOW_OY   = 10 * (window.devicePixelRatio > 1 ? 2 : 1);

      // Pass 1 — underlayer shapes (skip burning / burnt / hidden)
      for (let si = 0; si < shards.length; si++) {
        const s = shards[si];
        if (s.burnt || s.burning) { displaced[si] = null; continue; }
        // Hidden during narrative state 0; partially visible during 1
        if (s.reveal <= 0.01) { displaced[si] = null; continue; }

        const cp = s.pts.map(p => {
          let x = p.ox, y = p.oy;
          if (sw > 0) {
            // ── Twist warp ──
            // Magnitude SATURATES via tanh/exp so vertices never fly
            // off-screen no matter how far the user scrolls. But the
            // FREQUENCY and PHASE keep advancing with sw, so the visual
            // pattern is visibly different at sw=1, sw=3, sw=10, sw=30,
            // etc — the shapes keep twisting into new configurations.
            const sat   = 1 - Math.exp(-sw * 0.7);            // 0 → 1
            const freq  = 0.0095 * (1 + Math.min(sw, 8) * 0.18); // freq grows then caps
            const phase = sw * 1.3;                            // phase rotates forever
            x += Math.sin(y * freq + t * 1.1 + phase)         * sat * 90;
            y += Math.cos(x * freq + t * 0.65 + phase * 0.8)  * sat * 42;
            // Diagonal shear adds a "tearing" feel — also saturates.
            x += (y / H - 0.5) * sat * 110;
            y += (x / W - 0.5) * sat * 22;
            // Radial swirl that kicks in at higher scroll — rotates
            // the entire field around centre with a frequency that
            // shifts with sw. Magnitude clamped via tanh.
            const swirlAmp = Math.tanh(sw * 0.45) * 38;
            const a = Math.atan2(y - H * 0.5, x - W * 0.5);
            x += Math.cos(a * 3 + sw * 1.7) * swirlAmp;
            y += Math.sin(a * 3 + sw * 1.7) * swirlAmp;
          }
          if (opts.allowHover && (narrativeState === 4 || narrativeState === 11)) {
            const dx = x - mouse.x, dy = y - mouse.y;
            const d  = Math.sqrt(dx*dx + dy*dy);
            if (d < HR && d > .001) {
              const f = (1 - d/HR) * HF;
              x += (dx/d) * f;
              y += (dy/d) * f;
            }
          }
          return { x, y };
        });
        displaced[si] = cp;

        // Draw hard-edged offset shadow copy.
        // Fade its alpha with reveal during the float-in animation.
        if (s.reveal < 1) ctx.globalAlpha = s.reveal;
        ctx.beginPath();
        ctx.moveTo(cp[0].x + SHADOW_OX, cp[0].y + SHADOW_OY);
        for (let i = 1; i < cp.length; i++) {
          ctx.lineTo(cp[i].x + SHADOW_OX, cp[i].y + SHADOW_OY);
        }
        ctx.closePath();
        ctx.fillStyle = SHADOW_FILL;
        ctx.fill();
        if (s.reveal < 1) ctx.globalAlpha = 1;
      }

      // Pass 2 — actual shapes (coloured fill, burning states)
      for (let si = 0; si < shards.length; si++) {
        const s = shards[si];
        if (s.burnt) continue;
        // Skip not-yet-revealed shards in narrative
        if (s.reveal <= 0.01) continue;

        // For burning shapes we need fresh displaced pts too
        let cp = displaced[si];
        if (!cp) {
          cp = s.pts.map(p => {
            let x = p.ox, y = p.oy;
            if (sw > 0) {
              // Same warp as Pass 1 — see comments there. Kept inline
              // (not extracted into a helper) to avoid call overhead
              // in the per-frame, per-vertex hot path.
              const sat   = 1 - Math.exp(-sw * 0.7);
              const freq  = 0.0095 * (1 + Math.min(sw, 8) * 0.18);
              const phase = sw * 1.3;
              x += Math.sin(y * freq + t * 1.1 + phase)         * sat * 90;
              y += Math.cos(x * freq + t * 0.65 + phase * 0.8)  * sat * 42;
              x += (y / H - 0.5) * sat * 110;
              y += (x / W - 0.5) * sat * 22;
              const swirlAmp = Math.tanh(sw * 0.45) * 38;
              const a = Math.atan2(y - H * 0.5, x - W * 0.5);
              x += Math.cos(a * 3 + sw * 1.7) * swirlAmp;
              y += Math.sin(a * 3 + sw * 1.7) * swirlAmp;
            }
            if (opts.allowHover && (narrativeState === 4 || narrativeState === 11)) {
              const dx = x - mouse.x, dy = y - mouse.y;
              const d  = Math.sqrt(dx*dx + dy*dy);
              if (d < HR && d > .001) {
                const f = (1 - d/HR) * HF;
                x += (dx/d) * f;
                y += (dy/d) * f;
              }
            }
            return { x, y };
          });
        }

        // Apply reveal alpha for the entire shape draw
        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = prevAlpha * s.reveal;

        ctx.beginPath();
        ctx.moveTo(cp[0].x, cp[0].y);
        for (let i = 1; i < cp.length; i++) ctx.lineTo(cp[i].x, cp[i].y);
        ctx.closePath();

        if (s.burning) {
          s.burn += .028;
          if (s.burn >= 1) {
            s.burnt = true; totalBurnt++;
            // Fixed: each burned shape advances damage by ~10%,
            // independent of how many shapes the screen happens to hold.
            // On a large screen with hundreds of shards we don't want to
            // need hundreds of clicks; the experience should feel the
            // same at any resolution.
            damageLevel = Math.min(1, totalBurnt / 10);
            if (opts.onDamage) opts.onDamage(damageLevel);
            // Auto-trigger redemption arc when damage hits 100% in state 4.
            // Sets the permanent "world is hurt" flag too — once set, the
            // visual damage floor stays at 0.4 forever, so even full
            // reconnection won't restore vibrant colour.
            if (opts.narrative && narrativeState === 4 && damageLevel >= 1) {
              narrativeState = 5;
              hasReachedRedemption = true;
              if (opts.onNarrativeChange) opts.onNarrativeChange(5);
            }
            // FREE PLAY (state 11): every burn spawns a drag-ghost
            // so the user can immediately reconnect what they burnt.
            // The recovery counter is NOT decremented when burning —
            // recovery is a cumulative "how much have you tried to
            // repair" counter, not a current-state count.
            if (opts.narrative && narrativeState === 11) {
              spawnGhostForShard(si);
            }
            ctx.globalAlpha = prevAlpha;   // restore before continue
            continue;
          }
          const inv = 1 - s.burn;
          ctx.fillStyle = `rgba(255,${(55*inv)|0},0,${inv*.93})`;
          ctx.shadowColor = '#FED602'; ctx.shadowBlur = 45*inv;
          ctx.fill(); ctx.shadowBlur = 0;
          if (s.burn < .055) {
            let pcx = 0, pcy = 0;
            for (const p of cp) { pcx += p.x; pcy += p.y; }
            spawnParticles(pcx/cp.length, pcy/cp.length, s.rgb);
          }
        } else {
          const [r,g,b] = s.rgb;

          if (!s.pattern) {
            // Solid shape — lerp toward white as damage rises.
            // Uses effectiveDamage so reconnection brings colour back.
            const wr = (r + (255-r)*effectiveDamage) | 0;
            const wg = (g + (255-g)*effectiveDamage) | 0;
            const wb = (b + (255-b)*effectiveDamage) | 0;
            ctx.fillStyle = `rgb(${wr},${wg},${wb})`;
            ctx.shadowBlur = 0;
            ctx.fill();

          } else {
            // Patterned shape — tile handles both bg + mark colours.
            // Cache per ctx (canvas patterns are context-specific).
            if (!s._tileCache) s._tileCache = new WeakMap();
            let tile = s._tileCache.get(ctx);
            if (!tile) {
              tile = buildTile(s.pattern.type, s.rgb, s.pattern.col);
              if (tile) s._tileCache.set(ctx, tile);
            }

            if (tile) {
              // Fill the shape with the pattern tile
              ctx.shadowBlur = 0;
              ctx.fillStyle = tile;
              ctx.fill();

              // Fade to white on damage: paint a white overlay on top,
              // clipped to the shape, with alpha = effectiveDamage
              // (folds in recovery for the redemption phase).
              if (effectiveDamage > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(cp[0].x, cp[0].y);
                for (let i = 1; i < cp.length; i++) ctx.lineTo(cp[i].x, cp[i].y);
                ctx.closePath();
                ctx.clip();
                ctx.globalAlpha = effectiveDamage;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(
                  Math.min(...cp.map(p=>p.x)), Math.min(...cp.map(p=>p.y)),
                  Math.max(...cp.map(p=>p.x)) - Math.min(...cp.map(p=>p.x)),
                  Math.max(...cp.map(p=>p.y)) - Math.min(...cp.map(p=>p.y))
                );
                ctx.restore();
              }
            } else {
              // Fallback: solid fill if tile creation failed
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fill();
            }
          }
        }

        // Restore alpha after this shard's draw block
        ctx.globalAlpha = prevAlpha;
      }

      // ── Pass 2.5 — Sewn stitch overlay ──
      // For every shard with sewn > 0, draw a row of stitch marks along
      // each polygon edge. The stitch animation eases the visible
      // fraction in from 0 → 1 over ~700ms after a snap. Once at 1, the
      // overlay persists as a permanent "this piece was repaired" mark
      // until the next regenerate/reset. Uses the same warp-displaced
      // points (`displaced[si]`) so stitches twist along with the
      // shape under scroll.
      for (let si = 0; si < shards.length; si++) {
        const s = shards[si];
        if (!s.sewn || s.sewn <= 0) continue;
        // Advance the sewn animation. 700ms ≈ 0.024 step at 60fps.
        if (s.sewn < 1) {
          s.sewn = Math.min(1, s.sewn + 0.024);
        }
        // Reuse the already-displaced polygon points from Pass 1/2 so
        // stitches follow the same scroll-warped + hover-repelled
        // outline as the shape itself.
        const cp = displaced[si];
        if (!cp || cp.length < 2) continue;

        // Ease for nicer reveal — cubic ease-out so the stitches
        // appear quickly at first then settle.
        const ease = 1 - Math.pow(1 - s.sewn, 3);

        ctx.save();
        // Stitch ink: cream-white with subtle yellow tint so it reads
        // as thread on coloured cloth without competing with the shape.
        ctx.strokeStyle = `rgba(255,250,220,${0.85 * ease})`;
        ctx.lineWidth   = 1.6;
        ctx.lineCap     = 'round';
        // Cross-stitch pattern: each edge gets short tick marks
        // perpendicular to the edge direction, spaced every ~14px.
        for (let i = 0; i < cp.length; i++) {
          const a = cp[i];
          const b = cp[(i + 1) % cp.length];
          const edgeDX = b.x - a.x;
          const edgeDY = b.y - a.y;
          const edgeLen = Math.sqrt(edgeDX * edgeDX + edgeDY * edgeDY);
          if (edgeLen < 4) continue;
          // Unit tangent along edge, unit normal perpendicular inward.
          const ux = edgeDX / edgeLen;
          const uy = edgeDY / edgeLen;
          const nx = -uy;       // perpendicular (sign chosen below)
          const ny =  ux;
          // Stitch spacing — number of stitches scales with edge length.
          // Animation reveals stitches progressively along the edge:
          // at sewn=0 none are drawn; at sewn=1 all are drawn.
          const stitchCount = Math.max(2, Math.floor(edgeLen / 14));
          const visible = Math.ceil(stitchCount * ease);
          const tickLen = 4.5;          // half-length of each stitch
          for (let k = 0; k < visible; k++) {
            const tt = (k + 0.5) / stitchCount;     // 0..1 along edge
            const mx = a.x + edgeDX * tt;
            const my = a.y + edgeDY * tt;
            // Cross-stitch: a short line at +20° offset from normal
            // for one tick, -20° for the next. Alternating creates
            // the classic "XXXX" sewing pattern.
            const sign = (k & 1) ? 1 : -1;
            const tilt = 0.35 * sign;
            const dx1 = nx * Math.cos(tilt) - ny * Math.sin(tilt);
            const dy1 = ny * Math.cos(tilt) + nx * Math.sin(tilt);
            ctx.beginPath();
            ctx.moveTo(mx - dx1 * tickLen, my - dy1 * tickLen);
            ctx.lineTo(mx + dx1 * tickLen, my + dy1 * tickLen);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // ── Pass 3 — drag-mode ghost shards (states 8 and 11)
      // Each ghost is the polygon of a burnt shard, translated by the
      // delta from its home centroid to its current draggable position.
      // A guide line is drawn between the ghost and its home target so
      // the user knows where to drag it.
      if (opts.narrative &&
          (narrativeState === 8 || narrativeState === 11) &&
          dragShards.length) {
        for (let gi = 0; gi < dragShards.length; gi++) {
          const g = dragShards[gi];
          if (g.snapped) continue;       // snapped ones are now back as live shards
          const src = shards[g.shardIdx];

          // Compute polygon centroid (shape's home) so we know how
          // much to translate by.
          let hx = 0, hy = 0;
          for (const p of src.pts) { hx += p.ox; hy += p.oy; }
          hx /= src.pts.length; hy /= src.pts.length;
          const dx = g.x - hx, dy = g.y - hy;

          // Guide line from ghost centre to home — only drawn while
          // the ghost is being actively dragged or is close to home.
          // Saves per-frame stroke cost on mobile where every ghost
          // would otherwise paint a 2-segment dashed path.
          const distToHome = Math.sqrt(dx*dx + dy*dy);
          const proximity  = Math.max(0, 1 - distToHome / 400);
          if (g.dragging || proximity > 0.25) {
            ctx.save();
            ctx.strokeStyle = `rgba(254,214,2,${0.18 + proximity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(g.x, g.y);
            ctx.lineTo(hx, hy);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          }

          // Draw the ghost polygon at its dragged position.
          // Stroked yellow outline, faintly filled with shape colour.
          const [r,gC,b] = src.rgb;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(src.pts[0].ox + dx, src.pts[0].oy + dy);
          for (let i = 1; i < src.pts.length; i++) {
            ctx.lineTo(src.pts[i].ox + dx, src.pts[i].oy + dy);
          }
          ctx.closePath();
          // Fill — translucent original colour
          ctx.fillStyle = `rgba(${r},${gC},${b},${g.dragging ? 0.85 : 0.55})`;
          ctx.fill();
          // Stroke — bright dashed yellow if close to home, white otherwise
          ctx.strokeStyle = proximity > 0.7 ? '#FED602' : '#ffffff';
          ctx.lineWidth = g.dragging ? 4 : 2.5;
          ctx.stroke();
          ctx.restore();

          // Snap-radius indicator on the home target — pulses outward.
          if (proximity > 0.5) {
            ctx.save();
            const pulse = 1 + Math.sin(t * 3) * 0.08;
            ctx.strokeStyle = `rgba(254,214,2,${0.3 + proximity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(hx, hy, g.snapR * pulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Particles
      ctx.save();
      for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += .08; p.vx *= .97;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.shadowColor = `rgb(${p.r},${p.g},${p.b})`;
        ctx.shadowBlur  = 20;
        ctx.fillStyle   = `rgba(${p.r},${p.g},${p.b},${p.life*.88})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz * p.life, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();

      // ── Thread fragments ──
      // Thin line particles spawned at sew-snap moments. Each falls
      // under gravity, rotates slowly, and fades. Rendered as short
      // line segments rather than circles so they read as bits of
      // thread/yarn coming off the cloth piece.
      ctx.save();
      for (let i = threads.length - 1; i >= 0; i--) {
        const th = threads[i];
        // Physics step
        th.x  += th.vx;
        th.y  += th.vy;
        th.vy += 0.12;          // gravity — slightly stronger than particles
        th.vx *= 0.985;         // air drag
        th.ang += th.angVel;    // gentle rotation
        th.life -= th.decay;
        if (th.life <= 0) { threads.splice(i, 1); continue; }
        // Draw as a short line segment in the shard's colour.
        const halfLen = th.len * 0.5;
        const cosA = Math.cos(th.ang);
        const sinA = Math.sin(th.ang);
        ctx.strokeStyle = `rgba(${th.r},${th.g},${th.b},${th.life * 0.85})`;
        ctx.lineWidth   = 1.4;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(th.x - cosA * halfLen, th.y - sinA * halfLen);
        ctx.lineTo(th.x + cosA * halfLen, th.y + sinA * halfLen);
        ctx.stroke();
      }
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    }

    // ── Sizing ─────────────────────────────────
    function resize() {
      const rect = canvas.getBoundingClientRect();
      // High-DPI support, but capped at 2 for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width  = Math.max(100, rect.width  * dpr) | 0;
      H = canvas.height = Math.max(100, rect.height * dpr) | 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Convert all coords to device pixels on generate
      generate();
      buildGrainLayer();
    }

    // ── Grain texture builder ─────────────────────────────
    // Translated from the p5 reference (Gemini-provided snippet).
    // Three passes painted onto an offscreen canvas:
    //   (1) Soft "clouds" — faint white blobs with sine-wave edges
    //   (2) Tiny "scratches" — short white line segments, random angles
    //   (3) Sine-warped dot swirls — points distributed polar around
    //       a few random centres with sine-wobble so they form
    //       organic cell-like grain patterns, not uniform noise
    // Generated ONCE per resize and cached in `grainCanvas`. The main
    // render loop just blits it — no per-frame grain regeneration.
    function buildGrainLayer() {
      // Use an offscreen canvas (OffscreenCanvas where supported,
      // fall back to a regular <canvas> element otherwise).
      grainCanvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(W, H)
        : document.createElement('canvas');
      grainCanvas.width  = W;
      grainCanvas.height = H;
      const g = grainCanvas.getContext('2d');
      g.clearRect(0, 0, W, H);

      const TWO_PI = Math.PI * 2;
      const rand   = (a, b) => a + Math.random() * (b - a);

      // ── (1) Clouds — faint white blobs with sine-wave edges ──
      // p5: drawSineWaveBlob at random positions, fill alpha 2–8.
      // Density from reference: width * height * 0.00009
      const cloudCount = Math.floor(W * H * 0.00009);
      for (let i = 0; i < cloudCount; i++) {
        const cx = Math.random() * W;
        const cy = Math.random() * H;
        const baseR = rand(Math.max(14, W * 0.02), Math.max(52, W * 0.16));
        // Wobble lobes — irregular edge rather than a clean circle
        const lobes   = Math.floor(rand(3, 7));
        const amp     = rand(0.15, 0.35);
        const phase   = rand(0, TWO_PI);
        const alpha   = rand(2, 8) / 255;

        g.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        g.beginPath();
        const steps = 48;
        for (let k = 0; k <= steps; k++) {
          const ang = (k / steps) * TWO_PI;
          const r   = baseR * (1 + Math.sin(ang * lobes + phase) * amp);
          const x   = cx + Math.cos(ang) * r;
          const y   = cy + Math.sin(ang) * r;
          if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();
        g.fill();
      }

      // ── (2) Scratches — short white line segments ──
      // p5: stroke(255,255,255,12) weight 1, count ∝ area * 0.00028
      g.strokeStyle = 'rgba(255,255,255,0.047)';  // 12/255
      g.lineWidth   = 1;
      const scratchCount = Math.floor(W * H * 0.00028);
      for (let i = 0; i < scratchCount; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const len = rand(8, 34);
        const ang = Math.random() * TWO_PI;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        g.stroke();
      }

      // ── (3) Sine-warped dot swirls ──
      // p5: drawCellSineGrainPattern — points distributed polar around
      // a centre, each angle mapped through a sine wobble (3 lobes
      // with random frequency / amplitude / phase) so the cloud takes
      // an organic blob-y shape. Scatter several cells across canvas.
      const cellCount = Math.floor(W * H * 0.00002);
      for (let c = 0; c < cellCount; c++) {
        const cx = Math.random() * W;
        const cy = Math.random() * H;
        const radius = rand(W * 0.05, W * 0.18);

        const lobeA = Math.floor(rand(2, 9));
        const lobeB = Math.floor(rand(4, 13));
        const lobeC = Math.floor(rand(7, 19));
        const ampA  = rand(0.06, 0.22);
        const ampB  = rand(0.03, 0.14);
        const ampC  = rand(0.02, 0.10);
        const phA = rand(0, TWO_PI);
        const phB = rand(0, TWO_PI);
        const phC = rand(0, TWO_PI);
        const sx  = rand(0.72, 1.34);
        const sy  = rand(0.72, 1.34);

        const pointCount = Math.floor(radius * radius * 0.22);
        g.fillStyle = 'rgba(255,255,255,0.12)';  // alpha * 0.4 of 30/100
        for (let i = 0; i < pointCount; i++) {
          const ang = Math.random() * TWO_PI;
          const dist = Math.random() * radius;
          const wobble = 1 +
            Math.sin(ang * lobeA + phA) * ampA +
            Math.sin(ang * lobeB + phB) * ampB +
            Math.sin(ang * lobeC + phC) * ampC;
          const px = cx + Math.cos(ang) * dist * wobble * sx;
          const py = cy + Math.sin(ang) * dist * wobble * sy;
          g.fillRect(px, py, 1, 1);
        }
      }
    }

    // ── Events ─────────────────────────────────
    // Track which shape is currently under the cursor so hover SFX
    // only fires when the cursor crosses from one shape to another.
    let lastHoveredShard = -1;
    // Timestamp of the last scroll — used to suppress hover SFX
    // during active scrolling so the two sounds don't overlap.
    let lastScrollTime = 0;

    function onMouseMove(e) {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouse.x = (e.clientX - r.left) * dpr;
      mouse.y = (e.clientY - r.top)  * dpr;

      // Hover SFX — fires only on entering a NEW shape.
      // Suppressed if the user just scrolled (within 250ms) so the
      // hover sound and scroll sound don't fight each other.
      if (opts.allowHover && window.SFX &&
          performance.now() - lastScrollTime > 250) {
        let hit = -1;
        for (let i = shards.length - 1; i >= 0; i--) {
          const s = shards[i];
          if (s.burnt || s.burning) continue;
          if (ptInPoly(mouse.x, mouse.y, s.pts.map(p => ({x:p.ox, y:p.oy})))) {
            hit = i;
            break;
          }
        }
        if (hit !== lastHoveredShard) {
          if (hit !== -1) window.SFX.hover('gartHover', 'gartShape');
          lastHoveredShard = hit;
        }
      }
    }
    function onMouseLeave() {
      mouse.x = mouse.y = -9999;
      lastHoveredShard = -1;
    }

    function onClick(e) {
      if (!opts.allowClick) return;

      // Genart-specific click sound — fires on EVERY click inside the
      // canvas (narrative advance, burn, etc). Plays alongside any
      // other context-specific sound (burn). Only in fullscreen
      // (opts.allowClick is true only there).
      if (window.SFX) window.SFX.play('gartClick');

      // ── Narrative gating ──
      if (opts.narrative) {
        // PHASE 1 INTRO — states 0–3 advance on click (1 ignores)
        if (narrativeState < 4) {
          if (narrativeState !== 1) advanceNarrative();
          return;
        }
        // PHASE 2 REDEMPTION text states — 5, 6, 7, 9 advance on click
        if (narrativeState === 5 || narrativeState === 6 ||
            narrativeState === 7 || narrativeState === 9) {
          advanceNarrative();
          return;
        }
        // State 8 = drag-to-reconnect — clicks do nothing (drag handles it)
        if (narrativeState === 8) return;
        // State 10 = "Be mindful…" — one more click drops into free play
        if (narrativeState === 10) {
          advanceNarrative();
          return;
        }
        // State 4 (interactive) and State 11 (free play) both fall
        // through to the burn handler below.
      }

      // BURN — works in state 4 (interactive) and state 11 (free play).
      // In state 11, also spawn a drag-ghost so the user can re-drag
      // the burnt piece without leaving free-play mode.
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cx = (e.clientX - r.left) * dpr;
      const cy = (e.clientY - r.top)  * dpr;
      for (let i = shards.length-1; i >= 0; i--) {
        const s = shards[i];
        if (s.burnt || s.burning) continue;
        if (ptInPoly(cx, cy, s.pts.map(p => ({x:p.ox, y:p.oy})))) {
          s.burning = true;
          if (window.SFX) window.SFX.play('burn');
          break;
        }
      }
    }

    function onWheel(e) {
      if (!opts.allowScroll) return;
      // Narrative gating — scroll only works during the interactive
      // play state (4). Disabled in intro (0–3), redemption (5–7),
      // drag mode (8), and reflection (9–10).
      if (opts.narrative && narrativeState !== 4 && narrativeState !== 11) {
        e.stopPropagation();   // still block page-stack while in overlay
        return;
      }
      // Asymmetric step: scrolling DOWN adds slowly (0.00085 per px),
      // scrolling UP unwinds 4× faster (0.0034 per px). This makes
      // returning to normal take far less effort than getting deep
      // into the twist — matching the user's request that scroll-up
      // reset feel "quick to come back to normal".
      // Floor-clamped at 0, no upper cap.
      const step = e.deltaY > 0 ? 0.00085 : 0.0034;
      scrollProg = Math.max(0, scrollProg + e.deltaY * step);
      lastScrollTime = performance.now();
      // Scroll SFX — debounced inside the SFX manager so rapid wheel
      // events don't machine-gun the sound.
      if (window.SFX) window.SFX.hover('gartScroll', 'gartScroll');
      // Stop the page-stack scroll system from also firing
      e.stopPropagation();
    }

    function onTouchStart(e) { _touchY = e.touches[0].clientY; }
    function onTouchMove(e) {
      if (_touchY === null || !opts.allowScroll) return;
      if (opts.narrative && narrativeState !== 4 && narrativeState !== 11) {
        e.stopPropagation();
        return;
      }
      // Same asymmetric step for touch: swipe up (= scroll down, positive
      // delta) adds slowly; swipe down (= scroll up, negative delta)
      // unwinds 4× faster.
      const delta = _touchY - e.touches[0].clientY;
      const step  = delta > 0 ? 0.001 : 0.004;
      scrollProg = Math.max(0, scrollProg + delta * step);
      _touchY = e.touches[0].clientY;
      lastScrollTime = performance.now();
      if (window.SFX) window.SFX.hover('gartScroll', 'gartScroll');
      e.stopPropagation();
    }

    // ── Drag-to-reconnect handlers (narrative state 8) ─────
    // Use pointer events so mouse + touch share a single code path.
    // Capture-phase pointerdown lets us steal the gesture before the
    // canvas's `click` handler fires (which would otherwise also try
    // to advance the narrative or burn shapes).
    let activeDragIdx = -1;          // index into dragShards[]
    let dragOffsetX = 0, dragOffsetY = 0;

    function clientToCanvas(e) {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      return {
        x: (e.clientX - r.left) * dpr,
        y: (e.clientY - r.top)  * dpr,
      };
    }

    // Hit-test a ghost: returns dragShards index or -1.
    // Pass 1: precise polygon test (ptInPoly).
    // Pass 2: bounding-box test with `padding` pixels of slop.
    //         Critical on mobile where fingers are imprecise and
    //         small ghosts can be hard to grab on the first try.
    function ghostAt(cx, cy, padding) {
      padding = padding || 0;
      // Pass 1 — exact polygon hit (preferred)
      for (let gi = dragShards.length - 1; gi >= 0; gi--) {
        const g = dragShards[gi];
        if (g.snapped) continue;
        const src = shards[g.shardIdx];
        let hx = 0, hy = 0;
        for (const p of src.pts) { hx += p.ox; hy += p.oy; }
        hx /= src.pts.length; hy /= src.pts.length;
        const dx = g.x - hx, dy = g.y - hy;
        const translated = src.pts.map(p => ({ x: p.ox + dx, y: p.oy + dy }));
        if (ptInPoly(cx, cy, translated)) return gi;
      }
      // Pass 2 — bbox fallback (mobile-friendly grab radius)
      if (padding > 0) {
        let bestGi = -1, bestDist = Infinity;
        for (let gi = dragShards.length - 1; gi >= 0; gi--) {
          const g = dragShards[gi];
          if (g.snapped) continue;
          const src = shards[g.shardIdx];
          let hx = 0, hy = 0;
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (const p of src.pts) {
            hx += p.ox; hy += p.oy;
            if (p.ox < minX) minX = p.ox;
            if (p.oy < minY) minY = p.oy;
            if (p.ox > maxX) maxX = p.ox;
            if (p.oy > maxY) maxY = p.oy;
          }
          hx /= src.pts.length; hy /= src.pts.length;
          const dx = g.x - hx, dy = g.y - hy;
          // Translated bbox
          const bx1 = minX + dx - padding;
          const by1 = minY + dy - padding;
          const bx2 = maxX + dx + padding;
          const by2 = maxY + dy + padding;
          if (cx < bx1 || cx > bx2 || cy < by1 || cy > by2) continue;
          // Pick the ghost whose centre is closest to the tap point —
          // when several ghosts overlap, this gives a deterministic
          // "the one you meant" choice.
          const cgx = g.x, cgy = g.y;
          const d2 = (cx - cgx) * (cx - cgx) + (cy - cgy) * (cy - cgy);
          if (d2 < bestDist) { bestDist = d2; bestGi = gi; }
        }
        return bestGi;
      }
      return -1;
    }

    function onPointerDown(e) {
      if (!opts.narrative) return;
      if (narrativeState !== 8 && narrativeState !== 11) return;
      const pt = clientToCanvas(e);
      // Touch input is imprecise: allow a generous 30-device-pixel slop.
      // Mouse hits the polygon exactly so its slop is zero.
      const isTouch = e.pointerType === 'touch';
      const slop = isTouch ? 30 * Math.min(window.devicePixelRatio || 1, 2) : 0;
      const idx = ghostAt(pt.x, pt.y, slop);
      if (idx === -1) return;
      activeDragIdx = idx;
      const g = dragShards[idx];
      g.dragging = true;
      dragOffsetX = pt.x - g.x;
      dragOffsetY = pt.y - g.y;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (activeDragIdx === -1) return;
      const pt = clientToCanvas(e);
      const g = dragShards[activeDragIdx];
      g.x = pt.x - dragOffsetX;
      g.y = pt.y - dragOffsetY;
      // Drag SFX — debounced via the gartDrag hover-cooldown so the
      // sound paces itself nicely instead of machine-gunning per
      // pointer event. The cooldown is set in sound.js (~220ms).
      if (window.SFX) window.SFX.hover('gartDrag', 'gartDrag');
    }

    function onPointerUp(e) {
      if (activeDragIdx === -1) return;
      const g = dragShards[activeDragIdx];
      g.dragging = false;
      // Check snap — distance from ghost centre to home target
      const dx = g.x - g.homeX, dy = g.y - g.homeY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= g.snapR) {
        snapGhost(activeDragIdx);
      }
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      activeDragIdx = -1;
    }

    function snapGhost(gi) {
      const g = dragShards[gi];
      g.snapped = true;
      // Restore the source shard to live state — clear burnt flag so
      // it re-renders, reset burn progress.
      const src = shards[g.shardIdx];
      src.burnt   = false;
      src.burning = false;
      src.burn    = 0;
      // ── Mark this shard as freshly sewn ──
      // sewn=1e-3 starts the stitch-grow animation (0→1 over ~700ms,
      // see render-loop step at the bottom). Stays at 1 once finished,
      // which keeps the stitch overlay drawn permanently as a "this
      // piece was repaired" mark.
      src.sewn = 1e-3;
      // Decrement totalBurnt so damageLevel reflects current state.
      // (Previously this was append-only, which broke free-play in
      // state 11 — burning new shapes after recovery wouldn't show
      // because the cap was already maxed.)
      totalBurnt = Math.max(0, totalBurnt - 1);
      damageLevel = Math.min(1, totalBurnt / 10);
      if (opts.onDamage) opts.onDamage(damageLevel);

      // Recovery progress — fraction of burnt shards reconnected
      // (cumulative across the whole session, never decreases).
      totalRecovered++;
      recoveryLevel = Math.min(1, totalRecovered / Math.max(1, dragShards.length));

      // ── Sew SFX ──
      if (window.SFX) window.SFX.play('gartSew');

      // ── Spawn thread particles ──
      // Thin line fragments that scatter outward from the snap point,
      // fall under gravity, rotate slightly, and fade over ~1.2s.
      // Colors echo the shard's own rgb so the threads visually belong
      // to the cloth piece they came from.
      const threadCount = 6 + Math.floor(rng() * 4);    // 6-9
      const [tr, tg, tb] = src.rgb || [240, 240, 240];
      for (let i = 0; i < threadCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.4 + Math.random() * 3.0;
        threads.push({
          x:  g.homeX + (Math.random() - 0.5) * 30,
          y:  g.homeY + (Math.random() - 0.5) * 30,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.2,
          len: 14 + Math.random() * 22,
          ang: ang,
          angVel: (Math.random() - 0.5) * 0.08,
          life: 1,
          decay: 0.010 + Math.random() * 0.014,
          r: tr, g: tg, b: tb,
        });
      }

      // When most pieces (≥80%) are reconnected, advance to state 9.
      // Don't require 100% — the message is "not the same" so leaving a
      // few unconnected reinforces it. Plus impatience tolerance.
      if (narrativeState === 8 &&
          totalRecovered >= Math.max(1, Math.floor(dragShards.length * 0.8))) {
        narrativeState = 9;
        if (opts.onNarrativeChange) opts.onNarrativeChange(9);
      }
    }

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    if (opts.allowClick)  canvas.addEventListener('click', onClick);
    if (opts.allowScroll) {
      canvas.addEventListener('wheel',      onWheel,      { passive: true });
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove',  onTouchMove,  { passive: true });
    }
    // Drag-to-reconnect — registered both on the canvas and on window.
    // The window-level fallback is essential on mobile where pointer
    // capture sometimes fails silently: if the finger drifts off the
    // canvas, canvas-bound events stop firing. Window-bound listeners
    // keep the drag alive so the user doesn't get "stuck" mid-gesture.
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup',   onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup',   onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // ── Control API ─────────────────────────────
    const api = {
      resize,
      regenerate() {
        // In narrative mode, regenerate also restarts the intro AND
        // wipes the redemption arc (recovery, drag ghosts, totals,
        // redemption flag — full reset to a fresh world).
        generate();
        damageLevel    = 0;
        totalBurnt     = 0;
        scrollProg     = 0;
        recoveryLevel  = 0;
        totalRecovered = 0;
        dragShards     = [];
        threads        = [];
        hasReachedRedemption = false;
        if (opts.onDamage) opts.onDamage(0);
        if (opts.narrative) {
          narrativeState = 0;
          if (opts.onNarrativeChange) opts.onNarrativeChange(0);
        }
      },
      pause() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      },
      resume() {
        if (running) return;
        running = true;
        draw();
      },
      // Restart narrative without rebuilding shards — used when the
      // user reopens the fullscreen overlay after closing it.
      resetNarrative,
      get damageLevel() { return damageLevel; },
      get narrativeState() { return narrativeState; },
    };

    // Fire initial narrative state so DOM picks it up at startup
    if (opts.narrative && opts.onNarrativeChange) {
      opts.onNarrativeChange(narrativeState);
    }

    resize();
    draw();
    return api;
  }

  // ═══════════════════════════════════════════════
  //  PREVIEW + FULLSCREEN WIRING
  // ═══════════════════════════════════════════════
  const previewCanvas = document.getElementById('genart-preview-canvas');
  const fullCanvas    = document.getElementById('genart-full-canvas');
  const overlay       = document.getElementById('genart-fullscreen');
  const zoomBtn       = document.getElementById('genart-zoom');
  const closeBtn      = document.getElementById('genart-close');
  const regenBtn      = document.getElementById('genart-regen');
  const damageBar     = document.getElementById('genart-bar');
  const damagePct     = document.getElementById('genart-pct');

  if (!previewCanvas || !fullCanvas || !overlay) return;

  // Narrative DOM refs (populated below if narrative box is present)
  const narrBox  = document.getElementById('genart-narrative');
  const narrMain = document.getElementById('genart-narrative-main');
  const narrHint = document.getElementById('genart-narrative-hint');

  // Narrative copy — strings shown for each state
  const NARRATIVE_COPY = {
    // PHASE 1 — INTRO
    0:  { main: 'This is a piece of cloth.', hint: '(Click to continue)' },
    1:  { main: '', hint: '' },
    2:  { main: 'They appear everywhere. And we tend to throw them away, tear them apart, and burn them.', hint: '(Click to continue)' },
    3:  { main: 'Click to interact with them, and scroll to distort them.', hint: '(Click to start)' },
    4:  { main: '', hint: '' },                      // fully interactive

    // PHASE 2 — REDEMPTION
    5:  { main: 'Still want to hurt the surroundings more?', hint: '(Click to continue)' },
    6:  { main: 'Everything is destroyed. How could we bring it back?', hint: '(Click to continue)' },
    7:  { main: 'Drag the cloth pieces to connect them.', hint: '(Click to start)' },
    8:  { main: '', hint: '' },                      // drag mode
    9:  { main: 'Everything is not going to be the same.', hint: '(Click to continue)' },
    10: { main: 'Be mindful of what we are doing.', hint: '(Click to keep exploring)' },

    // PHASE 3 — FREE PLAY
    11: { main: '', hint: '' },                      // sandbox, no text
  };

  // The "(Click to continue)" hint should fade in a moment AFTER
  // the main quote so the reader has time to absorb the first line.
  const HINT_DELAY_MS = 1400;
  let hintTimer = null;
  let lastNarrativeTextPopupKey = '';

  function setNarrativeUi(state) {
    if (!narrBox || !narrMain || !narrHint) return;
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }

    const copy = NARRATIVE_COPY[state] || NARRATIVE_COPY[4];

    // States 1, 4, 8, 11 hide the box entirely (animation / interactive play)
    if (state === 1 || state === 4 || state === 8 || state === 11) {
      narrBox.classList.remove('show');
      narrMain.textContent = '';
      narrHint.textContent = '';
      narrHint.classList.remove('show');
      return;
    }

    narrMain.textContent = copy.main;
    narrHint.textContent = '';
    narrHint.classList.remove('show');
    narrBox.classList.add('show');

    const popupKey = `${state}:${copy.main}`;
    if (copy.main && popupKey !== lastNarrativeTextPopupKey && window.SFX) {
      lastNarrativeTextPopupKey = popupKey;
      window.SFX.play('gartText');
    }

    // Schedule the hint to fade in after a delay.
    // No hint scheduled for terminal state 10 (empty hint string).
    if (!copy.hint) return;
    const scheduledFor = state;
    hintTimer = setTimeout(() => {
      hintTimer = null;
      if (!fullArt || fullArt.narrativeState !== scheduledFor) return;
      narrHint.textContent = copy.hint;
      narrHint.classList.add('show');
    }, HINT_DELAY_MS);
  }

  // Preview — hover only, auto-animates gently, smaller cells.
  // Preview never runs the narrative; it's always fully revealed.
  const preview = createArt(previewCanvas, {
    allowHover: true,
    allowScroll: false,
    allowClick:  false,
    scaleCells:  0.55,
    narrative:   false,
  });

  let fullArt = null;
  let isOpen  = false;

  function syncPreviewRunning() {
    const page = document.getElementById('page-s3');
    const shouldRun = Boolean(page && page.classList.contains('active') && !isOpen);
    if (shouldRun) preview.resume();
    else preview.pause();
  }

  const previewPage = document.getElementById('page-s3');
  if (previewPage) {
    new MutationObserver(syncPreviewRunning)
      .observe(previewPage, { attributes: true, attributeFilter: ['class'] });
  }
  syncPreviewRunning();

  function updateDamage(lvl) {
    if (damageBar) damageBar.style.width = (lvl * 100) + '%';
    if (damagePct) damagePct.textContent = Math.round(lvl * 100);
  }

  function openFullscreen() {
    if (isOpen) return;
    isOpen = true;
    document.body.classList.add('genart-open');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    preview.pause();

    // Auto-mute background music — the generative art has its own
    // audio identity (drag/sew/scroll/click SFX) and the background
    // music would clash. The user's chosen music volume is remembered
    // and restored on close. SFX stay on.
    if (window.MUSIC && window.MUSIC.pauseTemporarily) {
      window.MUSIC.pauseTemporarily();
    }

    // Start the looping ambient bed that plays underneath the genart
    // experience. Lives on window.SFX (it's an effect, not music) so
    // it follows the Effects slider's master vol and the global sound
    // toggle. Stopped automatically on closeFullscreen.
    if (window.SFX && window.SFX.startAmbient) {
      window.SFX.startAmbient();
    }

    lastNarrativeTextPopupKey = '';

    // Lazy-init the fullscreen instance the first time
    if (!fullArt) {
      fullArt = createArt(fullCanvas, {
        allowHover:  true,
        allowScroll: true,
        allowClick:  true,
        narrative:   true,
        onDamage:    updateDamage,
        onNarrativeChange: setNarrativeUi,
      });
    } else {
      fullArt.resize();
      fullArt.resume();
      // Restart the narrative every time the user reopens the overlay
      fullArt.resetNarrative();
    }
    updateDamage(fullArt.damageLevel || 0);
  }

  function closeFullscreen() {
    if (!isOpen) return;
    isOpen = false;
    document.body.classList.remove('genart-open');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (fullArt) fullArt.pause();
    syncPreviewRunning();

    // Restore background music to whatever the slider currently shows
    // (which is the value the user picked before opening, unless they
    // moved it during the experience — in which case we trust the
    // new slider value).
    if (window.MUSIC && window.MUSIC.resume) {
      window.MUSIC.resume();
    }

    // Stop the ambient loop.
    if (window.SFX && window.SFX.stopAmbient) {
      window.SFX.stopAmbient();
    }
  }

  zoomBtn  && zoomBtn .addEventListener('click', openFullscreen);
  // Clicking anywhere on the preview body also opens fullscreen
  const cardBody = document.getElementById('genart-card-body');
  cardBody && cardBody.addEventListener('click', openFullscreen);
  closeBtn && closeBtn.addEventListener('click', closeFullscreen);

  // Expose close so pages.js can dismiss the overlay when the user
  // clicks a nav link while inside the generative art experience.
  // pages.js calls this BEFORE running its page transition.
  window.GENART = {
    close:  closeFullscreen,
    isOpen: () => isOpen,
  };
  regenBtn && regenBtn.addEventListener('click', () => {
    if (fullArt) { fullArt.regenerate(); updateDamage(0); }
  });

  // ESC closes — use capture so it runs before pages.js keydown
  window.addEventListener('keydown', e => {
    if (isOpen && e.key === 'Escape') {
      e.stopPropagation();
      closeFullscreen();
    }
  }, true);

  // Block page-stack events from firing when the overlay is open.
  // These run in BUBBLE phase on the overlay — which means the canvas's
  // own wheel/touch handlers fire FIRST (so scroll-warp still works),
  // then stopPropagation here prevents the event from reaching the
  // window-level listeners in pages.js.
  overlay.addEventListener('wheel', e => {
    if (isOpen) e.stopPropagation();
  }, { passive: true });
  overlay.addEventListener('touchstart', e => {
    if (isOpen) e.stopPropagation();
  }, { passive: true });
  overlay.addEventListener('touchend', e => {
    if (isOpen) e.stopPropagation();
  });
  overlay.addEventListener('touchmove', e => {
    if (isOpen) e.stopPropagation();
  }, { passive: true });

  // Block arrow / space keys from flipping pages — capture on window
  // is fine here because we're not trying to let anyone else see them.
  window.addEventListener('keydown', e => {
    if (!isOpen) return;
    if (['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(e.key)) {
      e.stopPropagation();
    }
  }, true);

  // Resize both canvases when window changes
  window.addEventListener('resize', () => {
    preview.resize();
    if (fullArt && isOpen) fullArt.resize();
  });

  // Click outside the canvas inside the overlay also closes
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeFullscreen();
  });

})();
