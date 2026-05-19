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

const STORY_PHASES = {
  introOne: "intro-one",
  introTwo: "intro-two",
  introThree: "intro-three",
  introFour: "intro-four",
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
const CIRCLE_DEATH_HOLD_SECONDS = 3;
const CIRCLE_DEATH_FADE_SECONDS = 3;
const CIRCLE_SPAWN_FADE_SECONDS = 1.35;
const CIRCLE_POST_SPAWN_GRACE_SECONDS = 0.45;
const CIRCLE_DEATH_SHAKE_SECONDS = 2.4;
const CIRCLE_REPLACEMENT_SPAWN_DELAY_SECONDS = 0.85;
const RETRO_SHAPE_SPAWN_FADE_SECONDS = 1.0;
const RETRO_SHAPE_RESPAWN_DELAY_SECONDS = 0.9;
const INTRO_MICROPLASTIC_CLICKS_REQUIRED = 4;

const RETRO_SHAPE_COLORS = [PALETTE.pink, PALETTE.teal, PALETTE.yellow, PALETTE.blue];

const SOUND_PREFIX = "audio/COMM2754-2026-S1-ThriftNGift-";

const SOUND_MANIFEST = {
  punch: { src: `${SOUND_PREFIX}Punch.wav`, volume: 0.75 },
  click1: { src: `${SOUND_PREFIX}Click1.wav`, volume: 0.48 },
  click2: { src: `${SOUND_PREFIX}Click2.wav`, volume: 0.48 },
  click3: { src: `${SOUND_PREFIX}Click3.wav`, volume: 0.48 },
  plastic1: { src: `${SOUND_PREFIX}Plastic-1.wav`, volume: 0.5 },
  plastic2: { src: `${SOUND_PREFIX}Plastic-2.wav`, volume: 0.5 },
  plastic3: { src: `${SOUND_PREFIX}Plastic-3.wav`, volume: 0.5 },
  hover1: { src: `${SOUND_PREFIX}Hover1.wav`, volume: 0.34 },
  hover2: { src: `${SOUND_PREFIX}Hover2.wav`, volume: 0.34 },
  hover3: { src: `${SOUND_PREFIX}Hover3.wav`, volume: 0.34 },
  damage1: { src: `${SOUND_PREFIX}Damage-1.wav`, volume: 0.5 },
  damage2: { src: `${SOUND_PREFIX}Damage-2.wav`, volume: 0.5 },
  damage3: { src: `${SOUND_PREFIX}Damage-3.wav`, volume: 0.5 },
  dieremake1: { src: `${SOUND_PREFIX}DieRemake1.wav`, volume: 0.8 },
  dieremake2: { src: `${SOUND_PREFIX}DieRemake2.wav`, volume: 0.8 },
  transition: { src: `${SOUND_PREFIX}Transition.wav`, volume: 0.55 },
  textPopup: { src: "../Hoang/designed-sounds/text-popup.wav", volume: 0.76 },
};

const SOUND_RANDOM_POOLS = {
  click: ["click1", "click2", "click3"],
  plastic: ["plastic1", "plastic2", "plastic3"],
  hover: ["hover1", "hover2", "hover3"],
  damage: ["damage1", "damage2", "damage3"],
  die: ["dieremake1", "dieremake2"],
};

// ============================================================================
// GLOBAL STATE VARIABLES
// ============================================================================

let referencePatternNoiseLayer = null; 
let globalTime = 0;
let phase = STORY_PHASES.introOne;
let phaseTime = 0;

let cameraZoom = 1;
let targetCameraZoom = 1;

let mainTriangle = {
  x: 0, y: 0, size: 18, targetSize: 18, rotation: 0,
  color: PALETTE.pink, seed: 0, visible: true,
};

let centerShards =[]; 
let divideCount = 0;
let divideEchoes = [];

let microTriangles =[]; 
let popTriangles =[];   
let ambientSpawnAccumulator = 0;

let circles =[];        
let circleSpawnCooldown = 0;
let circlesReleased = false;
let totalCircleDeaths = 0;
let finalLineVisible = false;
let introMicroplasticClicks = 0;
let circleReplacementCooldown = 0;

// Sparing background Memphis/Punk graphics
let retroShapes =[];

let soundPlayers = new Map();
let soundsInitialized = false;
let soundsUnlocked = false;
let soundEnabled = true;
let soundToggleButton = null;
let lastStoryTextPopupKey = "";


// ============================================================================
// CORE P5.JS FUNCTIONS
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
  
  // Match Nana's dialogue-box typography.
  textFont("Averia Sans Libre");
  textStyle(BOLD);
  rectMode(CENTER);

  initReferencePatternBackdrop();
  initializeSoundSystem();
  if (!isPreviewMode()) {
    ensureSoundToggleButton();
  }
  resetNarrative();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initReferencePatternBackdrop();
  clampRetroShapesToViewport();
}

