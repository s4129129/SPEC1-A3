
// ============================================================================
// CONFIGURATION & CONSTANTS
// Defines the visual theme, story progression states, and hard limits for performance.
// ============================================================================

const PALETTE = {
  pink: "#FE1595",
  teal: "#1DD9DB",
  yellow: "#FED602",
  blue: "#1722B0",
  black: "#000000",
  white: "#FFFFFF",
};

// Story phases act as a State Machine. The application behaves and looks different
// depending on which phase is currently active.
const STORY_PHASES = {
  introOne: "intro-one",
  introTwo: "intro-two",
  zoomIn: "zoom-in",
  zoomHold: "zoom-hold",
  divideLoop: "divide-loop",
  zoomOut: "zoom-out",
  circlesIntro: "circles-intro",
  released: "released",
};

const TOTAL_DIVIDES = 5;
const MICRO_TRIANGLE_MAX = 900;
const POP_TRIANGLE_MAX = 260;
const MAX_ACTIVE_CIRCLES = 34;
const CIRCLE_DEATH_HOLD_SECONDS = 60;
const CIRCLE_DEATH_FADE_SECONDS = 16;

const SOUND_MANIFEST = {
  punch: { src: "audio/COMM2754-2026-S1-Punch.wav", volume: 0.75 },
  plastic1: { src: "audio/COMM2754-2026-S1-Plastic-1.wav", volume: 0.5 },
  plastic2: { src: "audio/COMM2754-2026-S1-Plastic-2.wav", volume: 0.5 },
  plastic3: { src: "audio/COMM2754-2026-S1-Plastic-3.wav", volume: 0.5 },
  damage1: { src: "audio/COMM2754-2026-S1-Damage-1.wav", volume: 0.5 },
  damage2: { src: "audio/COMM2754-2026-S1-Damage-2.wav", volume: 0.5 },
  damage3: { src: "audio/COMM2754-2026-S1-Damage-3.wav", volume: 0.5 },
  die1: { src: "audio/Die-1.wav", volume: 0.2 },
  die2: { src: "audio/Die-2.wav", volume: 0.2 },
};

const SOUND_RANDOM_POOLS = {
  plastic: ["plastic1", "plastic2", "plastic3"],
  damage: ["damage1", "damage2", "damage3"],
  die: ["die1", "die2"],
};

// ============================================================================
// GLOBAL STATE VARIABLES
// ============================================================================

let referencePatternNoiseLayer = null; // Caches the static grainy background
let globalTime = 0;
let phase = STORY_PHASES.introOne;
let phaseTime = 0;

let cameraZoom = 1;
let targetCameraZoom = 1;

// The main central triangle before it gets split into shards
let mainTriangle = {
  x: 0, y: 0, size: 18, targetSize: 18, rotation: 0,
  color: PALETTE.pink, seed: 0, visible: true,
};

let centerShards = []; // Holds the pieces of the main triangle after splitting
let divideCount = 0;
let divideEchoes = [];

let microTriangles = []; // The floating background particles
let popTriangles = [];   // The burst particles when things hit
let ambientSpawnAccumulator = 0;

let circles = [];        // The vulnerable circle entities
let circleSpawnCooldown = 0;
let circlesReleased = false;
let totalCircleDeaths = 0;
let finalLineVisible = false;

let soundPlayers = new Map();
let soundsInitialized = false;
let soundsUnlocked = false;
let soundEnabled = true;
let soundToggleButton = null;


// ============================================================================
// CORE P5.JS FUNCTIONS
// Setup runs once, Draw runs every frame (usually 60 times a second).
// ============================================================================

function preload() {}

function setup() {
  ensureStaticStage();
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("art-stage");
  canvas.mousePressed(handleCanvasPress);
  canvas.attribute("role", "img");
  canvas.attribute("aria-label", "Grainy narrative artwork about microplastics, fragmentation, and ecosystem pressure.");

  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  noStroke();
  textFont("Helvetica");
  rectMode(CENTER);

  initReferencePatternBackdrop();
  initializeSoundSystem();
  ensureSoundToggleButton();
  resetNarrative();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initReferencePatternBackdrop();
}

function ensureStaticStage() {
  const scrollSpace = document.getElementById("scroll-space");
  if (scrollSpace) scrollSpace.style.height = "100vh";
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function resetNarrative() {
  // Resets all state variables to restart the interactive story
  globalTime = 0;
  phase = STORY_PHASES.introOne;
  phaseTime = 0;
  cameraZoom = 1;
  targetCameraZoom = 1;

  const baseSize = Math.min(width, height);
  mainTriangle.x = 0; mainTriangle.y = 0;
  mainTriangle.size = baseSize * 0.032; mainTriangle.targetSize = mainTriangle.size;
  mainTriangle.rotation = 0; mainTriangle.color = pickShapeColor();
  mainTriangle.seed = random(10000); mainTriangle.visible = true;

  centerShards = []; divideCount = 0; divideEchoes = [];
  microTriangles = []; popTriangles = []; ambientSpawnAccumulator = 0;
  circles = []; circleSpawnCooldown = 0.6; circlesReleased = false;
  totalCircleDeaths = 0; finalLineVisible = false;

  for (let i = 0; i < 210; i += 1) spawnAmbientMicroTriangle(true);
}

/**
 * Fundamental Function: draw()
 * Role: The master game loop. It calculates time passed (deltaTime), 
 * updates the logic/physics of all entities, and then renders them to the screen.
 * It uses push(), translate(), and scale() to create a zooming "camera" effect.
 */
function draw() {
  const dt = constrain(deltaTime / 1000, 1 / 240, 1 / 24);
  globalTime += dt;
  phaseTime += dt;

  // 1. UPDATE STATE & PHYSICS
  updateStoryPhase(dt);
  updateAmbientMicroTriangles(dt);
  updatePopTriangles(dt);
  updateCenterShards(dt);
  updateCircles(dt);
  updateDivideEchoes(dt);

  // 2. RENDER BACKGROUND
  background(PALETTE.black);
  drawReferencePatternBackdrop();

  // 3. RENDER CAMERA-AFFECTED ENTITIES
  push();
  translate(width * 0.5, height * 0.5);
  scale(cameraZoom);

  drawAmbientMicroTriangles();
  drawPopTriangles();
  drawCenterTriangles();
  drawCircles();

  pop();

  // 4. RENDER UI / TEXT (Unaffected by camera zoom)
  drawStoryText();
}

/**
 * Fundamental Function: handleCanvasPress()
 * Role: Acts as the primary user input handler. It pushes the narrative State Machine
 * forward to the next phase depending on what phase we are currently in.
 */
function handleCanvasPress() {
  unlockSoundPlayback();

  if (phase === STORY_PHASES.introOne) { setPhase(STORY_PHASES.introTwo); return false; }
  if (phase === STORY_PHASES.introTwo) { setPhase(STORY_PHASES.zoomIn); return false; }
  
  if (phase === STORY_PHASES.divideLoop) {
    if (divideCount < TOTAL_DIVIDES) divideCenterTriangles();
    else setPhase(STORY_PHASES.zoomOut);
    return false;
  }

  if (phase === STORY_PHASES.circlesIntro) {
    releaseCenterShards();
    setPhase(STORY_PHASES.released);
    return false;
  }

  if (phase === STORY_PHASES.released) {
    spawnUserMicroBurst(mouseX, mouseY);
    playRandomSound("plastic", { restart: true, volumeJitter: 0.1 });
    return false;
  }
  return false;
}

function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - width * 0.5) / Math.max(cameraZoom, 0.001),
    y: (screenY - height * 0.5) / Math.max(cameraZoom, 0.001),
  };
}

