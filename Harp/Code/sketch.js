
// ==========================================
// SETTINGS
// ==========================================

const COLORS = {
  bg: '#000000',
  text: '#FFFFFF',
  button: '#FED602',
  box: '#FE1595',
  mainPlane: '#FED602',
  smokeSquare: 'rgba(23, 34, 176, 0.8)',
  smokeRect: 'rgba(29, 217, 219, 0.9)',
  // Main maximalist accent colors.
  cyan: '#1DD9DB',
  pink: '#FE1595',
  yellow: '#FED602'
};

const SMOKE_BASE_LIFESPAN = 120;

// Scroll points where the artwork becomes more intense.
const STAGE_1_SCROLL = 1000;
const STAGE_2_SCROLL = 3000;
const STAGE_3_SCROLL = 5000;

const DEFAULT_TARGET_FPS = 60;
const ULTRA_SMOOTH_TARGET_FPS = 50;

// Humming sounds fade in and out as the user moves between stages.
const STAGE3_HUMMING_MAX_VOLUME = 0.08; // Changed to 80%
const STAGE1_HUMMING_VOLUME = 0.08;
const STAGE2_HUMMING_VOLUME = 0.15;
const STAGE_HUMMING_FADE_SPEED = 0.04;
const STAGE_HUMMING_SCROLL_FADE = 450;
const STAGE2_HUMMING_FILE_PATH = '../designed-sounds/humming.wav';
const STAGE3_HUMMING_FILE_PATH = '../designed-sounds/humming2.wav';

const POPUP_SOUND_FILE_PATHS = [
  '../designed-sounds/ring.wav',
  '../designed-sounds/ring2.wav',
  '../designed-sounds/ring3.wav'
];
const POPUP_HARP_CLICK_SOUND_FILE_PATHS = [
  '../designed-sounds/harp-click1.wav',
  '../designed-sounds/harp-click2.wav'
];
const POPUP_HOVER_SOUND_FILE_PATHS = [
  '../designed-sounds/harp-hover1.wav',
  '../designed-sounds/harp-hover2.wav'
];
const TEXT_POPUP_SOUND_FILE_PATH = '../designed-sounds/text-popup.wav';
const POPUP_WAVE_COUNTS = [1, 1, 2, 4];
const MESSAGE_BOX_TEXTS = [
  'New arrivals just dropped! Click now to be the first to wear it.',
  'Upgrade your style without breaking the bank. Order today.',
  'BUY 2 GET 1 FREE!!',
  "Limited edition drop. Once it's gone, it's gone forever.",
  'Your order will arrive shortly. Please Scroll down.'
];

// ==========================================
// RUNNING STATE
// ==========================================

let virtualScroll = 0;
let scrollVelocity = 0;
let grainLayer;
let stage3Layer;
let uiSeed;
let uiLayout;

let projectiles = [];
let uiPopups = [];
let popupAnimStates = [];
let mainPlanePos = { x: 0, y: 0 };
let mainPlaneAngle = Math.PI / 2;
let stage2HummingSound = null;
let stage3HummingSound = null;
let stageHummingUnlocked = false;
let stage2HummingVolume = 0;
let stage3HummingVolume = 0;
let ultraSmoothMode = false;
let ultraSmoothBannerFrames = 0;
let ultraSmoothBannerText = '';
let currentStage = 0;
let restartButtonPressed = false;
let restartButtonHoveredLast = false;

let popupHarpClickSounds = [];
let popupClickSounds = [];
let popupHoverSounds = [];
let textPopupSound = null;
let hoveredPopupIndex = -1;
let popupWaveIndex = 0;
let messageBoxStep = 0;
let lastMessageBoxSoundKey = '';
let clickedPopupIndices = new Set();

let particles = [];
let otherPlanes = [];

// ==========================================
// P5 LIFECYCLE
// ==========================================

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Caveat Brush');
  applyPerformanceMode();
  initPopupSounds();
  initStageHumming();
  
  uiSeed = random(10000);
  
  mainPlanePos.x = width / 2;
  mainPlanePos.y = height - 100;

  createGrain();
  createStage3Layer();
  uiLayout = generateMaximalistUILayout();
}

function draw() {
  background(COLORS.bg);

  // Ultra Smooth mode reduces the amount of smoke work on slower computers.
  const enemySmokeStep = ultraSmoothMode ? 14 : 10;
  const mainSmokeStep = ultraSmoothMode ? 5 : 3;

  // Stage 3 fades in as a textured layer instead of appearing instantly.
  let stage3Blend = constrain(map(virtualScroll, STAGE_2_SCROLL, STAGE_3_SCROLL, 0, 1), 0, 1);
  if (stage3Blend > 0) {
    push();
    tint(255, 255 * stage3Blend);
    image(stage3Layer, 0, 0);
    pop();
  }
  
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetX = 12;
  drawingContext.shadowOffsetY = 12;
  drawingContext.shadowColor = 'white';
  
  virtualScroll += scrollVelocity;
  if (virtualScroll < 0) virtualScroll = 0;
  
  let finalScrollLimit = getFinalScrollLimit();
  if (virtualScroll > finalScrollLimit) {
    virtualScroll = finalScrollLimit;
    scrollVelocity = 0;
  }
  
  scrollVelocity *= 0.9;

  // The main plane rotates gently toward the scroll direction.
  let targetAngle = PI/2;
  if (scrollVelocity > 1) targetAngle = PI/2;
  else if (scrollVelocity < -1) targetAngle = -PI/2;
  mainPlaneAngle = lerp(mainPlaneAngle, targetAngle, 0.1);

  let targetPlanes = 0;
  let smokeMultiplier = 1;
  let newStage = 0;

  if (virtualScroll > STAGE_3_SCROLL) {
    targetPlanes = 12; smokeMultiplier = 3; newStage = 3;
  } else if (virtualScroll > STAGE_2_SCROLL) {
    targetPlanes = 4; smokeMultiplier = 2; newStage = 2;
  } else if (virtualScroll > STAGE_1_SCROLL) {
    targetPlanes = 2; smokeMultiplier = 1; newStage = 1;
  }
  
  if (currentStage !== newStage) {
    currentStage = newStage;
  }

  manageOtherPlanes(targetPlanes);
  
  for (let i = otherPlanes.length - 1; i >= 0; i--) {
    let p = otherPlanes[i];
    p.update();
    let screenY = p.worldY - virtualScroll;
    if (frameCount % enemySmokeStep === 0 && p.x > -120 && p.x < width + 120 && screenY > -120 && screenY < height + 120) {
      spawnSmoke(p.x, screenY, smokeMultiplier);
    }
    if (p.isOffScreen()) otherPlanes.splice(i, 1);
  }

  if (abs(scrollVelocity) > 1 && frameCount % mainSmokeStep === 0) {
    spawnSmoke(mainPlanePos.x, mainPlanePos.y - 40, smokeMultiplier);
  }

  // Keep particle count capped when performance mode is enabled.
  if (ultraSmoothMode && particles.length > 320) {
    particles.splice(0, particles.length - 320);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  for (let i = 0; i < otherPlanes.length; i++) {
    otherPlanes[i].display();
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].display();
    if (projectiles[i].isDead()) projectiles.splice(i, 1);
  }

  push();
  translate(0, -virtualScroll);
  drawMaximalistUI();
  pop();

  drawPlane(mainPlanePos.x, mainPlanePos.y, COLORS.mainPlane, mainPlaneAngle, getStageVCutCount(), 42);
  drawMainPlanePrompt();
  drawMessageBox();

  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  image(grainLayer, 0, 0);
  drawPerformanceStatus();
  if (virtualScroll >= getFinalScrollLimit()) {
    drawRestartButton();
  }

  updateStageHumming();
}