function ensureStaticStage() {
  const scrollSpace = document.getElementById("scroll-space");
  if (scrollSpace) scrollSpace.style.height = "100vh";
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function isPreviewMode() {
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

function resetNarrative() {
  globalTime = 0;
  phase = STORY_PHASES.introOne;
  phaseTime = 0;
  cameraZoom = 1;
  targetCameraZoom = 1;
  introMicroplasticClicks = 0;
  circleReplacementCooldown = 0;
  lastStoryTextPopupKey = "";

  const baseSize = Math.min(width, height);
  mainTriangle.x = 0; mainTriangle.y = 0;
  mainTriangle.size = baseSize * 0.032; mainTriangle.targetSize = mainTriangle.size;
  mainTriangle.rotation = 0; mainTriangle.color = pickShapeColor();
  mainTriangle.seed = random(10000); mainTriangle.visible = true;

  centerShards =[]; divideCount = 0; divideEchoes = [];
  microTriangles =[]; popTriangles =[]; ambientSpawnAccumulator = 0;
  circles =[]; circleSpawnCooldown = 0.6; circlesReleased = false;
  totalCircleDeaths = 0; finalLineVisible = false;

  for (let i = 0; i < 210; i += 1) spawnAmbientMicroTriangle(true);

  // Spawn background graphic structures (Dots and Stripes ONLY)
  retroShapes = [];
  const retroShapeCount = Math.max(10, Math.round(constrain(Math.min(width, height) / 80, 10, 18)));
  for (let i = 0; i < retroShapeCount; i += 1) {
    retroShapes.push(createRetroShape());
  }
}

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
  updateRetroShapes(dt);

  // 2. RENDER BACKGROUND
  background(PALETTE.black);
  drawReferencePatternBackdrop();

  // 3. RENDER CAMERA-AFFECTED ENTITIES
  push();
  translate(width * 0.5, height * 0.5);
  scale(cameraZoom);

  drawRetroShapes();
  drawAmbientMicroTriangles();
  drawPopTriangles();
  drawCenterTriangles();
  drawCircles();

  pop();

  // 4. RENDER UI / TEXT
  drawStoryText();
}

function handleCanvasPress() {
  unlockSoundPlayback();
  if (handleRetroShapePress(mouseX, mouseY)) return false;
  playRandomSound("click", { volumeJitter: 0.05 });

  if (phase === STORY_PHASES.introOne) { setPhase(STORY_PHASES.introTwo); return false; }
  if (phase === STORY_PHASES.introTwo) { setPhase(STORY_PHASES.introThree); return false; }

  if (phase === STORY_PHASES.introThree) {
    spawnUserMicroBurst(mouseX, mouseY);
    playRandomSound("plastic", { restart: true, volumeJitter: 0.1 });
    introMicroplasticClicks += 1;
    if (introMicroplasticClicks >= INTRO_MICROPLASTIC_CLICKS_REQUIRED) setPhase(STORY_PHASES.introFour);
    return false;
  }

  if (phase === STORY_PHASES.introFour) { setPhase(STORY_PHASES.zoomIn); return false; }
  
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

function updateStoryPhase() {
  const baseSize = Math.min(width, height);

  if (phase === STORY_PHASES.introOne || phase === STORY_PHASES.introTwo || phase === STORY_PHASES.introThree || phase === STORY_PHASES.introFour) {
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

  cameraZoom = lerp(cameraZoom, targetCameraZoom, 0.08);
  mainTriangle.size = lerp(mainTriangle.size, mainTriangle.targetSize, 0.1);
}

function setPhase(nextPhase) {
  if (nextPhase === STORY_PHASES.zoomIn || nextPhase === STORY_PHASES.zoomOut) playSound("transition", { restart: true, volume: 0.85 });
  if (nextPhase === STORY_PHASES.zoomOut) primeTransitionField();
  if (nextPhase === STORY_PHASES.circlesIntro) divideEchoes =[];
  phase = nextPhase;
  phaseTime = 0;
}

function pickShapeColor() {
  const colors = [PALETTE.pink, PALETTE.teal, PALETTE.yellow, PALETTE.blue];
  return colors[Math.floor(random(colors.length))];
}

function pickDifferentRetroColor(excludeColor) {
  const colors = RETRO_SHAPE_COLORS.filter((colorValue) => colorValue !== excludeColor);
  return colors[Math.floor(random(colors.length))] || excludeColor;
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

function createRetroShape() {
  const viewHalfW = width * 0.5 / Math.max(cameraZoom, 0.001);
  const viewHalfH = height * 0.5 / Math.max(cameraZoom, 0.001);
  const minSide = Math.min(width, height);
  const introPhase = phase === STORY_PHASES.introOne || phase === STORY_PHASES.introTwo || phase === STORY_PHASES.introThree || phase === STORY_PHASES.introFour;
  const sizeScale = introPhase ? 0.72 : 1;
  const size = random(Math.max(32, minSide * 0.07), Math.max(78, minSide * 0.16)) * sizeScale;
  const x = random(-viewHalfW * 0.78, viewHalfW * 0.78);
  const y = random(-viewHalfH * 0.78, viewHalfH * 0.78);
  const baseColor = RETRO_SHAPE_COLORS[Math.floor(random(RETRO_SHAPE_COLORS.length))];
  const stripeColor = pickDifferentRetroColor(baseColor);

  return {
    x,
    y,
    vx: random(-0.18, 0.18),
    vy: random(-0.18, 0.18),
    size,
    type: Math.floor(random(2)),
    seed: random(10000),
    rotation: random(-0.9, 0.9),
    rotationSpeed: random(-0.018, 0.018),
    baseColor,
    stripeColor,
    hoverMix: 0,
    hoverKick: 0,
    pressMix: 0,
    shakeMix: 0,
    explodeMix: 0,
    spawnMix: 0,
    spawnDuration: random(RETRO_SHAPE_SPAWN_FADE_SECONDS * 0.85, RETRO_SHAPE_SPAWN_FADE_SECONDS * 1.35),
    spawnLocked: true,
    dying: false,
    deathMix: 0,
    deathAnchorX: x,
    deathAnchorY: y,
    deathBurstDone: false,
    exitVX: 0,
    exitVY: 0,
    clickCount: 0,
    clickLimit: Math.floor(random(3, 6)),
    dead: false,
    respawnTimer: 0,
    wasHovered: false,
  };
}

function clampRetroShapesToViewport() {
  const viewHalfW = width * 0.5 / Math.max(cameraZoom, 0.001);
  const viewHalfH = height * 0.5 / Math.max(cameraZoom, 0.001);
  for (let i = 0; i < retroShapes.length; i += 1) {
    const shape = retroShapes[i];
    const margin = shape.size * 0.65;
    shape.x = constrain(shape.x, -viewHalfW + margin, viewHalfW - margin);
    shape.y = constrain(shape.y, -viewHalfH + margin, viewHalfH - margin);
  }
}

function updateRetroShapes(dt) {
  const dtScale = dt * 60;
  const viewHalfW = width * 0.5 / Math.max(cameraZoom, 0.001);
  const viewHalfH = height * 0.5 / Math.max(cameraZoom, 0.001);
  const pointerWorld = screenToWorld(mouseX, mouseY);
  const blockRetroRespawn = phase === STORY_PHASES.zoomIn || phase === STORY_PHASES.zoomHold || phase === STORY_PHASES.divideLoop || phase === STORY_PHASES.zoomOut;
  let hoveredIndex = -1;
  let hoveredScore = Infinity;

  for (let i = 0; i < retroShapes.length; i += 1) {
    const shape = retroShapes[i];
    if (shape.dead || shape.dying) continue;

    const dx = pointerWorld.x - shape.x;
    const dy = pointerWorld.y - shape.y;
    const inverseRotation = -shape.rotation;
    const localX = dx * Math.cos(inverseRotation) - dy * Math.sin(inverseRotation);
    const localY = dx * Math.sin(inverseRotation) + dy * Math.cos(inverseRotation);
    const hoverReach = shape.size * 0.55 * Math.max(0.55, shape.spawnMix ?? 0.55);
    const normalizedScore = Math.max(Math.abs(localX) / hoverReach, Math.abs(localY) / hoverReach);

    if (normalizedScore <= 1 && normalizedScore < hoveredScore) {
      hoveredIndex = i;
      hoveredScore = normalizedScore;
    }
  }

  for (let i = 0; i < retroShapes.length; i += 1) {
    const shape = retroShapes[i];

    if (shape.dead) {
      shape.respawnTimer -= dt;

      if (shape.respawnTimer <= 0 && !blockRetroRespawn) {
        retroShapes[i] = createRetroShape();
      }
      continue;
    }

    if (shape.spawnLocked) {
      shape.spawnMix = Math.min(1, (shape.spawnMix ?? 0) + dt / Math.max(shape.spawnDuration, 0.001));
      shape.vx *= 0.88;
      shape.vy *= 0.88;

      if (shape.spawnMix >= 1) {
        shape.spawnLocked = false;
        shape.spawnMix = 1;
      } else {
        continue;
      }
    }

    if (shape.dying) {
      shape.deathMix = Math.min(1, (shape.deathMix ?? 0) + dt / 2.8);
      shape.hoverMix = Math.max(0, (shape.hoverMix ?? 0) - dt * 2.2);
      shape.pressMix = Math.max(0, (shape.pressMix ?? 0) - dt * 2.2);
      shape.shakeMix = Math.min(1, (shape.shakeMix ?? 0) + dt * 2.5);

      if (shape.deathMix < 0.45) {
        shape.x = shape.deathAnchorX;
        shape.y = shape.deathAnchorY;
      }

      if (!shape.deathBurstDone && shape.deathMix >= 0.45) {
        spawnRetroMicroBurst(shape, 1.15);
        const pushFromCenterX = shape.x === 0 ? random([-1, 1]) : Math.sign(shape.x);
        const pushFromCenterY = shape.y === 0 ? random([-1, 1]) : Math.sign(shape.y);
        shape.exitVX = pushFromCenterX * random(0.8, 2.1) + random(-0.35, 0.35);
        shape.exitVY = pushFromCenterY * random(0.8, 2.1) + random(-0.35, 0.35);
        shape.deathBurstDone = true;
      }

      if (shape.deathMix >= 0.6) {
        shape.x += shape.exitVX * dtScale;
        shape.y += shape.exitVY * dtScale;
      }

      const isOutside = Math.abs(shape.x) > viewHalfW + shape.size || Math.abs(shape.y) > viewHalfH + shape.size;
      if (shape.deathMix >= 0.72 && isOutside) {
        shape.dead = true;
        shape.respawnTimer = random(RETRO_SHAPE_RESPAWN_DELAY_SECONDS * 0.75, RETRO_SHAPE_RESPAWN_DELAY_SECONDS * 1.25);
      }
      continue;
    }

    const isHovered = i === hoveredIndex;
    const dx = pointerWorld.x - shape.x;
    const dy = pointerWorld.y - shape.y;
    const inverseRotation = -shape.rotation;
    const localX = dx * Math.cos(inverseRotation) - dy * Math.sin(inverseRotation);
    const localY = dx * Math.sin(inverseRotation) + dy * Math.cos(inverseRotation);
    const hoverReach = shape.size * (0.58 + (shape.hoverMix ?? 0) * 0.12);
    const normalizedScore = Math.max(Math.abs(localX) / hoverReach, Math.abs(localY) / hoverReach);
    const hoverTarget = isHovered && normalizedScore <= 1 ? 1 : 0;
    shape.hoverMix = lerp(shape.hoverMix ?? 0, hoverTarget, constrain(dt * 10, 0.06, 0.22));
    shape.pressMix = Math.max(0, (shape.pressMix ?? 0) - dt * 2.1);
    shape.hoverKick = Math.max(0, (shape.hoverKick ?? 0) - dt * 1.7);
    shape.shakeMix = Math.max(0, (shape.shakeMix ?? 0) - dt * 1.2);

    if (isHovered && !shape.wasHovered) playRandomSound("hover", { volumeJitter: 0.05 });
    shape.wasHovered = isHovered;

    const wanderNoise = noise(shape.seed + 91.7, globalTime * 0.18);
    shape.vx += (wanderNoise - 0.5) * 0.02 * dtScale;
    shape.vy += (noise(shape.seed + 13.4, globalTime * 0.18) - 0.5) * 0.02 * dtScale;

    if (isHovered) {
      shape.vx += (pointerWorld.x - shape.x) * 0.0015 * dtScale;
      shape.vy += (pointerWorld.y - shape.y) * 0.0015 * dtScale;
      shape.hoverKick = Math.min(1, (shape.hoverKick ?? 0) + dt * 2.2);
    }

    const pushOutPhase = phase === STORY_PHASES.zoomIn || phase === STORY_PHASES.zoomHold || phase === STORY_PHASES.divideLoop;
    if (pushOutPhase) {
      const distance = Math.max(10, Math.sqrt(shape.x * shape.x + shape.y * shape.y));
      shape.vx += (shape.x / distance) * 0.26;
      shape.vy += (shape.y / distance) * 0.26;
    }

    shape.x += shape.vx * dtScale;
    shape.y += shape.vy * dtScale;
    shape.rotation += shape.rotationSpeed * dtScale;

    const clampToViewport = !pushOutPhase;
    if (clampToViewport) {
      const paddedHalfW = Math.max(18, viewHalfW - shape.size * 0.55);
      const paddedHalfH = Math.max(18, viewHalfH - shape.size * 0.55);
      if (shape.x < -paddedHalfW || shape.x > paddedHalfW) {
        shape.vx *= -0.95;
        shape.x = constrain(shape.x, -paddedHalfW, paddedHalfW);
      }
      if (shape.y < -paddedHalfH || shape.y > paddedHalfH) {
        shape.vy *= -0.95;
        shape.y = constrain(shape.y, -paddedHalfH, paddedHalfH);
      }
    }

    const isOutsideView = Math.abs(shape.x) > viewHalfW + shape.size * 0.8 || Math.abs(shape.y) > viewHalfH + shape.size * 0.8;
    if (isOutsideView && (pushOutPhase || shape.spawnMix >= 1)) {
      beginRetroShapeDying(shape);
      shape.deathMix = Math.max(shape.deathMix, 0.45);
      shape.exitVX = Math.sign(shape.x || 1) * random(1.2, 2.6);
      shape.exitVY = Math.sign(shape.y || 1) * random(1.2, 2.6);
    }

    if (shape.clickCount >= shape.clickLimit) {
      beginRetroShapeDying(shape);
    }
  }
}

function handleRetroShapePress(screenX, screenY) {
  const world = screenToWorld(screenX, screenY);
  let hitIndex = -1;
  let hitScore = Infinity;

  for (let i = 0; i < retroShapes.length; i += 1) {
    const shape = retroShapes[i];
    if (shape.dead || shape.dying) continue;

    const dx = world.x - shape.x;
    const dy = world.y - shape.y;
    const inverseRotation = -shape.rotation;
    const localX = dx * Math.cos(inverseRotation) - dy * Math.sin(inverseRotation);
    const localY = dx * Math.sin(inverseRotation) + dy * Math.cos(inverseRotation);
    const reach = shape.size * 0.55;
    const score = Math.max(Math.abs(localX) / reach, Math.abs(localY) / reach);

    if (score <= 1 && score < hitScore) {
      hitIndex = i;
      hitScore = score;
    }
  }

  if (hitIndex < 0) return false;

  const shape = retroShapes[hitIndex];
  shape.clickCount += 1;
  shape.pressMix = Math.min(1, (shape.pressMix ?? 0) + 0.6);
  shape.shakeMix = Math.min(1, (shape.shakeMix ?? 0) + 0.8);
  shape.hoverMix = Math.max(shape.hoverMix ?? 0, 0.65);
  shape.vx += random(-1.2, 1.2);
  shape.vy += random(-1.2, 1.2);

  playRandomSound("damage", { volumeJitter: 0.08 });

  const burstSize = Math.max(10, shape.size * 0.42);
  spawnPopTriangles(shape.x, shape.y, Math.floor(random(3, 7)), burstSize, shape.baseColor);

  if (shape.clickCount >= shape.clickLimit) {
    beginRetroShapeDying(shape);
  }

  return true;
}

function spawnRetroMicroBurst(shape, intensity) {
  const count = Math.floor(random(10, 18) * intensity);
  for (let i = 0; i < count; i += 1) {
    const angle = random(TWO_PI);
    const distance = random(shape.size * 0.1, shape.size * 0.8);
    microTriangles.push({
      x: shape.x + Math.cos(angle) * distance,
      y: shape.y + Math.sin(angle) * distance,
      vx: Math.cos(angle) * random(0.6, 2.2) * intensity,
      vy: Math.sin(angle) * random(0.6, 2.2) * intensity,
      size: random(3.1, 10.2),
      rotation: random(TWO_PI),
      spin: random(-0.1, 0.1),
      color: pickShapeColor(),
      seed: random(10000),
      persistent: false,
      life: random(3.8, 8.8),
      maxLife: random(3.8, 8.8),
    });
  }
  trimList(microTriangles, MICRO_TRIANGLE_MAX);
}

function beginRetroShapeDying(shape) {
  if (shape.dead || shape.dying) return;
  shape.dying = true;
  shape.deathMix = 0;
  shape.deathBurstDone = false;
  shape.exitVX = 0;
  shape.exitVY = 0;
  shape.hoverMix = 0;
  shape.pressMix = 0;
  shape.shakeMix = 0;
  shape.deathAnchorX = shape.x;
  shape.deathAnchorY = shape.y;
}

function spawnAmbientMicroTriangle(seedInView = false, persistent = true) {
  const viewW = width / Math.max(cameraZoom, 0.001);
  const viewH = height / Math.max(cameraZoom, 0.001);
  const spanX = viewW * 1.2;
  const spanY = viewH * 1.2;

  let x = 0; let y = 0; let moveAngle;
  const activePhase = (phase === STORY_PHASES.zoomOut || phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released);

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
      const dist = Math.max(10, Math.sqrt(tri.x * tri.x + tri.y * tri.y));
      tri.vx += (tri.x / dist) * 0.16; tri.vy += (tri.y / dist) * 0.16;
    } else if (activePhase) {
      tri.vx += (noise(tri.seed, globalTime * 0.8) - 0.5) * 0.25;
      tri.vy += (noise(tri.seed + 100, globalTime * 0.8) - 0.5) * 0.25;
      const spd = Math.sqrt(tri.vx * tri.vx + tri.vy * tri.vy);
      if (spd > 3.0) { tri.vx = (tri.vx / spd) * 3.0; tri.vy = (tri.vy / spd) * 3.0; }
    }

    tri.x += tri.vx * dt * 60; tri.y += tri.vy * dt * 60;
    tri.rotation += tri.spin * dt * 60;

    const friction = activePhase ? 0.999 : 0.996;
    tri.vx *= friction; tri.vy *= friction;

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
    tri.vy += 0.02 * dt * 60; 
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
// MAIN SPLITTING MECHANIC
// ============================================================================

function divideCenterTriangles() {
  const sources = centerShards.length > 0 ? centerShards :[{
    x: mainTriangle.x, y: mainTriangle.y, anchorX: mainTriangle.x, anchorY: mainTriangle.y,
    vx: 0, vy: 0, size: mainTriangle.size, rotation: mainTriangle.rotation,
    color: mainTriangle.color, seed: mainTriangle.seed, released: circlesReleased,
  }];

  mainTriangle.visible = false;
  const nextShards =[];

  for (let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    const axis = source.rotation + seededRange(source.seed + 2.1, -0.12, 0.12);
    const spread = source.size * seededRange(source.seed + 4.1, 1.2, 2.5); 
    const childSize = Math.max(6, source.size * seededRange(source.seed + 8.7, 0.78, 0.88));
    const twist = seededRange(source.seed + 11.9, 0.04, 0.13);

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
        side: hand, released: circlesReleased, hoverMix: 0, wasHovered: false,
      });
    }
  }

  centerShards = nextShards.slice(0, 96); 
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
  if (phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released) { divideEchoes =[]; return; }
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
  const hoverablePhase = phase === STORY_PHASES.divideLoop || phase === STORY_PHASES.zoomOut || phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released;
  const hoverWorld = hoverablePhase ? screenToWorld(mouseX, mouseY) : null;
  let hoveredIndex = -1;
  let hoveredDistanceSq = Infinity;

  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];

    if (!shard.released) {
      shard.splitMix = Math.min(1, (shard.splitMix ?? 1) + dt * (shard.splitSpeed || 3));
      const ease = easeOutCubic(shard.splitMix);
      shard.x = lerp(shard.startX ?? shard.anchorX, shard.anchorX, ease);
      shard.y = lerp(shard.startY ?? shard.anchorY, shard.anchorY, ease);
      shard.vx *= 0.88; shard.vy *= 0.88;
    } else {
      shard.vx += (noise(shard.seed * 0.011, globalTime * 0.58) - 0.5) * 0.17;
      shard.vy += (noise(shard.seed * 0.017 + 81.3, globalTime * 0.62) - 0.5) * 0.17;
      const speed = Math.sqrt(shard.vx * shard.vx + shard.vy * shard.vy);
      if (speed > 3.4) { shard.vx *= 3.4 / speed; shard.vy *= 3.4 / speed; }

      shard.x += shard.vx * dtScale; shard.y += shard.vy * dtScale;
    }

    const boundX = Math.max(20, viewHalfW - shard.size * 0.7);
    const boundY = Math.max(20, viewHalfH - shard.size * 0.7);
    if (shard.x < -boundX || shard.x > boundX) { shard.vx *= -0.92; shard.x = constrain(shard.x, -boundX, boundX); }
    if (shard.y < -boundY || shard.y > boundY) { shard.vy *= -0.92; shard.y = constrain(shard.y, -boundY, boundY); }

    if (hoverablePhase && hoverWorld) {
      const hoverRadius = shard.size * 0.9;
      const dx = hoverWorld.x - shard.x;
      const dy = hoverWorld.y - shard.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq <= hoverRadius * hoverRadius && distanceSq < hoveredDistanceSq) {
        hoveredIndex = i;
        hoveredDistanceSq = distanceSq;
      }
    }
  }

  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];
    const isHovered = i === hoveredIndex;
    const hoverLerp = constrain(dt * 12, 0.08, 0.24);
    shard.hoverMix = lerp(shard.hoverMix ?? 0, isHovered ? 1 : 0, hoverLerp);

    if (isHovered && !shard.wasHovered) playRandomSound("hover", { volumeJitter: 0.05 });
    shard.wasHovered = isHovered;

    if (!isHovered || !hoverWorld) continue;

    const dx = hoverWorld.x - shard.x;
    const dy = hoverWorld.y - shard.y;
    shard.x += dx * 0.035 * shard.hoverMix;
    shard.y += dy * 0.035 * shard.hoverMix;
    shard.vx += dx * 0.0015 * dtScale;
    shard.vy += dy * 0.0015 * dtScale;
    shard.rotation += 0.01 * shard.hoverMix * dtScale;
  }
}