// ============================================================================
// PHASE & NARRATIVE MANAGEMENT
// ============================================================================

/**
 * Fundamental Function: updateStoryPhase()
 * Role: Smoothly animates properties based on the current story chapter.
 * It uses "lerp" (linear interpolation) to smoothly glide the camera zoom 
 * and main triangle size towards their targets.
 */
function updateStoryPhase() {
  const baseSize = Math.min(width, height);

  if (phase === STORY_PHASES.introOne || phase === STORY_PHASES.introTwo) {
    targetCameraZoom = 1; mainTriangle.targetSize = baseSize * 0.032;
  }
  if (phase === STORY_PHASES.zoomIn) {
    targetCameraZoom = 1.42; mainTriangle.targetSize = baseSize * 0.118;
    if (Math.abs(cameraZoom - targetCameraZoom) < 0.024 && phaseTime > 0.9) setPhase(STORY_PHASES.zoomHold);
  }
  if (phase === STORY_PHASES.zoomHold) {
    targetCameraZoom = 1.46; mainTriangle.targetSize = baseSize * 0.12;
    if (phaseTime > 1.12 && divideCount === 0) {
      divideCenterTriangles(); setPhase(STORY_PHASES.divideLoop);
    }
  }
  if (phase === STORY_PHASES.divideLoop) {
    targetCameraZoom = 1.46; mainTriangle.targetSize = baseSize * 0.12;
  }
  if (phase === STORY_PHASES.zoomOut) {
    targetCameraZoom = 0.42; mainTriangle.targetSize = baseSize * 0.058;
    if (Math.abs(cameraZoom - targetCameraZoom) < 0.02 && phaseTime > 1.3) setPhase(STORY_PHASES.circlesIntro);
  }
  if (phase === STORY_PHASES.circlesIntro) {
    targetCameraZoom = 0.42; mainTriangle.targetSize = baseSize * 0.058;
  }
  if (phase === STORY_PHASES.released) {
    targetCameraZoom = 0.42; mainTriangle.targetSize = baseSize * 0.058;
    if (!finalLineVisible && totalCircleDeaths > 0 && phaseTime > 1.1) finalLineVisible = true;
  }

  // Glide towards targets
  cameraZoom = lerp(cameraZoom, targetCameraZoom, 0.08);
  mainTriangle.size = lerp(mainTriangle.size, mainTriangle.targetSize, 0.1);
}

function setPhase(nextPhase) {
  if (nextPhase === STORY_PHASES.zoomOut) primeTransitionField();
  if (nextPhase === STORY_PHASES.circlesIntro) divideEchoes = [];
  phase = nextPhase;
  phaseTime = 0;
}

function pickShapeColor() {
  const colors = [PALETTE.pink, PALETTE.teal, PALETTE.yellow, PALETTE.blue];
  return colors[Math.floor(random(colors.length))];
}

function primeTransitionField() {
  const preSpawnCircles = Math.min(MAX_ACTIVE_CIRCLES - circles.length, Math.floor(random(10, 17)));
  for (let i = 0; i < preSpawnCircles; i += 1) spawnCircle();

  const preSpawnMicro = Math.floor(random(120, 190));
  for (let i = 0; i < preSpawnMicro; i += 1) spawnAmbientMicroTriangle(true, true);
}


// ============================================================================
// MICROPLASTICS (BACKGROUND TRIANGLES)
// ============================================================================

function spawnUserMicroBurst(screenX, screenY) {
  const world = screenToWorld(screenX, screenY);
  const count = Math.floor(random(4, 9));

  for (let i = 0; i < count; i += 1) {
    const angle = random(TWO_PI);
    const speed = random(1.6, 4.2);
    microTriangles.push({
      x: world.x + random(-18, 18), y: world.y + random(-18, 18),
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: random(4.2, 14.4), rotation: random(TWO_PI), spin: random(-0.16, 0.16),
      color: pickShapeColor(), seed: random(10000),
      persistent: true, life: Infinity, maxLife: 1,
    });
  }
  trimList(microTriangles, MICRO_TRIANGLE_MAX);
  spawnPopTriangles(world.x, world.y, Math.floor(random(2, 6)), random(8, 18), pickShapeColor());
}

function spawnAmbientMicroTriangle(seedInView = false, persistent = true) {
  const viewW = width / Math.max(cameraZoom, 0.001);
  const viewH = height / Math.max(cameraZoom, 0.001);
  const spanX = viewW * 1.2;
  const spanY = viewH * 1.2;

  let x = 0; let y = 0; let moveAngle;
  const activePhase = (phase === STORY_PHASES.zoomOut || phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released);

  // In active phases, spawn randomly everywhere. Otherwise spawn from the edges moving in.
  if (seedInView || activePhase) {
    x = random(-spanX * 0.5, spanX * 0.5); y = random(-spanY * 0.5, spanY * 0.5);
    moveAngle = random(TWO_PI);
  } else {
    const side = Math.floor(random(4));
    if (side === 0) { x = random(-spanX, spanX); y = -spanY; }
    else if (side === 1) { x = spanX; y = random(-spanY, spanY); }
    else if (side === 2) { x = random(-spanX, spanX); y = spanY; }
    else { x = -spanX; y = random(-spanY, spanY); }
    moveAngle = Math.atan2(-y, -x) + random(-0.7, 0.7);
  }
  
  const speed = random(0.45, 2.15);
  microTriangles.push({
    x, y, vx: Math.cos(moveAngle) * speed, vy: Math.sin(moveAngle) * speed,
    size: random(3.4, 12.2), rotation: random(TWO_PI), spin: random(-0.08, 0.08),
    color: pickShapeColor(), seed: random(10000), persistent,
    life: persistent ? Infinity : random(8.5, 22.5), maxLife: persistent ? 1 : random(8.5, 22.5),
  });
  trimList(microTriangles, MICRO_TRIANGLE_MAX);
}

