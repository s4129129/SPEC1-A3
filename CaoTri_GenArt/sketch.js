// Base colors and shadow styling.
const BACKGROUND_COLOR = "#000000";
const CIRCLE_COLOR = "#2c15fe";
const EARTH_OCEAN_COLOR = [23, 104, 255];
const EARTH_OCEAN_DARK = [8, 54, 168];
const EARTH_LAND_COLOR = [254, 214, 2];
const EARTH_LAND_DARK = [254, 214, 2];
const EARTH_CLOUD_COLOR = 255;
const EARTH_LAND_POSITION_JITTER = 0.09;
const EARTH_LAND_SIZE_JITTER = 0.24;
const EARTH_LAND_DETAIL_COUNT_MIN = 2;
const EARTH_LAND_DETAIL_COUNT_MAX = 4;
const EARTH_PULSE_RING_COLOR = "#FE1595";
const EARTH_PULSE_RING_WEIGHT = 5;
const EARTH_PULSE_RING_ALPHA = 190;
const EARTH_PULSE_RING_GAP = 18;
const EARTH_PULSE_RING_EXPAND = 34;
const PHASE_ONE_OVERLAY_ALPHA = 255;
const PHASE_ONE_CLICK_PROMPT_TEXT = "CLICK ME";
const PHASE_ONE_TAP_PROMPT_TEXT = "TAP ME";
const SHARED_HINT_COLOR = "#1DD9DB";
const SHARED_HINT_LETTER_SPACING = "5px";
const PHASE_ONE_OVERLAY_REVEAL_TIME = 900;
const PHASE_ONE_TEXTBOX_FADE_TIME = 650;
const SHADOW_COLOR = 255;
const SHADOW_ALPHA = 250;
const SHADOW_OFFSET_X = 16;
const SHADOW_OFFSET_Y = 18;

// Circle configuration
const CHIP_STAGE = 6; //Chipped configuration stage at which notches start getting patched by patterns.
const MAX_NOTCHES = 5;
const MIN_NOTCH_SPACING = 0.6;
const SCROLL_PHASES = 3;
const FINAL_PHASE = SCROLL_PHASES - 1;
const TRACKER_MARGIN = 24;
const TRACKER_WIDTH = 12;
const TRACKER_HEIGHT = 360;
const SHOW_SCROLL_TRACKER = false;
const PHASE_HEIGHTS = [3.0, 2.0, 2.0];
const PHASE_HEIGHT_PIXELS = [8000, 8000, 8000];
const PHONE_PHASE_HEIGHT_PIXELS = [2200, 2200, 2200];
const PHONE_TOUCH_SCROLL_SPEED = 10.0;
const DESKTOP_WHEEL_SCROLL_SPEED = 2.0;
const SCROLL_SNAP_IDLE_TIME = 140;
const SCROLL_SNAP_DURATION = 700;
const SCROLL_SNAP_MIN_DISTANCE = 8;
const RESTART_SCROLL_RESET_KEY = "tri3RestartAtPhaseOne";
const PULSE_SPEED = 0.08;
const PULSE_INTENSITY = 0.06;
const PULSE_DAMPING = 0.04;
const PULSE_JITTER_SPEED = 0.05;
const HEARTBEAT_PHASE_TRACKS = [
  "sound/succ-heartbeatP1.wav",
  "sound/heartbeatP2.wav",
  "sound/succ-heartbeat3.wav",
];
const HEARTBEAT_PLAYBACK_RATES = [1, 1, 0.7];
const HEARTBEAT_SFX_VOLUME = 1.0;
const HEARTBEAT_PULSE_GAIN = 0.42;
const HEARTBEAT_ATTACK = 0.34;
const HEARTBEAT_RELEASE = 0.075;
const HEARTBEAT_LEVEL_FLOOR = 0.012;
const HEARTBEAT_PULSE_MAX_MULTIPLIER = 2.15;
const HEARTBEAT_CROSSFADE_TIME = 0.45;
const HEARTBEAT_BEAT_PROFILES = [
  [
    { position: 0.06, width: 0.045, weight: 0.68 },
    { position: 0.258, width: 0.04, weight: 0.53 },
    { position: 0.294, width: 0.045, weight: 0.73 },
    { position: 0.612, width: 0.055, weight: 1 },
    { position: 0.894, width: 0.04, weight: 0.39 },
    { position: 0.936, width: 0.045, weight: 0.54 },
  ],
  [
    { position: 0.08, width: 0.09, weight: 1 },
    { position: 0.38, width: 0.06, weight: 0.62 },
  ],
  [
    { position: 0.109, width: 0.035, weight: 0.5 },
    { position: 0.156, width: 0.035, weight: 0.58 },
    { position: 0.202, width: 0.035, weight: 0.74 },
    { position: 0.245, width: 0.035, weight: 0.69 },
    { position: 0.292, width: 0.04, weight: 0.82 },
    { position: 0.727, width: 0.04, weight: 0.78 },
    { position: 0.774, width: 0.035, weight: 0.74 },
    { position: 0.82, width: 0.035, weight: 0.69 },
    { position: 0.859, width: 0.035, weight: 0.51 },
    { position: 0.91, width: 0.045, weight: 1 },
  ],
  [
    { position: 0.109, width: 0.035, weight: 0.5 },
    { position: 0.156, width: 0.035, weight: 0.58 },
    { position: 0.202, width: 0.035, weight: 0.74 },
    { position: 0.245, width: 0.035, weight: 0.69 },
    { position: 0.292, width: 0.04, weight: 0.82 },
    { position: 0.727, width: 0.04, weight: 0.78 },
    { position: 0.774, width: 0.035, weight: 0.74 },
    { position: 0.82, width: 0.035, weight: 0.69 },
    { position: 0.859, width: 0.035, weight: 0.51 },
    { position: 0.91, width: 0.045, weight: 1 },
  ],
];
const PULSE_PHASES = [
  { speed: 0.045, intensity: 0.015, jitter: 0.0 },
  { speed: 0.075, intensity: 0.03, jitter: 0.0 },
  { speed: 0.12, intensity: 0.07, jitter: 0.0 },
];
const SMOKE_ALPHA_MIN = 40;
const SMOKE_ALPHA_MAX = 140;
const SMOKE_PATCHED_ALPHA_MIN = 18;
const SMOKE_SCALE = 0.008;
const SMOKE_SPEED = 0;
const SMOKE_PADDING = 140;
const SMOKE_LAYER_SCALE = 0.45;
const REFERENCE_PATTERN_BACKDROP_ALPHA = 185;
const REFERENCE_PATTERN_LAYER_SCALE = 0.5;
const REFERENCE_PATTERN_MAX_POINTS = 3200;
const REFERENCE_PATTERN_MAX_CLOUDS = 40;
const REFERENCE_PATTERN_MAX_SCRATCHES = 140;
const REFERENCE_PATTERN_MAX_CELLS = 2;
const CORODE_WAVE_BASE = 0.22;
const CORODE_WAVE_DRIFT = 0.035;
const CORODE_WAVE_TIME_SPEED = 0.006;
const CORODE_WAVE_X_AMPLITUDE = 72;
const CORODE_WAVE_Y_AMPLITUDE = 32;
const CORODE_WAVE_SHEAR_X = 110;
const CORODE_WAVE_SHEAR_Y = 20;
const CORODE_WAVE_MOUSE_RADIUS = 180;
const CORODE_WAVE_MOUSE_FORCE = 65;
const CORODE_PATTERN_WOBBLE_SLICES = 10;
const CORODE_PATTERN_WOBBLE_AMPLITUDE = 10;
const CORODE_PATTERN_WOBBLE_FREQUENCY = 0.06;
const CORODE_PATTERN_WOBBLE_SPEED = 0.08;
const PHASE_SCROLL_SHIFT = 80;
const SCENE_TRANSITION_WINDOW = 0.12;
const PHASE_TWO_TEXTBOX_FADE_END = 0.28;
const STAGE_TWO_RECT_COUNT = 8;
const STAGE_TWO_RECT_MIN = 120;
const STAGE_TWO_RECT_MAX = 260;
const STAGE_TWO_SHADOW_OFFSET_X = 14;
const STAGE_TWO_SHADOW_OFFSET_Y = 16;
const STAGE_TWO_SHADOW_ALPHA = 220;
const STAGE_TWO_COLORS = ["#FE1595", "#1DD9DB", "#FED602"];
const PATTERN_STRIPE_WIDTH = 10;
const PATTERN_STRIPE_STEP = 22;
const PATTERN_DOT_SIZE = 10;
const PATTERN_DOT_STEP = 22;
const PATTERN_CHECKER_CELL = 26;
const PATTERN_CHECKER_SIZE = 26;

//Text box
const TEXT_BOX_MESSAGES = [
  "hello",
  "THEY ALL SLOWLY CORODING AWAY",
  "PICK UP THOSE BEAUTIFUL LEFT OVER, EVENTUALLY WE CAN PATCH US UP WITH GRACE",
];
const PHASE_ONE_TEXT_SEQUENCE = [
  "hello",
  "it does feel busy and crowdy here isnt it?",
  "we are chasing after trend of many things",
  "but what do we actually get in return?",
];
const PHASE_ONE_CONTINUE_PROMPT = "scroll down to continue";
const PHASE_ONE_CONTINUE_BLINK_SPEED = 0.055;
const PHASE_TWO_TEXT_SEQUENCE = [
  "we left out so many things behind",
  "it became a blanket of landfill",
  "cover us in an unbearable heat",
];
const FINAL_PHASE_TEXT_SEQUENCE = [
  "can you hear the heartbeat?",
  "it is a sign to patch ourselves up",
  "pick up what's left of us and help ourselves",
  "anything as long as its usable",
];
const POST_PATCH_TEXT_SEQUENCE = [
  "we still have a long way to go",
  "but we all can take part to help our planet",
  "thank you",
];
const EARTH_DIALOGUE_CLICK_PROMPT = "click anywhere to continue";
const EARTH_DIALOGUE_TAP_PROMPT = "tap anywhere to continue";
const PATCH_FIBER_CLICK_PROMPT = "click the fiber to patch";
const PATCH_FIBER_TAP_PROMPT = "tap the fiber to patch";
const TEXT_BOX_MARGIN_X = 50;
const TEXT_BOX_MARGIN_TOP = 40;
const TEXT_BOX_BOTTOM_RATIO = 0.14;
const TEXT_BOX_HEIGHT = 500;
const TEXT_BOX_BORDER = 4;
const TEXT_BOX_GLITCH_OFFSET = 5;
const TEXT_BOX_TEXT_SIZE = 40;
const TEXT_BOX_TEXT_PADDING_X = 40;
const TEXT_BOX_TEXT_PADDING_Y = 14;
const TEXT_BOX_TRANSITION_TIME = 520;
const TEXT_BOX_TRANSITION_OFFSET_Y = 18;
const TEXT_BOX_TEXT_SHADE_OFFSET = 5;
const TEXT_BOX_TEXT_SHADE_ALPHA = 210;

// Phase 2.5-3 triangle particles.
const SMALL_TRI_COUNT = 28;
const SMALL_TRI_SPEED_MIN = 0.4;
const SMALL_TRI_SPEED_MAX = 1.2;
const SMALL_TRI_SIZE_MIN = 10;
const SMALL_TRI_SIZE_MAX = 18;
const SMALL_TRI_SHADOW_OFFSET_X = 8;
const SMALL_TRI_SHADOW_OFFSET_Y = 9;
const SMALL_TRI_SHADOW_ALPHA = 200;
const SMALL_TRI_ALPHA = 210;
const SMALL_TRI_COLORS = ["#FE1595", "#1DD9DB", "#FED602"];
const SMALL_TRI_EXPLODE_DISTANCE = 380;
const SMALL_TRI_EXPLODE_SPIN = 5.2;
const SMALL_TRI_FRAGMENT_COUNT = 3;
const SMALL_TRI_FRAGMENT_DISTANCE = 95;
const PHASE_THREE_EXPLOSION_DURATION = 2200;
const FINAL_PATTERN_FALL_START_PROGRESS = 0.48;
const FINAL_PATTERN_FALL_FADE_END_PROGRESS = 0.62;
const FALLING_RECT_COUNT_MIN = 6;
const FALLING_RECT_COUNT_MAX = 14;
const FALLING_RECT_SPEED_MIN = 0.45;
const FALLING_RECT_SPEED_MAX = 1.15;
const FALLING_RECT_MAX_SPEED = 3.4;
const FALLING_RECT_GRAVITY = 0.018;
const FALLING_RECT_DRIFT = 0.45;
const FALLING_RECT_SWAY_AMOUNT = 1.2;
const FALLING_RECT_SWAY_SPEED_MIN = 0.012;
const FALLING_RECT_SWAY_SPEED_MAX = 0.035;
const FALLING_RECT_ROTATION_SPEED_MIN = 0.003;
const FALLING_RECT_ROTATION_SPEED_MAX = 0.018;
const FALLING_RECT_CLICK_PADDING = 28;
const FALLING_RECT_HINT_PADDING = 30;
const FALLING_RECT_HINT_BLINK_SPEED = 0.09;
const FALLING_RECT_HINT_ALPHA_MIN = 45;
const FALLING_RECT_HINT_ALPHA_MAX = 210;
const FALLING_RECT_HINT_STROKE_WEIGHT = 4;
const FALLING_RECT_SHADOW_OFFSET_X = STAGE_TWO_SHADOW_OFFSET_X;
const FALLING_RECT_SHADOW_OFFSET_Y = STAGE_TWO_SHADOW_OFFSET_Y;
const FALLING_RECT_CHIP_COUNT_MIN = 2;
const FALLING_RECT_CHIP_COUNT_MAX = 5;
const FALLING_RECT_CHIP_WIDTH_MIN = 0.12;
const FALLING_RECT_CHIP_WIDTH_MAX = 0.24;
const FALLING_RECT_CHIP_DEPTH_MIN = 0.10;
const FALLING_RECT_CHIP_DEPTH_MAX = 0.22;
const PATCH_FLY_EASE = 0.12;
const PATCH_SNAP_DISTANCE = 18;
const PATCH_SCALE_DECAY = 0.92;
const PATCH_MIN_SCALE = 0.15;
const PATCH_STITCH_COUNT = 7;
const PATCH_STITCH_LENGTH = 9;
const PATCH_STITCH_WEIGHT = 2;
const PATCH_STITCH_COLOR = "#ffffff";
const MOBILE_BREAKPOINT = 640;
const DESKTOP_BASE_SHORT_SIDE = 720;
const PHONE_MIN_TAP_SIZE = 44;