function drawCenterTriangles() {
  if (mainTriangle.visible) {
    drawTriangleWithWhiteDropShadow(mainTriangle.x, mainTriangle.y, mainTriangle.size, mainTriangle.rotation, mainTriangle.color, 255, mainTriangle.seed);
  }
  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];
    const hoverMix = shard.hoverMix ?? 0;
    const hoverScale = 1 + hoverMix * 0.14;
    const hoverOffsetX = Math.sin(globalTime * 7.4 + shard.seed) * hoverMix * 2.2;
    const hoverOffsetY = Math.cos(globalTime * 6.2 + shard.seed * 1.3) * hoverMix * 1.8;
    drawTriangleHalfWithWhiteDropShadow(shard.x + hoverOffsetX, shard.y + hoverOffsetY, shard.size * hoverScale, shard.rotation + hoverMix * 0.03, shard.color, 244, shard.seed, shard.side || (i % 2 === 0 ? -1 : 1));
  }
}


// ============================================================================
// CIRCLES & INTERACTIONS
// ============================================================================

function spawnCircle() {
  const radius = random(34, 96);
  const viewHalfW = width * 0.5 / Math.max(cameraZoom, 0.001);
  const viewHalfH = height * 0.5 / Math.max(cameraZoom, 0.001);
  const x = random(-viewHalfW * 0.68, viewHalfW * 0.68);
  const y = random(-viewHalfH * 0.68, viewHalfH * 0.68);
  const angle = random(TWO_PI);
  const speed = random(1.5, 3.2);

  const tones =[PALETTE.pink, PALETTE.blue, PALETTE.teal, PALETTE.yellow];

  circles.push({
    x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius,
    color: tones[Math.floor(random(tones.length))],
    seed: random(10000), crackSeed: random(10000), panicSeed: random(10000),
    damage: 0, panic: 0, hitCooldown: 0, enteredScreen: false, invincibleTimer: 0,
    dead: false, deadAt: -100, spawnMix: 0, spawnDuration: random(CIRCLE_SPAWN_FADE_SECONDS * 0.85, CIRCLE_SPAWN_FADE_SECONDS * 1.2), spawnLocked: true,
    dying: false, deathMix: 0, deathAnchorX: x, deathAnchorY: y, deathBurstStage1: false, deathBurstStage2: false, deathBurstStage3: false,
    deathMicroDripDone: false,
  });

  trimList(circles, MAX_ACTIVE_CIRCLES);
}