function updateAmbientMicroTriangles(dt) {
  let spawnRate = 18;
  if (phase === STORY_PHASES.zoomIn || phase === STORY_PHASES.zoomHold || phase === STORY_PHASES.divideLoop || phase === STORY_PHASES.zoomOut) {
    spawnRate = phase === STORY_PHASES.zoomOut ? 46 : 0;
  } else if (phase === STORY_PHASES.circlesIntro) spawnRate = 76;
  else if (phase === STORY_PHASES.released) spawnRate = 92;

  ambientSpawnAccumulator += dt * spawnRate;
  while (ambientSpawnAccumulator >= 1) {
    ambientSpawnAccumulator -= 1;
    const spawnInView = phase === STORY_PHASES.zoomOut || phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released;
    spawnAmbientMicroTriangle(spawnInView, true);
  }

  const pushAway = phase === STORY_PHASES.zoomIn || phase === STORY_PHASES.zoomHold || phase === STORY_PHASES.divideLoop;
  const activePhase = (phase === STORY_PHASES.zoomOut || phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released);

  const viewW = width / Math.max(cameraZoom, 0.001);
  const viewH = height / Math.max(cameraZoom, 0.001);
  const wrapX = viewW * 0.65;
  const wrapY = viewH * 0.65;

  for (let i = microTriangles.length - 1; i >= 0; i -= 1) {
    const tri = microTriangles[i];
    if (Number.isFinite(tri.life)) tri.life -= dt;

    if (pushAway) {
      // Repel from center
      const dist = Math.max(10, Math.sqrt(tri.x * tri.x + tri.y * tri.y));
      tri.vx += (tri.x / dist) * 0.16; tri.vy += (tri.y / dist) * 0.16;
    } else if (activePhase) {
      // Swarm behavior using noise to make them wiggle around chaotically
      tri.vx += (noise(tri.seed, globalTime * 0.8) - 0.5) * 0.25;
      tri.vy += (noise(tri.seed + 100, globalTime * 0.8) - 0.5) * 0.25;
      const spd = Math.sqrt(tri.vx * tri.vx + tri.vy * tri.vy);
      if (spd > 3.0) { tri.vx = (tri.vx / spd) * 3.0; tri.vy = (tri.vy / spd) * 3.0; }
    }

    tri.x += tri.vx * dt * 60; tri.y += tri.vy * dt * 60;
    tri.rotation += tri.spin * dt * 60;

    const friction = activePhase ? 0.999 : 0.996;
    tri.vx *= friction; tri.vy *= friction;

    // Wrap around screen edges seamlessly
    if (tri.x < -wrapX) tri.x = wrapX; else if (tri.x > wrapX) tri.x = -wrapX;
    if (tri.y < -wrapY) tri.y = wrapY; else if (tri.y > wrapY) tri.y = -wrapY;

    if ((Number.isFinite(tri.life) && tri.life <= 0) || (!tri.persistent && (Math.abs(tri.x) > viewW * 0.8 || Math.abs(tri.y) > viewH * 0.8))) {
      microTriangles.splice(i, 1);
    }
  }
}

function drawAmbientMicroTriangles() {
  for (let i = 0; i < microTriangles.length; i += 1) {
    const tri = microTriangles[i];
    const lifeMix = constrain(tri.life / tri.maxLife, 0, 1);
    drawTriangleWithWhiteDropShadow(tri.x, tri.y, tri.size, tri.rotation, tri.color, 65 + lifeMix * 170, tri.seed);
  }
}

// Particle bursts
function spawnPopTriangles(originX, originY, count, baseSize, preferredColor = null) {
  const limitedCount = Math.min(5, Math.max(1, count));
  for (let i = 0; i < limitedCount; i += 1) {
    const angle = random(TWO_PI); const speed = random(1.5, 4.2);
    popTriangles.push({
      x: originX + Math.cos(angle) * random(2, baseSize * 0.3), y: originY + Math.sin(angle) * random(2, baseSize * 0.3),
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: random(baseSize * 0.22, baseSize * 0.65), rotation: random(TWO_PI), spin: random(-0.2, 0.2),
      color: preferredColor || pickShapeColor(), seed: random(10000), life: random(0.34, 0.9), maxLife: random(0.34, 0.9),
    });
  }
  trimList(popTriangles, POP_TRIANGLE_MAX);
}

function updatePopTriangles(dt) {
  for (let i = popTriangles.length - 1; i >= 0; i -= 1) {
    const tri = popTriangles[i];
    tri.life -= dt;
    tri.x += tri.vx * dt * 60; tri.y += tri.vy * dt * 60;
    tri.vy += 0.02 * dt * 60; // Gravity
    tri.rotation += tri.spin * dt * 60;
    if (tri.life <= 0) popTriangles.splice(i, 1);
  }
}

function drawPopTriangles() {
  for (let i = 0; i < popTriangles.length; i += 1) {
    const tri = popTriangles[i];
    drawTriangleWithWhiteDropShadow(tri.x, tri.y, tri.size, tri.rotation, tri.color, 240 * constrain(tri.life / tri.maxLife, 0, 1), tri.seed);
  }
}


// ============================================================================
// MAIN SPLITTING MECHANIC (CENTER TRIANGLES)
// ============================================================================

/**
 * Fundamental Function: divideCenterTriangles()
 * Role: This is the core mechanic of the visual story. It takes existing shards
 * (or the main starting triangle), deletes them, and replaces each with TWO new, 
 * smaller shards. It uses trigonometry to push the two new children apart along a random axis.
 */
