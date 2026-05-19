/* ===========================================================
   reveal.js — staggered entrance + continuous pendulum tick
   after reveal completes.
   =========================================================== */

(function(){
  const landing = document.querySelector('.page-landing');
  if(!landing) return;

  // Collect reveals
  const list = [];
  landing.querySelectorAll('[data-reveal="plaid"]').forEach(el => list.push({el, baseDelay:50}));
  landing.querySelectorAll('[data-reveal="jag"]').forEach(el => list.push({el, baseDelay:parseInt(el.dataset.delay||600,10)}));
  landing.querySelectorAll('[data-reveal="prop"]').forEach(el => list.push({el, baseDelay:parseInt(el.dataset.delay||1000,10)}));
  landing.querySelectorAll('[data-reveal="scrap"]').forEach(el => list.push({el, baseDelay:parseInt(el.dataset.delay||1600,10)}));

  list.forEach(item => {
    setTimeout(() => item.el.classList.add('revealed'), item.baseDelay);
  });

  // Title word entrance
  const wThrift = document.getElementById('word-thrift');
  const wN      = document.getElementById('word-n');
  const wShift  = document.getElementById('word-shift');
  setTimeout(() => wThrift && wThrift.classList.add('revealed'), 250);
  setTimeout(() => wN      && wN.classList.add('revealed'),     700);
  setTimeout(() => wShift  && wShift.classList.add('revealed'), 1150);

  // After all reveals finish: snapshot each tickable element's current
  // computed rotation, store in --r, and add .ticking class.
  // The CSS pendulum keyframe uses var(--r) as the pivot so we don't
  // override existing rotation — we oscillate around it.
  setTimeout(() => {
    const tickSelector = [
      '.scrap','.tape','.clothes-tag','.stamp','.exclaim',
      '.arrow-deco','.barcode','.polaroid','.ticket',
      '.sdg-callout','.bolt','.music-note','.cassette',
      '.safety-pin','.paper-pin','.checker','.dstripes'
    ].join(',');

    landing.querySelectorAll(tickSelector).forEach(el => {
      const rot = extractRotation(getComputedStyle(el).transform);
      el.style.setProperty('--r', rot + 'deg');

      // Random size variation per element so the page feels dynamic.
      // Overall ranges shrunk so the title visually dominates the landing.
      // Smaller decorative accents get the most aggressive reduction.
      let min = 0.5, max = 0.95;
      if (el.matches('.polaroid, .ticket, .clothes-tag, .cassette')) {
        min = 0.58; max = 0.82;        // larger items — clearly subordinate to title
      } else if (el.matches('.scrap, .stamp, .barcode')) {
        min = 0.55; max = 0.88;
      } else if (el.matches('.sdg-callout')) {
        min = 1.0;  max = 1.0;         // CTA stays full size — it's important text
      } else if (el.matches('.music-note, .bolt, .exclaim, .starburst')) {
        min = 0.45; max = 1.05;        // small accents stay small
      } else if (el.matches('.paper-pin, .safety-pin, .checker, .dstripes, .halftone')) {
        min = 0.5;  max = 0.95;
      }
      const scale = (min + Math.random() * (max - min)).toFixed(2);
      el.style.setProperty('--s', scale);

      el.classList.add('ticking');
    });

    // Also vary size of non-ticking props (halftones/spray/tape/plaidjag)
    // that have size but don't tick — same shrink applied here.
    landing.querySelectorAll('.halftone, .spray, .tape, .plaid-jag').forEach(el => {
      if (!el.style.getPropertyValue('--s')) {
        const scale = (0.55 + Math.random() * 0.4).toFixed(2);
        el.style.setProperty('--s', scale);
        // manually apply scale since these don't animate
        const existing = getComputedStyle(el).transform;
        const curRot = extractRotation(existing);
        el.style.transform = `rotate(${curRot}deg) scale(${scale})`;
      }
    });
  }, 2900);

  function extractRotation(matrixStr){
    if(!matrixStr || matrixStr === 'none') return 0;
    const m = matrixStr.match(/matrix\(([^)]+)\)/);
    if(!m) return 0;
    const v = m[1].split(',').map(parseFloat);
    return +(Math.atan2(v[1], v[0]) * 180 / Math.PI).toFixed(1);
  }
})();