function spawnCircleMicroplastics(circleData, intensity = 1) {
  const burstCount = Math.floor(random(8, 14) * intensity + circleData.radius * 0.12 * intensity);
  const burstCenterX = circleData.x;
  const burstCenterY = circleData.y;

  for (let i = 0; i < burstCount; i += 1) {
    const angle = random(TWO_PI);
    const spread = random(circleData.radius * 0.12, circleData.radius * 0.82);
    const speed = random(0.6, 2.8) * intensity;
    microTriangles.push({
      x: burstCenterX + Math.cos(angle) * spread,
      y: burstCenterY + Math.sin(angle) * spread,
      vx: Math.cos(angle) * speed + random(-0.35, 0.35),
      vy: Math.sin(angle) * speed + random(-0.35, 0.35),
      size: random(3.2, 11.8),
      rotation: random(TWO_PI),
      spin: random(-0.09, 0.09),
      color: pickShapeColor(),
      seed: random(10000),
      persistent: false,
      life: random(4.5, 10.5),
      maxLife: random(4.5, 10.5),
    });
  }

  trimList(microTriangles, MICRO_TRIANGLE_MAX);
}

function updateCircles(dt) {
  const activePhase = phase === STORY_PHASES.zoomOut || phase === STORY_PHASES.circlesIntro || phase === STORY_PHASES.released;
  if (!activePhase && circles.length === 0) return;

  if (activePhase) {
    if (circleReplacementCooldown > 0) circleReplacementCooldown -= dt;
    circleSpawnCooldown -= dt;
    if (circleReplacementCooldown <= 0 && circleSpawnCooldown <= 0 && circles.length < MAX_ACTIVE_CIRCLES) {
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
      const deadAge = globalTime - circleData.deadAt;
      if (deadAge > Math.max(0.85, CIRCLE_DEATH_FADE_SECONDS * 0.35)) {
        circles.splice(i, 1);
        circleReplacementCooldown = Math.max(circleReplacementCooldown, CIRCLE_REPLACEMENT_SPAWN_DELAY_SECONDS);
      }
      continue;
    }

    if (circleData.spawnLocked) {
      circleData.spawnMix = Math.min(1, (circleData.spawnMix ?? 0) + dt / Math.max(circleData.spawnDuration, 0.001));
      circleData.vx *= 0.85;
      circleData.vy *= 0.85;
      circleData.invincibleTimer = Math.max(circleData.invincibleTimer, CIRCLE_POST_SPAWN_GRACE_SECONDS);

      if (circleData.spawnMix >= 1) {
        circleData.spawnLocked = false;
        circleData.enteredScreen = false;
        circleData.invincibleTimer = Math.max(circleData.invincibleTimer, CIRCLE_POST_SPAWN_GRACE_SECONDS);
      }
      continue;
    }

    if (circleData.dying) {
      circleData.deathMix = Math.min(1, circleData.deathMix + dt * 0.34);
      circleData.x = circleData.deathAnchorX;
      circleData.y = circleData.deathAnchorY;
      circleData.vx = 0;
      circleData.vy = 0;

      if (!circleData.deathBurstStage1 && circleData.deathMix > 0.56) {
        spawnCircleMicroplastics(circleData, 1.0);
        circleData.deathBurstStage1 = true;
      }
      if (!circleData.deathBurstStage2 && circleData.deathMix > 0.76) {
        spawnCircleMicroplastics(circleData, 0.6);
        circleData.deathBurstStage2 = true;
      }
      if (!circleData.deathBurstStage3 && circleData.deathMix > 0.9) {
        spawnCircleMicroplastics(circleData, 0.35);
        circleData.deathBurstStage3 = true;
      }

      if (circleData.deathMix >= 1) markCircleDead(circleData);
      continue;
    }

    if (circleData.invincibleTimer > 0) circleData.invincibleTimer -= dt;
    circleData.hitCooldown = Math.max(0, circleData.hitCooldown - dt);

    if (!circleData.enteredScreen) {
      if (Math.abs(circleData.x) < viewHalfW - circleData.radius && Math.abs(circleData.y) < viewHalfH - circleData.radius) {
        circleData.enteredScreen = true;
      }
    }

    const panic = smoothStep(0.5, 0.99, circleData.damage);
    circleData.panic = panic;

    const driftAmp = 0.04 + panic * 1.5;
    circleData.vx += (noise(circleData.seed + 3.1, globalTime * (0.37 + panic * 4.4)) - 0.5) * driftAmp;
    circleData.vy += (noise(circleData.seed + 7.4, globalTime * (0.41 + panic * 4.8)) - 0.5) * driftAmp;

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

    if (circleData.enteredScreen) {
      const boundX = Math.max(22, viewHalfW - circleData.radius - 2);
      const boundY = Math.max(22, viewHalfH - circleData.radius - 2);
      if (circleData.x < -boundX || circleData.x > boundX) { circleData.vx *= -0.95; circleData.x = constrain(circleData.x, -boundX, boundX); }
      if (circleData.y < -boundY || circleData.y > boundY) { circleData.vy *= -0.95; circleData.y = constrain(circleData.y, -boundY, boundY); }
    }

    applyCircleDamageFromTriangles(circleData);
  }
}