function divideCenterTriangles() {
  const sources = centerShards.length > 0 ? centerShards : [{
    x: mainTriangle.x, y: mainTriangle.y, anchorX: mainTriangle.x, anchorY: mainTriangle.y,
    vx: 0, vy: 0, size: mainTriangle.size, rotation: mainTriangle.rotation,
    color: mainTriangle.color, seed: mainTriangle.seed, released: circlesReleased,
  }];

  mainTriangle.visible = false;
  const nextShards = [];

  for (let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    const axis = source.rotation + seededRange(source.seed + 2.1, -0.12, 0.12);
    const spread = source.size * seededRange(source.seed + 4.1, 1.2, 2.5); 
    const childSize = Math.max(6, source.size * seededRange(source.seed + 8.7, 0.78, 0.88));
    const twist = seededRange(source.seed + 11.9, 0.04, 0.13);

    // Create a left (-1) and right (1) piece for every source piece
    for (let hand = -1; hand <= 1; hand += 2) {
      const targetX = source.x + Math.cos(axis) * spread * hand;
      const targetY = source.y + Math.sin(axis) * spread * hand;

      nextShards.push({
        x: source.x, y: source.y, startX: source.x, startY: source.y,
        anchorX: targetX, anchorY: targetY, splitMix: 0,
        splitSpeed: seededRange(source.seed + hand * 14.2 + divideCount * 4.1, 2.4, 3.8),
        vx: source.vx * 0.5 + Math.cos(axis) * hand * seededRange(source.seed + 10, 1.5, 3.5),
        vy: source.vy * 0.5 + Math.sin(axis) * hand * seededRange(source.seed + 20, 1.5, 3.5),
        size: childSize, rotation: source.rotation + twist * hand,
        color: source.color, seed: source.seed + hand * 37.2 + divideCount * 53.1 + random(-5, 5),
        side: hand, released: circlesReleased,
      });
    }
  }

  centerShards = nextShards.slice(0, 96); // Prevent exponential crash limits
  divideCount += 1;

  spawnPopTriangles(0, 0, Math.floor(random(3, 6)), Math.max(mainTriangle.size * 0.2, 9), pickShapeColor());
  addDivideEcho();
  playSound("punch", { restart: true, volume: constrain(0.9 + random(-0.08, 0.05), 0, 1) });
}

function addDivideEcho() {
  divideEchoes.push({
    x: random(width * 0.14, width * 0.86), y: random(height * 0.2, height * 0.78),
    angle: random(-0.2, 0.2), size: random(14, 23), drift: random(-7, 7),
  });
  trimList(divideEchoes, 48);
}

function updateDivideEchoes(dt) {
  if (phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released) { divideEchoes = []; return; }
  for (let i = 0; i < divideEchoes.length; i += 1) divideEchoes[i].angle += divideEchoes[i].drift * 0.0002 * dt * 60;
}

function releaseCenterShards() {
  circlesReleased = true;
  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];
    shard.released = true; shard.splitMix = 1;
    const angle = random(TWO_PI); const speed = random(0.9, 2.8);
    shard.vx = Math.cos(angle) * speed; shard.vy = Math.sin(angle) * speed;
  }
}

function updateCenterShards(dt) {
  const dtScale = dt * 60;
  const viewHalfW = width * 0.5 / Math.max(cameraZoom, 0.001);
  const viewHalfH = height * 0.5 / Math.max(cameraZoom, 0.001);

  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];

    // If not released, smoothly animate them into their separated split positions
    if (!shard.released) {
      shard.splitMix = Math.min(1, (shard.splitMix ?? 1) + dt * (shard.splitSpeed || 3));
      const ease = easeOutCubic(shard.splitMix);
      shard.x = lerp(shard.startX ?? shard.anchorX, shard.anchorX, ease);
      shard.y = lerp(shard.startY ?? shard.anchorY, shard.anchorY, ease);
      shard.vx *= 0.88; shard.vy *= 0.88;
      continue;
    }

    // Once released, wander randomly using noise
    shard.vx += (noise(shard.seed * 0.011, globalTime * 0.58) - 0.5) * 0.17;
    shard.vy += (noise(shard.seed * 0.017 + 81.3, globalTime * 0.62) - 0.5) * 0.17;
    const speed = Math.sqrt(shard.vx * shard.vx + shard.vy * shard.vy);
    if (speed > 3.4) { shard.vx *= 3.4 / speed; shard.vy *= 3.4 / speed; }

    shard.x += shard.vx * dtScale; shard.y += shard.vy * dtScale;

    // Bounce off screen boundaries
    const boundX = Math.max(20, viewHalfW - shard.size * 0.7);
    const boundY = Math.max(20, viewHalfH - shard.size * 0.7);
    if (shard.x < -boundX || shard.x > boundX) { shard.vx *= -0.92; shard.x = constrain(shard.x, -boundX, boundX); }
    if (shard.y < -boundY || shard.y > boundY) { shard.vy *= -0.92; shard.y = constrain(shard.y, -boundY, boundY); }
  }
}

function drawCenterTriangles() {
  if (mainTriangle.visible) {
    drawTriangleWithWhiteDropShadow(mainTriangle.x, mainTriangle.y, mainTriangle.size, mainTriangle.rotation, mainTriangle.color, 255, mainTriangle.seed);
  }
  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];
    drawTriangleHalfWithWhiteDropShadow(shard.x, shard.y, shard.size, shard.rotation, shard.color, 244, shard.seed, shard.side || (i % 2 === 0 ? -1 : 1));
  }
}


// ============================================================================
// CIRCLES (ENEMIES/TARGETS)
// ============================================================================

function spawnCircle() {
  const radius = random(34, 96);
  const viewHalfW = width * 0.5 / Math.max(cameraZoom, 0.001);
  const viewHalfH = height * 0.5 / Math.max(cameraZoom, 0.001);
  
  const spawnMargin = radius + 60;
  let x, y;
  const side = Math.floor(random(4));
  if (side === 0) { x = random(-viewHalfW, viewHalfW); y = -viewHalfH - spawnMargin; }
  else if (side === 1) { x = viewHalfW + spawnMargin; y = random(-viewHalfH, viewHalfH); }
  else if (side === 2) { x = random(-viewHalfW, viewHalfW); y = viewHalfH + spawnMargin; }
  else { x = -viewHalfW - spawnMargin; y = random(-viewHalfH, viewHalfH); }

  const targetX = random(-viewHalfW * 0.6, viewHalfW * 0.6);
  const targetY = random(-viewHalfH * 0.6, viewHalfH * 0.6);
  const angle = Math.atan2(targetY - y, targetX - x);
  const speed = random(1.5, 3.2);

  const tones = [PALETTE.pink, PALETTE.blue, PALETTE.teal, PALETTE.yellow];

  circles.push({
    x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius,
    color: tones[Math.floor(random(tones.length))],
    seed: random(10000), crackSeed: random(10000), panicSeed: random(10000),
    damage: 0, panic: 0, hitCooldown: 0, enteredScreen: false, invincibleTimer: 3.5,
    dead: false, deadAt: -100,
  });

  trimList(circles, MAX_ACTIVE_CIRCLES);
}

