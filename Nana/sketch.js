/* ===========================================================
   sketch.js
   Generates the randomized "Thrift-N-Shift" title on load,
   then keeps shuffling random letters' font / color / clip
   at random intervals so the title feels alive.
   =========================================================== */

(function(){
  const FONTS  = ['f-monoton','f-fruktur','f-splash','f-rainbow','f-kolker'];
  const BGS    = ['bg-pink','bg-cyan','bg-yellow','bg-blue','bg-black','bg-white'];
  const CLIPS  = ['clip-1','clip-2','clip-3','clip-4','clip-5'];
  const ROTS   = ['rot-a','rot-b','rot-c','rot-d','rot-e','rot-f','rot-g'];

  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const stripClasses = (el, prefix) => {
    [...el.classList].forEach(c => { if(c.startsWith(prefix)) el.classList.remove(c); });
  };

  function buildLetter(span, ch){
    span.className = 'letter';
    span.textContent = Math.random() < 0.55 ? ch.toUpperCase() : ch.toLowerCase();
    span.classList.add(pick(FONTS));
    span.classList.add(pick(BGS));
    span.classList.add(pick(CLIPS));
    span.classList.add(pick(ROTS));
    span.style.marginTop  = (Math.random()*24 - 12).toFixed(1) + 'px';
    span.style.marginLeft = (Math.random()*10 - 5 ).toFixed(1) + 'px';
    span.dataset.char = ch;
  }

  function buildWord(wordEl, text){
    wordEl.innerHTML = '';
    [...text].forEach(ch => {
      const span = document.createElement('span');
      buildLetter(span, ch);
      wordEl.appendChild(span);
    });
  }

  window.__buildTitle = function(){
    buildWord(document.getElementById('word-thrift'), 'Thrift');
    buildWord(document.getElementById('word-n'),      'N');
    buildWord(document.getElementById('word-shift'),  'Shift');
  };
  window.__buildTitle();

  /* ===== live shuffle: change random aspect of a random letter ===== */
  function shuffleRandomLetter(){
    const letters = document.querySelectorAll('.letter');
    if(!letters.length) return;
    const el = letters[Math.floor(Math.random()*letters.length)];

    // Pick 1–2 aspects to change: font, bg, clip, casing, shadow
    const aspects = ['font','bg','clip','case','shadow'];
    // shuffle aspects array
    aspects.sort(() => Math.random() - 0.5);
    const count = 1 + (Math.random() < 0.4 ? 1 : 0); // sometimes change two at once

    // brief fade so the change is visible
    el.style.transition = 'opacity .15s ease, transform .25s cubic-bezier(.3,1.4,.5,1)';
    el.style.opacity = '0.3';
    setTimeout(() => {
      for(let i = 0; i < count; i++){
        const aspect = aspects[i];
        if(aspect === 'font'){
          stripClasses(el, 'f-');
          el.classList.add(pick(FONTS));
        } else if(aspect === 'bg'){
          stripClasses(el, 'bg-');
          el.classList.add(pick(BGS));
        } else if(aspect === 'clip'){
          stripClasses(el, 'clip-');
          el.classList.add(pick(CLIPS));
        } else if(aspect === 'case'){
          const ch = el.dataset.char || el.textContent;
          el.textContent = Math.random() < 0.5 ? ch.toUpperCase() : ch.toLowerCase();
        } else if(aspect === 'shadow'){
          // Instead of changing shadow (now permanent black outline),
          // shuffle the letter's rotation slightly for extra chaos
          const newRot = (Math.random() * 20 - 10).toFixed(1);
          el.style.setProperty('--letter-tilt', newRot + 'deg');
          el.style.transform = `rotate(${newRot}deg)`;
        }
      }
      // small pop on change
      el.style.opacity = '1';
    }, 150);
  }

  // start after title entrance completes (~1600ms)
  setTimeout(() => {
    function scheduleNext(){
      const delay = 500 + Math.random()*1400;
      setTimeout(() => {
        shuffleRandomLetter();
        // every so often shuffle two in quick succession
        if(Math.random() < 0.3) setTimeout(shuffleRandomLetter, 200);
        scheduleNext();
      }, delay);
    }
    scheduleNext();

    // ===== Random big-small pulse on random letters at random times =====
    function pulseRandomLetter(){
      const letters = document.querySelectorAll('.letter');
      if(!letters.length) return;
      // skip letters already pulsing so we don't double-up
      const pool = Array.from(letters).filter(l => !l.classList.contains('pulsing'));
      if(!pool.length) return;
      const el = pool[Math.floor(Math.random() * pool.length)];

      // Capture current computed rotation so the pulse keyframe preserves it
      const rot = extractRotation(getComputedStyle(el).transform);
      el.style.setProperty('--lr', rot + 'deg');

      el.classList.add('pulsing');
      setTimeout(() => el.classList.remove('pulsing'), 820);
    }

    function extractRotation(matrixStr){
      if(!matrixStr || matrixStr === 'none') return 0;
      const m = matrixStr.match(/matrix\(([^)]+)\)/);
      if(!m) return 0;
      const v = m[1].split(',').map(parseFloat);
      return +(Math.atan2(v[1], v[0]) * 180 / Math.PI).toFixed(1);
    }

    function schedulePulse(){
      const delay = 600 + Math.random() * 2000;
      setTimeout(() => {
        pulseRandomLetter();
        // sometimes pulse two letters in quick succession
        if(Math.random() < 0.25) setTimeout(pulseRandomLetter, 300);
        schedulePulse();
      }, delay);
    }
    schedulePulse();
  }, 1800);
})();