function beginCircleDying(circleData) {
  if (circleData.dead || circleData.dying) return;
  circleData.dying = true;
  circleData.deathMix = 0;
  circleData.deathBurstStage1 = false;
  circleData.deathBurstStage2 = false;
  circleData.deathBurstStage3 = false;
  circleData.deathAnchorX = circleData.x;
  circleData.deathAnchorY = circleData.y;
  circleData.vx = 0;
  circleData.vy = 0;
  playRandomSound("die", { volumeJitter: 0.08 });
}

function applyCircleDamageFromTriangles(circleData) {
  if (circleData.dead || circleData.dying || circleData.hitCooldown > 0 || !circleData.enteredScreen || circleData.invincibleTimer > 0) return;

  let collisionChance = 0; let burstSize = 0; let collisionRegistered = false;

  for (let i = 0; i < centerShards.length; i += 1) {
    const shard = centerShards[i];
    const reach = circleData.radius + shard.size * 0.44;
    const dx = circleData.x - shard.x; const dy = circleData.y - shard.y;
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

    if (circleData.damage >= 0.68) beginCircleDying(circleData);
  }
}

function markCircleDead(circleData) {
  if (circleData.dead) return;
  circleData.dying = false;
  circleData.dead = true; circleData.deadAt = globalTime; totalCircleDeaths += 1;
  spawnCircleMicroplastics(circleData, 1.0);
  spawnPopTriangles(circleData.x, circleData.y, 5, circleData.radius * 0.5, circleData.color);
}