/**
 * Fundamental Function: updateCircles()
 * Role: Manages the movement logic for circles. It calculates noise-based "drift",
 * detects if they've fully entered the screen to trap them inside bounds, and drastically
 * increases speed/chaos ("panic") the higher their damage level goes.
 */
function updateCircles(dt) {
  const activePhase = phase === STORY_PHASES.zoomOut || phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released;
  if (!activePhase && circles.length === 0) return;

  if (activePhase) {
    circleSpawnCooldown -= dt;
    if (circleSpawnCooldown <= 0 && circles.length < MAX_ACTIVE_CIRCLES) {
      spawnCircle();
      if (phase === STORY_PHASES.zoomOut) circleSpawnCooldown = random(0.12, 0.34);
      else if (phase === STORY_PHASES.circlesIntro) circleSpawnCooldown = random(0.24, 0.64);
      else circleSpawnCooldown = random(0.28, 0.82);
    }
  }

  const dtScale = dt * 60;
  const viewHalfW = width * 0.5 / Math.max(cameraZoom, 0.001);
  const viewHalfH = height * 0.5 / Math.max(cameraZoom, 0.001);

  for (let i = circles.length - 1; i >= 0; i -= 1) {
    const circleData = circles[i];

    if (circleData.dead) {
      if (globalTime - circleData.deadAt > CIRCLE_DEATH_HOLD_SECONDS + CIRCLE_DEATH_FADE_SECONDS) circles.splice(i, 1);
      continue;
    }

    if (circleData.invincibleTimer > 0) circleData.invincibleTimer -= dt;
    circleData.hitCooldown = Math.max(0, circleData.hitCooldown - dt);

    if (!circleData.enteredScreen) {
      if (Math.abs(circleData.x) < viewHalfW - circleData.radius && Math.abs(circleData.y) < viewHalfH - circleData.radius) {
        circleData.enteredScreen = true;
      }
    }

    // Panic increases exponentially based on damage
    const panic = smoothStep(0.5, 0.99, circleData.damage);
    circleData.panic = panic;

    const driftAmp = 0.04 + panic * 1.5;
    circleData.vx += (noise(circleData.seed + 3.1, globalTime * (0.37 + panic * 4.4)) - 0.5) * driftAmp;
    circleData.vy += (noise(circleData.seed + 7.4, globalTime * (0.41 + panic * 4.8)) - 0.5) * driftAmp;

    // Erratic darting movement when highly damaged
    if (panic > 0.05) {
      circleData.vx += (noise(circleData.panicSeed + 21.4, globalTime * (5.6 + panic * 8.2)) - 0.5) * (1.0 + panic * 6.0);
      circleData.vy += (noise(circleData.panicSeed + 51.2, globalTime * (6.1 + panic * 8.9)) - 0.5) * (1.0 + panic * 6.0);

      if (random() < dt * (2.0 + panic * 10.0)) {
        const panicAngle = random(TWO_PI); const impulse = panic * random(3.0, 10.0);
        circleData.vx += Math.cos(panicAngle) * impulse; circleData.vy += Math.sin(panicAngle) * impulse;
      }
    }

    const speed = Math.sqrt(circleData.vx * circleData.vx + circleData.vy * circleData.vy);
    const maxSpeed = lerp(1.9, 14.0, panic);
    if (speed > maxSpeed) { circleData.vx *= maxSpeed / speed; circleData.vy *= maxSpeed / speed; }

    circleData.x += circleData.vx * dtScale; circleData.y += circleData.vy * dtScale;

    // Hard screen boundaries only trap them once they enter
    if (circleData.enteredScreen) {
      const boundX = Math.max(22, viewHalfW - circleData.radius - 2);
      const boundY = Math.max(22, viewHalfH - circleData.radius - 2);
      if (circleData.x < -boundX || circleData.x > boundX) { circleData.vx *= -0.95; circleData.x = constrain(circleData.x, -boundX, boundX); }
      if (circleData.y < -boundY || circleData.y > boundY) { circleData.vy *= -0.95; circleData.y = constrain(circleData.y, -boundY, boundY); }
    }

    applyCircleDamageFromTriangles(circleData);
    if (circleData.damage >= 1) markCircleDead(circleData);
  }
}

/**
 * Fundamental Function: applyCircleDamageFromTriangles()
 * Role: Collision Detection engine. It compares the distances between circles
 * and triangle shards. If Distance Squared < Radius Squared, it registers a hit,
 * increases damage, sets a cooldown so it isn't insta-killed, and plays effects.
 */
function applyCircleDamageFromTriangles(circleData) {
  if (circleData.dead || circleData.hitCooldown > 0 || !circleData.enteredScreen || circleData.invincibleTimer > 0) return;

  let collisionChance = 0; let burstSize = 0; let collisionRegistered = false;

  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];
    const reach = circleData.radius + shard.size * 0.44;
    const dx = circleData.x - shard.x; const dy = circleData.y - shard.y;
    // Math: a^2 + b^2 <= c^2 avoids slow Math.sqrt() calculations
    if (dx * dx + dy * dy <= reach * reach) {
      collisionChance = 0.44; burstSize = Math.max(burstSize, shard.size);
      if (random() < collisionChance) collisionRegistered = true;
      break;
    }
  }

  if (!collisionRegistered) {
    const offset = Math.floor(random(3));
    for (let i = offset; i < microTriangles.length; i += 3) {
      const tri = microTriangles[i];
      const reach = circleData.radius + tri.size * 0.5;
      const dx = circleData.x - tri.x; const dy = circleData.y - tri.y;
      if (dx * dx + dy * dy <= reach * reach) {
        collisionChance = 0.24; burstSize = Math.max(burstSize, tri.size);
        if (random() < collisionChance) collisionRegistered = true;
        break;
      }
    }
  }

  if (collisionRegistered) {
    circleData.damage = Math.min(1, circleData.damage + random(0.2, 0.25));
    if (circleData.damage >= 0.5 && circleData.damage < 1.0) circleData.hitCooldown = random(2.5, 4.0); 
    else circleData.hitCooldown = random(0.1, 0.25);

    spawnPopTriangles(circleData.x, circleData.y, Math.floor(random(2, 5)), burstSize, circleData.color);
    playRandomSound("damage", { volumeJitter: 0.08 });
  }
}