//Phase 1 triangle data
const ARROW_COUNT = 14;
const ARROW_SPEED = 3.2;
const ARROW_MARGIN = 80;
const ARROW_LENGTH = 92;
const ARROW_HEAD = 18;
const ARROW_STROKE = 6;
const TRIANGLE_COLOR = "#FED602";
const TRIANGLE_SHADOW_COLOR = 255;
const TRIANGLE_SHADOW_ALPHA = 220;
const TRIANGLE_SHADOW_OFFSET_X = 10;
const TRIANGLE_SHADOW_OFFSET_Y = 12;
const TRIANGLE_PARTICLE_MAX = 320;
const TRIANGLE_PARTICLE_SPAWN_CHANCE = 0.62;
const TRIANGLE_PARTICLE_LIFE = 52;
const TRIANGLE_PARTICLE_SIZE_MIN = 6;
const TRIANGLE_PARTICLE_SIZE_MAX = 50;
const TRIANGLE_PARTICLE_ALPHA = 110;
const TRIANGLE_PARTICLE_COLORS = ["#ffffff", "#1DD9DB", "#2c15fe"];
const MOUSE_CLICK_SFX_PATHS = [
  "sound/click1.wav",
  "sound/click2.wav",
  "sound/click3.wav",
];
const MOUSE_CLICK_SFX_VOLUME = 1.0;
const PATCH_ZIP_SFX_PATHS = [
  "sound/sew.wav",
];
const PATCH_ZIP_SFX_VOLUME = 0.5;
const PHASE_ONE_ZIP_SFX_PATHS = [
  "sound/zip1.wav",
  "sound/zip2.wav",
  "sound/zip3.wav",
];
const PHASE_ONE_ZIP_SFX_VOLUME = 0.5;
const PHASE_THREE_POP_SFX_PATHS = [
  "sound/pop1.wav",
  "sound/pop2.wav",
];
const PHASE_THREE_POP_SFX_VOLUME = 1.0;
const PHASE_TRANSITION_SFX_PATH = "sound/transistion.wav";
const PHASE_TRANSITION_SFX_VOLUME = 1.0;
const EARTH_TEAR_SFX_PATHS = [
  "sound/face_mask_tear.wav",
  "sound/face_mask_tear2.wav",
];
const EARTH_TEAR_SFX_VOLUME = 1.0;
const TEXT_POPUP_SFX_PATH = "../Hoang/designed-sounds/text-popup.wav";
const TEXT_POPUP_SFX_VOLUME = 0.76;
const TEXT_POPUP_SFX_POOL_SIZE = 3;
const TEXT_POPUP_SFX_MIN_INTERVAL = 120;
const PATTERN_HOVER_SFX_COOLDOWN = 180;

// Cached random notch directions for the current render.
let notchAngles = [];
let scrollPhase = 0;
let scrollPhaseProgress = 0;
let arrowSeeds = [];
let circleSize = 0;
let circlePoints = [];
let circleCacheDirty = true;
let earthLandSpecs = [];
let triangleParticles = [];
let triangleParticlePalette = [];
let stageTwoRects = [];
let referencePatternNoiseLayer;
let smokeLayer;
let smokeOffset;
let lastPhase = -1;
let pulseAmount = 0;
let pulseScale = 1;
let patchedNotches = [];
let circleStage = 0;
let smallTriangles = [];
let sceneOffsetY = 0;
let fallingRects = [];
let currentFallingRectCount = null;
let finalPatternFallStarted = false;
let currentSceneDrawOffsetY = 0;
let corodeShapeOriginX = 0;
let corodeShapeOriginY = 0;
let corodeShapeScale = 1;
let corodeMouseHasMoved = false;
let mouseClickSounds = [];
let patchZipSounds = [];
let phaseOneZipSounds = [];
let phaseThreePopSounds = [];
let earthTearSounds = [];
let textPopupSounds = [];
let heartbeatSounds = [];
let activeHeartbeatSound = null;
let heartbeatPulseLevel = 0;
let heartbeatPulseEnvelope = 0;
let heartbeatStarted = false;
let activeHeartbeatPhase = -1;
let phaseTransitionSound = null;
let phaseThreeExplosionStartTime = -Infinity;
let phaseOneOverlayRevealStartTime = -Infinity;
let phaseOneTextIndex = 0;
let phaseTwoTextIndex = 0;
let finalPhaseTextIndex = 0;
let postPatchTextIndex = 0;
let activeTextBoxState = null;
let previousTextBoxState = null;
let textBoxTransitionStartTime = -Infinity;
let textPopupSoundIndex = 0;
let lastTextPopupSfxTime = -Infinity;
let lastPatternHoverSfxTime = -Infinity;
let hoveredPatternRect = null;
let isDraggingScrollTracker = false;
let lastTouchStartedTime = -Infinity;
let lastTouchY = null;
let lastScrollInputTime = -Infinity;
let scrollSnapStartY = 0;
let scrollSnapTargetY = 0;
let scrollSnapStartTime = -Infinity;
let isScrollSnapping = false;
let restartButton = null;

function getViewportWidth() {
  const candidates = [
    document.documentElement.clientWidth,
    window.innerWidth,
    window.visualViewport && window.visualViewport.width,
    window.outerWidth,
    windowWidth,
  ].filter((value) => Number.isFinite(value) && value > 0);
  return floor(Math.min(...candidates));
}

function getViewportHeight() {
  const candidates = [
    document.documentElement.clientHeight,
    window.innerHeight,
    window.visualViewport && window.visualViewport.height,
    window.outerHeight,
    windowHeight,
  ].filter((value) => Number.isFinite(value) && value > 0);
  return floor(Math.min(...candidates));
}

function getShortSide() {
  return min(width || getViewportWidth(), height || getViewportHeight());
}

function isPhoneLayout() {
  return getShortSide() <= MOBILE_BREAKPOINT;
}

function getResponsiveScale(minScale, maxScale) {
  const scale = getShortSide() / DESKTOP_BASE_SHORT_SIDE;
  return constrain(scale, minScale, maxScale);
}

function getCanvasWidth() {
  return max(1, getViewportWidth());
}

function getCanvasHeight() {
  return max(1, getViewportHeight());
}

function getCircleSize() {
  const shortSide = getShortSide();
  const ratio = isPhoneLayout() ? 0.46 : 0.30;
  return constrain(shortSide * ratio, 118, shortSide * 0.54);
}

function getScaled(value, minScale, maxScale) {
  return value * getResponsiveScale(minScale, maxScale);
}

function resetResponsiveSceneAssets() {
  arrowSeeds = buildArrowSeeds();
  circleSize = getCircleSize();
  circleCacheDirty = true;
  earthLandSpecs = buildEarthLandSpecs();
  stageTwoRects = buildStageTwoRects();
  referencePatternNoiseLayer = initReferencePatternBackdrop();
  smokeLayer = buildSmokeLayer();
  smallTriangles = buildSmallTriangles();
  currentFallingRectCount = chooseFallingRectCount();
  fallingRects = buildFallingRects();
}

function preload() {
  mouseClickSounds = [];
  for (const soundPath of MOUSE_CLICK_SFX_PATHS) {
    mouseClickSounds.push(createNativeSound(soundPath));
  }
  patchZipSounds = [];
  for (const soundPath of PATCH_ZIP_SFX_PATHS) {
    patchZipSounds.push(createNativeSound(soundPath));
  }
  phaseOneZipSounds = [];
  for (const soundPath of PHASE_ONE_ZIP_SFX_PATHS) {
    phaseOneZipSounds.push(createNativeSound(soundPath));
  }
  phaseThreePopSounds = [];
  for (const soundPath of PHASE_THREE_POP_SFX_PATHS) {
    phaseThreePopSounds.push(createNativeSound(soundPath));
  }
  earthTearSounds = [];
  for (const soundPath of EARTH_TEAR_SFX_PATHS) {
    earthTearSounds.push(createNativeSound(soundPath));
  }
  textPopupSounds = [];
  for (let i = 0; i < TEXT_POPUP_SFX_POOL_SIZE; i += 1) {
    textPopupSounds.push(createNativeSound(TEXT_POPUP_SFX_PATH));
  }
  heartbeatSounds = [];
  for (const heartbeatPath of HEARTBEAT_PHASE_TRACKS) {
    heartbeatSounds.push(createNativeSound(heartbeatPath));
  }
  phaseTransitionSound = createNativeSound(PHASE_TRANSITION_SFX_PATH);
}

function setup() {
  const canvas = createCanvas(getCanvasWidth(), getCanvasHeight());
  pixelDensity(1);
  canvas.style("position", "fixed");
  canvas.style("top", "0");
  canvas.style("left", "0");
  canvas.style("width", "100vw");
  canvas.style("height", "100dvh");
  canvas.style("pointer-events", "auto");
  canvas.style("touch-action", "pan-y");
  noStroke();
  notchAngles = buildRandomNotchAngles(MAX_NOTCHES);
  triangleParticlePalette = TRIANGLE_PARTICLE_COLORS.map((value) => color(value));
  resetResponsiveSceneAssets();
  smokeOffset = createVector(0, 0);
  initHeartbeatPulse();
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportResize);
  }
  window.addEventListener("wheel", handleDesktopWheel, { passive: false });
  createRestartButton();
  setScrollHeight();
  resetScrollToPhaseOneCover();
}

function draw() {
  updateScrollSnap();
  updateScrollState();
  updatePhaseState();
  updatePulse();
  background(BACKGROUND_COLOR);
  drawReferencePatternBackdrop();
  drawSmokeBackground();
  sceneOffsetY = getSceneOffsetY(scrollPhase);

  if (getSceneAlpha(0) <= 0 && triangleParticles.length > 0) {
    triangleParticles = [];
  }

  for (let phase = 0; phase < SCROLL_PHASES; phase += 1) {
    drawSceneForPhase(phase, getSceneAlpha(phase));
  }

  if (circleCacheDirty) {
    circlePoints = buildDecayedCirclePoints(circleSize, circleStage);
    circleCacheDirty = false;
  }

  drawPhaseOneFocusOverlay();
  drawEarthPulseRing();

  // Shadow pass (same chipped silhouette, offset).
  fill(SHADOW_COLOR, SHADOW_ALPHA);
  push();
  translate(width / 2 + SHADOW_OFFSET_X, height / 2 + SHADOW_OFFSET_Y);
  scale(pulseScale);
  setCorodeShapeSpace(width / 2 + SHADOW_OFFSET_X, height / 2 + SHADOW_OFFSET_Y, pulseScale);
  drawChippedCircle(circlePoints);
  const patchAlpha = getSceneAlpha(FINAL_PHASE);
  if (patchAlpha > 0) {
    withAlpha(patchAlpha, () => {
      drawPatchedNotches(circleSize * 0.5, SHADOW_COLOR, SHADOW_ALPHA);
    });
  }
  pop();

  // Main circle pass.
  push();
  translate(width / 2, height / 2);
  scale(pulseScale);
  setCorodeShapeSpace(width / 2, height / 2, pulseScale);
  drawEarthChippedCircle(circlePoints, circleSize * 0.5);
  if (patchAlpha > 0) {
    withAlpha(patchAlpha, () => {
      drawPatchedNotches(circleSize * 0.5, CIRCLE_COLOR, 255);
    });
  }
  pop();
  resetCorodeShapeSpace();

  drawPhaseOneClickPrompt();
  drawScrollTracker();
  drawTopTextBox();
  updateRestartButtonVisibility();
}

function windowResized() {
  handleViewportResize();
}

function handleViewportResize() {
  cancelScrollSnap();
  resizeCanvas(getCanvasWidth(), getCanvasHeight());
  resetResponsiveSceneAssets();
  setScrollHeight();
}

function createRestartButton() {
  if (restartButton) {
    return;
  }

  restartButton = document.createElement("button");
  restartButton.type = "button";
  restartButton.textContent = "restart";
  restartButton.setAttribute("aria-label", "Restart sketch");
  restartButton.style.position = "fixed";
  restartButton.style.top = "18px";
  restartButton.style.left = "50%";
  restartButton.style.transform = "translateX(-50%)";
  restartButton.style.zIndex = "20";
  restartButton.style.padding = "8px 18px";
  restartButton.style.border = "3px solid #FED602";
  restartButton.style.background = "#000000";
  restartButton.style.color = "#ffffff";
  restartButton.style.font = "700 18px 'Averia Sans Libre', sans-serif";
  restartButton.style.cursor = "pointer";
  restartButton.style.boxShadow = "4px 4px 0 #FE1595";
  restartButton.style.textTransform = "uppercase";
  restartButton.style.letterSpacing = "0";
  restartButton.style.opacity = "0";
  restartButton.style.pointerEvents = "none";
  restartButton.style.transition = "opacity 800ms ease-in-out";

  const stopSketchPointer = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  restartButton.addEventListener("pointerdown", stopSketchPointer);
  restartButton.addEventListener("pointerup", restartProject);
  restartButton.addEventListener("mousedown", stopSketchPointer);
  restartButton.addEventListener("touchstart", stopSketchPointer);
  restartButton.addEventListener("touchend", restartProject);
  restartButton.addEventListener("click", restartProject);

  document.body.appendChild(restartButton);
}

function restartProject(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  sessionStorage.setItem(RESTART_SCROLL_RESET_KEY, "1");
  window.scrollTo(0, 0);
  window.location.reload();
}

function updateRestartButtonVisibility() {
  if (!restartButton) {
    return;
  }

  const shouldShow = isPostPatchTextSequenceComplete();
  restartButton.style.opacity = shouldShow ? "1" : "0";
  restartButton.style.pointerEvents = shouldShow ? "auto" : "none";
}

function resetScrollToPhaseOneCover() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  if (sessionStorage.getItem(RESTART_SCROLL_RESET_KEY) === "1") {
    sessionStorage.removeItem(RESTART_SCROLL_RESET_KEY);
  }

  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
}

function mousePressed() {
  if (millis() - lastTouchStartedTime < 350) {
    return false;
  }
  return handlePointerPressed(mouseX, mouseY);
}

