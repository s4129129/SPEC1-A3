(function(){
  const overlay = document.getElementById('stage-art-fullscreen');
  const frame = document.getElementById('stage-art-frame');
  const closeBtn = document.getElementById('stage-art-close');
  const label = document.getElementById('stage-art-label');
  const cards = Array.from(document.querySelectorAll('.stage-art-card'));

  if (!overlay || !frame || !cards.length) return;

  let isOpen = false;
  let activePreviewTimer = null;

  function getCardSrc(card) {
    return card.getAttribute('data-stage-art-src');
  }

  function getPreviewSrc(card) {
    const src = getCardSrc(card);
    if (!src) return '';
    const joiner = src.includes('?') ? '&' : '?';
    return `${src}${joiner}preview=1`;
  }

  function getCardFrame(card) {
    return card.querySelector('.stage-art-card-body iframe');
  }

  function isCardPageActive(card) {
    const page = card.closest('.page');
    return Boolean(page && page.classList.contains('active'));
  }

  function loadPreview(card) {
    const iframe = getCardFrame(card);
    const src = getPreviewSrc(card);
    if (!iframe || !src || iframe.getAttribute('src') === src) return;
    iframe.setAttribute('src', src);
  }

  function unloadPreview(card) {
    const iframe = getCardFrame(card);
    if (!iframe || !iframe.hasAttribute('src')) return;
    iframe.setAttribute('src', 'about:blank');
    iframe.removeAttribute('src');
  }

  function syncPreviewFrames() {
    cards.forEach(card => {
      if (isCardPageActive(card)) loadPreview(card);
      else unloadPreview(card);
    });
  }

  function schedulePreviewSync() {
    if (activePreviewTimer) clearTimeout(activePreviewTimer);
    syncPreviewFrames();
    activePreviewTimer = setTimeout(() => {
      activePreviewTimer = null;
      syncPreviewFrames();
    }, 950);
  }

  function openCard(card) {
    const src = getCardSrc(card);
    const title = card.getAttribute('data-stage-art-title') || 'STAGE ART';
    if (!src) return;

    if (window.GENART && window.GENART.isOpen()) {
      window.GENART.close();
    }

    isOpen = true;
    document.body.classList.add('stage-art-open');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    cards.forEach(unloadPreview);
    frame.src = src;
    if (label) label.textContent = title;

    if (window.MUSIC && window.MUSIC.pauseTemporarily) {
      window.MUSIC.pauseTemporarily();
    }
  }

  function closeStageArt() {
    if (!isOpen) return;
    isOpen = false;
    document.body.classList.remove('stage-art-open');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    frame.src = 'about:blank';
    schedulePreviewSync();

    if (window.MUSIC && window.MUSIC.resume) {
      window.MUSIC.resume();
    }
  }

  cards.forEach(card => {
    const controls = card.querySelectorAll('.stage-art-zoom, .stage-art-open-hit');
    controls.forEach(control => {
      control.addEventListener('click', event => {
        event.preventDefault();
        openCard(card);
      });
    });
  });

  const pageObserver = new MutationObserver(schedulePreviewSync);
  document.querySelectorAll('.page').forEach(page => {
    pageObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
  });
  schedulePreviewSync();

  closeBtn && closeBtn.addEventListener('click', closeStageArt);

  overlay.addEventListener('click', event => {
    if (event.target === overlay) closeStageArt();
  });

  overlay.addEventListener('wheel', event => {
    if (isOpen) event.stopPropagation();
  }, { passive: true });
  overlay.addEventListener('touchstart', event => {
    if (isOpen) event.stopPropagation();
  }, { passive: true });
  overlay.addEventListener('touchmove', event => {
    if (isOpen) event.stopPropagation();
  }, { passive: true });
  overlay.addEventListener('touchend', event => {
    if (isOpen) event.stopPropagation();
  });

  window.addEventListener('keydown', event => {
    if (isOpen && event.key === 'Escape') {
      event.stopPropagation();
      closeStageArt();
    }
  }, true);

  window.addEventListener('keydown', event => {
    if (!isOpen) return;
    if (['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key)) {
      event.stopPropagation();
    }
  }, true);

  window.STAGEART = {
    close: closeStageArt,
    isOpen: () => isOpen,
  };
})();