function markCircleDead(circleData) {
  if (circleData.dead) return;
  circleData.dead = true; circleData.deadAt = globalTime; totalCircleDeaths += 1;
  playRandomSound("die", { volumeJitter: 0.08 });
  spawnPopTriangles(circleData.x, circleData.y, 5, circleData.radius * 0.5, circleData.color);
}

function drawCircles() {
  for (let i = 0; i < circles.length; i += 1) {
    const circleData = circles[i];
    const deadAge = circleData.dead ? globalTime - circleData.deadAt : 0;
    let fade = 1;
    if (circleData.dead && deadAge > CIRCLE_DEATH_HOLD_SECONDS) {
      const fadeAge = deadAge - CIRCLE_DEATH_HOLD_SECONDS;
      fade = 1 - constrain(fadeAge / CIRCLE_DEATH_FADE_SECONDS, 0, 1);
    }
    const alpha = circleData.dead ? (72 + 120 * fade) * fade : 228;
    const colorValue = circleData.dead ? "#0C0D10" : circleData.color;

    drawCircleWithWhiteDropShadow(circleData.x, circleData.y, circleData.radius, colorValue, alpha, circleData.seed);
  }
}

// ============================================================================
// GEOMETRY & RENDER HELPERS
// Creates the unique "V-Cut" visual style using shadow offsetting.
// ============================================================================

/**
 * Fundamental Concept: Visual Shadow Matching
 * To ensure the drop shadow perfectly matches the cut shape of the object above it,
 * we pass the EXACT SAME math inputs (size, radius, seed) to the render function twice.
 * Drawing white underneath slightly offset, then drawing color directly on top.
 */
function drawTriangleWithWhiteDropShadow(x, y, size, rotation, fillColor, alpha, seed) {
  const shift = constrain(size * 0.25, 6, 25);
  fillHex(PALETTE.white, Math.min(255, alpha * 0.95));
  drawVCutTriangleShape(x + shift * 0.72, y + shift * 0.56, size, rotation, seed);
  fillHex(fillColor, alpha);
  drawVCutTriangleShape(x, y, size, rotation, seed);
}

function drawTriangleHalfWithWhiteDropShadow(x, y, size, rotation, fillColor, alpha, seed, side) {
  const shift = constrain(size * 0.25, 6, 25);
  fillHex(PALETTE.white, Math.min(255, alpha * 0.95));
  drawSplitTriangleHalfShape(x + shift * 0.74, y + shift * 0.56, size, rotation, seed, side);
  fillHex(fillColor, alpha);
  drawSplitTriangleHalfShape(x, y, size, rotation, seed, side);
}

function drawSplitTriangleHalfShape(x, y, size, rotation, seed, side) {
  const points = buildSplitTriangleHalfPoints(size, seed, side);
  push(); translate(x, y); rotate(rotation);
  beginShape(); for (let i = 0; i < points.length; i += 1) vertex(points[i].x, points[i].y); endShape(CLOSE);
  pop();
}

function buildSplitTriangleHalfPoints(size, seed, side) {
  const hand = side < 0 ? -1 : 1;
  const outerTop = { x: hand * size * 0.56, y: -size * 0.5 };
  const outerTip = { x: 0, y: size * 0.58 };
  const seamTop = { x: hand * size * 0.02, y: -size * 0.5 };
  const seamUpper = { x: hand * size * 0.09, y: -size * 0.18 };
  const seamMid = { x: hand * size * 0.06, y: size * 0.06 };
  const seamBottom = { x: hand * size * 0.02, y: size * 0.44 };
  const centroid = { x: hand * size * 0.2, y: -size * 0.02 };

  const cutT = seededRange(seed + 1.8, 0.28, 0.76);
  const cutSpread = seededRange(seed + 3.4, 0.07, 0.16);
  const cutDepth = size * seededRange(seed + 5.2, 0.08, 0.17);
  const outerCut = buildEdgeVCut(outerTop, outerTip, cutT, cutSpread, cutDepth, centroid);

  const points = [seamTop, outerTop, outerCut.pre, outerCut.notch, outerCut.post, outerTip, seamBottom, seamMid, seamUpper];

  for (let i = 0; i < points.length; i += 1) {
    if (i === 1 || i === 5) continue;
    points[i].x += seededRange(seed + i * 12.4, -1, 1) * size * 0.01;
    points[i].y += seededRange(seed + i * 19.7, -1, 1) * size * 0.01;
  }
  return points;
}

function drawCircleWithWhiteDropShadow(x, y, radius, fillColor, alpha, seed) {
  const shift = constrain(radius * 0.22, 6, 25);
  fillHex(PALETTE.white, Math.min(255, 188 + alpha * 0.28));
  drawVCutCircleShape(x + shift * 0.9, y + shift * 0.66, radius, seed);
  fillHex(fillColor, alpha);
  drawVCutCircleShape(x, y, radius, seed);
}

function drawVCutCircleShape(x, y, radius, seed) {
  if (radius <= 0.5) return;
  const points = buildVCutCirclePoints(radius, seed);
  push(); translate(x, y);
  beginShape(); for (let i = 0; i < points.length; i += 1) vertex(points[i].x, points[i].y); endShape(CLOSE);
  pop();
}

/**
 * Fundamental Function: buildVCutCirclePoints()
 * Role: Mathematically builds a 2D shape array that looks like a circle with sharp "bites" missing.
 * It sweeps 360 degrees using polar coordinates (angle & distance). Wherever an angle matches 
 * a predefined "cut", it drastically pulls the radius inward, creating a sharp V.
 */