// ==========================================
// INPUT AND WINDOW EVENTS
// ==========================================

function mouseWheel(event) {
  unlockStageHumming();
  scrollVelocity += event.delta * 0.1;
  return false; 
}

function keyPressed() {
  if (key === 'u' || key === 'U') {
    toggleUltraSmoothMode();
    return false;
  }
}

function mousePressed() {
  unlockStageHumming();

  if (virtualScroll >= getFinalScrollLimit() && isRestartButtonHovered(mouseX, mouseY)) {
    restartButtonPressed = true;
    playRestartButtonClickSound(() => {
      restartSketch();
    });
    return;
  }

  let myWorld = mouseY + virtualScroll;
  
  // Check popups from top to bottom. The last drawn popup is visually on top.
  for (let i = uiPopups.length - 1; i >= 0; i--) {
    let p = uiPopups[i];
    if (abs(mouseX - p.x) < p.w/2 && abs(myWorld - p.y) < p.h/2) {
      if (p.idx !== undefined && p.idx >= 0) {
        if (!popupAnimStates[p.idx]) popupAnimStates[p.idx] = { scale: 1, clickFrames: 0 };
        popupAnimStates[p.idx].clickFrames = 8;
      }
      projectiles.push(new Projectile(p.x, p.y, mainPlanePos.x, mainPlanePos.y));
      
      let wasLast = handlePopupClick(p.idx, true); // check if this click completes the wave
      playPopupRingSound(() => {
        if (wasLast) {
          advancePopupWaveAndText();
        }
      });
      break;
    }
  }
}