function drawCircles() {
  for (let i = 0; i < circles.length; i += 1) {
    const circleData = circles[i];
    if (circleData.dead) continue;
    const deadAge = circleData.dead ? globalTime - circleData.deadAt : 0;
    const spawnMix = constrain(circleData.spawnMix ?? 0, 0, 1);
    const deathMix = constrain(circleData.deathMix ?? 0, 0, 1);
    const aliveAlpha = lerp(0, 222, spawnMix);
    const darkMix = circleData.dying ? smoothStep(0.18, 0.62, deathMix) : 0;
    const stillMix = circleData.dying ? smoothStep(0.55, 0.8, deathMix) : 0;
    const fadeOutMix = circleData.dying ? smoothStep(0.72, 1, deathMix) : 0;
    const deathColor = lerpColor(color(circleData.color), color("#000000"), darkMix);
    const deathShake = circleData.dying ? easeOutCubic(1 - stillMix) * circleData.radius * 0.2 : 0;
    const shakeX = circleData.dying ? (noise(circleData.seed + 1.7, globalTime * 18.0) - 0.5) * deathShake : 0;
    const shakeY = circleData.dying ? (noise(circleData.seed + 9.4, globalTime * 18.0) - 0.5) * deathShake : 0;
    const alpha = circleData.dying ? lerp(aliveAlpha, 0, fadeOutMix) : aliveAlpha;
    const colorValue = circleData.dying ? deathColor : circleData.color;
    const shadowAlpha = circleData.dying ? lerp(220, 0, fadeOutMix) : lerp(0, 232, spawnMix);
    const drawRadius = circleData.radius * (0.8 + spawnMix * 0.2);

    drawCircleWithWhiteDropShadow(circleData.x + shakeX, circleData.y + shakeY, drawRadius, colorValue, alpha, circleData.seed, shadowAlpha, PALETTE.white);
  }
}

// ============================================================================
// GEOMETRY & RENDER HELPERS
// ============================================================================