function buildVCutCirclePoints(radius, seed) {
  const pointCount = 120; // High resolution loop for perfectly sharp points
  const numCuts = Math.floor(seededRange(seed, 1, 3)); // Max of two cuts (1 or 2)
  const cuts = [];
  
  let baseAngle = seededRange(seed + 1, 0, TWO_PI);
  cuts.push({ center: baseAngle, width: seededRange(seed + 2, 0.6, 1.2), depth: radius * seededRange(seed + 3, 0.3, 0.6) });

  if (numCuts > 1) {
     let offset = seededRange(seed + 4, PI * 0.6, PI * 1.4); 
     cuts.push({ center: baseAngle + offset, width: seededRange(seed + 6, 0.6, 1.2), depth: radius * seededRange(seed + 7, 0.3, 0.6) });
  }

  const points = [];
  for (let i = 0; i < pointCount; i += 1) {
    const angle = map(i, 0, pointCount, 0, TWO_PI);
    let localRadius = radius;
    let insideCut = false;
    
    // Check if current sweep angle overlaps with a defined V-cut region
    for (let c = 0; c < cuts.length; c++) {
       const dist = angularDistanceRad(angle, cuts[c].center);
       const halfW = cuts[c].width / 2;
       if (dist < halfW) {
          const mix = 1 - (dist / halfW); // Linear interpolation for absolute sharp straight lines
          localRadius -= cuts[c].depth * mix;
          insideCut = true;
       }
    }
    
    // Wobble outer edges gently, but disable wobble inside cuts to keep edges mathematically straight.
    if (!insideCut) localRadius += seededRange(seed + i * 19.4, -1, 1) * radius * 0.015;
    
    localRadius = Math.max(radius * 0.15, localRadius); 
    points.push({ x: Math.cos(angle) * localRadius, y: Math.sin(angle) * localRadius });
  }

  return points;
}

function angularDistanceRad(a, b) {
  let diff = a - b;
  while (diff > PI) diff -= TWO_PI;
  while (diff < -PI) diff += TWO_PI;
  return Math.abs(diff);
}

function drawVCutTriangleShape(x, y, size, rotation, seed) {
  const points = buildVCutTrianglePoints(size, seed);
  push(); translate(x, y); rotate(rotation);
  beginShape(); for (let i = 0; i < points.length; i += 1) vertex(points[i].x, points[i].y); endShape(CLOSE);
  pop();
}

function buildVCutTrianglePoints(size, seed) {
  const right = { x: size * 0.56, y: -size * 0.5 };
  const tip = { x: 0, y: size * 0.58 };
  const left = { x: -size * 0.56, y: -size * 0.5 };
  const centroid = { x: (right.x + tip.x + left.x) / 3, y: (right.y + tip.y + left.y) / 3 };

  const rightCutT = seededRange(seed + 1.1, 0.28, 0.74);
  const rightCutDepth = size * seededRange(seed + 2.9, 0.06, 0.16);
  const rightSpread = seededRange(seed + 4.2, 0.06, 0.14);

  const leftCutT = seededRange(seed + 6.5, 0.28, 0.74);
  const leftCutDepth = size * seededRange(seed + 8.3, 0.06, 0.16);
  const leftSpread = seededRange(seed + 9.7, 0.06, 0.14);

  const rightCut = buildEdgeVCut(right, tip, rightCutT, rightSpread, rightCutDepth, centroid);
  const leftCut = buildEdgeVCut(tip, left, leftCutT, leftSpread, leftCutDepth, centroid);

  const points = [
    { x: right.x, y: right.y }, rightCut.pre, rightCut.notch, rightCut.post,
    { x: tip.x, y: tip.y }, leftCut.pre, leftCut.notch, leftCut.post, { x: left.x, y: left.y },
  ];

  for (let i = 0; i < points.length; i += 1) {
    if (i === 0 || i === 4 || i === 8) continue;
    points[i].x += seededRange(seed + i * 13.7, -1, 1) * size * 0.015;
    points[i].y += seededRange(seed + i * 21.4, -1, 1) * size * 0.015;
  }
  return points;
}

function buildEdgeVCut(a, b, t, spread, depth, centroid) {
  const preT = constrain(t - spread, 0.08, 0.9);
  const postT = constrain(t + spread, 0.1, 0.92);
  const pre = lerpPoint(a, b, Math.min(preT, postT - 0.03));
  const mid = lerpPoint(a, b, t);
  const post = lerpPoint(a, b, Math.max(postT, preT + 0.03));

  const normal = inwardUnitNormal(a, b, centroid);
  return { pre, notch: { x: mid.x + normal.x * depth, y: mid.y + normal.y * depth }, post };
}

function lerpPoint(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }

function inwardUnitNormal(a, b, centroid) {
  const edgeX = b.x - a.x; const edgeY = b.y - a.y;
  const len = Math.max(0.0001, Math.sqrt(edgeX * edgeX + edgeY * edgeY));
  let nx = -edgeY / len; let ny = edgeX / len;
  if (nx * (centroid.x - (a.x + b.x) * 0.5) + ny * (centroid.y - (a.y + b.y) * 0.5) < 0) { nx *= -1; ny *= -1; }
  return { x: nx, y: ny };
}

function seeded01(seed) { const raw = Math.sin(seed * 127.1 + 311.7) * 43758.5453123; return raw - Math.floor(raw); }
function smoothStep(edge0, edge1, x) { const t = constrain((x - edge0) / (edge1 - edge0), 0, 1); return t * t * (3.0 - 2.0 * t); }
function seededRange(seed, minValue, maxValue) { return minValue + (maxValue - minValue) * seeded01(seed); }
function easeOutCubic(t) { const clamped = constrain(t, 0, 1); const inv = 1 - clamped; return 1 - inv * inv * inv; }

// ============================================================================
// UI & AUDIO
// ============================================================================

