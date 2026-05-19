/* ===========================================================
   pages.js — Page stack controller.
   Instead of native scrolling, we cycle through fixed pages.
   - Wheel / touch-swipe / keyboard arrows / page-up-down all
     advance or retreat the active page.
   - Pages fade + gently slide between each other.
   - At Section 5, scrolling down loops to Landing.
   - At Landing, scrolling up loops to Section 5.
   =========================================================== */

(function(){
  const pages = Array.from(document.querySelectorAll('.page'));
  const dots  = Array.from(document.querySelectorAll('.progress-dots li'));
  if(!pages.length) return;

  // Build nav-link → page-index map once.
  // For each <li> in nav, look at its inner <a href="#page-xxx"> and find
  // the matching page index. Cache as parallel array so updateNav() is O(n).
  const navItems = Array.from(document.querySelectorAll('nav.topnav ul li'));
  const navIdxForLi = navItems.map(li => {
    const a = li.querySelector('a[href^="#"]');
    if (!a) return -1;
    const id = a.getAttribute('href').substring(1);
    return pages.findIndex(p => p.id === id);
  });

  let current = 0;
  let transitioning = false;
  const TRANSITION_MS = 900;

  // Initialize: make sure only first page is active
  pages.forEach((p,i) => {
    p.classList.toggle('active', i === 0);
    p.classList.remove('leaving-up','leaving-down');
  });

  function goTo(targetIdx, direction){
    if(transitioning) return;
    const total = pages.length;
    // wrap
    targetIdx = ((targetIdx % total) + total) % total;
    if(targetIdx === current) return;

    transitioning = true;
    const outgoing = pages[current];
    const incoming = pages[targetIdx];

    // Play page-turn SFX (if sound manager is loaded and sound is on)
    if (window.SFX) window.SFX.play('pageturn');

    // Figure out direction for transition
    // direction = 1 => moving forward (scroll down), outgoing goes up
    // direction = -1 => moving back (scroll up), outgoing goes down
    const dir = direction || (targetIdx > current ? 1 : -1);

    outgoing.classList.remove('active');
    outgoing.classList.add(dir > 0 ? 'leaving-up' : 'leaving-down');
    incoming.classList.add('active');

    current = targetIdx;
    updateDots();
    updateNav();

    setTimeout(() => {
      outgoing.classList.remove('leaving-up','leaving-down');
      transitioning = false;
    }, TRANSITION_MS);
  }

  function updateDots(){
    dots.forEach((d,i) => d.classList.toggle('active', i === current));
  }

  // Highlight the nav <li> whose linked page matches the current index.
  // Landing has no nav link, so when on landing nothing is highlighted —
  // that's the correct UX (the brand logo represents landing).
  function updateNav(){
    navItems.forEach((li, i) => {
      li.classList.toggle('active', navIdxForLi[i] === current);
    });
  }

  // ===== Wheel =====
  let wheelCooldown = 0;
  window.addEventListener('wheel', e => {
    const now = Date.now();
    if(now < wheelCooldown) return;
    if(transitioning) return;
    // ignore tiny scrolls
    if(Math.abs(e.deltaY) < 12) return;

    // Check if we're inside a scrollable section that hasn't hit its limit
    const page = pages[current];
    if(page && page.classList.contains('page-section')){
      const sh = page.scrollHeight;
      const ch = page.clientHeight;
      const st = page.scrollTop;
      // If content overflows and user is scrolling within it, let it scroll
      if(sh > ch){
        if(e.deltaY > 0 && st + ch < sh - 4){
          return; // let native scroll happen within the page
        }
        if(e.deltaY < 0 && st > 4){
          return;
        }
      }
    }

    wheelCooldown = now + TRANSITION_MS + 80;
    if(e.deltaY > 0) goTo(current + 1, 1);
    else             goTo(current - 1, -1);
  }, {passive:true});

  // ===== Touch =====
  let touchStartY = null, touchStartT = 0;
  window.addEventListener('touchstart', e => {
    if(e.touches.length === 1){
      touchStartY = e.touches[0].clientY;
      touchStartT = Date.now();
    }
  }, {passive:true});
  window.addEventListener('touchend', e => {
    if(touchStartY === null) return;
    const dy = (e.changedTouches[0].clientY - touchStartY);
    const dt = Date.now() - touchStartT;
    touchStartY = null;
    if(Math.abs(dy) < 45) return;
    if(dt > 900) return;
    if(transitioning) return;

    // Same guard for pages with overflow
    const page = pages[current];
    if(page && page.classList.contains('page-section')){
      const sh = page.scrollHeight, ch = page.clientHeight, st = page.scrollTop;
      if(sh > ch){
        if(dy < 0 && st + ch < sh - 4) return;
        if(dy > 0 && st > 4) return;
      }
    }
    if(dy < 0) goTo(current + 1, 1);
    else       goTo(current - 1, -1);
  });

  // ===== Keyboard =====
  window.addEventListener('keydown', e => {
    if(transitioning) return;
    if(['ArrowDown','PageDown',' '].includes(e.key)){
      e.preventDefault();
      goTo(current + 1, 1);
    } else if(['ArrowUp','PageUp'].includes(e.key)){
      e.preventDefault();
      goTo(current - 1, -1);
    } else if(e.key === 'Home'){
      e.preventDefault();
      goTo(0, -1);
    } else if(e.key === 'End'){
      e.preventDefault();
      goTo(pages.length-1, 1);
    }
  });

  // ===== Nav clicks =====
  document.querySelectorAll('nav.topnav a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      // If the generative art overlay is open, dismiss it first so the
      // user lands on a clean page (not the genart overlay over a different page).
      if (window.GENART && window.GENART.isOpen()) {
        window.GENART.close();
      }
      if (window.STAGEART && window.STAGEART.isOpen()) {
        window.STAGEART.close();
      }
      const id = a.getAttribute('href').substring(1);
      const idx = pages.findIndex(p => p.id === id);
      if(idx !== -1){
        const dir = idx > current ? 1 : -1;
        goTo(idx, dir);
      }
    });
  });

  // ===== Brand logo — always goes to landing (index 0) =====
  const brandEl = document.querySelector('nav.topnav .brand');
  if(brandEl){
    brandEl.addEventListener('click', e => {
      e.preventDefault();
      if (window.GENART && window.GENART.isOpen()) {
        window.GENART.close();
      }
      if (window.STAGEART && window.STAGEART.isOpen()) {
        window.STAGEART.close();
      }
      goTo(0, -1);
    });
  }

  // ===== Progress dots clicks =====
  dots.forEach((d,i) => {
    d.addEventListener('click', () => {
      if(i === current) return;
      goTo(i, i > current ? 1 : -1);
    });
  });

  // ===== Hamburger menu (mobile) =====
  // Toggles a `.open` class on nav.topnav. CSS handles all visibility
  // — on desktop the hamburger button is display:none, so this code
  // has no visible effect there.
  const navToggle = document.getElementById('nav-toggle');
  const navEl     = document.querySelector('nav.topnav');
  if (navToggle && navEl) {
    navToggle.addEventListener('click', () => {
      const willOpen = !navEl.classList.contains('open');
      navEl.classList.toggle('open', willOpen);
      navToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    // Close menu after selecting any nav link
    navEl.querySelectorAll('ul a').forEach(a => {
      a.addEventListener('click', () => {
        navEl.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    // Close menu when clicking the brand logo
    const brandClose = navEl.querySelector('.brand');
    if (brandClose) {
      brandClose.addEventListener('click', () => {
        navEl.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    }
  }

  updateDots();
  updateNav();
})();