function mouseReleased() {
  if (restartButtonPressed) {
    restartButtonPressed = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  mainPlanePos.x = width / 2;
  mainPlanePos.y = height - 100;
  createGrain();
  createStage3Layer();
  popupAnimStates = [];
  uiLayout = generateMaximalistUILayout();
}

function restartSketch() {
  virtualScroll = 0;
  scrollVelocity = 0;
  particles = [];
  otherPlanes = [];
  projectiles = [];
  popupAnimStates = [];
  popupWaveIndex = 0;
  messageBoxStep = 0;
  lastMessageBoxSoundKey = '';
  clickedPopupIndices.clear();
  hoveredPopupIndex = -1;
  currentStage = 0;
  mainPlaneAngle = Math.PI / 2;
  stage2HummingVolume = 0;
  stage3HummingVolume = 0;
  restartButtonPressed = false;
  restartButtonHoveredLast = false;
  uiSeed = random(10000);
  uiLayout = generateMaximalistUILayout();
  createGrain();
  createStage3Layer();
}

// ==========================================
// PERFORMANCE MODE
// ==========================================

function applyPerformanceMode() {
  frameRate(ultraSmoothMode ? ULTRA_SMOOTH_TARGET_FPS : DEFAULT_TARGET_FPS);
}

function toggleUltraSmoothMode() {
  ultraSmoothMode = !ultraSmoothMode;
  applyPerformanceMode();

  if (ultraSmoothMode && particles.length > 260) {
    particles.splice(0, particles.length - 260);
  }

  ultraSmoothBannerText = ultraSmoothMode ? 'Ultra Smooth: ON (press U to toggle)' : 'Ultra Smooth: OFF (press U to toggle)';
  ultraSmoothBannerFrames = 180;
}

function drawPerformanceStatus() {
  if (!ultraSmoothMode && ultraSmoothBannerFrames <= 0) return;

  if (ultraSmoothBannerFrames > 0) ultraSmoothBannerFrames--;

  push();
  textAlign(LEFT, TOP);
  textSize(14);
  noStroke();
  fill(255);
  text(ultraSmoothMode ? 'Ultra Smooth: ON (U)' : ultraSmoothBannerText, 14, 12);
  pop();
}

// ==========================================
// MAXIMALIST UI LAYOUT AND DRAWING
// ==========================================

function randomColor() {
  const palette = [
    COLORS.cyan, COLORS.pink, COLORS.yellow, COLORS.button, 
    COLORS.box, COLORS.mainPlane, color(23, 34, 176), color(29, 217, 219)
  ];
  return random(palette);
}

function randomTextColor(bgCol) {
  // Keep popup patterns readable by avoiding the popup background color and black.
  let candidates = [
    '#FFFFFF',
    COLORS.cyan,
    COLORS.pink,
    COLORS.yellow,
    COLORS.button,
    COLORS.box,
    COLORS.mainPlane,
    'rgb(23, 34, 176)',
    'rgb(29, 217, 219)'
  ];

  let bg = color(bgCol).toString();
  let filtered = candidates.filter((c) => color(c).toString() !== bg && color(c).toString() !== color('#000000').toString());

  if (!filtered.length) return '#FFFFFF';
  return random(filtered);
}

function drawMaximalistUI() {
  if (!uiLayout) uiLayout = generateMaximalistUILayout();

  // Reset clickable areas because popup scale/position can change each frame.
  uiPopups = [];
  push();

  // White offset shadows are part of the visual style.
  drawingContext.shadowOffsetX = 12;
  drawingContext.shadowOffsetY = 12;
  drawingContext.shadowColor = 'white';

  // Decorations are drawn first so popups sit above them.
  for (let i = 0; i < uiLayout.microCircles.length; i++) {
    let p = uiLayout.microCircles[i];
    drawDecorativeCircle(p.x, p.y, p.s, p.col);
  }
  for (let i = 0; i < uiLayout.microOctagons.length; i++) {
    let p = uiLayout.microOctagons[i];
    drawDecorativeOctagon(p.x, p.y, p.s, p.col, p.rot);
  }
  for (let i = 0; i < uiLayout.circles.length; i++) {
    let p = uiLayout.circles[i];
    drawDecorativeCircle(p.x, p.y, p.s, p.col);
  }
  for (let i = 0; i < uiLayout.octagons.length; i++) {
    let p = uiLayout.octagons[i];
    drawDecorativeOctagon(p.x, p.y, p.s, p.col, p.rot);
  }

  // Mouse position is converted into world space so hitboxes still work while scrolled.
  let myWorld = mouseY + virtualScroll;
  let anyPopupHovered = false;
  let currentHoveredPopupIndex = -1;
  for (let i = 0; i < uiLayout.popups.length; i++) {
    let popup = uiLayout.popups[i];
    if (!isPopupVisible(popup, i)) continue;

    if (!popupAnimStates[i]) {
      popupAnimStates[i] = { scale: 1, clickFrames: 0 };
    }

    let state = popupAnimStates[i];
    let isHovered = abs(mouseX - popup.x) < popup.w / 2 && abs(myWorld - popup.y) < popup.h / 2;
    if (isHovered) {
      anyPopupHovered = true;
      currentHoveredPopupIndex = i;
    }

    let targetScale = 1;
    if (state.clickFrames > 0) {
      state.clickFrames--;
      targetScale = 0.9;
    } else if (isHovered) {
      targetScale = 1.08;
    }

    state.scale = lerp(state.scale, targetScale, 0.25);
    drawPopupAd(popup, state.scale, i);
  }

  if (currentHoveredPopupIndex !== -1 && currentHoveredPopupIndex !== hoveredPopupIndex) {
    playPopupHoverSound();
  }
  hoveredPopupIndex = currentHoveredPopupIndex;

  if (anyPopupHovered) cursor('pointer');
  else cursor(ARROW);

  pop();
}

function generateMaximalistUILayout() {
  // The seed keeps the layout stable until the window is resized.
  randomSeed(uiSeed);

  let layout = {
    microCircles: [],
    microOctagons: [],
    circles: [],
    octagons: [],
    popups: []
  };

  let decoPositions = [];

  // Reject positions too close to the center or to an existing decoration.
  function isValidPos(px, py, minRes) {
    if (px > width / 2 - 450 && px < width / 2 + 450 && py > 50 && py < height * 0.8) return false;
    for (let i = 0; i < decoPositions.length; i++) {
      let dp = decoPositions[i];
      if (dist(px, py, dp.x, dp.y) < minRes) return false;
    }
    return true;
  }

  // Try random positions first; if none fit, return a fallback so generation never fails.
  function getPos(minRes = 120, specificX = -1, specificY = -1, rangeX = 0, rangeY = 0, minY = 50, maxY = height - 50) {
    for (let i = 0; i < 200; i++) {
      let px = specificX === -1 ? random(width) : specificX + random(-rangeX, rangeX);
      let py = specificY === -1 ? random(minY, maxY) : specificY + random(-rangeY, rangeY);
      if (px < 50 || px > width - 50 || py < minY || py > maxY) continue;

      if (isValidPos(px, py, minRes)) {
        decoPositions.push({ x: px, y: py });
        return { x: px, y: py };
      }
    }

    let fallback = { x: random(50, width - 50), y: random(minY, maxY) };
    decoPositions.push(fallback);
    return fallback;
  }

  // Build a loose grid, then jitter each point. This gives even spacing without looking rigid.
  function getEvenScatterPositions(count, minRes, minY = 50, maxY = height - 50) {
    let safeMinX = 50;
    let safeMaxX = width - 50;
    let areaW = max(1, safeMaxX - safeMinX);
    let areaH = max(1, maxY - minY);
    let cols = max(1, round(sqrt((count * areaW) / areaH)));
    let rows = max(1, ceil(count / cols));
    let cellW = areaW / cols;
    let cellH = areaH / rows;
    let points = [];

    for (let i = 0; i < count; i++) {
      let col = i % cols;
      let row = floor(i / cols);
      let tx = safeMinX + col * cellW + cellW * 0.5;
      let ty = minY + row * cellH + cellH * 0.5;
      let p = getPos(minRes, tx, ty, cellW * 0.32, cellH * 0.32, minY, maxY);
      points.push(p);
    }

    return points;
  }

  // Use probability to fade decoration density lower on the page.
  function getTaperedScatterPositions(count, minRes, minY, maxY, falloffPower = 1.8) {
    let points = [];
    let attempts = 0;
    while (points.length < count && attempts < 4) {
      attempts++;
      let candidates = getEvenScatterPositions(count * 2, minRes, minY, maxY);
      for (let i = 0; i < candidates.length; i++) {
        let p = candidates[i];
        let t = constrain(map(p.y, minY, maxY, 0, 1), 0, 1);
        let keepChance = pow(1 - t, falloffPower);
        if (random() < keepChance) points.push(p);
        if (points.length >= count) break;
      }
    }

    if (points.length < count) {
      while (points.length < count) {
        let p = getPos(minRes, -1, -1, 0, 0, minY, maxY);
        points.push(p);
      }
    }

    return points;
  }

  let arr1Pos = getPos(120, width / 2 - 400, height / 2 - 100, 20, 20);
  let arr2Pos = getPos(120, width / 2 + 400, height / 2 + 100, 20, 20);

  let microCirclePositions = getEvenScatterPositions(34, 45);
  for (let i = 0; i < microCirclePositions.length; i++) {
    let p = microCirclePositions[i];
    layout.microCircles.push({ x: p.x, y: p.y, s: random(0.1, 0.25), col: randomColor() });
  }
  let microOctagonPositions = getEvenScatterPositions(34, 45);
  for (let i = 0; i < microOctagonPositions.length; i++) {
    let p = microOctagonPositions[i];
    layout.microOctagons.push({ x: p.x, y: p.y, s: random(0.1, 0.25), col: randomColor(), rot: random(TWO_PI) });
  }

  let transitionMinY = min(height + 30, STAGE_1_SCROLL - 140);
  let transitionMaxY = max(transitionMinY + 80, STAGE_1_SCROLL - 60);
  let transitionMicroCirclePositions = getTaperedScatterPositions(6, 34, height + 20, STAGE_1_SCROLL - 60, 2.1);
  for (let i = 0; i < transitionMicroCirclePositions.length; i++) {
    let p = transitionMicroCirclePositions[i];
    let t = constrain(map(p.y, height + 20, STAGE_1_SCROLL - 60, 0, 1), 0, 1);
    layout.microCircles.push({ x: p.x, y: p.y, s: random(0.1, 0.2) * (1 - t * 0.25), col: randomColor() });
  }
  let transitionMicroOctagonPositions = getTaperedScatterPositions(6, 34, height + 20, STAGE_1_SCROLL - 60, 2.1);
  for (let i = 0; i < transitionMicroOctagonPositions.length; i++) {
    let p = transitionMicroOctagonPositions[i];
    let t = constrain(map(p.y, height + 20, STAGE_1_SCROLL - 60, 0, 1), 0, 1);
    layout.microOctagons.push({ x: p.x, y: p.y, s: random(0.1, 0.2) * (1 - t * 0.25), col: randomColor(), rot: random(TWO_PI) });
  }

  let circlePositions = getTaperedScatterPositions(12, 95, 50, STAGE_2_SCROLL, 1.2);
  for (let i = 0; i < circlePositions.length; i++) {
    let p = circlePositions[i];
    let t = constrain(map(p.y, 50, STAGE_2_SCROLL, 0, 1), 0, 1);
    layout.circles.push({ x: p.x, y: p.y, s: random(0.2, 0.4) * (1 - t * 0.4), col: randomColor() });
  }
  let octagonPositions = getTaperedScatterPositions(12, 95, 50, STAGE_2_SCROLL, 1.2);
  for (let i = 0; i < octagonPositions.length; i++) {
    let p = octagonPositions[i];
    let t = constrain(map(p.y, 50, STAGE_2_SCROLL, 0, 1), 0, 1);
    layout.octagons.push({ x: p.x, y: p.y, s: random(0.2, 0.4) * (1 - t * 0.4), col: randomColor(), rot: random(TWO_PI) });
  }
  layout.octagons.push({ x: arr1Pos.x, y: arr1Pos.y, s: 0.5, col: randomColor(), rot: -PI / 6 });
  layout.octagons.push({ x: arr2Pos.x, y: arr2Pos.y, s: 0.5, col: randomColor(), rot: -PI + PI / 6 });

  let popupPositions = [];
  for (let wave = 0; wave < POPUP_WAVE_COUNTS.length; wave++) {
    for (let waveSlot = 0; waveSlot < POPUP_WAVE_COUNTS[wave]; waveSlot++) {
      let pCol = randomColor();
      let size = getPopupSizeForWave(wave);
      let bw = size.w;
      let bh = size.h;
      let pos = wave === 0
        ? { x: width / 2, y: height / 2 }
        : getRandomPopupPosition(bw, bh, popupPositions);

      popupPositions.push({ x: pos.x, y: pos.y, w: bw, h: bh });

      let patternType = int(random(3));
      let patternColor = randomTextColor(pCol);
      let popupGraphic = createPopupGraphic(bw, bh, pCol, patternType, patternColor);

      layout.popups.push({
        x: pos.x,
        y: pos.y,
        w: bw,
        h: bh,
        rot: random(-0.05, 0.05),
        graphic: popupGraphic,
        wave
      });
    }
  }

  // Restore unpredictable randomness for animations and particles after using uiSeed.
  randomSeed(Math.random() * 1000000);
  return layout;
}

function getPopupSizeForWave(wave) {
  let maxW = wave >= 3 ? min(260, width * 0.36) : min(320, width * 0.7);
  let maxH = wave >= 3 ? min(190, height * 0.23) : min(240, height * 0.32);
  let minW = min(200, maxW);
  let minH = min(150, maxH);

  return {
    w: random(minW, maxW),
    h: random(minH, maxH)
  };
}

function getRandomPopupPosition(popupW, popupH, existingPopups) {
  let minX = popupW / 2 + 30;
  let maxX = width - popupW / 2 - 30;
  let minY = popupH / 2 + 30;
  let maxY = height * 0.8 - popupH / 2 - 30;

  if (minX > maxX) {
    minX = width / 2;
    maxX = width / 2;
  }
  if (minY > maxY) {
    minY = height / 2;
    maxY = height / 2;
  }

  for (let attempts = 0; attempts < 90; attempts++) {
    let x = random(minX, maxX);
    let y = random(minY, maxY);
    let overlaps = false;

    for (let i = 0; i < existingPopups.length; i++) {
      let p = existingPopups[i];
      let minGap = 24;
      if (abs(x - p.x) < (popupW + p.w) / 2 + minGap && abs(y - p.y) < (popupH + p.h) / 2 + minGap) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) return { x, y };
  }

  return {
    x: random(minX, maxX),
    y: random(minY, maxY)
  };
}

function isPopupVisible(popup, popupIndex) {
  return popup.wave <= popupWaveIndex;
}

function isFinalPopupWave() {
  return popupWaveIndex >= POPUP_WAVE_COUNTS.length - 1;
}

function handlePopupClick(popupIndex, justCheck = false) {
  let clickedPopup = uiLayout.popups[popupIndex];
  if (!clickedPopup || clickedPopup.wave !== popupWaveIndex) return false;

  clickedPopupIndices.add(popupIndex);

  let activeWaveIndices = uiLayout.popups
    .map((popup, index) => popup.wave === popupWaveIndex ? index : -1)
    .filter((index) => index !== -1);

  if (activeWaveIndices.every((index) => clickedPopupIndices.has(index))) {
    if (!justCheck) {
      advancePopupWaveAndText();
    }
    return true;
  }
  return false;
}

function advancePopupWaveAndText() {
  if (isFinalPopupWave()) {
    messageBoxStep = MESSAGE_BOX_TEXTS.length - 1;
    return;
  }

  popupWaveIndex = min(popupWaveIndex + 1, POPUP_WAVE_COUNTS.length - 1);
  let newStep = min(popupWaveIndex, MESSAGE_BOX_TEXTS.length - 1);
  if (messageBoxStep !== newStep) {
    messageBoxStep = newStep;
  }
  clickedPopupIndices.clear();
  hoveredPopupIndex = -1;
}

function createPopupGraphic(w, h, col, patternType, patternColor) {
  let g = createGraphics(max(1, floor(w)), max(1, floor(h)));
  g.rectMode(CENTER);
  g.noStroke();
  g.fill(col);
  g.rect(g.width / 2, g.height / 2, w, h);

  g.drawingContext.save();
  g.drawingContext.beginPath();
  g.drawingContext.rect(2, 2, g.width - 4, g.height - 4);
  g.drawingContext.clip();

  drawRandomPatternOnLayer(g, w, h, patternColor, patternType);

  g.drawingContext.restore();

  // Draw V-cuts in the middle of the left and right edges
  g.push();
  g.erase();
  g.noStroke();
  let cutSize = 24; 
  // Left V-cut
  g.triangle(0, g.height / 2 - cutSize, 0, g.height / 2 + cutSize, cutSize, g.height / 2);
  // Right V-cut
  g.triangle(g.width, g.height / 2 - cutSize, g.width, g.height / 2 + cutSize, g.width - cutSize, g.height / 2);
  g.noErase();
  g.pop();

  return g;
}

function drawPopupAd(popup, popupScale = 1, popupIndex = -1) {
  push();
  translate(popup.x, popup.y);
  
  rotate(popup.rot);
  scale(popupScale);
  
  // Register hitbox for click/hover detection.
  uiPopups.push({x: popup.x, y: popup.y, w: popup.w * popupScale, h: popup.h * popupScale, idx: popupIndex});

  drawingContext.shadowOffsetX = 12;
  drawingContext.shadowOffsetY = 12;
  drawingContext.shadowColor = 'white';

  imageMode(CENTER);
  image(popup.graphic, 0, 0, popup.w, popup.h);

  pop();
}

function drawRandomPatternOnLayer(layer, w, h, c, pType) {
  layer.push();
  layer.translate(layer.width / 2, layer.height / 2);
  layer.fill(c);
  layer.noStroke();
  
  if (pType === 0) {
    layer.push();
    layer.rotate(PI / 4);
    for (let i = -w * 1.5; i < w * 1.5; i += 20) {
      layer.rect(i, 0, 10, h * 3);
    }
    layer.pop();
  } else if (pType === 1) {
    for (let i = -w / 2; i < w / 2; i += 20) {
      for (let j = -h / 2; j < h / 2; j += 20) {
        layer.circle(i + 10, j + 10, 10);
      }
    }
  } else {
    let size = 20;
    for (let i = -w / 2 - size; i < w / 2 + size; i += size) {
      for (let j = -h / 2 - size; j < h / 2 + size; j += size) {
        let colIndex = floor(i / size);
        let rowIndex = floor(j / size);
        if ((colIndex + rowIndex) % 2 === 0) {
          layer.rect(i + size / 2, j + size / 2, size, size);
        }
      }
    }
  }

  layer.pop();
}

// ==========================================
// SMALL DECORATION DRAWING HELPERS
// ==========================================

function drawDecorativeCircle(x, y, s, col) {
  push();
  translate(x, y);
  scale(s);
  fill(col);
  noStroke();
  circle(0, 0, 36);
  pop();
}

function drawDecorativeOctagon(x, y, s, col, rot = 0) {
  push();
  translate(x, y);
  
  // The sine wave gives each octagon a small floating rotation.
  let animRot = rot + sin(frameCount * 0.05 + x) * 0.15;
  rotate(animRot);
  
  scale(s);
  fill(col);
  noStroke();
  beginShape();
  for (let i = 0; i < 8; i++) {
    let angle = TWO_PI * i / 8 - PI / 8;
    vertex(cos(angle) * 18, sin(angle) * 18);
  }
  endShape(CLOSE);
  pop();
}

// ==========================================
// SOUND HELPERS
// ==========================================

function initPopupSounds() {
  popupClickSounds = POPUP_SOUND_FILE_PATHS.map((path) => {
    let audio = new Audio(path);
    audio.preload = 'auto';
    return audio;
  });

  popupHarpClickSounds = POPUP_HARP_CLICK_SOUND_FILE_PATHS.map((path) => {
    let audio = new Audio(path);
    audio.preload = 'auto';
    return audio;
  });

  popupHoverSounds = POPUP_HOVER_SOUND_FILE_PATHS.map((path) => {
    let audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = 0.1; 
    return audio;
  });

  textPopupSound = new Audio(TEXT_POPUP_SOUND_FILE_PATH);
  textPopupSound.preload = 'auto';
  textPopupSound.volume = 0.76;
}

function playTextPopupSound() {
  if (isPreviewMode()) return;
  if (!textPopupSound) return;
  let audio = textPopupSound.cloneNode(true);
  audio.currentTime = 0;
  audio.volume = 0.76;
  void audio.play().catch(() => {});
}

function isPreviewMode() {
  return new URLSearchParams(window.location.search).get('preview') === '1';
}

function noteMessageBoxTextVisible(message) {
  if (!message) {
    lastMessageBoxSoundKey = '';
    return;
  }

  const key = String(message);
  if (key === lastMessageBoxSoundKey) return;
  lastMessageBoxSoundKey = key;
  playTextPopupSound();
}

function playRestartButtonClickSound(onEnded) {
  if (!popupHarpClickSounds.length) {
    if (onEnded) onEnded();
    return;
  }

  let soundIdx = floor(random(popupHarpClickSounds.length));
  let src = popupHarpClickSounds[soundIdx];
  let audio = src.cloneNode(true);
  audio.currentTime = 0;
  audio.onended = () => {
    if (onEnded) onEnded();
  };
  void audio.play().catch(() => {
    if (onEnded) onEnded();
  });
}

function playPopupRingSound(onRingPlayed) {
  if (popupHarpClickSounds.length > 0) {
    let harpIdx = floor(random(popupHarpClickSounds.length));
    let harpSrc = popupHarpClickSounds[harpIdx];
    let harpAudio = harpSrc.cloneNode(true);
    harpAudio.currentTime = 0;
    harpAudio.volume = 0.8;
    harpAudio.onended = () => {
      setTimeout(() => {
        if (!popupClickSounds.length) {
          if (onRingPlayed) onRingPlayed();
          return;
        }
        let soundIdx = floor(random(popupClickSounds.length));
        let src = popupClickSounds[soundIdx];
        let audio = src.cloneNode(true);
        audio.currentTime = 0;
        audio.onended = () => {
          setTimeout(() => {
            if (onRingPlayed) onRingPlayed();
          }, 500);
        };
        void audio.play().catch(() => {});
      }, 200);
    };
    
    void harpAudio.play().catch(() => {});
  } else {
    // Fallback if harp sounds are missing
    if (!popupClickSounds.length) {
      if (onRingPlayed) onRingPlayed();
      return;
    }
    let soundIdx = floor(random(popupClickSounds.length));
    let src = popupClickSounds[soundIdx];
    let audio = src.cloneNode(true);
    audio.currentTime = 0;
    audio.onended = () => {
      setTimeout(() => {
        if (onRingPlayed) onRingPlayed();
      }, 500);
    };
    void audio.play().catch(() => {});
  }
}

function playPopupHoverSound() {
  if (!popupHoverSounds.length) return;

  // Clone the hover sound for the same reason as click sounds.
  let soundIdx = floor(random(popupHoverSounds.length));
  let src = popupHoverSounds[soundIdx];
  let audio = src.cloneNode(true);
  audio.volume = src.volume; // Ensure cloned audio keeps the same volume
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}

function initStageHumming() {
  stage2HummingSound = createLoopingHummingSound(STAGE2_HUMMING_FILE_PATH);
  stage3HummingSound = createLoopingHummingSound(STAGE3_HUMMING_FILE_PATH);
}

function createLoopingHummingSound(path) {
  let audio = new Audio(path);
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0;
  return audio;
}

function unlockStageHumming() {
  // Browsers block autoplay. A wheel/click counts as user input, so sound can start.
  stageHummingUnlocked = true;
}

function updateStageHumming() {
  if (!stage2HummingSound || !stage3HummingSound) return;

  // Smoothstep fades avoid harsh jumps as the scroll crosses stage boundaries.
  let stage1FadeIn = getSmoothScrollFade(STAGE_1_SCROLL, STAGE_1_SCROLL + STAGE_HUMMING_SCROLL_FADE, virtualScroll);
  let stage2FadeIn = getSmoothScrollFade(STAGE_2_SCROLL, STAGE_2_SCROLL + STAGE_HUMMING_SCROLL_FADE, virtualScroll);
  let stage3FadeIn = getSmoothScrollFade(STAGE_3_SCROLL, STAGE_3_SCROLL + STAGE_HUMMING_SCROLL_FADE, virtualScroll);
  let targetStage2Volume = lerp(STAGE1_HUMMING_VOLUME, STAGE2_HUMMING_VOLUME, stage2FadeIn) * stage1FadeIn * (1 - stage3FadeIn);
  let targetStage3Volume = STAGE3_HUMMING_MAX_VOLUME * stage3FadeIn;

  stage2HummingVolume = updateHummingSoundVolume(stage2HummingSound, stage2HummingVolume, targetStage2Volume);
  stage3HummingVolume = updateHummingSoundVolume(stage3HummingSound, stage3HummingVolume, targetStage3Volume);
}

function getSmoothScrollFade(start, end, value) {
  // Smoothstep curve: starts slow, moves faster in the middle, then eases out.
  let t = constrain(map(value, start, end, 0, 1), 0, 1);
  return t * t * (3 - 2 * t);
}

function updateHummingSoundVolume(audio, currentVolume, targetVolume) {
  let nextVolume = lerp(currentVolume, targetVolume, STAGE_HUMMING_FADE_SPEED);

  if (stageHummingUnlocked && targetVolume > 0 && audio.paused) {
    void audio.play().catch(() => {});
  }

  audio.volume = constrain(nextVolume, 0, 1);

  if (audio.volume < 0.005 && targetVolume === 0 && !audio.paused) {
    audio.pause();
  }

  return nextVolume;
}

// ==========================================
// MAIN DRAWING HELPERS
// ==========================================

function drawMainPlanePrompt() {
  push();
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 0;
  textAlign(CENTER, TOP);
  textSize(14);
  noStroke();
  fill(255, 210);
  // text('Scroll down', mainPlanePos.x, mainPlanePos.y + 56);
  pop();
}

function drawMessageBox() {
  let message;
  if (virtualScroll >= getFinalScrollLimit()) {
    message = "Your order has arrived! Enjoy your purchase. We’ve traded the clear sky for the speed you requested.";
  } else if (currentStage >= 2) {
    message = "Wow... it's getting busy up here. A million paths carved by the same demand: sooner, quicker, now.";
  } else if (currentStage === 1) {
    message = "Oh, look. It seems you weren't the only one looking for something new today..";
  } else {
    message = MESSAGE_BOX_TEXTS[messageBoxStep] || MESSAGE_BOX_TEXTS[0];
  }

  noteMessageBoxTextVisible(message);

  let boxW = min(width * 0.82, 760);
  let boxH = width < 560 ? 100 : 84;
  let centerX = width / 2;
  let preferredY = mainPlanePos.y - max(80, height * 0.12);
  let centerY = constrain(preferredY, boxH / 2 + 20, height - boxH / 2 - 20);
  let innerW = boxW - 52;
  let innerH = boxH - 24;

  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Averia Sans Libre');

  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;

  noStroke();
  fill(COLORS.cyan);
  rect(centerX + 12, centerY + 12, boxW, boxH);
  fill(COLORS.pink);
  rect(centerX + 6, centerY + 6, boxW, boxH);

  fill(0, 0, 0, 184);
  stroke(COLORS.yellow);
  strokeWeight(3);
  rect(centerX, centerY, boxW, boxH);

  noStroke();
  let fontSize = width < 560 ? 18 : 24; 
  let lines = [];
  while (fontSize >= 12) {
    textSize(fontSize);
    lines = wrapMessageText(String(message).toUpperCase(), innerW);
    if (lines.length * fontSize * 1.5 <= innerH) break; 
    fontSize--;
  }

  let lineHeight = fontSize * 1.35; 
  let startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  for (let i = 0; i < lines.length; i++) {
    fill(COLORS.pink);
    text(lines[i], centerX + 2, startY + i * lineHeight + 2);
    fill(255);
    text(lines[i], centerX, startY + i * lineHeight);
  }

  pop();
}

function getFinalScrollLimit() {
  return STAGE_3_SCROLL + 1000;
}

function getRestartButtonBounds() {
  let buttonW = min(320, width * 0.55);
  let buttonH = 66;
  let buttonX = width / 2;
  let buttonY = mainPlanePos.y + 6;
  return { x: buttonX, y: buttonY, w: buttonW, h: buttonH };
}

function isRestartButtonHovered(mx, my) {
  let bounds = getRestartButtonBounds();
  return abs(mx - bounds.x) < bounds.w / 2 && abs(my - bounds.y) < bounds.h / 2;
}

function drawRestartButton() {
  let bounds = getRestartButtonBounds();
  let isHovered = isRestartButtonHovered(mouseX, mouseY);
  let isPressed = restartButtonPressed && isHovered;
  let buttonScale = isPressed ? 0.96 : (isHovered ? 1.08 : 1);

  if (isHovered && !restartButtonHoveredLast) {
    playPopupHoverSound();
  }
  restartButtonHoveredLast = isHovered;

  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont('Averia Sans Libre');
  translate(bounds.x, bounds.y);
  scale(buttonScale);

  noStroke();
  fill(COLORS.pink);
  rect(10, 10, bounds.w, bounds.h);

  let buttonFill = (isHovered || isPressed) ? COLORS.yellow : 0;
  let textFill = (isHovered || isPressed) ? 0 : COLORS.yellow;

  fill(buttonFill);
  stroke(isHovered || isPressed ? 0 : COLORS.yellow);
  strokeWeight(4);
  rect(0, 0, bounds.w, bounds.h);

  noStroke();
  fill(textFill);
  textSize(bounds.h * 0.34);
  text('Restart', 0, 1);
  pop();
}

function wrapMessageText(message, maxLineW) {
  let words = message.split(' ');
  let lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    let testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    if (textWidth(testLine) <= maxLineW || currentLine === '') {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawPlane(x, y, col, angle, cutCount = 0, seed = 0) {
  push();
  translate(x, y);
  rotate(angle);
  scale(1.5);
  fill(col);
  noStroke();

  randomSeed(seed);

  // These values choose where each V-shaped bite appears on the plane.
  // The seed keeps each plane's shape steady while it moves.
  let t1 = random(0.24, 0.76);
  let t2 = random(0.24, 0.76);
  let t3 = random(0.24, 0.76);

  beginShape();
  vertex(30, 0); 

  if (cutCount >= 1) {
    let px = lerp(30, -20, t1);
    let py = lerp(0, 20, t1);
    let nx = lerp(30, -20, t1 - 0.12);
    let ny = lerp(0, 20, t1 - 0.12);
    let bx = lerp(30, -20, t1 + 0.12);
    let by = lerp(0, 20, t1 + 0.12);
    vertex(nx, ny);
    vertex(px * 0.6, py * 0.6);
    vertex(bx, by);
  }

  vertex(-20, 20); 

  if (cutCount >= 3) {
    let p1y = lerp(20, -20, t2 - 0.12);
    let pty = lerp(20, -20, t2);
    let p2y = lerp(20, -20, t2 + 0.12);
    vertex(-20, p1y);
    vertex(-10, pty);
    vertex(-20, p2y);
  }

  vertex(-20, -20); 

  if (cutCount >= 2) {
    let px = lerp(-20, 30, t3);
    let py = lerp(-20, 0, t3);
    let nx = lerp(-20, 30, t3 - 0.12);
    let ny = lerp(-20, 0, t3 - 0.12);
    let bx = lerp(-20, 30, t3 + 0.12);
    let by = lerp(-20, 0, t3 + 0.12);
    vertex(nx, ny);
    vertex(px * 0.6, py * 0.6);
    vertex(bx, by);
  }

  endShape(CLOSE);

  // Restore unpredictable randomness for the rest of the sketch.
  randomSeed(Math.random() * 1000000);
  pop();
}

function createGrain() {
  grainLayer = createGraphics(width, height);
  grainLayer.loadPixels();
  for (let i = 0; i < grainLayer.pixels.length; i += 4) {
    let val = random(255);
    grainLayer.pixels[i] = val;
    grainLayer.pixels[i+1] = val;
    grainLayer.pixels[i+2] = val;
    grainLayer.pixels[i+3] = 15;
  }
  grainLayer.updatePixels();
}

function createStage3Layer() {
  stage3Layer = createGraphics(width, height);
  stage3Layer.background(10);
  stage3Layer.noStroke();

  // Circular cloud clusters.
  for (let i = 0; i < 34; i++) {
    let cx = random(width);
    let cy = random(height);
    let base = random(width * 0.08, width * 0.24);

    // Build each cloud from overlapping circular puffs.
    for (let j = 0; j < 6; j++) {
      let puffX = cx + random(-base * 0.45, base * 0.45);
      let puffY = cy + random(-base * 0.45, base * 0.45);
      let puffSize = base * random(0.65, 1.25);
      let shade = random(42, 96);
      stage3Layer.fill(shade, random(14, 28));
      stage3Layer.circle(puffX, puffY, puffSize);
    }
  }

  // Dark circular pockets for depth.
  for (let i = 0; i < 26; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(width * 0.05, width * 0.16);
    stage3Layer.fill(random(14, 36), random(14, 24));
    stage3Layer.circle(x, y, size);
  }

  // Dense scanlines.
  for (let y = 0; y < height; y += 3) {
    stage3Layer.fill(255, 9);
    stage3Layer.rect(0, y, width, 1);
  }

  // Extra speckle and static.
  let speckleCount = floor(width * height * 0.045);
  for (let i = 0; i < speckleCount; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(1, 3.5);
    let bright = random(95, 180);
    stage3Layer.fill(bright, random(18, 65));
    stage3Layer.rect(x, y, size, size);
  }

  // Larger bright flecks to mimic the spotted texture.
  for (let i = 0; i < 120; i++) {
    let x = random(width);
    let y = random(height);
    let size = random(2, 6);
    stage3Layer.fill(random(110, 190), random(16, 52));
    stage3Layer.ellipse(x, y, size, size * random(0.7, 1.2));
  }

  // Subtle vertical haze to avoid a flat tiled look.
  for (let i = 0; i < 18; i++) {
    let x = random(width);
    stage3Layer.fill(0, random(10, 20));
    stage3Layer.rect(x, height / 2, random(width * 0.03, width * 0.12), height);
  }

  // Vignette darkening at the edges.
  for (let i = 0; i < 10; i++) {
    let inset = i * 18;
    stage3Layer.fill(0, 10);
    stage3Layer.rect(inset, inset, width - inset * 2, height - inset * 2);
  }
}

// ==========================================
// SMOKE HELPERS
// ==========================================

function spawnSmoke(x, y, lifespanMultiplier) {
  let life = SMOKE_BASE_LIFESPAN * lifespanMultiplier;
  particles.push(new SmokeParticle(x, y, 'square', life, int(random(1, 4))));
  particles.push(new SmokeParticle(x, y, 'square', life, int(random(1, 4))));
  particles.push(new SmokeParticle(x, y, 'rect', life, int(random(1, 4))));
}

function getStageVCutCount() {
  if (virtualScroll >= STAGE_3_SCROLL) return 3;
  if (virtualScroll >= STAGE_2_SCROLL) return 2;
  if (virtualScroll >= STAGE_1_SCROLL) return 1;
  return 0;
}

function randomEdgePositionAwayFromMiddle() {
  if (random(1) < 0.5) return random(0.12, 0.42);
  return random(0.58, 0.88);
}

function createSmokeCuts(cutCount) {
  // Smoke pieces get random V-shaped missing chunks to echo the plane shape.
  let count = constrain(floor(cutCount), 1, 3);
  let edges = ['top', 'right', 'bottom', 'left'];
  let shuffledEdges = shuffle(edges.slice());

  let cuts = [];
  for (let i = 0; i < count; i++) {
    let edge = shuffledEdges[i];
    let style = 'v';

    cuts.push({
      edge,
      style,
      t: randomEdgePositionAwayFromMiddle(),
      spanRatio: random(0.2, 0.34),
      depthRatio: random(0.14, 0.28)
    });
  }

  return cuts;
}

function drawSmokeEdgeCuts(w, h, cuts, alphaPhase) {
  // destination-out turns the triangles below into an eraser for the smoke shape.
  const left = -w / 2;
  const right = w / 2;
  const top = -h / 2;
  const bottom = h / 2;
  const previousCompositeOperation = drawingContext.globalCompositeOperation;

  push();
  noStroke();
  fill(255, 255 * alphaPhase);
  drawingContext.globalCompositeOperation = 'destination-out';

  for (let i = 0; i < cuts.length; i++) {
    let cut = cuts[i];

    if (cut.edge === 'top' || cut.edge === 'bottom') {
      let span = constrain(w * cut.spanRatio, 6, w * 0.6);
      let cx = lerp(left, right, cut.t);
      cx = constrain(cx, left + span / 2 + 2, right - span / 2 - 2);
      let yEdge = cut.edge === 'top' ? top : bottom;
      let x1 = cx - span / 2;
      let x2 = cx + span / 2;
      let tipX = cx * 0.6;
      let tipY = yEdge * 0.6;
      triangle(x1, yEdge, tipX, tipY, x2, yEdge);
    } else {
      let span = constrain(h * cut.spanRatio, 6, h * 0.6);
      let cy = lerp(top, bottom, cut.t);
      cy = constrain(cy, top + span / 2 + 2, bottom - span / 2 - 2);
      let xEdge = cut.edge === 'left' ? left : right;
      let y1 = cy - span / 2;
      let y2 = cy + span / 2;
      let tipX = xEdge * 0.6;
      let tipY = cy * 0.6;
      triangle(xEdge, y1, tipX, tipY, xEdge, y2);
    }
  }

  drawingContext.globalCompositeOperation = previousCompositeOperation;
  pop();
}

// ==========================================
// ENTITY CLASSES
// ==========================================

class SmokeParticle {
  constructor(x, y, type, maxLife, cutCount = 1) {
    this.x = x + random(-20, 20);
    this.y = y + random(-20, 20);
    this.type = type; 
    this.maxLife = maxLife;
    this.life = maxLife;
    this.size = random(20, 50);
    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5); 
    this.angle = random(TWO_PI); 
    this.rotSpeed = random(-0.02, 0.02); 
    this.cuts = createSmokeCuts(cutCount);
  }

  update() {
    // Smoke drifts upward relative to the scrolling world.
    this.x += this.vx;
    this.y += this.vy - (scrollVelocity * 0.5);
    this.angle += this.rotSpeed;
    this.life--;
    this.size += 0.2;
  }

  display() {
    // Skip drawing far-off particles to save work.
    if (this.x < -140 || this.x > width + 140 || this.y < -140 || this.y > height + 140) {
      return;
    }

    push();
    noStroke();
    let alphaPhase = map(this.life, 0, this.maxLife, 0, 1);
    translate(this.x, this.y);
    rotate(this.angle);
    if (this.type === 'square') {
      fill(23, 34, 176, 150 * alphaPhase); 
      rect(0, 0, this.size, this.size);
      drawSmokeEdgeCuts(this.size, this.size, this.cuts, alphaPhase);
    } else {
      fill(29, 217, 219, 180 * alphaPhase); 
      let rw = this.size * 0.3;
      let rh = this.size * 1.5;
      rect(0, 0, rw, rh);
      drawSmokeEdgeCuts(rw, rh, this.cuts, alphaPhase);
    }
    pop();
  }

  isDead() { return this.life <= 0; }
}

// ==========================================
// ENEMY PLANES AND PROJECTILES
// ==========================================

function manageOtherPlanes(targetCount) {
  if (otherPlanes.length < targetCount && random(1) < 0.05) {
    let side = random(['left', 'right']);
    let startWorldY = virtualScroll + random(height);
    let angle, startX;
    if (side === 'left') {
      startX = -50; angle = random(-PI/4, PI/4);
    } else {
      startX = width + 50; angle = random(PI - PI/4, PI + PI/4);
    }
    
    let planeSpeed;
    if (virtualScroll > STAGE_3_SCROLL) {
      planeSpeed = random(12, 20);
    } else if (virtualScroll > STAGE_2_SCROLL) {
      planeSpeed = random(7, 12);
    } else {
      planeSpeed = random(2, 5);
    }
    
    otherPlanes.push(new EnemyPlane(startX, startWorldY, angle, planeSpeed));
  }
}

class EnemyPlane {
  constructor(x, worldY, angle, speed) {
    this.x = x; this.worldY = worldY; this.angle = angle; this.speed = speed || random(2, 5);
    this.seed = random(10000);
  }
  update() {
    this.x += cos(this.angle) * this.speed;
    this.worldY += sin(this.angle) * this.speed;
  }
  display() { 
    let screenY = this.worldY - virtualScroll;
    drawPlane(this.x, screenY, COLORS.mainPlane, this.angle, getStageVCutCount(), this.seed); 
  }
  isOffScreen() { 
    let screenY = this.worldY - virtualScroll;
    return (this.x < -100 || this.x > width + 100 || screenY < -100 || screenY > height + 100); 
  }
}

class Projectile {
  constructor(startWorldX, startWorldY, targetScreenX, targetScreenY) {
    this.x = startWorldX;
    this.y = startWorldY - virtualScroll;
    let dx = targetScreenX - this.x;
    let dy = targetScreenY - this.y;
    let angle = atan2(dy, dx);
    let speed = 15;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  
  display() {
    push();
    fill(COLORS.box);
    noStroke();
    rect(this.x, this.y, 25, 25);
    pop();
  }
  
  isDead() {
    return this.y > mainPlanePos.y + 20 || this.x < -50 || this.x > width + 50 || this.y < -50;
  }
}
