/* ===========================================================
   drag.js — make .draggable elements free-draggable by user.
   Uses pointer events (mouse + touch) and sets top/left.
   =========================================================== */

(function(){
  const draggables = document.querySelectorAll('.draggable');
  if(!draggables.length) return;

  let activeEl = null;
  let pointerStartX = 0, pointerStartY = 0;
  let elStartLeft = 0, elStartTop = 0;
  let pointerMoved = false;

  draggables.forEach(el => {
    el.addEventListener('pointerdown', onDown);
  });

  function onDown(e){
    // Don't hijack if target is a nav link etc.
    if(e.button !== 0 && e.pointerType === 'mouse') return;
    activeEl = e.currentTarget;
    pointerMoved = false;

    // Get current bounding rect and convert to left/top absolute values
    const rect = activeEl.getBoundingClientRect();
    const parentRect = activeEl.offsetParent
      ? activeEl.offsetParent.getBoundingClientRect()
      : {left:0, top:0};

    // Set explicit left/top in pixels so we can move freely
    const newLeft = rect.left - parentRect.left;
    const newTop  = rect.top  - parentRect.top;

    activeEl.style.left   = newLeft + 'px';
    activeEl.style.top    = newTop  + 'px';
    activeEl.style.right  = 'auto';
    activeEl.style.bottom = 'auto';

    elStartLeft = newLeft;
    elStartTop  = newTop;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;

    activeEl.classList.add('being-dragged');
    // capture so pointermove/up always reach us
    try { activeEl.setPointerCapture(e.pointerId); } catch(err){}

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, {once:true});
    document.addEventListener('pointercancel', onUp, {once:true});
    e.preventDefault();
  }

  function onMove(e){
    if(!activeEl) return;
    const dx = e.clientX - pointerStartX;
    const dy = e.clientY - pointerStartY;
    if(Math.abs(dx) + Math.abs(dy) > 3) pointerMoved = true;
    activeEl.style.left = (elStartLeft + dx) + 'px';
    activeEl.style.top  = (elStartTop  + dy) + 'px';
  }

  function onUp(e){
    if(!activeEl) return;
    activeEl.classList.remove('being-dragged');
    if(pointerMoved){
      activeEl.classList.add('was-dragged'); // so idle-pop skips it
    }
    try { activeEl.releasePointerCapture(e.pointerId); } catch(err){}
    document.removeEventListener('pointermove', onMove);
    activeEl = null;
  }
})();