function touchStarted() {
  lastTouchStartedTime = millis();
  const point = getPrimaryTouchPoint();
  if (!point) {
    return true;
  }
  lastTouchY = point.y;
  return handlePointerPressed(point.x, point.y);
}

function handlePointerPressed(pointerX, pointerY) {
  corodeMouseHasMoved = true;
  startHeartbeatPulse();
  playMouseClickSfx();

  if (isPointInScrollTracker(pointerX, pointerY)) {
    if (!canScrollCurrentPhase()) {
      return false;
    }
    isDraggingScrollTracker = true;
    markScrollInput();
    updateScrollFromTracker(pointerY);
    return false;
  }

  if (scrollPhase === 0) {
    if (getPhaseOneOverlayRevealProgress() < 1) {
      startPhaseOneOverlayReveal();
      playPhaseOneZipSfx();
    } else {
      advancePhaseOneText();
    }
    return false;
  }

  if (scrollPhase === 1 && getPatternRectAt(pointerX, pointerY)) {
    playPhaseTransitionSfx();
    return false;
  }

  if (scrollPhase === 1) {
    advancePhaseTwoText();
    return false;
  }

  if (scrollPhase !== FINAL_PHASE || circleSize <= 0) {
    return true;
  }

  if (!isFinalPhaseTextSequenceComplete()) {
    advanceFinalPhaseText();
    return false;
  }

  if (isPostPatchSequenceActive()) {
    advancePostPatchText();
    return false;
  }

  if (!finalPatternFallStarted) {
    return true;
  }

  const clickedRect = getFallingRectAt(pointerX, pointerY);
  if (!clickedRect) {
    return true;
  }

  applyPatternPatch(clickedRect);
  return false;
}

function mouseMoved() {
  corodeMouseHasMoved = true;
  updatePatternRectHoverSfx(mouseX, mouseY);
}

function mouseDragged() {
  corodeMouseHasMoved = true;
  if (isDraggingScrollTracker) {
    if (!canScrollCurrentPhase()) {
      return false;
    }
    markScrollInput();
    updateScrollFromTracker(mouseY);
    return false;
  }
  return true;
}

function touchMoved() {
  const point = getPrimaryTouchPoint();
  if (!point) {
    return false;
  }

  corodeMouseHasMoved = true;
  updatePatternRectHoverSfx(point.x, point.y);
  if (isDraggingScrollTracker) {
    if (!canScrollCurrentPhase()) {
      lastTouchY = point.y;
      return false;
    }
    markScrollInput();
    updateScrollFromTracker(point.y);
    lastTouchY = point.y;
    return false;
  }

  if (isPhoneLayout() && lastTouchY !== null) {
    if (!canScrollCurrentPhase()) {
      lastTouchY = point.y;
      return false;
    }
    markScrollInput();
    window.scrollBy({
      top: (lastTouchY - point.y) * PHONE_TOUCH_SCROLL_SPEED,
      left: 0,
      behavior: "auto",
    });
    lastTouchY = point.y;
    return false;
  }

  lastTouchY = point.y;
  return true;
}

function handleDesktopWheel(event) {
  if (isPhoneLayout()) {
    return;
  }

  event.preventDefault();
  if (!canScrollCurrentPhase()) {
    return;
  }
  markScrollInput();
  const deltaUnit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
  window.scrollBy({
    top: event.deltaY * deltaUnit * DESKTOP_WHEEL_SCROLL_SPEED,
    left: 0,
    behavior: "auto",
  });
}

function canScrollCurrentPhase() {
  if (scrollPhase === 0) {
    return isPhaseOneTextSequenceComplete();
  }

  if (scrollPhase === 1) {
    return isPhaseTwoTextSequenceComplete();
  }

  return true;
}

function mouseReleased() {
  isDraggingScrollTracker = false;
}

function touchEnded() {
  isDraggingScrollTracker = false;
  lastTouchY = null;
  markScrollInput();
  return false;
}

function markScrollInput() {
  lastScrollInputTime = millis();
  cancelScrollSnap();
}

function cancelScrollSnap() {
  isScrollSnapping = false;
  scrollSnapStartTime = -Infinity;
}

function updateScrollSnap() {
  if (isScrollSnapping) {
    updateActiveScrollSnap();
    return;
  }

  if (!Number.isFinite(lastScrollInputTime) || millis() - lastScrollInputTime < SCROLL_SNAP_IDLE_TIME) {
    return;
  }

  if (isDraggingScrollTracker || touches.length > 0) {
    return;
  }

  const scrollY = window.scrollY || window.pageYOffset || 0;
  const targetY = getNearestPhaseSnapScrollY(scrollY);
  if (abs(targetY - scrollY) <= SCROLL_SNAP_MIN_DISTANCE) {
    return;
  }

  startScrollSnap(targetY);
}

function startScrollSnap(targetY) {
  scrollSnapStartY = window.scrollY || window.pageYOffset || 0;
  scrollSnapTargetY = constrain(targetY, 0, getScrollableHeight());
  scrollSnapStartTime = millis();
  isScrollSnapping = true;
}

function updateActiveScrollSnap() {
  const elapsed = millis() - scrollSnapStartTime;
  const progress = constrain(elapsed / SCROLL_SNAP_DURATION, 0, 1);
  const easedProgress = smoothTransition(0, 1, progress);
  const nextY = lerp(scrollSnapStartY, scrollSnapTargetY, easedProgress);

  window.scrollTo({
    top: nextY,
    left: 0,
    behavior: "auto",
  });

  if (progress >= 1) {
    window.scrollTo({
      top: scrollSnapTargetY,
      left: 0,
      behavior: "auto",
    });
    cancelScrollSnap();
    lastScrollInputTime = -Infinity;
  }
}

function getPrimaryTouchPoint() {
  if (!touches || touches.length === 0) {
    return null;
  }

  return {
    x: touches[0].x,
    y: touches[0].y,
  };
}

function isPointInScrollTracker(x, y) {
  if (!SHOW_SCROLL_TRACKER) {
    return false;
  }

  const metrics = getScrollTrackerMetrics();
  const hitPadX = isPhoneLayout() ? PHONE_MIN_TAP_SIZE : 18;
  const hitPadY = isPhoneLayout() ? 32 : 28;
  return (
    x >= metrics.barX - hitPadX
    && x <= metrics.barX + metrics.barW + hitPadX
    && y >= metrics.barY - hitPadY
    && y <= metrics.barY + metrics.barH + hitPadY + 20
  );
}

function updateScrollFromTracker(y) {
  const metrics = getScrollTrackerMetrics();
  const progress = constrain((y - metrics.barY) / metrics.barH, 0, 1);
  window.scrollTo({
    top: getScrollableHeight() * progress,
    left: 0,
    behavior: "auto",
  });
}

function updatePatternRectHoverSfx(pointerX, pointerY) {
  const rectData = getPatternRectAt(pointerX, pointerY);
  if (!rectData) {
    hoveredPatternRect = null;
    return;
  }

  const now = millis();
  if (rectData === hoveredPatternRect && now - lastPatternHoverSfxTime < PATTERN_HOVER_SFX_COOLDOWN) {
    return;
  }

  hoveredPatternRect = rectData;
  lastPatternHoverSfxTime = now;
  playPhaseTransitionSfx();
}

function isPointInEarth(pointerX, pointerY) {
  const radius = circleSize * 0.5 * pulseScale;
  return dist(pointerX, pointerY, width / 2, height / 2) <= radius;
}

function startPhaseOneOverlayReveal() {
  if (getPhaseOneOverlayRevealProgress() >= 1) {
    return;
  }

  if (!Number.isFinite(phaseOneOverlayRevealStartTime)) {
    phaseOneOverlayRevealStartTime = millis();
  }
}

function advancePhaseOneText() {
  phaseOneTextIndex = min(phaseOneTextIndex + 1, PHASE_ONE_TEXT_SEQUENCE.length - 1);
}

function advancePhaseTwoText() {
  phaseTwoTextIndex = min(phaseTwoTextIndex + 1, PHASE_TWO_TEXT_SEQUENCE.length - 1);
}

function advanceFinalPhaseText() {
  finalPhaseTextIndex = min(finalPhaseTextIndex + 1, FINAL_PHASE_TEXT_SEQUENCE.length - 1);
}

function advancePostPatchText() {
  postPatchTextIndex = min(postPatchTextIndex + 1, POST_PATCH_TEXT_SEQUENCE.length - 1);
}

function getPatternRectAt(x, y) {
  if (scrollPhase !== 1 || stageTwoRects.length === 0) {
    return null;
  }

  const offsetY = getSceneOffsetY(1);
  for (let i = stageTwoRects.length - 1; i >= 0; i -= 1) {
    const rectData = stageTwoRects[i];
    const rectPosition = getCorodeScenePoint(rectData.x, rectData.y);
    const halfW = rectData.w * 0.5;
    const halfH = rectData.h * 0.5;

    if (
      abs(x - rectPosition.x) <= halfW
      && abs(y - (rectPosition.y + offsetY)) <= halfH
    ) {
      return rectData;
    }
  }

  return null;
}

function createNativeSound(path) {
  const audio = new Audio(path);
  audio.preload = "auto";

  return {
    audio,
    isLoaded() {
      return true;
    },
    isPlaying() {
      return !audio.paused && !audio.ended;
    },
    setVolume(volume, fadeTime) {
      const targetVolume = constrain(volume, 0, 1);
      if (!fadeTime || fadeTime <= 0) {
        audio.volume = targetVolume;
        return;
      }

      const startVolume = audio.volume;
      const startTime = performance.now();
      const durationMs = fadeTime * 1000;
      const fade = () => {
        const amount = constrain((performance.now() - startTime) / durationMs, 0, 1);
        audio.volume = lerp(startVolume, targetVolume, amount);
        if (amount < 1) {
          requestAnimationFrame(fade);
        }
      };
      fade();
    },
    setRate(rate) {
      audio.playbackRate = rate;
    },
    play() {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {});
      }
    },
    stop() {
      audio.pause();
      audio.currentTime = 0;
    },
    loop() {
      audio.loop = true;
      const playPromise = audio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {});
      }
    },
    jump(timeValue) {
      audio.currentTime = constrain(timeValue, 0, this.duration());
    },
    duration() {
      return Number.isFinite(audio.duration) ? audio.duration : 0;
    },
    currentTime() {
      return audio.currentTime || 0;
    },
  };
}

function initHeartbeatPulse() {
  for (const sound of heartbeatSounds) {
    if (sound) {
      sound.setVolume(HEARTBEAT_SFX_VOLUME);
    }
  }
  setActiveHeartbeatForPhase(scrollPhase);
}

function startHeartbeatPulse() {
  setActiveHeartbeatForPhase(scrollPhase);

  if (!activeHeartbeatSound || heartbeatStarted || !activeHeartbeatSound.isLoaded()) {
    return;
  }

  startHeartbeatSoundAtProgress(activeHeartbeatSound, 0, false);
  heartbeatStarted = true;
}

function updateHeartbeatPhaseTrack() {
  if (!heartbeatStarted) {
    setActiveHeartbeatForPhase(scrollPhase);
    return;
  }

  const previousSound = activeHeartbeatSound;
  const nextSound = getHeartbeatSoundForPhase(scrollPhase);
  if (!nextSound || nextSound === previousSound) {
    return;
  }

  const progress = getHeartbeatSoundProgress(previousSound);
  fadeOutHeartbeatSound(previousSound);

  setActiveHeartbeatForPhase(scrollPhase);
  heartbeatPulseEnvelope = 0;
  heartbeatPulseLevel = 0;

  if (activeHeartbeatSound.isLoaded()) {
    startHeartbeatSoundAtProgress(activeHeartbeatSound, progress, true);
  }
}

function getHeartbeatSoundProgress(sound) {
  if (!sound || !sound.isLoaded() || sound.duration() <= 0) {
    return 0;
  }

  return constrain(sound.currentTime() / sound.duration(), 0, 1);
}

function startHeartbeatSoundAtProgress(sound, progress, fadeIn) {
  if (!sound || !sound.isLoaded()) {
    return;
  }

  sound.setVolume(fadeIn ? 0 : HEARTBEAT_SFX_VOLUME);
  sound.setRate(getHeartbeatPlaybackRate(activeHeartbeatPhase));
  sound.loop();

  const duration = sound.duration();
  if (duration > 0 && progress > 0) {
    sound.jump((progress % 1) * duration);
  }

  if (fadeIn) {
    sound.setVolume(HEARTBEAT_SFX_VOLUME, HEARTBEAT_CROSSFADE_TIME);
  }
}

function getHeartbeatPlaybackRate(phase) {
  return HEARTBEAT_PLAYBACK_RATES[constrain(phase, 0, HEARTBEAT_PLAYBACK_RATES.length - 1)] || 1;
}

function fadeOutHeartbeatSound(sound) {
  if (!sound || !sound.isPlaying()) {
    return;
  }

  sound.setVolume(0, HEARTBEAT_CROSSFADE_TIME);
  setTimeout(() => {
    if (sound && sound.isPlaying() && sound !== activeHeartbeatSound) {
      sound.stop();
      sound.setVolume(HEARTBEAT_SFX_VOLUME);
    }
  }, HEARTBEAT_CROSSFADE_TIME * 1000 + 40);
}

function setActiveHeartbeatForPhase(phase) {
  const sound = getHeartbeatSoundForPhase(phase);
  if (!sound) {
    return;
  }

  activeHeartbeatSound = sound;
  activeHeartbeatPhase = phase;
}

function getHeartbeatSoundForPhase(phase) {
  if (!heartbeatSounds || heartbeatSounds.length === 0) {
    return null;
  }

  return heartbeatSounds[constrain(phase, 0, heartbeatSounds.length - 1)];
}

function playMouseClickSfx() {
  if (!mouseClickSounds || mouseClickSounds.length === 0) {
    return;
  }

  const clickSound = random(mouseClickSounds);
  if (!clickSound || !clickSound.isLoaded()) {
    return;
  }

  clickSound.setVolume(MOUSE_CLICK_SFX_VOLUME);
  if (clickSound.isPlaying()) {
    clickSound.stop();
  }
  clickSound.play();
}

function playPatchZipSfx() {
  if (!patchZipSounds || patchZipSounds.length === 0) {
    return;
  }

  const zipSound = random(patchZipSounds);
  if (!zipSound || !zipSound.isLoaded()) {
    return;
  }

  zipSound.setVolume(PATCH_ZIP_SFX_VOLUME);
  if (zipSound.isPlaying()) {
    zipSound.stop();
  }
  zipSound.play();
}

