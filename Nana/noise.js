/* ===========================================================
   noise.js — Film / CRT style noise.
   Instead of visible square pixels, we render:
     - Fine white/dark noise dots (sub-pixel, blurred)
     - Occasional diagonal "film scratches"
     - Random dust specks that pop in and out
     - A subtle rolling flicker
   No hard grid. Looks like an old TV + old film reel.
   =========================================================== */

(function(){
  const canvas = document.getElementById('noise-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Scratch state — scratches fade in and out
  const scratches = [];
  function spawnScratch(){
    scratches.push({
      x: Math.random()*W,
      y: Math.random()*H,
      len: 30 + Math.random()*180,
      angle: (Math.random()-.5) * 0.25 + Math.PI/2, // mostly vertical
      life: 0,
      maxLife: 8 + Math.random()*18,   // frames visible
      width: Math.random()*1.2 + 0.3,
      alpha: 0.4 + Math.random()*0.5
    });
  }
  // Seed some
  for(let i=0;i<2;i++) spawnScratch();

  // Dust specks — brighter particles that linger briefly
  const specks = [];
  function spawnSpeck(){
    specks.push({
      x: Math.random()*W,
      y: Math.random()*H,
      r: 0.6 + Math.random()*1.8,
      life: 0,
      maxLife: 4 + Math.random()*10,
      alpha: 0.3 + Math.random()*0.5,
      dark: Math.random() < 0.5
    });
  }

  let frame = 0;

  function drawNoise(){
    frame++;

    // Clear
    ctx.clearRect(0,0,W,H);

    // ===== Fine grain =====
    // Render tiny random dots, not a full pixel grid — sparse, antialiased
    // so the noise is organic. Density controls perceived intensity.
    const density = Math.floor((W * H) / 1600); // tweak for more/less grain
    ctx.save();
    for(let i = 0; i < density; i++){
      const x = Math.random() * W;
      const y = Math.random() * H;
      const v = Math.random();
      // most dots are faint, a few are brighter
      const bright = v < 0.04;
      const dark   = v < 0.12 && !bright;
      if(bright){
        ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + Math.random()*0.4) + ')';
        ctx.fillRect(x, y, 1, 1);
      } else if(dark){
        ctx.fillStyle = 'rgba(0,0,0,' + (0.2 + Math.random()*0.3) + ')';
        ctx.fillRect(x, y, 1, 1);
      } else {
        // subtle gray noise
        const g = Math.random() < 0.5 ? 255 : 0;
        ctx.fillStyle = 'rgba(' + g + ',' + g + ',' + g + ',' + (0.08 + Math.random()*0.12) + ')';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.restore();

    // ===== Dust specks — bigger occasional particles =====
    if(Math.random() < 0.25) spawnSpeck();
    for(let i = specks.length-1; i >= 0; i--){
      const s = specks[i];
      s.life++;
      if(s.life > s.maxLife){ specks.splice(i,1); continue; }
      const p = s.life / s.maxLife;
      // fade in then out
      const a = (p < 0.3 ? p/0.3 : (1 - (p-0.3)/0.7)) * s.alpha;
      ctx.beginPath();
      ctx.fillStyle = s.dark
        ? 'rgba(0,0,0,' + a.toFixed(3) + ')'
        : 'rgba(255,255,255,' + a.toFixed(3) + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }

    // ===== Scratches — film vertical scratches =====
    if(Math.random() < 0.04) spawnScratch();
    for(let i = scratches.length-1; i >= 0; i--){
      const sc = scratches[i];
      sc.life++;
      if(sc.life > sc.maxLife){ scratches.splice(i,1); continue; }
      const p = sc.life / sc.maxLife;
      const a = (p < 0.2 ? p/0.2 : (1 - (p-0.2)/0.8)) * sc.alpha;
      ctx.save();
      ctx.translate(sc.x, sc.y);
      ctx.rotate(sc.angle);
      ctx.strokeStyle = Math.random() < 0.5
        ? 'rgba(255,255,255,' + a.toFixed(3) + ')'
        : 'rgba(0,0,0,' + (a*0.8).toFixed(3) + ')';
      ctx.lineWidth = sc.width;
      // small jitter on position every frame for wobble
      const jx = (Math.random()-.5)*2;
      ctx.beginPath();
      ctx.moveTo(jx, -sc.len/2);
      ctx.lineTo(jx + (Math.random()-.5)*3, sc.len/2);
      ctx.stroke();
      ctx.restore();
    }

    // ===== Occasional horizontal tracking glitch =====
    if(Math.random() < 0.02){
      const y = Math.random() * H;
      const h = 2 + Math.random()*6;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.05 + Math.random()*0.12) + ')';
      ctx.fillRect(0, y, W, h);
    }
    // Rare color-shift band
    if(Math.random() < 0.008){
      const y = Math.random() * H;
      const h = 1 + Math.random()*3;
      ctx.fillStyle = 'rgba(254,21,149,0.15)';
      ctx.fillRect(0, y, W, h);
      ctx.fillStyle = 'rgba(29,217,219,0.15)';
      ctx.fillRect(0, y + h, W, h);
    }
  }

  // Smooth rAF loop, throttled to ~18fps for CPU kindness
  let last = 0;
  const targetMs = 1000 / 18;
  function loop(ts){
    if(ts - last >= targetMs){
      last = ts;
      drawNoise();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