function drawRetroShapes() {
  push();
  rectMode(CENTER);
  const introPhase = phase === STORY_PHASES.introOne || phase === STORY_PHASES.introTwo || phase === STORY_PHASES.introThree || phase === STORY_PHASES.introFour;
  const phaseSizeScale = introPhase ? 0.78 : 1;

  for (let i = 0; i < retroShapes.length; i += 1) {
    const rs = retroShapes[i];
    if (rs.dead) continue;
    const spawnMix = constrain(rs.spawnMix ?? 1, 0, 1);
    const deathMix = constrain(rs.deathMix ?? 0, 0, 1);
    const hoverMix = rs.hoverMix ?? 0;
    const pressMix = rs.pressMix ?? 0;
    const drawScale = phaseSizeScale * (0.72 + spawnMix * 0.28) * (1 + hoverMix * 0.08 + pressMix * 0.05 + (rs.dying ? deathMix * 0.06 : 0));
    const drawRotation = rs.rotation + (noise(rs.seed + 200, globalTime * 2.8) - 0.5) * 0.06 * hoverMix;
    const renderAlpha = Math.round(255 * spawnMix * (rs.dying ? Math.max(0, 1 - smoothStep(0.72, 1, deathMix)) : 1));
    const shadowAlpha = Math.round(180 * spawnMix * (rs.dying ? Math.max(0, 1 - smoothStep(0.72, 1, deathMix)) : 1));
    const fillColor = rs.dying ? rs.baseColor : rs.baseColor;
    const points = buildVCutSquarePoints(rs.size, rs.seed);

    push();
    const hoverOffsetX = Math.sin(globalTime * 5.4 + rs.seed * 0.7) * hoverMix * 4.8;
    const hoverOffsetY = Math.cos(globalTime * 4.9 + rs.seed * 1.1) * hoverMix * 4.0;
    const exitX = rs.dying ? (rs.exitVX ?? 0) * Math.min(1, deathMix) * 6 : 0;
    const exitY = rs.dying ? (rs.exitVY ?? 0) * Math.min(1, deathMix) * 6 : 0;

    translate(rs.x + hoverOffsetX + exitX, rs.y + hoverOffsetY + exitY);
    rotate(drawRotation);
    scale(drawScale);

    noStroke();
    fillHex(PALETTE.white, shadowAlpha);
    beginShape();
    for (let j = 0; j < points.length; j += 1) vertex(points[j].x + 4, points[j].y + 4);
    endShape(CLOSE);

    fillHex(fillColor, renderAlpha);
    beginShape();
    for (let j = 0; j < points.length; j += 1) vertex(points[j].x, points[j].y);
    endShape(CLOSE);

    drawingContext.save();
    beginClip();
    beginShape();
    for (let j = 0; j < points.length; j += 1) vertex(points[j].x, points[j].y);
    endShape(CLOSE);
    endClip();

    if (rs.type === 0) {
      fillHex(rs.stripeColor, Math.max(0, renderAlpha - 16));
      const steps = 5; const stepDist = rs.size / steps;
      for (let dx = -rs.size / 2 + stepDist / 2; dx < rs.size / 2; dx += stepDist) {
        for (let dy = -rs.size / 2 + stepDist / 2; dy < rs.size / 2; dy += stepDist) {
          ellipse(dx, dy, rs.size * 0.12);
        }
      }
    } else if (rs.type === 1) {
      fillHex(rs.stripeColor, Math.max(0, renderAlpha - 20));
      const stripeGap = Math.max(10, rs.size * 0.14);
      rectMode(CORNER);
      for (let px = -rs.size; px <= rs.size; px += stripeGap) {
        push();
        translate(px, -rs.size * 0.8);
        rotate(0.48);
        rect(0, 0, Math.max(4, rs.size * 0.06), rs.size * 1.8);
        pop();
      }
      rectMode(CENTER);
    }

    drawingContext.restore();
    pop();
  }
  pop();
}

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

  // Smooth, completely straight edge points for vector styling
  return [seamTop, outerTop, outerCut.pre, outerCut.notch, outerCut.post, outerTip, seamBottom, seamMid, seamUpper];
}