function playPhaseOneZipSfx() {
  if (!phaseOneZipSounds || phaseOneZipSounds.length === 0) {
    return;
  }

  const zipSound = random(phaseOneZipSounds);
  if (!zipSound || !zipSound.isLoaded()) {
    return;
  }

  zipSound.setVolume(PHASE_ONE_ZIP_SFX_VOLUME);
  if (zipSound.isPlaying()) {
    zipSound.stop();
  }
  zipSound.play();
}

function playPhaseThreePopSfx() {
  if (!phaseThreePopSounds || phaseThreePopSounds.length === 0) {
    return;
  }

  const popSound = random(phaseThreePopSounds);
  if (!popSound || !popSound.isLoaded()) {
    return;
  }

  popSound.setVolume(PHASE_THREE_POP_SFX_VOLUME);
  if (popSound.isPlaying()) {
    popSound.stop();
  }
  popSound.play();
}

function playEarthTearSfx() {
  if (!earthTearSounds || earthTearSounds.length === 0) {
    return;
  }

  const tearSound = random(earthTearSounds);
  if (!tearSound || !tearSound.isLoaded()) {
    return;
  }

  tearSound.setVolume(EARTH_TEAR_SFX_VOLUME);
  if (tearSound.isPlaying()) {
    tearSound.stop();
  }
  tearSound.play();
}