function drawStoryText() {
  let mainLine = ""; let hintLine = "";

  if (phase === STORY_PHASES.introOne) { mainLine = "how did we get here?"; hintLine = "click to continue"; }
  else if (phase === STORY_PHASES.introTwo) { mainLine = "microplastics are everywhere."; hintLine = "click to continue"; }
  else if (phase === STORY_PHASES.zoomHold) { mainLine = "they break down."; }
  else if (phase === STORY_PHASES.divideLoop) { mainLine = "and divides"; hintLine = divideCount < TOTAL_DIVIDES ? "click to divide again" : "click to continue"; }
  else if (phase === STORY_PHASES.circlesIntro) { mainLine = "sometimes, it feels hard to escape them."; hintLine = "click to continue"; }
  else if (phase === STORY_PHASES.released && finalLineVisible) { mainLine = "that is, if we can at all."; }

  push(); textAlign(CENTER, CENTER);
  if (mainLine.length > 0) { fill(255, 232); textSize(Math.max(12, Math.min(width, height) * 0.021)); text(mainLine, width * 0.5, height * 0.78); }
  if (hintLine.length > 0) { fill(255, 168); textSize(Math.max(9, Math.min(width, height) * 0.012)); text(hintLine, width * 0.5, height * 0.84); }

  for (let i = 0; i < divideEchoes.length; i += 1) {
    push(); translate(divideEchoes[i].x, divideEchoes[i].y); rotate(divideEchoes[i].angle);
    fill(255, 180); textSize(divideEchoes[i].size); text("and divides", 0, 0); pop();
  }
  pop();
}

function ensureSoundToggleButton() {
  let button = document.getElementById("sound-toggle");
  if (!button) {
    button = document.createElement("button"); button.id = "sound-toggle"; button.type = "button";
    document.body.appendChild(button);
  }
  if (!button.dataset.boundClick) {
    button.addEventListener("click", (event) => { event.stopPropagation(); toggleSoundEnabled(); });
    button.dataset.boundClick = "true";
  }
  soundToggleButton = button; updateSoundToggleLabel();
}

function updateSoundToggleLabel() {
  if (!soundToggleButton) return;
  soundToggleButton.textContent = soundEnabled ? "sound on" : "sound off";
  soundToggleButton.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
}

function toggleSoundEnabled() {
  soundEnabled = !soundEnabled;
  if (!soundEnabled) soundPlayers.forEach((player) => { player.pause(); player.currentTime = 0; });
  updateSoundToggleLabel();
}

function initializeSoundSystem() {
  soundPlayers = new Map();
  const entries = Object.entries(SOUND_MANIFEST);
  for (let i = 0; i < entries.length; i += 1) {
    const player = new Audio(entries[i][1].src);
    player.preload = "auto"; player.volume = entries[i][1].volume;
    soundPlayers.set(entries[i][0], player);
  }
  if (!soundsInitialized) {
    window.addEventListener("pointerdown", unlockSoundPlayback, { passive: true });
    window.addEventListener("keydown", unlockSoundPlayback, { passive: true });
    soundsInitialized = true;
  }
  updateSoundToggleLabel();
}

function unlockSoundPlayback() {
  if (soundsUnlocked) return;
  soundsUnlocked = true;
  soundPlayers.forEach((player) => { player.load(); });
}

function playSound(name, options = {}) {
  const slot = SOUND_MANIFEST[name]; const player = soundPlayers.get(name);
  if (!slot || !player || !soundsUnlocked || !soundEnabled) return false;

  player.volume = options.volume ?? slot.volume;
  if (options.restart !== false) player.currentTime = 0;
  const attempt = player.play();
  if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
  return true;
}

function playRandomSound(poolName, options = {}) {
  const pool = SOUND_RANDOM_POOLS[poolName];
  if (!pool || pool.length === 0) return false;
  const slotName = pool[Math.floor(random(pool.length))];
  const slot = SOUND_MANIFEST[slotName];
  if (!slot) return false;
  
  const jitter = options.volumeJitter ?? 0;
  return playSound(slotName, { restart: options.restart ?? true, volume: options.volume ?? constrain(slot.volume + random(-jitter, jitter), 0, 1) });
}

function fillHex(hex, alpha) {
  const swatch = color(hex); swatch.setAlpha(alpha); fill(swatch);
}

function trimList(list, maxLength) {
  while (list.length > maxLength) list.shift();
}

// ============================================================================
// BACKGROUND GENERATOR
// Computes thousands of noise points ONCE and caches it onto a graphic layer
// to prevent severe lag during the 60fps draw loop.
// ============================================================================

function initReferencePatternBackdrop() {
  const layerScale = 0.48;
  const layerWidth = Math.max(1, floor(width * layerScale));
  const layerHeight = Math.max(1, floor(height * layerScale));

  referencePatternNoiseLayer = createGraphics(layerWidth, layerHeight);
  referencePatternNoiseLayer.pixelDensity(1);
  referencePatternNoiseLayer.clear();
  referencePatternNoiseLayer.noStroke();

  const fogPatchCount = floor(layerWidth * layerHeight * 0.0014);
  for (let i = 0; i < fogPatchCount; i += 1) {
    const cloudShade = random(82, 148); const cloudW = random(layerWidth * 0.04, layerWidth * 0.18);
    referencePatternNoiseLayer.fill(cloudShade, cloudShade, cloudShade, random(6, 18));
    referencePatternNoiseLayer.ellipse(random(referencePatternNoiseLayer.width), random(referencePatternNoiseLayer.height), cloudW, cloudW * random(0.58, 1.28));
  }

  const sampleCount = floor(referencePatternNoiseLayer.width * referencePatternNoiseLayer.height * 0.1);
  for (let i = 0; i < sampleCount; i += 1) {
    const x = floor(random(referencePatternNoiseLayer.width)); const y = floor(random(referencePatternNoiseLayer.height));
    const noiseMix = noise(x * 0.04, y * 0.04); const shade = random() > 0.5 ? 255 : floor(136 + noiseMix * 88);
    referencePatternNoiseLayer.fill(shade, shade, shade, random(10, 48) + noiseMix * 24);
    referencePatternNoiseLayer.rect(x, y, 1, 1);
  }

  const sparkleCount = floor(layerWidth * layerHeight * 0.008);
  for (let i = 0; i < sparkleCount; i += 1) {
    referencePatternNoiseLayer.fill(255, 255, 255, random(18, 64));
    referencePatternNoiseLayer.rect(floor(random(referencePatternNoiseLayer.width)), floor(random(referencePatternNoiseLayer.height)), 1, 1);
  }

  for (let y = 0; y < referencePatternNoiseLayer.height; y += 1) {
    referencePatternNoiseLayer.fill(0, 0, 0, y % 4 === 0 ? random(10, 20) : random(2, 7));
    referencePatternNoiseLayer.rect(0, y, referencePatternNoiseLayer.width, 1);
  }
}

function drawReferencePatternBackdrop() {
  if (!referencePatternNoiseLayer) return;
  push(); imageMode(CORNER); tint(255, 156);
  image(referencePatternNoiseLayer, 0, 0, width, height);
  noTint(); pop();
}