function drawCircleWithWhiteDropShadow(x, y, radius, fillColor, alpha, seed, shadowAlpha = 220, shadowColor = PALETTE.white) {
  const shift = constrain(radius * 0.22, 6, 25);
  fillHex(shadowColor, shadowAlpha);
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
 * Builds hard-edge V-cuts (Pacman style wedges) into the circle
 * using exact vertex points rather than math smoothing.
 */
function buildVCutCirclePoints(radius, seed) {
  const numCuts = Math.floor(seededRange(seed, 1, 3)); 
  const notches =[];
  
  // Confine base angles to avoid crossing the mathematical -PI/PI seam for easier drawing
  let baseAngle = seededRange(seed + 1, -PI + 0.8, PI - 0.8);
  notches.push({ 
    angle: baseAngle, 
    span: seededRange(seed + 2, 0.35, 0.6), 
    depth: radius * seededRange(seed + 3, 0.4, 0.65) 
  });

  if (numCuts > 1) {
     let offset = seededRange(seed + 4, PI * 0.6, PI * 1.2); 
     let secondAngle = baseAngle + offset;
     // Shift offset safely
     if (secondAngle > PI - 0.6) secondAngle -= TWO_PI;
     
     if (secondAngle > -PI + 0.6 && secondAngle < PI - 0.6) {
       notches.push({ 
         angle: secondAngle, 
         span: seededRange(seed + 6, 0.35, 0.6), 
         depth: radius * seededRange(seed + 7, 0.4, 0.65) 
       });
     }
  }

  // Sort sequentially to allow a clean continuous sweep
  notches.sort((a, b) => a.angle - b.angle);

  const points =[];
  let currentAngle = -PI;
  const step = 0.08; 

  for (let i = 0; i < notches.length; i++) {
    const notch = notches[i];
    let startCut = notch.angle - notch.span;
    let endCut = notch.angle + notch.span;

    // Prevent backtracking if multiple deep cuts somehow slightly overlap
    if (startCut < currentAngle) startCut = currentAngle;

    // Draw the smooth outer perimeter up to the cut edge
    for (let angle = currentAngle; angle <= startCut; angle += step) {
      points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }

    // Draw exact 3 points to form the hard edge V-cut into the center
    points.push({ x: Math.cos(startCut) * radius, y: Math.sin(startCut) * radius });
    points.push({
      x: Math.cos(notch.angle) * (radius - notch.depth),
      y: Math.sin(notch.angle) * (radius - notch.depth),
    });
    points.push({ x: Math.cos(endCut) * radius, y: Math.sin(endCut) * radius });

    currentAngle = endCut;
  }

  // Finish the rest of the circle loop back to PI
  for (let angle = currentAngle; angle <= PI + 0.001; angle += step) {
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
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

  // Return perfectly clean mathematical points with no fuzzy noise applied to edges
  return [
    { x: right.x, y: right.y }, rightCut.pre, rightCut.notch, rightCut.post,
    { x: tip.x, y: tip.y }, leftCut.pre, leftCut.notch, leftCut.post, { x: left.x, y: left.y },
  ];
}

function buildVCutSquarePoints(size, seed) {
  const half = size * 0.5;
  const topLeft = { x: -half, y: -half };
  const topRight = { x: half, y: -half };
  const bottomRight = { x: half, y: half };
  const bottomLeft = { x: -half, y: half };
  const centroid = { x: 0, y: 0 };

  const topCut = buildEdgeVCut(topLeft, topRight, seededRange(seed + 1.6, 0.28, 0.76), seededRange(seed + 2.4, 0.06, 0.14), size * seededRange(seed + 3.1, 0.05, 0.12), centroid);
  const rightCut = buildEdgeVCut(topRight, bottomRight, seededRange(seed + 4.7, 0.28, 0.76), seededRange(seed + 5.3, 0.06, 0.14), size * seededRange(seed + 6.2, 0.05, 0.12), centroid);
  const bottomCut = buildEdgeVCut(bottomRight, bottomLeft, seededRange(seed + 7.4, 0.28, 0.76), seededRange(seed + 8.0, 0.06, 0.14), size * seededRange(seed + 9.7, 0.05, 0.12), centroid);

  return [
    topLeft,
    topCut.pre,
    topCut.notch,
    topCut.post,
    topRight,
    rightCut.pre,
    rightCut.notch,
    rightCut.post,
    bottomRight,
    bottomCut.pre,
    bottomCut.notch,
    bottomCut.post,
    bottomLeft,
  ];
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

  if (phase === STORY_PHASES.introOne) { mainLine = "HAVE YOU EVER WANDERED..."; hintLine = "(CLICK TO CONTINUE)"; }
  else if (phase === STORY_PHASES.introTwo) { mainLine = "WHERE DO MICROPLASTICS COME FROM?"; hintLine = "(CLICK TO CONTINUE)"; }
  else if (phase === STORY_PHASES.introThree) { mainLine = "IT'S EASY TO CREATE ONE. JUST CLICK."; hintLine = `(${introMicroplasticClicks}/${INTRO_MICROPLASTIC_CLICKS_REQUIRED})`; }
  else if (phase === STORY_PHASES.introFour) { mainLine = "BUT THERE'S ONE THING\nYOU HAVE TO KNOW ABOUT MICROPLASTICS."; hintLine = "(CLICK TO CONTINUE)"; }
  else if (phase === STORY_PHASES.zoomHold) { mainLine = "THEY BREAK DOWN."; hintLine = "(CLICK TO CONTINUE)"; }
  else if (phase === STORY_PHASES.divideLoop) { mainLine = "AND DIVIDES."; hintLine = divideCount < TOTAL_DIVIDES ? "(CLICK TO DIVIDE AGAIN)" : "(CLICK TO CONTINUE)"; }
  else if (phase === STORY_PHASES.circlesIntro) { mainLine = "SOMETIMES, IT FEELS HARD TO ESCAPE THEM."; hintLine = "(CLICK TO CONTINUE)"; }
  else if (phase === STORY_PHASES.released && finalLineVisible) { mainLine = "BUT DOES IT EVER MATTER IN THE END?"; }

  noteStoryTextPopupVisible(mainLine, hintLine);

  push(); 
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  textFont("Averia Sans Libre");
  textStyle(NORMAL);

  // Floating ambient text echoes
  for (let i = 0; i < divideEchoes.length; i += 1) {
    push(); translate(divideEchoes[i].x, divideEchoes[i].y); rotate(divideEchoes[i].angle);
    fill(255, 180); textSize(divideEchoes[i].size); text("AND DIVIDES.", 0, 0); pop();
  }

  if (!isPreviewMode()) {
    // Draw HUD style frame
    push();
    textAlign(LEFT, TOP);
    textSize(Math.max(10, Math.min(width, height) * 0.015));
    fill(255, 200);
    text("WASTE MANAGEMENT / CLIMATE DAMAGE", 20, 20);

    textAlign(RIGHT, TOP);
    text(`ENV. DAMAGE ${Math.min(100, totalCircleDeaths * 5)}%`, width - 20, 20);
    pop();
  }

  if (mainLine.length > 0) { 
    textSize(Math.max(17, Math.min(width, height) * 0.035)); 
    
    // Dynamic Box Constraints
    const mainLines = mainLine.toUpperCase().split("\n");
    const tw = Math.max(...mainLines.map((line) => textWidth(line)));
    const boxW = tw + 60;
    const lineHeight = Math.max(24, Math.min(width, height) * 0.047);
    const boxPaddingTop = Math.max(18, Math.min(width, height) * 0.026);
    const boxPaddingBottom = Math.max(18, Math.min(width, height) * 0.026);
    const boxH = Math.max(
      54,
      lineHeight * mainLines.length + boxPaddingTop + boxPaddingBottom
    );
    const cx = width * 0.5;
    const cy = height * 0.78;
    const boxTop = cy - boxH * 0.5;
    const boxBottom = cy + boxH * 0.5;

    noStroke();
    fill(PALETTE.teal);
    rect(cx + 12, cy + 12, boxW, boxH);
    fill(PALETTE.pink);
    rect(cx + 6, cy + 6, boxW, boxH);

    fill(0, 0, 0, 184);
    stroke(PALETTE.yellow);
    strokeWeight(3);
    rect(cx, cy, boxW, boxH);

    noStroke();
    for (let i = 0; i < mainLines.length; i += 1) {
      const lineY = boxTop + boxPaddingTop + lineHeight * 0.5 + i * lineHeight;
      fill(PALETTE.pink);
      text(mainLines[i], cx + 2, lineY + 2);
      fill(PALETTE.white);
      text(mainLines[i], cx, lineY);
    }

    if (hintLine.length > 0) {
      textSize(Math.max(10, Math.min(width, height) * 0.015));
      fill(PALETTE.teal);
      noStroke();
      const hintGap = Math.max(48, Math.min(width, height) * 0.07);
      const hintY = Math.min(height - 28, boxBottom + hintGap);
      text(hintLine, width * 0.5, hintY);
      hintLine = "";
    }
  }

  if (hintLine.length > 0) { 
    textSize(Math.max(10, Math.min(width, height) * 0.015)); 
    fill(PALETTE.teal); 
    noStroke();
    const subtextYOffset = Math.max(40, Math.min(width, height) * 0.08) * 0.5 + 20;
    text(hintLine, width * 0.5, height * 0.78 + subtextYOffset); 
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
    button.addEventListener("click", (event) => { event.stopPropagation(); playRandomSound("click", { volumeJitter: 0.05 }); toggleSoundEnabled(); });
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

function noteStoryTextPopupVisible(mainLine, hintLine) {
  const key = mainLine ? `${phase}:${mainLine}:${hintLine}` : "";
  if (!key) {
    lastStoryTextPopupKey = "";
    return;
  }

  if (key === lastStoryTextPopupKey) {
    return;
  }

  lastStoryTextPopupKey = key;
  playSound("textPopup");
}

function fillHex(hex, alpha) {
  const swatch = color(hex); swatch.setAlpha(alpha); fill(swatch);
}

function trimList(list, maxLength) {
  while (list.length > maxLength) list.shift();
}

// ============================================================================
// BACKGROUND GENERATOR
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