function isPreviewMode() {
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

function playParentTextPopupSfx() {
  try {
    if (window.parent && window.parent !== window && window.parent.SFX) {
      window.parent.SFX.play("gartText");
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}

function playTextPopupSfx() {
  if (isPreviewMode()) {
    return;
  }

  const now = millis();
  if (now - lastTextPopupSfxTime < TEXT_POPUP_SFX_MIN_INTERVAL) {
    return;
  }

  lastTextPopupSfxTime = now;

  if (playParentTextPopupSfx()) {
    return;
  }

  if (!textPopupSounds || textPopupSounds.length === 0) {
    return;
  }

  const textSound = textPopupSounds[textPopupSoundIndex % textPopupSounds.length];
  textPopupSoundIndex = (textPopupSoundIndex + 1) % textPopupSounds.length;
  if (!textSound || !textSound.isLoaded()) {
    return;
  }

  textSound.setVolume(TEXT_POPUP_SFX_VOLUME);
  if (textSound.isPlaying()) {
    textSound.stop();
  }
  textSound.play();
}

function setScrollHeight() {
  const totalHeight = getTotalPhasePixelHeight();
  document.body.style.height = `${totalHeight}px`;
}

function updateScrollState() {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  let offset = 0;
  let activePhase = 0;

  for (let i = 0; i < SCROLL_PHASES; i += 1) {
    const phaseHeight = getPhasePixelHeight(i);
    if (scrollY < offset + phaseHeight) {
      activePhase = i;
      scrollPhaseProgress = (scrollY - offset) / phaseHeight;
      break;
    }
    offset += phaseHeight;
  }

  scrollPhase = constrain(activePhase, 0, SCROLL_PHASES - 1);
}

function getPhaseHeight(phase) {
  if (phase < 0 || phase >= PHASE_HEIGHTS.length) {
    return 1;
  }
  return PHASE_HEIGHTS[phase];
}

function getPhasePixelHeight(phase) {
  const phasePixels = isPhoneLayout() ? PHONE_PHASE_HEIGHT_PIXELS : PHASE_HEIGHT_PIXELS;
  if (
    phase >= 0
    && phase < phasePixels.length
    && phasePixels[phase] !== null
  ) {
    return phasePixels[phase];
  }

  return height * getPhaseHeight(phase);
}

function getPhaseStartScrollY(phase) {
  let phaseStart = 0;
  for (let i = 0; i < phase; i += 1) {
    phaseStart += getPhasePixelHeight(i);
  }
  return constrain(phaseStart, 0, getScrollableHeight());
}

function getPhaseSnapScrollY(phase) {
  const phaseStart = getPhaseStartScrollY(phase);
  if (phase <= 0) {
    return phaseStart;
  }

  const snapProgress = phase === 1 ? PHASE_TWO_TEXTBOX_FADE_END : SCENE_TRANSITION_WINDOW;
  return constrain(
    phaseStart + getPhasePixelHeight(phase) * snapProgress,
    0,
    getScrollableHeight()
  );
}

function getNearestPhaseSnapScrollY(scrollY) {
  let nearestY = 0;
  let nearestDistance = Infinity;

  for (let phase = 0; phase < SCROLL_PHASES; phase += 1) {
    const phaseSnapY = getPhaseSnapScrollY(phase);
    const distanceToPhase = abs(scrollY - phaseSnapY);
    if (distanceToPhase < nearestDistance) {
      nearestDistance = distanceToPhase;
      nearestY = phaseSnapY;
    }
  }

  return nearestY;
}

function getTotalPhaseHeight() {
  let total = 0;
  for (let i = 0; i < SCROLL_PHASES; i += 1) {
    total += getPhaseHeight(i);
  }
  return total;
}

function getTotalPhasePixelHeight() {
  let total = 0;
  for (let i = 0; i < SCROLL_PHASES; i += 1) {
    total += getPhasePixelHeight(i);
  }
  return total;
}

function getPhaseOffsetY() {
  return lerp(PHASE_SCROLL_SHIFT, -PHASE_SCROLL_SHIFT, scrollPhaseProgress);
}

function getSceneAlpha(phase) {
  const windowSize = SCENE_TRANSITION_WINDOW;
  if (phase === scrollPhase) {
    const fadeIn = scrollPhase === 0 ? 1 : smoothTransition(0, windowSize, scrollPhaseProgress);
    const fadeOut = scrollPhase === SCROLL_PHASES - 1
      ? 1
      : 1 - smoothTransition(1 - windowSize, 1, scrollPhaseProgress);
    return constrain(min(fadeIn, fadeOut), 0, 1);
  }

  return 0;
}

function getSceneOffsetY(phase) {
  if (phase === scrollPhase) {
    return getPhaseOffsetY();
  }

  return 0;
}

function drawSceneForPhase(phase, alphaValue) {
  if (alphaValue <= 0) {
    return;
  }

  withAlpha(alphaValue, () => {
    currentSceneDrawOffsetY = getSceneOffsetY(phase);
    translate(0, currentSceneDrawOffsetY);

    if (phase === 0) {
      drawPhaseOneArrows();
    } else if (phase === 1) {
      drawStageTwoRects();
      drawPhaseTwoThreeTriangles(1);
    } else if (phase === 2) {
      drawPhaseThreeExplodingParticles();
      drawFinalPhaseFallingRects();
    }
    currentSceneDrawOffsetY = 0;
  });
}

// Corode wave helpers live in corode-effect.js.

function withAlpha(alphaValue, drawCallback) {
  push();
  drawingContext.save();
  drawingContext.globalAlpha *= constrain(alphaValue, 0, 1);
  drawCallback();
  drawingContext.restore();
  pop();
}

function smoothTransition(edge0, edge1, value) {
  const amount = constrain((value - edge0) / max(0.0001, edge1 - edge0), 0, 1);
  return amount * amount * (3 - 2 * amount);
}

// Background texture helpers live in background-effects.js.

function updatePhaseState() {
  const nextCircleStage = getSmoothCircleStage();
  if (abs(nextCircleStage - circleStage) > 0.001) {
    if (floor(nextCircleStage) > floor(circleStage)) {
      playEarthTearSfx();
    }
    circleStage = nextCircleStage;
    circleCacheDirty = true;
  }

  updateHeartbeatPhaseTrack();

  if (scrollPhase === lastPhase) {
    return;
  }

  if (scrollPhase === FINAL_PHASE) {
    const radius = circleSize * 0.5;
    const notchCount = getCircleDecayNotches(circleStage, radius).length;
    if (patchedNotches.length !== notchCount) {
      patchedNotches = new Array(notchCount).fill(null);
    }
    pulseAmount = 1;
    smallTriangles = buildSmallTriangles();
    phaseThreeExplosionStartTime = -Infinity;
    finalPatternFallStarted = false;
    finalPhaseTextIndex = 0;
    postPatchTextIndex = 0;
  } else {
    pulseAmount = 1;
  }

  if (scrollPhase === 1) {
    phaseTwoTextIndex = 0;
  }

  lastPhase = scrollPhase;
}

function playPhaseTransitionSfx() {
  if (!phaseTransitionSound || !phaseTransitionSound.isLoaded()) {
    return;
  }

  phaseTransitionSound.setVolume(PHASE_TRANSITION_SFX_VOLUME);
  if (phaseTransitionSound.isPlaying()) {
    phaseTransitionSound.stop();
  }
  phaseTransitionSound.play();
}

function getSmoothCircleStage() {
  const currentStage = getCircleStageForPhase(scrollPhase);
  const nextStage = getCircleStageForPhase(min(scrollPhase + 1, SCROLL_PHASES - 1));
  const transition = smoothTransition(0.55, 1, scrollPhaseProgress);
  return lerp(currentStage, nextStage, transition);
}

function updatePulse() {
  const profile = getBlendedPulseProfile();
  if (!profile) {
    pulseScale = 1;
    return;
  }

  let target = 1;
  if (scrollPhase === FINAL_PHASE) {
    target = 1 - getPatchedRatio();
  }

  pulseAmount = lerp(pulseAmount, target, PULSE_DAMPING);

  const jitter = profile.jitter > 0
    ? 0.7 + 0.6 * noise(frameCount * PULSE_JITTER_SPEED, getContinuousPhase() * 7.4)
    : 1;
  const finalSceneAlpha = getSceneAlpha(FINAL_PHASE);
  const speedFactor = finalSceneAlpha > 0 ? (0.35 + 0.65 * pulseAmount) : 1;
  const speed = profile.speed * speedFactor * jitter;
  const pulse = sin(frameCount * speed);
  const intensity = profile.intensity * (finalSceneAlpha > 0 ? pulseAmount : 1) * jitter;
  const fallbackScale = 1 + pulse * intensity;
  const heartbeatScale = getHeartbeatPulseScale(intensity);
  pulseScale = heartbeatScale || fallbackScale;
}

function getHeartbeatPulseScale(baseIntensity) {
  if (!heartbeatStarted || !activeHeartbeatSound || !activeHeartbeatSound.isPlaying()) {
    return 0;
  }

  const progress = getHeartbeatSoundProgress(activeHeartbeatSound);
  const activeLevel = constrain(getHeartbeatBeatLevel(progress) * HEARTBEAT_PULSE_GAIN, 0, 1);
  heartbeatPulseLevel = activeLevel;
  const envelopeSpeed = activeLevel > heartbeatPulseEnvelope ? HEARTBEAT_ATTACK : HEARTBEAT_RELEASE;
  heartbeatPulseEnvelope = lerp(heartbeatPulseEnvelope, activeLevel, envelopeSpeed);

  if (heartbeatPulseEnvelope <= 0.0001) {
    return 0;
  }

  const curvedLevel = heartbeatPulseEnvelope * heartbeatPulseEnvelope * (3 - 2 * heartbeatPulseEnvelope);
  const scaledLevel = constrain(curvedLevel, 0, baseIntensity * HEARTBEAT_PULSE_MAX_MULTIPLIER);
  return 1 + scaledLevel * (getSceneAlpha(FINAL_PHASE) > 0 ? pulseAmount : 1);
}

function getHeartbeatBeatLevel(progress) {
  const profile = HEARTBEAT_BEAT_PROFILES[constrain(activeHeartbeatPhase, 0, HEARTBEAT_BEAT_PROFILES.length - 1)]
    || HEARTBEAT_BEAT_PROFILES[0];
  let level = 0;

  for (const beat of profile) {
    level = max(level, getLoopBeatPulse(progress, beat.position, beat.width) * beat.weight);
  }

  return level;
}

function getLoopBeatPulse(progress, beatPosition, widthValue) {
  const directDistance = abs(progress - beatPosition);
  const wrappedDistance = min(directDistance, 1 - directDistance);
  const amount = 1 - constrain(wrappedDistance / widthValue, 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function getBlendedPulseProfile() {
  return getPulseProfile(scrollPhase);
}

function mixPulseProfiles(fromProfile, toProfile, amount) {
  if (!fromProfile || !toProfile) {
    return toProfile || fromProfile;
  }

  return {
    speed: lerp(fromProfile.speed, toProfile.speed, amount),
    intensity: lerp(fromProfile.intensity, toProfile.intensity, amount),
    jitter: lerp(fromProfile.jitter, toProfile.jitter, amount),
  };
}

function getPulseProfile(phase) {
  if (phase < 0 || phase >= PULSE_PHASES.length) {
    return null;
  }
  return PULSE_PHASES[phase];
}

function getPatchedRatio() {
  if (patchedNotches.length === 0) {
    return 0;
  }

  let patchedCount = 0;
  for (const patched of patchedNotches) {
    if (patched) {
      patchedCount += 1;
    }
  }

  return patchedCount / patchedNotches.length;
}

// Smoke background helpers live in background-effects.js.

function getContinuousPhase() {
  return constrain(scrollPhase + scrollPhaseProgress, 0, SCROLL_PHASES - 1);
}

function drawScrollTracker() {
  if (!SHOW_SCROLL_TRACKER) {
    return;
  }

  const scrollY = window.scrollY || window.pageYOffset || 0;
  const totalScrollRange = max(1, getScrollableHeight());
  const totalProgress = constrain(scrollY / totalScrollRange, 0, 1);
  const metrics = getScrollTrackerMetrics();
  const { barX, barY, barW, barH } = metrics;
  const thumbY = barY + totalProgress * barH;
  const trackerActive = isDraggingScrollTracker || isPointInScrollTracker(mouseX, mouseY);

  if (!isPhoneLayout()) {
    cursor(trackerActive ? "grab" : ARROW);
  }

  push();
  noStroke();
  fill(0, 0, 0, 120);
  rect(barX - metrics.backdropPadX, barY - 22, metrics.backdropW, barH + 64, 8);

  fill(255, trackerActive ? 95 : 65);
  rect(barX, barY, barW, barH, 4);

  fill(255);
  rect(barX, barY, barW, max(8, barH * totalProgress), 4);

  fill("#FED602");
  ellipse(barX + barW * 0.5, thumbY, metrics.thumbSize, metrics.thumbSize);

  fill(255, 150);
  for (let i = 0; i < SCROLL_PHASES; i += 1) {
    const tickY = barY + (i / max(1, SCROLL_PHASES - 1)) * barH;
    rect(barX - 5, tickY - 1, barW + 10, 2, 1);
  }

  fill(255);
  textFont("Averia Sans Libre");
  textAlign(CENTER, CENTER);
  textSize(metrics.counterTextSize);
  text(`${scrollPhase + 1}/${SCROLL_PHASES}`, barX + barW * 0.5, barY - 11);

  textSize(metrics.cueTextSize);
  const cueAlpha = 130 + 80 * sin(frameCount * 0.08);
  fill(255, cueAlpha);
  text(isPhoneLayout() ? "DRAG" : "SCROLL", barX + barW * 0.5, barY + barH + 18);

  stroke(255, cueAlpha);
  strokeWeight(2);
  line(barX + barW * 0.5, barY + barH + 28, barX + barW * 0.5, barY + barH + 40);
  line(barX + barW * 0.5, barY + barH + 40, barX - 3, barY + barH + 34);
  line(barX + barW * 0.5, barY + barH + 40, barX + barW + 3, barY + barH + 34);
  pop();
}

function getScrollTrackerMetrics() {
  const scaleValue = getResponsiveScale(0.7, 1.15);
  const barW = isPhoneLayout() ? 14 : TRACKER_WIDTH * scaleValue;
  const barH = constrain(height * (isPhoneLayout() ? 0.48 : 0.52), 260, TRACKER_HEIGHT * 1.12);
  const margin = max(isPhoneLayout() ? 18 : TRACKER_MARGIN * scaleValue, window.safeAreaInsets ? window.safeAreaInsets.right : 0);
  const barX = width - margin - barW;
  const barY = (height - barH) * 0.5;

  return {
    barX,
    barY,
    barW,
    barH,
    backdropPadX: isPhoneLayout() ? 16 : 12,
    backdropW: isPhoneLayout() ? 46 : 36,
    thumbSize: isPhoneLayout() ? PHONE_MIN_TAP_SIZE * 0.68 : 22,
    counterTextSize: isPhoneLayout() ? 10 : 11,
    cueTextSize: isPhoneLayout() ? 9 : 10,
  };
}

function drawTopTextBox() {
  let currentState = null;

  for (let phase = 0; phase < SCROLL_PHASES; phase += 1) {
    let alphaValue = getSceneAlpha(phase);
    if (alphaValue <= 0) {
      continue;
    }

    if (phase === 0) {
      alphaValue *= getPhaseOneTextBoxAlpha();
      alphaValue *= getPhaseOneScrollAwayAlpha();
      if (alphaValue <= 0) {
        continue;
      }
    }

    if (phase === 1) {
      alphaValue *= getPhaseTwoTextBoxAlpha();
      if (alphaValue <= 0) {
        continue;
      }
    }

    currentState = {
      key: getTextBoxStateKey(phase),
      message: getTextBoxMessageForPhase(phase),
      promptText: shouldDrawDialoguePrompt(phase) ? getDialoguePromptText(phase) : "",
      alphaValue,
      offsetY: getTextBoxOffsetY(phase),
      phase,
    };
    break;
  }

  updateTextBoxTransitionState(currentState);
  drawTextBoxTransitionState();
}

function getTextBoxStateKey(phase) {
  return `${phase}:${getTextBoxMessageForPhase(phase)}`;
}

function updateTextBoxTransitionState(currentState) {
  if (!currentState) {
    activeTextBoxState = null;
    previousTextBoxState = null;
    return;
  }

  if (!activeTextBoxState || activeTextBoxState.key !== currentState.key) {
    previousTextBoxState = activeTextBoxState;
    activeTextBoxState = currentState;
    textBoxTransitionStartTime = millis();
    playTextPopupSfx();
    return;
  }

  activeTextBoxState = currentState;
}

function drawTextBoxTransitionState() {
  if (!activeTextBoxState) {
    return;
  }

  const transitionProgress = getTextBoxTransitionProgress();
  if (previousTextBoxState && transitionProgress < 1) {
    const previousAlpha = previousTextBoxState.alphaValue * (1 - transitionProgress);
    const previousOffsetY = previousTextBoxState.offsetY - TEXT_BOX_TRANSITION_OFFSET_Y * transitionProgress;
    drawTopTextBoxMessage(
      previousTextBoxState.message,
      previousAlpha,
      previousOffsetY,
      previousTextBoxState.phase,
      previousTextBoxState.promptText
    );
  }

  const currentAlpha = activeTextBoxState.alphaValue * transitionProgress;
  const currentOffsetY = activeTextBoxState.offsetY + TEXT_BOX_TRANSITION_OFFSET_Y * (1 - transitionProgress);
  drawTopTextBoxMessage(
    activeTextBoxState.message,
    currentAlpha,
    currentOffsetY,
    activeTextBoxState.phase,
    activeTextBoxState.promptText
  );

  if (transitionProgress >= 1) {
    previousTextBoxState = null;
  }
}

function getTextBoxTransitionProgress() {
  if (!Number.isFinite(textBoxTransitionStartTime)) {
    return 1;
  }

  const elapsed = millis() - textBoxTransitionStartTime;
  return smoothTransition(0, TEXT_BOX_TRANSITION_TIME, elapsed);
}

function drawTopTextBoxMessage(message, alphaValue, offsetY, phase, promptText = null) {
  const displayMessage = String(message).toUpperCase();
  const scaleValue = getResponsiveScale(0.58, 1);
  const marginX = isPhoneLayout() ? 18 : TEXT_BOX_MARGIN_X * scaleValue;
  const paddingX = max(18, TEXT_BOX_TEXT_PADDING_X * scaleValue);
  const paddingY = max(10, TEXT_BOX_TEXT_PADDING_Y * scaleValue);
  const borderSize = max(2, TEXT_BOX_BORDER * scaleValue);
  const glitchOffset = max(3, TEXT_BOX_GLITCH_OFFSET * scaleValue);
  const maxBoxW = width - marginX * 2 - getScrollTrackerMetrics().backdropW * 0.6;
  push();
  drawingContext.save();
  drawingContext.globalAlpha *= constrain(alphaValue, 0, 1);
  textFont("Averia Sans Libre");
  textAlign(LEFT, CENTER);
  textStyle(BOLD);

  let fontSize = max(isPhoneLayout() ? 18 : 24, TEXT_BOX_TEXT_SIZE * scaleValue);
  textSize(fontSize);
  const minFontSize = isPhoneLayout() ? 10 : 12;
  let textLines = wrapTextBoxMessage(displayMessage, maxBoxW - paddingX * 2);
  while (getMaxTextLineWidth(textLines) > maxBoxW - paddingX * 2 && fontSize > minFontSize) {
    fontSize -= 1;
    textSize(fontSize);
    textLines = wrapTextBoxMessage(displayMessage, maxBoxW - paddingX * 2);
  }

  const lineHeight = fontSize * 1.08;
  const boxW = min(maxBoxW, getMaxTextLineWidth(textLines) + paddingX * 2);
  const boxH = min(TEXT_BOX_HEIGHT * scaleValue, textLines.length * lineHeight + paddingY * 2);
  const boxX = (width - boxW) * 0.5;
  const boxY = height * (1 - TEXT_BOX_BOTTOM_RATIO) - boxH * 0.5 + offsetY;
  const firstTextY = boxY + boxH * 0.5 - (textLines.length - 1) * lineHeight * 0.5;

  rectMode(CORNER);
  noFill();
  strokeWeight(borderSize);
  stroke("#1DD9DB");
  rect(boxX + glitchOffset, boxY + glitchOffset, boxW, boxH);
  stroke("#FE1595");
  rect(boxX + glitchOffset * 0.55, boxY + glitchOffset * 0.35, boxW, boxH);

  fill(0);
  stroke("#FED602");
  strokeWeight(borderSize);
  rect(boxX, boxY, boxW, boxH);

  noStroke();

  const textShadeOffset = max(2, TEXT_BOX_TEXT_SHADE_OFFSET * scaleValue);
  fill(0, TEXT_BOX_TEXT_SHADE_ALPHA);
  for (let i = 0; i < textLines.length; i += 1) {
    text(textLines[i], boxX + paddingX + textShadeOffset, firstTextY + i * lineHeight + textShadeOffset);
  }

  fill("#FE1595");
  for (let i = 0; i < textLines.length; i += 1) {
    text(textLines[i], boxX + paddingX + 3 * scaleValue, firstTextY + i * lineHeight + 3 * scaleValue);
  }
  fill(255);
  for (let i = 0; i < textLines.length; i += 1) {
    text(textLines[i], boxX + paddingX, firstTextY + i * lineHeight);
  }

  const visiblePromptText = promptText !== null
    ? promptText
    : shouldDrawDialoguePrompt(phase) ? getDialoguePromptText(phase) : "";
  if (visiblePromptText) {
    drawDialoguePrompt(visiblePromptText, boxX, boxY, boxW, boxH, alphaValue, scaleValue);
  }

  drawingContext.restore();
  pop();
}

function drawDialoguePrompt(promptText, boxX, boxY, boxW, boxH, alphaValue, scaleValue) {
  const promptFontSize = max(10, min(width, height) * 0.015);
  const promptY = boxY + boxH + 24 * scaleValue;
  const blinkAlpha = 0.25 + 0.75 * (sin(frameCount * PHASE_ONE_CONTINUE_BLINK_SPEED) * 0.5 + 0.5);

  push();
  drawingContext.globalAlpha *= constrain(alphaValue, 0, 1) * blinkAlpha;
  textFont("Averia Sans Libre");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(promptFontSize);
  noStroke();
  fill(SHARED_HINT_COLOR);
  drawingContext.save();
  if ("letterSpacing" in drawingContext) {
    drawingContext.letterSpacing = SHARED_HINT_LETTER_SPACING;
  }
  text(`(${promptText.toUpperCase()})`, boxX + boxW * 0.5, promptY);
  drawingContext.restore();
  pop();
}

function shouldDrawDialoguePrompt(phase) {
  return phase === 0 || phase === 1 || phase === FINAL_PHASE;
}

function getDialoguePromptText(phase) {
  if (phase === 0) {
    return isPhaseOneTextSequenceComplete() ? PHASE_ONE_CONTINUE_PROMPT : getDialogueContinuePromptText();
  }

  if (phase === 1) {
    return isPhaseTwoTextSequenceComplete() ? PHASE_ONE_CONTINUE_PROMPT : getDialogueContinuePromptText();
  }

  if (phase === FINAL_PHASE) {
    if (isPostPatchTextSequenceComplete()) {
      return "";
    }
    if (isPostPatchSequenceActive()) {
      return getDialogueContinuePromptText();
    }
    return isFinalPhaseTextSequenceComplete()
      ? getPatchFiberPromptText()
      : getDialogueContinuePromptText();
  }

  return getDialogueContinuePromptText();
}

function getDialogueContinuePromptText() {
  return isPhoneLayout() ? EARTH_DIALOGUE_TAP_PROMPT : EARTH_DIALOGUE_CLICK_PROMPT;
}

function getPatchFiberPromptText() {
  return isPhoneLayout() ? PATCH_FIBER_TAP_PROMPT : PATCH_FIBER_CLICK_PROMPT;
}

function wrapTextBoxMessage(message, maxLineWidth) {
  const words = message.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (currentLine && textWidth(nextLine) > maxLineWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [message];
}

function getMaxTextLineWidth(lines) {
  let maxLineWidth = 0;
  for (const line of lines) {
    maxLineWidth = max(maxLineWidth, textWidth(line));
  }
  return maxLineWidth;
}

function getDocumentScrollHeight() {
  return max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    height
  );
}

function getScrollableHeight() {
  return max(0, getDocumentScrollHeight() - height);
}

function getCurrentTextBoxMessage() {
  return getTextBoxMessageForPhase(scrollPhase);
}

function getTextBoxMessageForPhase(phase) {
  if (phase === 0) {
    return PHASE_ONE_TEXT_SEQUENCE[phaseOneTextIndex] || PHASE_ONE_TEXT_SEQUENCE[0];
  }

  if (phase === 1) {
    return PHASE_TWO_TEXT_SEQUENCE[phaseTwoTextIndex] || PHASE_TWO_TEXT_SEQUENCE[0];
  }

  if (phase === FINAL_PHASE) {
    if (isPatchingComplete()) {
      return POST_PATCH_TEXT_SEQUENCE[postPatchTextIndex] || POST_PATCH_TEXT_SEQUENCE[0];
    }
    return FINAL_PHASE_TEXT_SEQUENCE[finalPhaseTextIndex] || FINAL_PHASE_TEXT_SEQUENCE[0];
  }

  return TEXT_BOX_MESSAGES[phase] || TEXT_BOX_MESSAGES[0];
}

function isPhaseOneTextSequenceComplete() {
  return phaseOneTextIndex >= PHASE_ONE_TEXT_SEQUENCE.length - 1;
}

function isPhaseTwoTextSequenceComplete() {
  return phaseTwoTextIndex >= PHASE_TWO_TEXT_SEQUENCE.length - 1;
}

function isFinalPhaseTextSequenceComplete() {
  return finalPhaseTextIndex >= FINAL_PHASE_TEXT_SEQUENCE.length - 1;
}

function isPostPatchSequenceActive() {
  return isPatchingComplete() && !isPostPatchTextSequenceComplete();
}

function isPostPatchTextSequenceComplete() {
  return isPatchingComplete() && postPatchTextIndex >= POST_PATCH_TEXT_SEQUENCE.length - 1;
}

function isPatchingComplete() {
  return patchedNotches.length > 0 && getPatchedRatio() >= 1;
}

function getPhaseOneScrollAwayAlpha() {
  if (scrollPhase !== 0) {
    return 0;
  }

  return 1 - smoothTransition(0.01, 0.14, scrollPhaseProgress);
}

function getTextBoxOffsetY(phase) {
  if (phase === scrollPhase - 1) {
    return -TEXT_BOX_TEXT_PADDING_Y;
  }

  if (phase === scrollPhase + 1) {
    return TEXT_BOX_TEXT_PADDING_Y;
  }

  return 0;
}

function drawPhaseOneFocusOverlay() {
  const alphaValue = getSceneAlpha(0);
  if (alphaValue <= 0) {
    return;
  }

  const revealProgress = getPhaseOneOverlayRevealProgress();
  if (revealProgress >= 1) {
    return;
  }

  const coverScale = 1 - revealProgress;
  push();
  rectMode(CENTER);
  noStroke();
  fill(0, PHASE_ONE_OVERLAY_ALPHA);
  translate(width / 2, height / 2);
  scale(coverScale);
  rect(0, 0, width * 1.08, height * 1.08);
  pop();
}

function drawPhaseOneClickPrompt() {
  const alphaValue = getSceneAlpha(0);
  if (alphaValue <= 0) {
    return;
  }

  const promptAlpha = 1 - getPhaseOneOverlayRevealProgress();
  if (promptAlpha <= 0) {
    return;
  }

  const scaleValue = getResponsiveScale(0.62, 1);
  const fontSize = max(10, min(width, height) * 0.015);
  const promptY = height / 2 + circleSize * 0.5 * pulseScale + 42 * scaleValue;
  const promptText = getPhaseOneCoverPromptText();

  push();
  drawingContext.globalAlpha *= alphaValue * promptAlpha;
  textFont("Averia Sans Libre");
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  noStroke();
  fill(SHARED_HINT_COLOR);
  drawingContext.save();
  if ("letterSpacing" in drawingContext) {
    drawingContext.letterSpacing = SHARED_HINT_LETTER_SPACING;
  }
  text(`(${promptText.toUpperCase()})`, width / 2, promptY);
  drawingContext.restore();
  pop();
}

function getPhaseOneCoverPromptText() {
  return isPhoneLayout() ? PHASE_ONE_TAP_PROMPT_TEXT : PHASE_ONE_CLICK_PROMPT_TEXT;
}

function getPhaseOneOverlayRevealProgress() {
  if (!Number.isFinite(phaseOneOverlayRevealStartTime)) {
    return 0;
  }

  const rawProgress = constrain((millis() - phaseOneOverlayRevealStartTime) / PHASE_ONE_OVERLAY_REVEAL_TIME, 0, 1);
  return smoothTransition(0, 1, rawProgress);
}

function getPhaseOneTextBoxAlpha() {
  if (!Number.isFinite(phaseOneOverlayRevealStartTime)) {
    return 0;
  }

  const elapsedAfterReveal = millis() - phaseOneOverlayRevealStartTime - PHASE_ONE_OVERLAY_REVEAL_TIME;
  return smoothTransition(0, PHASE_ONE_TEXTBOX_FADE_TIME, elapsedAfterReveal);
}

function getPhaseTwoTextBoxAlpha() {
  if (scrollPhase !== 1) {
    return 0;
  }

  return smoothTransition(SCENE_TRANSITION_WINDOW, PHASE_TWO_TEXTBOX_FADE_END, scrollPhaseProgress);
}

function drawEarthPulseRing() {
  const scaleValue = getResponsiveScale(0.62, 1);
  const pulseStrength = constrain(abs(pulseScale - 1) / 0.08, 0, 1);
  const fallbackPulse = 0.45 + 0.55 * (sin(frameCount * 0.08) * 0.5 + 0.5);
  const ringPulse = max(pulseStrength, fallbackPulse * 0.35);
  const ringSize = circleSize
    + EARTH_PULSE_RING_GAP * scaleValue
    + EARTH_PULSE_RING_EXPAND * scaleValue * ringPulse;
  const ringAlpha = EARTH_PULSE_RING_ALPHA * (0.35 + ringPulse * 0.65);

  push();
  noFill();
  stroke(EARTH_PULSE_RING_COLOR);
  strokeWeight(max(2, EARTH_PULSE_RING_WEIGHT * scaleValue * (0.75 + ringPulse * 0.35)));
  drawingContext.globalAlpha *= ringAlpha / 255;
  ellipse(width / 2, height / 2, ringSize, ringSize);
  pop();
}

function drawEarthChippedCircle(points, radius) {
  push();
  noStroke();
  fill(EARTH_OCEAN_COLOR[0], EARTH_OCEAN_COLOR[1], EARTH_OCEAN_COLOR[2]);
  drawChippedCircle(points);

  fill(EARTH_OCEAN_DARK[0], EARTH_OCEAN_DARK[1], EARTH_OCEAN_DARK[2], 90);
  drawEllipseWithCorodeWave(radius * 0.22, radius * 0.12, radius * 1.65, radius * 1.9);

  drawEarthLandDetails(radius);

  pop();
}

function drawEarthLandDetails(radius) {
  if (earthLandSpecs.length === 0) {
    earthLandSpecs = buildEarthLandSpecs();
  }

  fill(EARTH_LAND_COLOR[0], EARTH_LAND_COLOR[1], EARTH_LAND_COLOR[2]);
  for (const spec of earthLandSpecs) {
    drawGeometricLand(
      spec.x * radius,
      spec.y * radius,
      spec.scale * radius,
      spec.points
    );
  }

  fill(EARTH_LAND_DARK[0], EARTH_LAND_DARK[1], EARTH_LAND_DARK[2], 150);
  for (const spec of earthLandSpecs) {
    if (!spec.detailPoints) {
      continue;
    }

    drawGeometricLand(
      (spec.x + spec.detailX) * radius,
      (spec.y + spec.detailY) * radius,
      spec.scale * spec.detailScale * radius,
      spec.detailPoints
    );
  }
}

function buildEarthLandSpecs() {
  const templates = [
    {
      x: -0.42,
      y: -0.28,
      scale: 0.58,
      points: [
        [-0.5, -0.35],
        [0.08, -0.55],
        [0.5, -0.12],
        [0.28, 0.42],
        [-0.32, 0.5],
      ],
      detailPoints: [
        [-0.48, -0.2],
        [0.2, -0.46],
        [0.48, 0.14],
        [-0.12, 0.46],
      ],
    },
    {
      x: 0.16,
      y: -0.18,
      scale: 0.72,
      points: [
        [-0.58, -0.18],
        [-0.18, -0.58],
        [0.42, -0.46],
        [0.58, 0.06],
        [0.18, 0.58],
        [-0.48, 0.28],
      ],
      detailPoints: [
        [-0.5, -0.14],
        [0.12, -0.46],
        [0.5, 0.02],
        [0.06, 0.46],
      ],
    },
    {
      x: 0.42,
      y: 0.3,
      scale: 0.42,
      points: [
        [-0.52, -0.2],
        [0.04, -0.48],
        [0.52, -0.04],
        [0.22, 0.48],
        [-0.42, 0.22],
      ],
    },
    {
      x: -0.24,
      y: 0.32,
      scale: 0.3,
      points: [
        [-0.45, -0.12],
        [-0.08, -0.42],
        [0.42, -0.18],
        [0.34, 0.32],
        [-0.28, 0.42],
      ],
    },
  ];

  const specs = [];
  const count = floor(random(EARTH_LAND_DETAIL_COUNT_MIN, EARTH_LAND_DETAIL_COUNT_MAX + 1));
  const shuffledTemplates = shuffle(templates.slice());

  for (let i = 0; i < count; i += 1) {
    const template = shuffledTemplates[i % shuffledTemplates.length];
    specs.push({
      x: template.x + random(-EARTH_LAND_POSITION_JITTER, EARTH_LAND_POSITION_JITTER),
      y: template.y + random(-EARTH_LAND_POSITION_JITTER, EARTH_LAND_POSITION_JITTER),
      scale: template.scale * random(1 - EARTH_LAND_SIZE_JITTER, 1 + EARTH_LAND_SIZE_JITTER),
      points: jitterLandPoints(template.points),
      detailX: random(-0.08, 0.08),
      detailY: random(-0.08, 0.08),
      detailScale: random(0.42, 0.62),
      detailPoints: template.detailPoints ? jitterLandPoints(template.detailPoints) : null,
    });
  }

  return specs;
}

function jitterLandPoints(points) {
  const jittered = [];
  for (const point of points) {
    jittered.push([
      point[0] + random(-0.07, 0.07),
      point[1] + random(-0.07, 0.07),
    ]);
  }
  return jittered;
}

function drawGeometricLand(x, y, scaleValue, points) {
  beginShape();
  for (const point of points) {
    vertexWithCorodeWave(x + point[0] * scaleValue, y + point[1] * scaleValue);
  }
  endShape(CLOSE);
}

// Draw the chipped circle outline as a single polygon.
function drawChippedCircle(points) {
  beginShape();
  for (const point of points) {
    vertexWithCorodeWave(point.x, point.y);
  }
  endShape(CLOSE);
}

// Convert notch angles into concrete chip spans/depths.
function getCircleDecayNotches(stage, radius) {
  if (stage <= 0) {
    return [];
  }
  const notchCount = min(MAX_NOTCHES, ceil(stage * 0.9));
  const notches = [];

  for (let i = 0; i < notchCount; i += 1) {
    const strength = constrain(stage * 0.9 - i, 0, 1);
    if (strength <= 0) {
      continue;
    }
    const baseSpan = 0.2 + i * 0.02;
    const baseDepth = radius * min(0.55, 0.28 + i * 0.06);
    notches.push({
      angle: notchAngles[i],
      span: baseSpan * lerp(0.45, 1, strength),
      depth: baseDepth * strength,
    });
  }

  notches.sort((a, b) => a.angle - b.angle);
  return notches;
}

// Randomly place chip directions with minimum spacing.
function buildRandomNotchAngles(count) {
  const angles = [];
  let attempts = 0;

  while (angles.length < count && attempts < 200) {
    const candidate = random(-PI, PI);
    const isFarEnough = angles.every(
      (angle) => abs(angle - candidate) > MIN_NOTCH_SPACING
    );
    if (isFarEnough) {
      angles.push(candidate);
    }
    attempts += 1;
  }

  angles.sort((a, b) => a - b);
  return angles;
}

// Build a polygon that replaces arcs with V-cut notches.
function buildDecayedCirclePoints(size, stage) {
  const radius = size * 0.5;
  const notches = getCircleDecayNotches(stage, radius);
  if (notches.length === 0) {
    return buildCirclePoints(radius);
  }

  const points = [];
  let current = -PI;
  const step = 0.12;

  for (const notch of notches) {
    const start = notch.angle - notch.span;
    const end = notch.angle + notch.span;

    for (let angle = current; angle <= start; angle += step) {
      points.push({ x: cos(angle) * radius, y: sin(angle) * radius });
    }

    points.push({ x: cos(start) * radius, y: sin(start) * radius });
    points.push({
      x: cos(notch.angle) * (radius - notch.depth),
      y: sin(notch.angle) * (radius - notch.depth),
    });
    points.push({ x: cos(end) * radius, y: sin(end) * radius });

    current = end;
  }

  for (let angle = current; angle <= PI + 0.001; angle += step) {
    points.push({ x: cos(angle) * radius, y: sin(angle) * radius });
  }

  return points;
}

// Smooth fallback circle (no chips).
function buildCirclePoints(radius) {
  const points = [];
  for (let angle = -PI; angle <= PI + 0.001; angle += 0.12) {
    points.push({ x: cos(angle) * radius, y: sin(angle) * radius });
  }
  return points;
}

// Patterned rectangle helpers live in pattern-assets.js.

// Triangle motion + trail system (phase 1).
function drawPhaseOneArrows() {
  if (arrowSeeds.length !== ARROW_COUNT) {
    arrowSeeds = buildArrowSeeds();
  }

  updateTriangleParticles();

  push();
  noStroke();

  const arrowLength = getScaled(ARROW_LENGTH, 0.55, 1);
  const shadowOffsetX = getScaled(TRIANGLE_SHADOW_OFFSET_X, 0.55, 1);
  const shadowOffsetY = getScaled(TRIANGLE_SHADOW_OFFSET_Y, 0.55, 1);
  const margin = getScaled(ARROW_MARGIN, 0.55, 1);
  for (let i = 0; i < ARROW_COUNT; i += 1) {
    const seed = arrowSeeds[i];
    seed.x += seed.vx;
    seed.y += seed.vy;

    if (seed.x < -margin) {
      seed.x = width + margin;
    } else if (seed.x > width + margin) {
      seed.x = -margin;
    }

    if (seed.y < -margin) {
      seed.y = height + margin;
    } else if (seed.y > height + margin) {
      seed.y = -margin;
    }

    spawnTriangleParticle(seed.x, seed.y, seed.angle, arrowLength);

    fill(TRIANGLE_SHADOW_COLOR, TRIANGLE_SHADOW_ALPHA);
    drawTriangle(
      seed.x + shadowOffsetX,
      seed.y + shadowOffsetY,
      arrowLength,
      seed.angle
    );
    fill(TRIANGLE_COLOR);
    drawTriangle(seed.x, seed.y, arrowLength, seed.angle);
  }

  pop();
}

function drawTriangle(x, y, size, angle) {
  const halfSize = size * 0.5;
  const height = size * 0.4;
  push();
  translate(x, y);
  rotate(angle);
  triangle(
    halfSize, 0,
    -halfSize, -height,
    -halfSize, height
  );
  pop();
}

function buildArrowSeeds() {
  const seeds = [];
  const margin = getScaled(ARROW_MARGIN, 0.55, 1);
  const speedScale = getResponsiveScale(0.62, 1);

  for (let i = 0; i < ARROW_COUNT; i += 1) {
    const angle = random(TWO_PI);
    const speed = ARROW_SPEED * speedScale * random(0.7, 1.3);
    seeds.push({
      x: random(-margin, width + margin),
      y: random(-margin, height + margin),
      angle,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
    });
  }

  return seeds;
}

function spawnTriangleParticle(x, y, angle, arrowLength) {
  if (frameCount % 2 !== 0 || random() > TRIANGLE_PARTICLE_SPAWN_CHANCE) {
    return;
  }

  const scaleValue = getResponsiveScale(0.55, 1);
  const backX = x - cos(angle) * (arrowLength * 0.4) + random(-6, 6) * scaleValue;
  const backY = y - sin(angle) * (arrowLength * 0.4) + random(-6, 6) * scaleValue;
  const drift = random(0.2, 0.8);

  triangleParticles.push({
    x: backX,
    y: backY,
    vx: -cos(angle) * drift + random(-0.2, 0.2),
    vy: -sin(angle) * drift + random(-0.2, 0.2),
    size: random(TRIANGLE_PARTICLE_SIZE_MIN, TRIANGLE_PARTICLE_SIZE_MAX) * scaleValue,
    life: TRIANGLE_PARTICLE_LIFE,
    maxLife: TRIANGLE_PARTICLE_LIFE,
    color: random(triangleParticlePalette),
  });

  if (triangleParticles.length > TRIANGLE_PARTICLE_MAX) {
    triangleParticles.shift();
  }
}

function updateTriangleParticles() {
  if (triangleParticles.length === 0) {
    return;
  }

  push();
  noStroke();
  rectMode(CENTER);

  for (let i = triangleParticles.length - 1; i >= 0; i -= 1) {
    const particle = triangleParticles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 1;

    if (particle.life <= 0) {
      triangleParticles.splice(i, 1);
      continue;
    }

    const alpha = TRIANGLE_PARTICLE_ALPHA * (particle.life / particle.maxLife);
    const tint = particle.color;
    fill(red(tint), green(tint), blue(tint), alpha);
    rect(particle.x, particle.y, particle.size, particle.size, 2);
  }

  pop();
}


function drawPatchedNotches(radius, fillColor, alphaValue) {
  const notches = getCircleDecayNotches(circleStage, radius);
  if (notches.length === 0 || patchedNotches.length === 0) {
    return;
  }

  for (let i = 0; i < notches.length; i += 1) {
    const patch = patchedNotches[i];
    if (!patch) {
      continue;
    }
    drawPatternWedge(notches[i], radius, patch, alphaValue);
  }
}

function drawPatternWedge(notch, radius, patch, alphaValue) {
  const start = notch.angle - notch.span;
  const end = notch.angle + notch.span;
  const tipRadius = radius - notch.depth;
  const ax = cos(start) * radius;
  const ay = sin(start) * radius;
  const bx = cos(notch.angle) * tipRadius;
  const by = sin(notch.angle) * tipRadius;
  const cx = cos(end) * radius;
  const cy = sin(end) * radius;

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.moveTo(ax, ay);
  drawingContext.lineTo(bx, by);
  drawingContext.lineTo(cx, cy);
  drawingContext.closePath();
  drawingContext.clip();

  const patternScale = getPatternScale(radius * 2, radius * 2);
  noStroke();
  fill(patch.colors.base);
  rectMode(CENTER);
  rect(0, 0, radius * 2, radius * 2);

  if (patch.pattern === "STRIPES") {
    const stripeWidth = PATTERN_STRIPE_WIDTH * patternScale;
    const stripeStep = PATTERN_STRIPE_STEP * patternScale;
    const diag = radius * 2;
    stroke(patch.colors.accentA);
    strokeWeight(stripeWidth);
    strokeCap(SQUARE);
    for (let px = -diag; px <= diag; px += stripeStep) {
      line(px, -diag, px + diag, diag);
    }
  } else if (patch.pattern === "DOTS") {
    const step = PATTERN_DOT_STEP * patternScale;
    fill(patch.colors.accentA);
    for (let px = -radius; px <= radius; px += step) {
      for (let py = -radius; py <= radius; py += step) {
        ellipse(px, py, PATTERN_DOT_SIZE * patternScale, PATTERN_DOT_SIZE * patternScale);
      }
    }
  } else {
    const cell = PATTERN_CHECKER_CELL * patternScale;
    const squareSize = PATTERN_CHECKER_SIZE * patternScale;
    for (let px = -radius; px <= radius; px += cell) {
      for (let py = -radius; py <= radius; py += cell) {
        const isAlt = (floor((px + radius) / cell) + floor((py + radius) / cell)) % 2 === 0;
        fill(isAlt ? patch.colors.accentA : patch.colors.accentB);
        rect(px + cell * 0.5, py + cell * 0.5, squareSize, squareSize);
      }
    }
  }

  drawingContext.restore();

  drawPatchStitches(notch, radius, alphaValue);

  if (alphaValue < 255) {
    noStroke();
    fill(255, alphaValue);
    triangle(ax, ay, bx, by, cx, cy);
  }
}

function drawPatchStitches(notch, radius, alphaValue) {
  const stitchAlpha = constrain(alphaValue, 0, 255);
  if (stitchAlpha <= 0) {
    return;
  }

  const startAngle = notch.angle - notch.span;
  const endAngle = notch.angle + notch.span;
  const tipRadius = radius - notch.depth;
  const stitchCount = max(3, floor(PATCH_STITCH_COUNT * getResponsiveScale(0.72, 1.1)));
  const stitchLength = PATCH_STITCH_LENGTH * getResponsiveScale(0.62, 1);
  const stitchWeight = max(1.5, PATCH_STITCH_WEIGHT * getResponsiveScale(0.7, 1));
  const startEdge = {
    x: cos(startAngle) * radius,
    y: sin(startAngle) * radius,
  };
  const tip = {
    x: cos(notch.angle) * tipRadius,
    y: sin(notch.angle) * tipRadius,
  };
  const endEdge = {
    x: cos(endAngle) * radius,
    y: sin(endAngle) * radius,
  };

  push();
  stroke(PATCH_STITCH_COLOR);
  strokeWeight(stitchWeight);
  strokeCap(ROUND);
  drawingContext.globalAlpha *= stitchAlpha / 255;

  drawStitchesAlongPatchEdge(startEdge, tip, stitchCount, stitchLength);
  drawStitchesAlongPatchEdge(tip, endEdge, stitchCount, stitchLength);

  pop();
}

function drawStitchesAlongPatchEdge(fromPoint, toPoint, stitchCount, stitchLength) {
  const edgeX = toPoint.x - fromPoint.x;
  const edgeY = toPoint.y - fromPoint.y;
  const edgeLength = sqrt(edgeX * edgeX + edgeY * edgeY);
  if (edgeLength <= 0.001) {
    return;
  }

  const normalX = -edgeY / edgeLength;
  const normalY = edgeX / edgeLength;
  const halfLength = stitchLength * 0.5;

  for (let i = 0; i < stitchCount; i += 1) {
    const amount = (i + 0.5) / stitchCount;
    const x = lerp(fromPoint.x, toPoint.x, amount);
    const y = lerp(fromPoint.y, toPoint.y, amount);

    line(
      x - normalX * halfLength,
      y - normalY * halfLength,
      x + normalX * halfLength,
      y + normalY * halfLength
    );
  }
}

function applyPatternPatch(rectData) {
  if (rectData.state === "patching") {
    return;
  }
  const radius = circleSize * 0.5;
  const notches = getCircleDecayNotches(circleStage, radius);
  const index = patchedNotches.findIndex((patch) => !patch);
  if (index === -1 || notches.length === 0) {
    return;
  }

  const notch = notches[index];
  const targetRadius = radius - notch.depth * 0.45;
  rectData.state = "patching";
  rectData.patchIndex = index;
  rectData.targetX = width / 2 + cos(notch.angle) * targetRadius;
  rectData.targetY = height / 2 + sin(notch.angle) * targetRadius;
  rectData.scale = 1;
}

function finalizePatternPatch(rectData) {
  const index = rectData.patchIndex;
  if (index === null || index === undefined) {
    resetFallingRect(rectData);
    return;
  }

  patchedNotches[index] = {
    pattern: rectData.pattern,
    colors: rectData.colors,
  };
  playPatchZipSfx();

  resetFallingRect(rectData);
}

function resetFallingRect(rectData, useDeepStagger = false) {
  const scaleValue = getResponsiveScale(0.52, 1);
  rectData.state = "falling";
  rectData.scale = 1;
  rectData.patchIndex = null;
  rectData.targetX = null;
  rectData.targetY = null;
  const spawnDepth = useDeepStagger
    ? random(20, height * 1.8)
    : random(20, 180);
  rectData.y = -rectData.h - spawnDepth * scaleValue;
  rectData.x = random(rectData.w / 2, max(rectData.w / 2, width - rectData.w / 2));
  rectData.vx = random(-FALLING_RECT_DRIFT, FALLING_RECT_DRIFT) * scaleValue;
  rectData.vy = random(FALLING_RECT_SPEED_MIN, FALLING_RECT_SPEED_MAX) * scaleValue;
  rectData.angle = random(-0.2, 0.2);
  rectData.rotationSpeed = random([-1, 1]) * random(FALLING_RECT_ROTATION_SPEED_MIN, FALLING_RECT_ROTATION_SPEED_MAX);
  rectData.swayPhase = random(TWO_PI);
  rectData.swaySpeed = random(FALLING_RECT_SWAY_SPEED_MIN, FALLING_RECT_SWAY_SPEED_MAX);
}

function getFallingRectAt(x, y) {
  for (let i = fallingRects.length - 1; i >= 0; i -= 1) {
    const rectData = fallingRects[i];
    if (rectData.state === "patching") {
      continue;
    }
    const scaleValue = rectData.scale ? rectData.scale : 1;
    const angle = -(rectData.angle || 0);
    const dx = x - rectData.x;
    const dy = y - rectData.y;
    const localX = (dx * cos(angle) - dy * sin(angle)) / scaleValue;
    const localY = (dx * sin(angle) + dy * cos(angle)) / scaleValue;
    const paddedHalfW = rectData.w * 0.5 + FALLING_RECT_CLICK_PADDING;
    const paddedHalfH = rectData.h * 0.5 + FALLING_RECT_CLICK_PADDING;
    if (abs(localX) <= paddedHalfW && abs(localY) <= paddedHalfH) {
      return rectData;
    }

    const shapePoints = getRectShapePoints(rectData, rectData.w, rectData.h);
    if (pointInPolygon(localX, localY, shapePoints)) {
      return rectData;
    }
  }
  return null;
}

function isPointInNotch(x, y, notch, radius) {
  const start = notch.angle - notch.span;
  const end = notch.angle + notch.span;
  const tipRadius = radius - notch.depth;
  const ax = cos(start) * radius;
  const ay = sin(start) * radius;
  const bx = cos(notch.angle) * tipRadius;
  const by = sin(notch.angle) * tipRadius;
  const cx = cos(end) * radius;
  const cy = sin(end) * radius;
  return pointInTriangle(x, y, ax, ay, bx, by, cx, cy);
}

function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function pointInPolygon(px, py, points) {
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const current = points[i];
    const previous = points[j];
    const crossesY = current.y > py !== previous.y > py;

    if (!crossesY) {
      continue;
    }

    const intersectX = ((previous.x - current.x) * (py - current.y)) / (previous.y - current.y) + current.x;
    if (px < intersectX) {
      inside = !inside;
    }
  }

  return inside;
}

function getCircleStageForPhase(phase) {
  if (phase <= 0) {
    return 0;
  }
  if (phase === 1) {
    return Math.round(CHIP_STAGE * 0.33);
  }
  if (phase >= FINAL_PHASE) {
    return CHIP_STAGE;
  }
  return Math.round(CHIP_STAGE * 0.66);
}

// Starfield helpers live in background-effects.js.

// Phase 2/3 small triangle particles.
function drawPhaseTwoThreeTriangles(alphaScale) {
  if (alphaScale === undefined) {
    alphaScale = getSmallTriangleAlpha();
  }
  if (alphaScale <= 0) {
    return;
  }

  if (smallTriangles.length !== SMALL_TRI_COUNT) {
    smallTriangles = buildSmallTriangles();
  }

  push();
  noStroke();

  for (const tri of smallTriangles) {
    tri.x += tri.vx;
    tri.y += tri.vy;

    if (tri.x < -SMALL_TRI_SIZE_MAX) {
      tri.x = width + SMALL_TRI_SIZE_MAX;
    } else if (tri.x > width + SMALL_TRI_SIZE_MAX) {
      tri.x = -SMALL_TRI_SIZE_MAX;
    }

    if (tri.y < -SMALL_TRI_SIZE_MAX) {
      tri.y = height + SMALL_TRI_SIZE_MAX;
    } else if (tri.y > height + SMALL_TRI_SIZE_MAX) {
      tri.y = -SMALL_TRI_SIZE_MAX;
    }

    const angle = atan2(tri.vy, tri.vx);
    const triPosition = getCorodeScenePoint(tri.x, tri.y);
    fill(255, SMALL_TRI_SHADOW_ALPHA * alphaScale);
    drawSmallTriangle(
      triPosition.x + SMALL_TRI_SHADOW_OFFSET_X,
      triPosition.y + SMALL_TRI_SHADOW_OFFSET_Y,
      tri.size,
      angle
    );

    const tintColor = tri.color;
    fill(red(tintColor), green(tintColor), blue(tintColor), SMALL_TRI_ALPHA * alphaScale);
    drawSmallTriangle(triPosition.x, triPosition.y, tri.size, angle);
  }

  pop();
}

function drawSmallTriangle(x, y, size, angle) {
  const halfSize = size * 0.5;
  const height = size * 0.6;
  push();
  translate(x, y);
  rotate(angle);
  triangle(
    halfSize, 0,
    -halfSize, -height,
    -halfSize, height
  );
  pop();
}

function drawPhaseThreeExplodingParticles() {
  if (smallTriangles.length !== SMALL_TRI_COUNT) {
    smallTriangles = buildSmallTriangles();
  }

  if (
    !Number.isFinite(phaseThreeExplosionStartTime)
    && scrollPhase === FINAL_PHASE
    && scrollPhaseProgress >= SCENE_TRANSITION_WINDOW
  ) {
    phaseThreeExplosionStartTime = millis();
    playPhaseThreePopSfx();
  }

  const explosionStarted = Number.isFinite(phaseThreeExplosionStartTime);
  const autoProgress = explosionStarted
    ? constrain((millis() - phaseThreeExplosionStartTime) / PHASE_THREE_EXPLOSION_DURATION, 0, 1)
    : 0;
  const emergeAmount = explosionStarted ? 1 : smoothTransition(0, SCENE_TRANSITION_WINDOW, scrollPhaseProgress);
  const explodeAmount = explosionStarted ? smoothTransition(0, 0.42, autoProgress) : 0;
  const fragmentAmount = explosionStarted ? smoothTransition(0.08, 0.62, autoProgress) : 0;
  const alphaScale = 1 - smoothTransition(0.78, 1, autoProgress) * 0.45;
  const scaleValue = getResponsiveScale(0.58, 1);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const explodeDistance = SMALL_TRI_EXPLODE_DISTANCE * scaleValue;
  const fragmentDistance = SMALL_TRI_FRAGMENT_DISTANCE * scaleValue;

  push();
  noStroke();

  for (const tri of smallTriangles) {
    const impactX = centerX + cos(tri.impactAngle) * circleSize * tri.impactRadius;
    const impactY = centerY + sin(tri.impactAngle) * circleSize * tri.impactRadius;
    const coreX = centerX + cos(tri.impactAngle) * circleSize * tri.coreRadius;
    const coreY = centerY + sin(tri.impactAngle) * circleSize * tri.coreRadius;
    const emergeEase = emergeAmount * emergeAmount * (3 - 2 * emergeAmount);
    const baseX = lerp(coreX, impactX, emergeEase);
    const baseY = lerp(coreY, impactY, emergeEase);
    const fromCenterX = impactX - centerX;
    const fromCenterY = impactY - centerY;
    const distanceFromCenter = max(1, sqrt(fromCenterX * fromCenterX + fromCenterY * fromCenterY));
    const directionX = fromCenterX / distanceFromCenter;
    const directionY = fromCenterY / distanceFromCenter;
    const driftWave = sin(frameCount * 0.035 + tri.explodePhase) * 24 * scaleValue * explodeAmount;
    const explodeX = directionX * explodeDistance * tri.explodePower * explodeAmount;
    const explodeY = directionY * explodeDistance * tri.explodePower * explodeAmount;
    const sideX = -directionY * driftWave;
    const sideY = directionX * driftWave;
    const drawX = baseX + explodeX + sideX;
    const drawY = baseY + explodeY + sideY;
    const angle = tri.angle + explodeAmount * SMALL_TRI_EXPLODE_SPIN * tri.spinDirection + frameCount * tri.spinSpeed;
    const size = tri.size * lerp(0.2, 1.65, max(emergeAmount, explodeAmount));
    const mainBreakAlpha = 1 - smoothTransition(0.18, 0.72, fragmentAmount);
    const mainBreakSize = lerp(1, 0.25, fragmentAmount);
    const particleAlpha = SMALL_TRI_ALPHA * alphaScale * mainBreakAlpha;
    const shadowAlpha = SMALL_TRI_SHADOW_ALPHA * alphaScale * mainBreakAlpha;
    const tintColor = tri.color;

    if (mainBreakAlpha > 0.02) {
      fill(255, shadowAlpha);
      drawSmallTriangle(
        drawX + SMALL_TRI_SHADOW_OFFSET_X * scaleValue,
        drawY + SMALL_TRI_SHADOW_OFFSET_Y * scaleValue,
        size * mainBreakSize,
        angle
      );

      fill(red(tintColor), green(tintColor), blue(tintColor), particleAlpha);
      drawSmallTriangle(drawX, drawY, size * mainBreakSize, angle);
    }

    drawPhaseThreeParticleFragments(
      tri,
      drawX,
      drawY,
      angle,
      size,
      fragmentAmount,
      fragmentDistance,
      alphaScale,
      scaleValue
    );
  }

  pop();
}

function drawPhaseThreeParticleFragments(
  tri,
  originX,
  originY,
  baseAngle,
  baseSize,
  fragmentAmount,
  fragmentDistance,
  alphaScale,
  scaleValue
) {
  if (fragmentAmount <= 0) {
    return;
  }

  const fragmentAlpha = SMALL_TRI_ALPHA * alphaScale * smoothTransition(0.04, 0.35, fragmentAmount);
  const shadowAlpha = SMALL_TRI_SHADOW_ALPHA * alphaScale * smoothTransition(0.04, 0.35, fragmentAmount) * 0.65;
  const fadeSize = lerp(0.42, 0.18, smoothTransition(0.58, 1, fragmentAmount));

  for (const fragment of tri.fragments) {
    const spread = fragmentDistance * fragment.distance * fragmentAmount;
    const flutter = sin(frameCount * fragment.flutterSpeed + fragment.phase) * 18 * scaleValue * fragmentAmount;
    const x = originX + cos(fragment.angle) * spread + cos(fragment.angle + HALF_PI) * flutter;
    const y = originY + sin(fragment.angle) * spread + sin(fragment.angle + HALF_PI) * flutter;
    const angle = baseAngle + fragment.rotation + frameCount * fragment.spinSpeed;
    const size = baseSize * fragment.size * fadeSize;
    const tintColor = fragment.color;

    fill(255, shadowAlpha);
    drawSmallTriangle(
      x + SMALL_TRI_SHADOW_OFFSET_X * scaleValue * 0.55,
      y + SMALL_TRI_SHADOW_OFFSET_Y * scaleValue * 0.55,
      size,
      angle
    );

    fill(red(tintColor), green(tintColor), blue(tintColor), fragmentAlpha);
    drawSmallTriangle(x, y, size, angle);
  }
}

function buildSmallTriangles() {
  const tris = [];
  const scaleValue = getResponsiveScale(0.58, 1);
  for (let i = 0; i < SMALL_TRI_COUNT; i += 1) {
    const angle = random(TWO_PI);
    const speed = random(SMALL_TRI_SPEED_MIN, SMALL_TRI_SPEED_MAX) * scaleValue;
    tris.push({
      x: random(0, width),
      y: random(0, height),
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(SMALL_TRI_SIZE_MIN, SMALL_TRI_SIZE_MAX) * scaleValue,
      color: color(random(SMALL_TRI_COLORS)),
      angle,
      impactAngle: random(TWO_PI),
      impactRadius: random(0.12, 0.62),
      coreRadius: random(0.02, 0.16),
      explodePhase: random(TWO_PI),
      explodePower: random(0.72, 1.25),
      spinDirection: random([-1, 1]),
      spinSpeed: random(-0.018, 0.018),
      fragments: buildSmallTriangleFragments(angle),
    });
  }
  return tris;
}

function buildSmallTriangleFragments(baseAngle) {
  const fragments = [];

  for (let i = 0; i < SMALL_TRI_FRAGMENT_COUNT; i += 1) {
    fragments.push({
      angle: baseAngle + random(-1.15, 1.15),
      distance: random(0.55, 1.25),
      size: random(0.28, 0.48),
      rotation: random(TWO_PI),
      spinSpeed: random(-0.05, 0.05),
      flutterSpeed: random(0.035, 0.08),
      phase: random(TWO_PI),
      color: color(random(SMALL_TRI_COLORS)),
    });
  }

  return fragments;
}

function getSmallTriangleAlpha() {
  return getSceneAlpha(1);
}

// Final phase falling patterned rectangles.
function drawFallingRects() {
  if (fallingRects.length !== getFallingRectCount()) {
    fallingRects = buildFallingRects();
  }

  push();
  rectMode(CENTER);
  noStroke();

  const scaleValue = getResponsiveScale(0.52, 1);
  for (const rectData of fallingRects) {
    let skipDraw = false;

    if (rectData.state === "patching") {
      rectData.x = lerp(rectData.x, rectData.targetX, PATCH_FLY_EASE);
      rectData.y = lerp(rectData.y, rectData.targetY, PATCH_FLY_EASE);
      rectData.angle = lerp(rectData.angle || 0, 0, PATCH_FLY_EASE);
      rectData.scale = max(PATCH_MIN_SCALE, rectData.scale * PATCH_SCALE_DECAY);

      const distance = dist(rectData.x, rectData.y, rectData.targetX, rectData.targetY);
      if (distance < PATCH_SNAP_DISTANCE || rectData.scale <= PATCH_MIN_SCALE) {
        finalizePatternPatch(rectData);
        skipDraw = true;
      }
    } else {
      rectData.vy = min(FALLING_RECT_MAX_SPEED * scaleValue, rectData.vy + FALLING_RECT_GRAVITY * scaleValue);
      rectData.swayPhase += rectData.swaySpeed;
      rectData.angle += rectData.rotationSpeed;
      rectData.y += rectData.vy;
      rectData.x += rectData.vx + sin(rectData.swayPhase) * FALLING_RECT_SWAY_AMOUNT * scaleValue;

      if (rectData.y - rectData.h > height + 80) {
        resetFallingRect(rectData);
      }

      if (rectData.x < -rectData.w) {
        rectData.x = width + rectData.w;
      } else if (rectData.x > width + rectData.w) {
        rectData.x = -rectData.w;
      }
    }

    if (skipDraw) {
      continue;
    }

    fill(255, STAGE_TWO_SHADOW_ALPHA);
    drawPatternRectShadow(
      rectData,
      rectData.x + FALLING_RECT_SHADOW_OFFSET_X * scaleValue,
      rectData.y + FALLING_RECT_SHADOW_OFFSET_Y * scaleValue,
      rectData.scale ? rectData.scale : 1,
      rectData.angle || 0
    );
    drawPatternRect(rectData, undefined, undefined, rectData.angle || 0);
    drawFallingRectClickHint(rectData, scaleValue);
  }

  pop();
}

function drawFallingRectClickHint(rectData, scaleValue) {
  if (rectData.state === "patching" || !isFinalPhaseTextSequenceComplete() || isPatchingComplete()) {
    return;
  }

  const blinkAmount = 0.5 + 0.5 * sin(frameCount * FALLING_RECT_HINT_BLINK_SPEED + rectData.hintPhase);
  const hintAlpha = lerp(FALLING_RECT_HINT_ALPHA_MIN, FALLING_RECT_HINT_ALPHA_MAX, blinkAmount);
  const drawScale = rectData.scale ? rectData.scale : 1;
  const hintSize = max(rectData.w, rectData.h) * drawScale + FALLING_RECT_HINT_PADDING * scaleValue;

  push();
  noFill();
  stroke("#FED602");
  strokeWeight(FALLING_RECT_HINT_STROKE_WEIGHT * scaleValue);
  drawingContext.globalAlpha *= hintAlpha / 255;
  ellipse(rectData.x, rectData.y, hintSize, hintSize);
  stroke("#FE1595");
  strokeWeight(max(1, FALLING_RECT_HINT_STROKE_WEIGHT * 0.45 * scaleValue));
  ellipse(rectData.x + 3 * scaleValue, rectData.y + 3 * scaleValue, hintSize, hintSize);
  pop();
}

function drawFinalPhaseFallingRects() {
  const explosionProgress = getPhaseThreeExplosionProgress();
  if (explosionProgress < FINAL_PATTERN_FALL_START_PROGRESS) {
    return;
  }

  if (!finalPatternFallStarted) {
    finalPatternFallStarted = true;
    currentFallingRectCount = chooseFallingRectCount();
    fallingRects = buildFallingRects();
    for (const rectData of fallingRects) {
      resetFallingRect(rectData, true);
    }
  }

  const fallAlpha = smoothTransition(
    FINAL_PATTERN_FALL_START_PROGRESS,
    FINAL_PATTERN_FALL_FADE_END_PROGRESS,
    explosionProgress
  );
  withAlpha(fallAlpha, drawFallingRects);
}

function getPhaseThreeExplosionProgress() {
  if (!Number.isFinite(phaseThreeExplosionStartTime)) {
    return 0;
  }

  return constrain((millis() - phaseThreeExplosionStartTime) / PHASE_THREE_EXPLOSION_DURATION, 0, 1);
}

// Falling rectangle shadow helper lives in pattern-assets.js.

function buildFallingRects() {
  const rects = [];
  const scaleValue = getResponsiveScale(0.52, 1);
  if (currentFallingRectCount === null) {
    currentFallingRectCount = chooseFallingRectCount();
  }
  const rectCount = getFallingRectCount();
  const minW = STAGE_TWO_RECT_MIN * 0.5 * scaleValue;
  const maxW = min(STAGE_TWO_RECT_MAX * 0.6 * scaleValue, width * 0.32);
  const minH = STAGE_TWO_RECT_MIN * 0.4 * scaleValue;
  const maxH = min(STAGE_TWO_RECT_MAX * 0.6 * scaleValue, width * 0.30);
  for (let i = 0; i < rectCount; i += 1) {
    const w = random(minW, max(minW + 1, maxW));
    const h = random(minH, max(minH + 1, maxH));
    const rectData = {
      x: random(w / 2, max(w / 2, width - w / 2)),
      y: random(-height, height),
      w,
      h,
      pattern: random(["STRIPES", "DOTS", "CHECKER"]),
      colors: pickStageTwoColors(),
      vx: random(-FALLING_RECT_DRIFT, FALLING_RECT_DRIFT),
      vy: random(FALLING_RECT_SPEED_MIN, FALLING_RECT_SPEED_MAX) * scaleValue,
      angle: random(-0.2, 0.2),
      rotationSpeed: random([-1, 1]) * random(FALLING_RECT_ROTATION_SPEED_MIN, FALLING_RECT_ROTATION_SPEED_MAX),
      swayPhase: random(TWO_PI),
      swaySpeed: random(FALLING_RECT_SWAY_SPEED_MIN, FALLING_RECT_SWAY_SPEED_MAX),
      state: "falling",
      scale: 1,
      patchIndex: null,
      targetX: null,
      targetY: null,
      hintPhase: random(TWO_PI),
      chipCuts: buildFallingRectChipCuts(),
    };
    rectData.patternLayer = buildPatternRectLayer(rectData);
    rects.push(rectData);
  }
  return rects;
}

function getFallingRectCount() {
  if (currentFallingRectCount !== null) {
    return currentFallingRectCount;
  }

  return chooseFallingRectCount();
}

function chooseFallingRectCount() {
  const minCount = isPhoneLayout() ? max(5, floor(FALLING_RECT_COUNT_MIN * 0.75)) : FALLING_RECT_COUNT_MIN;
  const maxCount = isPhoneLayout() ? max(minCount, floor(FALLING_RECT_COUNT_MAX * 0.75)) : FALLING_RECT_COUNT_MAX;
  return floor(random(minCount, maxCount + 1));
}

function buildFallingRectChipCuts() {
  const cuts = [];
  const edges = ["top", "right", "bottom", "left"];
  const cutCount = floor(random(FALLING_RECT_CHIP_COUNT_MIN, FALLING_RECT_CHIP_COUNT_MAX + 1));

  for (let i = 0; i < cutCount; i += 1) {
    cuts.push({
      edge: random(edges),
      position: random(0.18, 0.82),
      width: random(FALLING_RECT_CHIP_WIDTH_MIN, FALLING_RECT_CHIP_WIDTH_MAX),
      depth: random(FALLING_RECT_CHIP_DEPTH_MIN, FALLING_RECT_CHIP_DEPTH_MAX),
    });
  }

  return cuts;
}
