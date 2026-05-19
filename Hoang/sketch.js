let climateCanvas;
let boidConfig = null;

let userLeader = null;
let userFollowers = [];
let narrativeCubes = [];
let narrativePrompt = "";
let narrativePromptHideAtMs = 0;
let narrativeClicks = 0;
let nextNarrativeCubeId = 1;
let assimilationSequenceStarted = false;
let crowdAudio = null;
let crowdAudioPrimed = false;
let fabricCollisionAudioPools = [];
let fabricCollisionAudioPrimed = false;
let fabricDropAudioPools = [];
let fabricDropAudioPrimed = false;
let pickupAudioPools = [];
let pickupAudioPrimed = false;
let mouseClickAudioPools = [];
let mouseClickAudioPrimed = false;
let textPopupAudioPool = [];
let textPopupAudioPrimed = false;
let walkingAudioPools = [];
let walkingAudioPrimed = false;
let tensionAudio = null;
let tensionAudioPrimed = false;
let finalAudioLockActive = false;
let fabricCollisionPairStates = new Map();
let lastFabricCollisionSoundAtMs = 0;
let lastTextPopupSoundAtMs = 0;
let lastWalkingSoundAtMs = 0;
let nextCollisionAudioEntityId = 1;
let finalHurtTensionPlayed = false;
let p5IntroFont = null;
let previousTextPopupKeys = new Set();
let currentTextPopupKeys = new Set();

let smallSwarms = [];
let bigTrendLeaders = [];
let droppedShapes = [];
let pendingDroppedShapes = [];
let lastMacroLeaderDespawnPoint = null;
let lastMacroLeaderRoute = null;
let grainRevealDropCount = 0;
let backgroundGrainRevealAlpha = 0;

let posterLayer;
let backgroundGrainLayer;
let scanlineOverlayLayer;
let referencePatternLayer;
let referencePatternNoiseLayer;
let referencePatternPalette = [];
let referencePatternSeed = 0;

let influenceActive = false;
let simulationStarted = false;

let macroExitActive = false;
let macroExitFrames = 0;
let smallSwarmExitActive = false;
let smallSwarmExitQueued = false;

// Cycle runs Yellow -> Pink -> Blue -> Cyan, then loops.
let cyclePhaseIndex = 0;
let completedCycleCount = 0;
let cycleWaitingForReturn = false;
let cycleReturnAtMs = 0;
let cycleReturnForceStartAtMs = 0;
let influenceCycleStartedAtMs = 0;
let cycleLimitReached = false;
let cycleCompletionMessageDelayUntilMs = 0;

let previewOffsetX = 0;
let previewOffsetY = 0;
let roomRoutingCacheFrame = -1;
let roomRoutingCache = null;
let droppedStaticCollisionBodies = [];
let droppedStaticCacheDirty = true;

// Keep follower silhouettes locked to squares; the roughness now comes from
// heavier V-cut variation instead of multiple base shape families.
const FOLLOWER_SHAPE_TYPES = ["square"];

const COLOR_YELLOW = [254, 214, 2];
const COLOR_PINK = [254, 21, 149];
const COLOR_CYAN = [29, 217, 219];
const COLOR_WHITE = [255, 255, 255];
const COLOR_BLACK = [0, 0, 0];
const WEBSITE_MAIN_PALETTE = Object.freeze([
  COLOR_PINK,
  COLOR_CYAN,
  COLOR_YELLOW,
]);

// Global size boost so piles read better at a distance and feel weightier.
const SHAPE_SIZE_BOOST = 1.22;
const USER_SWARM_COLOR = COLOR_CYAN;
// Keep autonomous swarms on the pre-assimilation yellow baseline.
const AUTONOMOUS_SWARM_BASE_COLOR = COLOR_YELLOW;
// Force conversion window shrinks as cycles progress to create faster wave turnover.
const INFLUENCE_FORCE_CONVERT_BASE_MS = 10000;
const INFLUENCE_FORCE_CONVERT_MIN_MS = 3600;
const INFLUENCE_FORCE_CONVERT_STEP_MS = 650;
const FINAL_CYCLE_INFLUENCE_MIN_MS = 2400;
const FINAL_CYCLE_INFLUENCE_SHARE = 0.62;
const FINAL_CYCLE_MACRO_EXIT_MIN_MS = 1800;
const FINAL_CYCLE_MACRO_EXIT_SHARE = 0.5;
const MACRO_EXIT_FAILSAFE_FRAMES = 2200;
const DROPPED_SHAPE_MAX = 300;
const DROPPED_SHAPE_RELEASE_PER_FRAME = 8;
const DROPPED_FLOOR_INSET_MIN = 2;
const DROPPED_FLOOR_INSET_MAX = 10;
const COLLISION_SOLVER_ITERATIONS = 3;
const PATTERN_ALPHA_FLOOR = 0.15;
const BACKGROUND_GRAIN_START_ALPHA = 0;
const BACKGROUND_GRAIN_REVEAL_LERP = 0.035;
const BACKGROUND_GRAIN_REVEAL_POWER = 1;
const BACKGROUND_GRAIN_REVEAL_TARGET_FACTOR = 0.42;
const CROWD_AUDIO_SRC = "designed-sounds/Crowd.wav";
const FABRIC_COLLISION_AUDIO_SRCS = [
  "designed-sounds/fabric-colide.wav",
  "designed-sounds/fabric-colide-2.wav",
];
const FABRIC_DROP_AUDIO_SRCS = [
  "designed-sounds/fabric-dropped1.wav",
  "designed-sounds/fabric-dropped2.wav",
];
const PICKUP_AUDIO_SRCS = [
  "designed-sounds/pickup-clothing1.wav",
  "designed-sounds/pickup-clothing2.wav",
];
const MOUSE_CLICK_AUDIO_SRCS = [
  "designed-sounds/puff-click.wav",
  "designed-sounds/puff-click2.wav",
  "designed-sounds/puff-click3.wav",
];
const TEXT_POPUP_AUDIO_SRC = "designed-sounds/text-popup.wav";
const WALKING_AUDIO_SRCS = [
  "designed-sounds/walking.wav",
  "designed-sounds/walking2.wav",
];
const TENSION_AUDIO_SRC = "designed-sounds/tension.wav";
const FABRIC_COLLISION_POOL_SIZE = 3;
const FABRIC_DROP_AUDIO_POOL_SIZE = 2;
const PICKUP_AUDIO_POOL_SIZE = 2;
const MOUSE_CLICK_AUDIO_POOL_SIZE = 2;
const TEXT_POPUP_AUDIO_POOL_SIZE = 3;
const WALKING_AUDIO_POOL_SIZE = 2;
const TEXT_POPUP_MIN_INTERVAL_MS = 140;
const TEXT_POPUP_PITCH_STEP_PER_CYCLE = 0.95;
const WALKING_AUDIO_MIN_INTERVAL_MS = 115;
const WALKING_AUDIO_STEP_DISTANCE = 34;
const FABRIC_COLLISION_MIN_INTERVAL_MS = 80;
const FABRIC_COLLISION_PAIR_COOLDOWN_MS = 140;
const FABRIC_COLLISION_CONTACT_COOLDOWN_MS = 520;
const FABRIC_COLLISION_MIN_IMPACT = 0.16;
const FABRIC_COLLISION_MAX_PAIR_CACHE = 512;
const FABRIC_COLLISION_REARM_DISTANCE_MIN = 8;
const FABRIC_COLLISION_REARM_DISTANCE_MAX = 24;
const FABRIC_COLLISION_REARM_IDLE_MS = 900;
const FABRIC_COLLISION_CONTACT_VOLUME_SCALE = 0.32;
const FABRIC_COLLISION_CONTACT_VOLUME_MAX = 0.24;
const FINAL_AUDIO_FADE_OUT_MS = 1100;
const CYCLE_RETURN_REGROUP_GRACE_MS = 2200;
const MACRO_ROUTE_ATTEMPTS = 14;
const MACRO_ROUTE_MIN_SEPARATION_SCORE = 0.72;
const NARRATIVE_PROMPTS = [
  "Fabric?",
  "Having more is always good",
  "One more cant hurt...",
  "Right?",
];
const SMALL_LEADER_DIALOGUE_LINES = Object.freeze([
  "I NEED IT",
]);
const NARRATIVE_CUBE_COUNT = 4;
const NARRATIVE_FINAL_PROMPT_HOLD_MS = 1700;
const NARRATIVE_CUBE_ANCHOR_OFFSETS = [0, -110, 110, -170];
const P5_DIALOG_FONT_FAMILY = "Averia Sans Libre";
const P5_DIALOG_FONT_STACK = '"Averia Sans Libre", sans-serif';
const P5_INTRO_FONT_FAMILY = P5_DIALOG_FONT_FAMILY;
const P5_INTRO_FONT_STACK = P5_DIALOG_FONT_STACK;
const FAST_SEQUENCE_PROFILE_SECONDS = [6, 4, 2, 1, 0.5];
const MAX_ASSIMILATION_CYCLES = 5;
const FINAL_HURT_BLEED_DURATION_MS = 7600;
const FINAL_HURT_LIQUID_GROWTH_MS = 10800;
const FINAL_HURT_SINK_DURATION_MS = 5200;
const FINAL_HURT_SINK_SCALE_LOSS = 0.1;
const FINAL_HURT_SINK_START_COVER_RATIO = 0;
const FINAL_HURT_DROPPED_SINK_MIN_SCALE = 0.04;
const FINAL_HURT_DROPPED_SHADE_LOSS_MS = 900;
const FINAL_HURT_DROPPED_DISAPPEAR_DELAY_MS = 260;
const FINAL_HURT_DROPPED_DISAPPEAR_MS = 850;
const FINAL_HURT_MAX_VCUTS = 10;
const FINAL_HURT_VCUT_INTERVAL_MS = 260;
const FINAL_HURT_GRAY = [134, 134, 134];
const PRE_FINAL_CYCLE_INFLUENCE_SHARE = 0.5;
const OVERLAY_TEXT_REFERENCE_SIZE_PX = 28;
const NARRATIVE_PROMPT_Y_RATIO = 0.76;
const USER_STAGE_MIN_GAP_PX = 72;
const USER_STAGE_MAX_GAP_RATIO = 0.16;
const PHONE_ENTITY_SCALE = 0.25;
const TABLET_ENTITY_SCALE = 0.5;
const LAPTOP_ENTITY_SCALE = 0.75;
const BIG_LEADER_FADE_IN_MS = 220;
const REGULAR_POLYGON_POINT_CACHE = new Map();
const BASE_SHAPE_POINT_CACHE = new Map();
const CHIPPED_SHAPE_POINT_CACHE = new Map();
const CHIPPED_SHAPE_POINT_CACHE_MAX = 7000;
const PATTERN_TILE_CACHE = new Map();
const PATTERN_TILE_CACHE_MAX = 384;
const FOLLOWER_CHIP_MIN_SIZE = 9;
const FOLLOWER_PATTERN_MIN_SPAN = 6;
const GRAIN_POINT_CACHE = new Map();
const GRAIN_POINT_CACHE_MAX = 6000;
const BIG_LEADER_SCRATCH = [];
const SMALL_LEADER_SCRATCH = [];
const ZERO_VELOCITY = Object.freeze({ x: 0, y: 0 });
const DROPPED_SHRINK_MIN_RATIO = 0.78;
const DROPPED_SHRINK_LERP_RATE = 0.08;
const DROPPED_GROUND_SQUASH_RATIO = 0.92;
const ROOM_ENTRY_EPSILON = 0.5;
const ROOM_BLOCKED_BOUNCE_DAMPING = 0.2;
const COLLISION_HASH_COORD_OFFSET = 32768;
const COLLISION_HASH_ROW_STRIDE = 65536;
const COLLISION_NEIGHBOR_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];
const SHAPE_GEOMETRY_ROLE_PROFILES = Object.freeze({
  default: Object.freeze({
    sizeStep: 1,
    seedBuckets: 96,
    minChipSize: 10,
    cutChanceMin: 0.38,
    cutChanceMax: 0.68,
    cutDepthMin: 0.045,
    cutDepthMax: 0.115,
    maxCuts: 1,
    notchTip: false,
  }),
  follower: Object.freeze({
    // Followers are the hottest path, so they intentionally reuse fewer, simpler
    // chipped templates than hero leaders. Art direction now pushes the square
    // chipping harder instead of mixing in other base silhouettes.
    sizeStep: 2,
    seedBuckets: 52,
    minChipSize: FOLLOWER_CHIP_MIN_SIZE,
    cutChanceMin: 1.04,
    cutChanceMax: 1.28,
    cutDepthMin: 0.09,
    cutDepthMax: 0.18,
    maxCuts: 4,
    notchTip: false,
  }),
  droppedShape: Object.freeze({
    // Dropped piles can spike into the hundreds; keep their geometry especially cheap.
    sizeStep: 2,
    seedBuckets: 40,
    minChipSize: 10,
    cutChanceMin: 0.98,
    cutChanceMax: 1.2,
    cutDepthMin: 0.082,
    cutDepthMax: 0.16,
    maxCuts: 4,
    notchTip: false,
  }),
  introCube: Object.freeze({
    sizeStep: 1,
    seedBuckets: 18,
    minChipSize: 10,
    cutChanceMin: 0.72,
    cutChanceMax: 0.92,
    cutDepthMin: 0.072,
    cutDepthMax: 0.13,
    maxCuts: 2,
    notchTip: false,
  }),
  smallLeader: Object.freeze({
    sizeStep: 0.5,
    seedBuckets: 64,
    minChipSize: 10,
    cutChanceMin: 0.72,
    cutChanceMax: 0.94,
    cutWidthMin: 0.032,
    cutWidthMax: 0.076,
    cutDepthMin: 0.04,
    cutDepthMax: 0.096,
    maxCuts: 2,
    notchTip: false,
  }),
  userLeader: Object.freeze({
    sizeStep: 0.25,
    seedBuckets: 192,
    minChipSize: 10,
    cutChanceMin: 0,
    cutChanceMax: 0,
    cutDepthMin: 0.13,
    cutDepthMax: 0.235,
    maxCuts: 0,
    notchTip: false,
  }),
  userLeaderCorrupted: Object.freeze({
    sizeStep: 0.25,
    seedBuckets: 192,
    minChipSize: 10,
    cutChanceMin: 1.08,
    cutChanceMax: 1.3,
    cutDepthMin: 0.14,
    cutDepthMax: 0.255,
    maxCuts: FINAL_HURT_MAX_VCUTS,
    notchTip: true,
  }),
  bigLeader: Object.freeze({
    sizeStep: 0.25,
    seedBuckets: 224,
    minChipSize: 10,
    cutChanceMin: 0.82,
    cutChanceMax: 1.02,
    cutWidthMin: 0.028,
    cutWidthMax: 0.068,
    cutDepthMin: 0.036,
    cutDepthMax: 0.088,
    maxCuts: 3,
    notchTip: false,
  }),
});

const PATTERN_STYLES = ["polkadots", "checker", "stripes"];
const PATTERN_ACCENTS = WEBSITE_MAIN_PALETTE.map((color) => color.slice());

const CYCLE_PHASES = [
  {
    name: "Yellow",
    leaderColor: COLOR_YELLOW,
    low: COLOR_YELLOW,
    high: COLOR_YELLOW,
    accent: COLOR_PINK,
  },
  {
    name: "Pink",
    leaderColor: COLOR_PINK,
    low: COLOR_PINK,
    high: COLOR_PINK,
    accent: COLOR_CYAN,
  },
  {
    name: "Cyan",
    leaderColor: COLOR_CYAN,
    low: COLOR_CYAN,
    high: COLOR_CYAN,
    accent: COLOR_YELLOW,
  },
];

const REFERENCE_COLOR_SCHEMES = [
  {
    name: "Spec1 Main",
    colors: ["#FE1595", "#1DD9DB", "#FED602"],
  },
];

const REBUILD_KEYS = new Set([
  "autonomousLeaderCount",
  "minFollowersPerLeader",
  "maxFollowersPerLeader",
  "userFollowerCount",
  "leaderSize",
  "bigLeaderSize",
  "followerSizeMin",
  "followerSizeMax",
  "globalElementScale",
  "userLeaderScale",
  "smallLeaderScale",
  "macroLeaderScale",
  "followerScale",
  "narrativeCubeScale",
  "droppedShapeScale",
  "cycleFollowerStartFactor",
  "cycleFollowerGrowthPerCycle",
  "cycleFollowerMaxFactor",
  "followerOrbitRadiusMin",
  "followerOrbitRadiusMax",
]);

const BACKDROP_REBUILD_KEYS = new Set([
  "gridDensity",
  "gridLineScale",
  "gridLineOpacity",
]);

function preload() {
  // Caveat Brush is loaded through the page head to match the Spec1 website.
  p5IntroFont = null;
}

function setup() {
  const world = getWorldSize();
  climateCanvas = createCanvas(world.width, world.height);
  climateCanvas.parent("p5-canvas-wrap");

  pixelDensity(1);
  angleMode(RADIANS);
  rectMode(CENTER);

  // Prime canvas text style immediately so text uses the Spec1 Caveat Brush face.
  textFont(P5_INTRO_FONT_STACK);
  textStyle(NORMAL);
  if (document.fonts && typeof document.fonts.load === "function") {
    document.fonts.load(`400 16px "${P5_INTRO_FONT_FAMILY}"`).catch(() => {
      // Ignore load failures; browser will keep closest available local fallback.
    });
  }
  initCrowdAudio();
  initFabricCollisionAudio();
  initFabricDropAudio();
  initPickupAudio();
  initMouseClickAudio();
  initTextPopupAudio();
  initWalkingAudio();
  initTensionAudio();

  // World canvas is clipped by the preview shell in page layout mode.
  climateCanvas.elt.style.position = "absolute";
  climateCanvas.elt.style.top = "0";
  climateCanvas.elt.style.left = "0";
  climateCanvas.elt.style.willChange = "transform";

  boidConfig = readConfigSnapshot();
  bindControlEvents();
  rebuildSimulation();
  updatePreviewWindow();

  if (isArtOnlyMode()) {
    startSimulationIfNeeded();
  } else {
    // Keep scene paused until user explicitly starts from fullscreen button.
    noLoop();
    redraw();
  }
}

function initCrowdAudio() {
  if (crowdAudio || typeof Audio !== "function") {
    return;
  }

  const inlineAudio =
    typeof document !== "undefined"
      ? document.getElementById("crowd-audio")
      : null;
  crowdAudio =
    inlineAudio instanceof HTMLAudioElement
      ? inlineAudio
      : new Audio(CROWD_AUDIO_SRC);
  crowdAudio.preload = "auto";
  crowdAudio.loop = false;
  crowdAudio.playsInline = true;
  crowdAudio.volume = 1;
  crowdAudio.load();
}

function initFabricCollisionAudio() {
  if (fabricCollisionAudioPools.length > 0 || typeof Audio !== "function") {
    return;
  }

  for (const src of FABRIC_COLLISION_AUDIO_SRCS) {
    const pool = [];
    for (let i = 0; i < FABRIC_COLLISION_POOL_SIZE; i += 1) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.playsInline = true;
      audio.volume = 0.55;
      audio.load();
      pool.push(audio);
    }
    fabricCollisionAudioPools.push(pool);
  }
}

function initFabricDropAudio() {
  if (fabricDropAudioPools.length > 0 || typeof Audio !== "function") {
    return;
  }

  for (const src of FABRIC_DROP_AUDIO_SRCS) {
    const pool = [];
    for (let i = 0; i < FABRIC_DROP_AUDIO_POOL_SIZE; i += 1) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.playsInline = true;
      audio.volume = 0.7;
      audio.load();
      pool.push(audio);
    }
    fabricDropAudioPools.push(pool);
  }
}

function initPickupAudio() {
  if (pickupAudioPools.length > 0 || typeof Audio !== "function") {
    return;
  }

  for (const src of PICKUP_AUDIO_SRCS) {
    const pool = [];
    for (let i = 0; i < PICKUP_AUDIO_POOL_SIZE; i += 1) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.playsInline = true;
      audio.volume = 0.68;
      audio.load();
      pool.push(audio);
    }
    pickupAudioPools.push(pool);
  }
}

function initMouseClickAudio() {
  if (mouseClickAudioPools.length > 0 || typeof Audio !== "function") {
    return;
  }

  for (const src of MOUSE_CLICK_AUDIO_SRCS) {
    const pool = [];
    for (let i = 0; i < MOUSE_CLICK_AUDIO_POOL_SIZE; i += 1) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.playsInline = true;
      audio.volume = 1;
      audio.load();
      pool.push(audio);
    }
    mouseClickAudioPools.push(pool);
  }
}

function initTextPopupAudio() {
  if (textPopupAudioPool.length > 0 || typeof Audio !== "function") {
    return;
  }

  for (let i = 0; i < TEXT_POPUP_AUDIO_POOL_SIZE; i += 1) {
    const audio = new Audio(TEXT_POPUP_AUDIO_SRC);
    audio.preload = "auto";
    audio.playsInline = true;
    audio.volume = 0.76;
    audio.preservesPitch = false;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;
    audio.load();
    textPopupAudioPool.push(audio);
  }
}

function initWalkingAudio() {
  if (walkingAudioPools.length > 0 || typeof Audio !== "function") {
    return;
  }

  for (const src of WALKING_AUDIO_SRCS) {
    const pool = [];
    for (let i = 0; i < WALKING_AUDIO_POOL_SIZE; i += 1) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.playsInline = true;
      audio.volume = 0.42;
      audio.load();
      pool.push(audio);
    }
    walkingAudioPools.push(pool);
  }
}

function initTensionAudio() {
  if (tensionAudio || typeof Audio !== "function") {
    return;
  }

  tensionAudio = new Audio(TENSION_AUDIO_SRC);
  tensionAudio.preload = "auto";
  tensionAudio.playsInline = true;
  tensionAudio.loop = false;
  tensionAudio.volume = 0.72;
  tensionAudio.load();
}

function primeFabricCollisionAudio() {
  initFabricCollisionAudio();

  if (fabricCollisionAudioPrimed || fabricCollisionAudioPools.length === 0) {
    return;
  }

  const targets = fabricCollisionAudioPools
    .map((pool) => (Array.isArray(pool) ? pool[0] : null))
    .filter(Boolean);

  if (targets.length === 0) {
    return;
  }

  Promise.all(
    targets.map((audio) => {
      const previousMuted = audio.muted;
      audio.muted = true;
      return audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        })
        .catch(() => {
          audio.muted = previousMuted;
        });
    }),
  ).finally(() => {
    fabricCollisionAudioPrimed = true;
  });
}

function primeFabricDropAudio() {
  initFabricDropAudio();

  if (fabricDropAudioPrimed || fabricDropAudioPools.length === 0) {
    return;
  }

  const targets = fabricDropAudioPools
    .map((pool) => (Array.isArray(pool) ? pool[0] : null))
    .filter(Boolean);

  if (targets.length === 0) {
    return;
  }

  Promise.all(
    targets.map((audio) => {
      const previousMuted = audio.muted;
      audio.muted = true;
      return audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        })
        .catch(() => {
          audio.muted = previousMuted;
        });
    }),
  ).finally(() => {
    fabricDropAudioPrimed = true;
  });
}

function primePickupAudio() {
  initPickupAudio();

  if (pickupAudioPrimed || pickupAudioPools.length === 0) {
    return;
  }

  const targets = pickupAudioPools
    .map((pool) => (Array.isArray(pool) ? pool[0] : null))
    .filter(Boolean);

  if (targets.length === 0) {
    return;
  }

  Promise.all(
    targets.map((audio) => {
      const previousMuted = audio.muted;
      audio.muted = true;
      return audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        })
        .catch(() => {
          audio.muted = previousMuted;
        });
    }),
  ).finally(() => {
    pickupAudioPrimed = true;
  });
}

function primeMouseClickAudio() {
  initMouseClickAudio();

  if (mouseClickAudioPrimed || mouseClickAudioPools.length === 0) {
    return;
  }

  const targets = mouseClickAudioPools
    .map((pool) => (Array.isArray(pool) ? pool[0] : null))
    .filter(Boolean);

  if (targets.length === 0) {
    return;
  }

  Promise.all(
    targets.map((audio) => {
      const previousMuted = audio.muted;
      audio.muted = true;
      return audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        })
        .catch(() => {
          audio.muted = previousMuted;
        });
    }),
  ).finally(() => {
    mouseClickAudioPrimed = true;
  });
}

function primeTextPopupAudio() {
  initTextPopupAudio();

  if (textPopupAudioPrimed || textPopupAudioPool.length === 0) {
    return;
  }

  const audio = textPopupAudioPool[0];
  const previousMuted = audio.muted;
  audio.muted = true;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = previousMuted;
      textPopupAudioPrimed = true;
    })
    .catch(() => {
      audio.muted = previousMuted;
    });
}

function primeWalkingAudio() {
  initWalkingAudio();

  if (walkingAudioPrimed || walkingAudioPools.length === 0) {
    return;
  }

  const targets = walkingAudioPools
    .map((pool) => (Array.isArray(pool) ? pool[0] : null))
    .filter(Boolean);

  if (targets.length === 0) {
    return;
  }

  Promise.all(
    targets.map((audio) => {
      const previousMuted = audio.muted;
      audio.muted = true;
      return audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = previousMuted;
        })
        .catch(() => {
          audio.muted = previousMuted;
        });
    }),
  ).finally(() => {
    walkingAudioPrimed = true;
  });
}

function primeTensionAudio() {
  initTensionAudio();

  if (!tensionAudio || tensionAudioPrimed) {
    return;
  }

  const previousMuted = tensionAudio.muted;
  tensionAudio.muted = true;
  tensionAudio
    .play()
    .then(() => {
      tensionAudio.pause();
      tensionAudio.currentTime = 0;
      tensionAudio.muted = previousMuted;
      tensionAudioPrimed = true;
    })
    .catch(() => {
      tensionAudio.muted = previousMuted;
    });
}

function fadeAudioElementOut(audio, durationMs = FINAL_AUDIO_FADE_OUT_MS) {
  if (!audio || audio.paused || audio.muted) {
    return;
  }

  const startVolume = Number.isFinite(audio.volume) ? audio.volume : 1;
  const startedAt =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  const tickMs = 33;

  const fadeId = setInterval(() => {
    const now =
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    const progress = constrain((now - startedAt) / durationMs, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    audio.volume = max(0, startVolume * (1 - eased));

    if (progress >= 1) {
      clearInterval(fadeId);
      audio.pause();
      audio.currentTime = 0;
      audio.volume = startVolume;
    }
  }, tickMs);
}

function fadeAudioPoolOut(poolCollection) {
  for (const pool of poolCollection) {
    if (!Array.isArray(pool)) {
      continue;
    }

    for (const audio of pool) {
      fadeAudioElementOut(audio);
    }
  }
}

function fadeOutAndLockNonTensionAudio() {
  if (finalAudioLockActive) {
    return;
  }

  finalAudioLockActive = true;
  fadeAudioElementOut(crowdAudio);
  fadeAudioPoolOut(fabricCollisionAudioPools);
  fadeAudioPoolOut(fabricDropAudioPools);
  fadeAudioPoolOut(pickupAudioPools);
  fadeAudioPoolOut(mouseClickAudioPools);
  fadeAudioPoolOut([textPopupAudioPool]);
  fadeAudioPoolOut(walkingAudioPools);

  if (
    typeof window !== "undefined" &&
    window.OrganicMusic &&
    typeof window.OrganicMusic.fadeOutAndLock === "function"
  ) {
    window.OrganicMusic.fadeOutAndLock(FINAL_AUDIO_FADE_OUT_MS);
  }
}

function getCollisionAudioEntityId(entity) {
  if (!entity || typeof entity !== "object") {
    return 0;
  }

  if (!Number.isFinite(entity._collisionAudioId)) {
    entity._collisionAudioId = nextCollisionAudioEntityId;
    nextCollisionAudioEntityId += 1;
  }

  return entity._collisionAudioId;
}

function isUserLeaderCollisionBody(body) {
  return Boolean(body && body.kind === "leader" && body.entity === userLeader);
}

function isDroppedCollisionBody(body) {
  return Boolean(
    body && (body.kind === "dropped" || body.kind === "dropped-static"),
  );
}

function getFabricCollisionPairKey(a, b) {
  const leftId = a && Number.isFinite(a.audioEntityId) ? a.audioEntityId : 0;
  const rightId = b && Number.isFinite(b.audioEntityId) ? b.audioEntityId : 0;

  if (leftId <= 0 || rightId <= 0) {
    return null;
  }

  return leftId < rightId ? `${leftId}:${rightId}` : `${rightId}:${leftId}`;
}

function getFabricCollisionRearmDistance(a, b) {
  const smallerRadius = min(
    a && Number.isFinite(a.radius) ? a.radius : FABRIC_COLLISION_REARM_DISTANCE_MIN,
    b && Number.isFinite(b.radius) ? b.radius : FABRIC_COLLISION_REARM_DISTANCE_MIN,
  );
  return constrain(
    smallerRadius * 0.38,
    FABRIC_COLLISION_REARM_DISTANCE_MIN,
    FABRIC_COLLISION_REARM_DISTANCE_MAX,
  );
}

function getFabricCollisionPairState(pairKey) {
  if (!pairKey) {
    return null;
  }

  let state = fabricCollisionPairStates.get(pairKey);
  if (!state) {
    state = {
      lastFullPlayedAt: 0,
      lastQuietPlayedAt: 0,
      lastContactAt: 0,
      rearmed: true,
    };
    fabricCollisionPairStates.set(pairKey, state);
  }

  if (fabricCollisionPairStates.size > FABRIC_COLLISION_MAX_PAIR_CACHE) {
    const oldestKey = fabricCollisionPairStates.keys().next().value;
    if (oldestKey !== undefined) {
      fabricCollisionPairStates.delete(oldestKey);
    }
  }

  return state;
}

function markFabricCollisionPairSeparation(a, b, separationDistance) {
  const pairKey = getFabricCollisionPairKey(a, b);
  if (!pairKey) {
    return;
  }

  const state = fabricCollisionPairStates.get(pairKey);
  if (!state) {
    return;
  }

  if (separationDistance >= getFabricCollisionRearmDistance(a, b)) {
    state.rearmed = true;
  }
}

function pickFabricCollisionAudioInstance() {
  if (fabricCollisionAudioPools.length === 0) {
    return null;
  }

  const pool =
    fabricCollisionAudioPools[floor(random(fabricCollisionAudioPools.length))];
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }

  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }

  return pool[0];
}

function playFabricCollisionSound(volume) {
  if (finalAudioLockActive) {
    return;
  }

  initFabricCollisionAudio();
  const audio = pickFabricCollisionAudioInstance();
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
  audio.volume = constrain(volume, 0.05, 0.8);
  audio.muted = false;
  audio.play().catch(() => {
    // Ignore late-play failures; collisions still resolve visually.
  });
}

function pickFabricDropAudioInstance() {
  if (fabricDropAudioPools.length === 0) {
    return null;
  }

  const pool = fabricDropAudioPools[floor(random(fabricDropAudioPools.length))];
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }

  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }

  return pool[0];
}

function playFabricDropSound() {
  if (finalAudioLockActive) {
    return;
  }

  initFabricDropAudio();
  const audio = pickFabricDropAudioInstance();
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
  audio.muted = false;
  audio.volume = 0.7;
  audio.play().catch(() => {
    // Ignore playback failures; drops still happen visually.
  });
}

function queueFabricCollisionSoundForBodies(a, b, impactStrength) {
  if (finalAudioLockActive) {
    return;
  }

  if (impactStrength < FABRIC_COLLISION_MIN_IMPACT) {
    return;
  }

  const involvesUserLeader =
    isUserLeaderCollisionBody(a) || isUserLeaderCollisionBody(b);
  const involvesDropped = isDroppedCollisionBody(a) || isDroppedCollisionBody(b);
  if (!involvesUserLeader && !involvesDropped) {
    return;
  }

  const nowMs = millis();
  if (nowMs - lastFabricCollisionSoundAtMs < FABRIC_COLLISION_MIN_INTERVAL_MS) {
    return;
  }

  const pairKey = getFabricCollisionPairKey(a, b);
  let sustainedContact = false;
  if (pairKey) {
    const state = getFabricCollisionPairState(pairKey);
    if (
      state.lastContactAt > 0 &&
      nowMs - state.lastContactAt >= FABRIC_COLLISION_REARM_IDLE_MS
    ) {
      state.rearmed = true;
    }

    sustainedContact = Boolean(state && !state.rearmed);
    state.lastContactAt = nowMs;

    if (sustainedContact) {
      if (
        nowMs - state.lastQuietPlayedAt <
        FABRIC_COLLISION_CONTACT_COOLDOWN_MS
      ) {
        return;
      }
      state.lastQuietPlayedAt = nowMs;
    } else {
      if (nowMs - state.lastFullPlayedAt < FABRIC_COLLISION_PAIR_COOLDOWN_MS) {
        return;
      }
      state.lastFullPlayedAt = nowMs;
      state.rearmed = false;
    }
  }

  const fullVolume = map(
    constrain(impactStrength, FABRIC_COLLISION_MIN_IMPACT, 2.1),
    FABRIC_COLLISION_MIN_IMPACT,
    2.1,
    0.18,
    0.72,
  );
  const volume = sustainedContact
    ? min(
        FABRIC_COLLISION_CONTACT_VOLUME_MAX,
        max(0.06, fullVolume * FABRIC_COLLISION_CONTACT_VOLUME_SCALE),
      )
    : fullVolume;

  lastFabricCollisionSoundAtMs = nowMs;
  playFabricCollisionSound(volume);
}

function pickPickupAudioInstance() {
  if (pickupAudioPools.length === 0) {
    return null;
  }

  const pool = pickupAudioPools[floor(random(pickupAudioPools.length))];
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }

  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }

  return pool[0];
}

function playPickupSound() {
  if (finalAudioLockActive) {
    return;
  }

  initPickupAudio();
  const audio = pickPickupAudioInstance();
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
  audio.muted = false;
  audio.volume = 0.68;
  audio.play().catch(() => {
    // Ignore autoplay failures; pickup still proceeds visually.
  });
}

function pickMouseClickAudioInstance() {
  if (mouseClickAudioPools.length === 0) {
    return null;
  }

  const pool = mouseClickAudioPools[floor(random(mouseClickAudioPools.length))];
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }

  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }

  return pool[0];
}

function playMouseClickSound() {
  if (finalAudioLockActive) {
    return;
  }

  initMouseClickAudio();
  const audio = pickMouseClickAudioInstance();
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
  audio.muted = false;
  audio.volume = 1;
  audio.play().catch(() => {
    // Ignore autoplay failures; click input still behaves normally.
  });
}

function pickTextPopupAudioInstance() {
  if (textPopupAudioPool.length === 0) {
    return null;
  }

  for (const audio of textPopupAudioPool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }

  return textPopupAudioPool[0];
}

function getTextPopupPlaybackRate() {
  const cycleCount = max(
    0,
    Number.isFinite(completedCycleCount) ? completedCycleCount : 0,
  );
  return constrain(
    Math.pow(TEXT_POPUP_PITCH_STEP_PER_CYCLE, cycleCount),
    0.65,
    1,
  );
}

function playTextPopupSound() {
  if (isPreviewMode()) {
    return;
  }

  if (finalAudioLockActive) {
    return;
  }

  const nowMs = millis();
  if (nowMs - lastTextPopupSoundAtMs < TEXT_POPUP_MIN_INTERVAL_MS) {
    return;
  }

  initTextPopupAudio();
  const audio = pickTextPopupAudioInstance();
  if (!audio) {
    return;
  }

  lastTextPopupSoundAtMs = nowMs;
  audio.pause();
  audio.currentTime = 0;
  audio.muted = false;
  audio.volume = 0.76;
  audio.preservesPitch = false;
  audio.mozPreservesPitch = false;
  audio.webkitPreservesPitch = false;
  audio.playbackRate = getTextPopupPlaybackRate();
  audio.play().catch(() => {
    // Ignore playback failures; text still appears visually.
  });
}

function pickWalkingAudioInstance() {
  if (walkingAudioPools.length === 0) {
    return null;
  }

  const pool = walkingAudioPools[floor(random(walkingAudioPools.length))];
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }

  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }

  return pool[0];
}

function playWalkingSound(volume = 0.42) {
  if (finalAudioLockActive) {
    return;
  }

  const nowMs = millis();
  if (nowMs - lastWalkingSoundAtMs < WALKING_AUDIO_MIN_INTERVAL_MS) {
    return;
  }

  initWalkingAudio();
  const audio = pickWalkingAudioInstance();
  if (!audio) {
    return;
  }

  lastWalkingSoundAtMs = nowMs;
  audio.pause();
  audio.currentTime = 0;
  audio.muted = false;
  audio.volume = constrain(volume, 0.18, 0.48);
  audio.play().catch(() => {
    // Ignore playback failures; small leaders still move visually.
  });
}

function beginTextPopupFrame() {
  previousTextPopupKeys = currentTextPopupKeys;
  currentTextPopupKeys = new Set();
}

function noteTextPopupVisible(key) {
  if (!key) {
    return;
  }

  currentTextPopupKeys.add(key);
  if (!previousTextPopupKeys.has(key)) {
    playTextPopupSound();
  }
}

function playTensionWave() {
  initTensionAudio();
  if (!tensionAudio) {
    return;
  }

  fadeOutAndLockNonTensionAudio();
  tensionAudio.pause();
  tensionAudio.currentTime = 0;
  tensionAudio.muted = false;
  tensionAudio.volume = 0.72;
  tensionAudio.play().catch(() => {
    // Ignore playback failures when the browser refuses late audio starts.
  });
}

function draw() {
  beginTextPopupFrame();

  if (!boidConfig) {
    return;
  }

  paintBackdrop();

  if (!simulationStarted) {
    drawDroppedShapes();
    drawPreStartOverlay();
    drawScanlineOverlay();
    updatePreviewWindow();
    return;
  }

  updateUserLeader();

  if (assimilationSequenceStarted) {
    updateInfluenceState();
    updateBigTrendLeaders();
    updateSmallLeaders();

    updateFollowersForLeader(userFollowers, userLeader);

    for (const swarm of smallSwarms) {
      const smallFollowerSpeedFactor = getSmallFollowerCycleSpeedFactor();
      updateFollowersForLeader(swarm.followers, swarm.leader, {
        allowIndividualWrap: false,
        // Control: cycleFollowerSpeedGrowthPerCycle accelerates the small-swarm shapes every completed cycle.
        maxSpeedMultiplier: smallFollowerSpeedFactor,
        followStrengthMultiplier: smallFollowerSpeedFactor,
      });
    }

    pruneExitedSmallSwarmsForMacroExit();
  } else {
    updateNarrativeSequence();
  }

  processPendingDroppedShapes();
  updateDroppedShapes();
  resolveGlobalCollisionPhysics();
  updateUserLeader();
  updateFinalHurtState();

  drawFinalHurtLiquidFlood();
  drawWorldEntitiesWithFinalHurtSink();
  drawNarrativeOverlay();
  // Scanlines are composited last so the filter sits above all scene and UI canvas content.
  drawScanlineOverlay();
  updatePreviewWindow();
}

function windowResized() {
  syncCanvasSize();
}

function readConfigSnapshot() {
  const controls = window.BoidControls;

  if (!controls || typeof controls.getConfig !== "function") {
    return getFallbackConfig();
  }

  return controls.getConfig();
}

function bindControlEvents() {
  const controls = window.BoidControls;

  if (!controls || typeof controls.subscribe !== "function") {
    return;
  }

  controls.subscribe((nextConfig, changedKey) => {
    boidConfig = nextConfig;

    if (changedKey === "__init__") {
      return;
    }

    if (
      changedKey === "__reset__" ||
      changedKey === "__rebuild__" ||
      REBUILD_KEYS.has(changedKey)
    ) {
      rebuildSimulation();
      return;
    }

    if (BACKDROP_REBUILD_KEYS.has(changedKey)) {
      rebuildBackdropLayers();

      if (!simulationStarted) {
        redraw();
      }

      return;
    }

    if (!simulationStarted) {
      redraw();
    }
  });
}

// Full reset of boids and backdrop layers while preserving fullscreen world rendering.
function rebuildSimulation() {
  if (!boidConfig) {
    return;
  }

  stopCrowdAudio();

  influenceActive = false;
  macroExitActive = false;
  macroExitFrames = 0;
  smallSwarmExitActive = false;
  smallSwarmExitQueued = false;

  cyclePhaseIndex = 0;
  completedCycleCount = 0;
  cycleWaitingForReturn = false;
  cycleReturnAtMs = 0;
  cycleReturnForceStartAtMs = 0;
  influenceCycleStartedAtMs = 0;
  cycleLimitReached = false;
  cycleCompletionMessageDelayUntilMs = 0;
  assimilationSequenceStarted = false;
  narrativePromptHideAtMs = 0;

  droppedShapes = [];
  pendingDroppedShapes = [];
  lastMacroLeaderDespawnPoint = null;
  lastMacroLeaderRoute = null;
  grainRevealDropCount = 0;
  backgroundGrainRevealAlpha = BACKGROUND_GRAIN_START_ALPHA;
  droppedStaticCollisionBodies = [];
  droppedStaticCacheDirty = true;
  fabricCollisionPairStates = new Map();
  lastFabricCollisionSoundAtMs = 0;
  lastTextPopupSoundAtMs = 0;
  lastWalkingSoundAtMs = 0;
  previousTextPopupKeys = new Set();
  currentTextPopupKeys = new Set();
  finalHurtTensionPlayed = false;
  finalAudioLockActive = false;
  if (
    typeof window !== "undefined" &&
    window.OrganicMusic &&
    typeof window.OrganicMusic.unlock === "function"
  ) {
    window.OrganicMusic.unlock();
  }

  userLeader = createLeader(
    getWorldCenterPoint(),
    boidConfig.leaderSize * 1.15,
    USER_SWARM_COLOR,
    true,
    "userLeaderScale",
  );
  centerUserLeaderForSpawn();

  // Narrative intro starts with only the user icon and staged interactive cubes.
  userFollowers = [];
  smallSwarms = [];
  bigTrendLeaders = [];
  initNarrativeSequence();
  rebuildBackdropLayers();
  prewarmRenderCaches();

  const previewFocus = getPreviewFocusPoint();
  previewOffsetX = max(0, min(width, previewFocus.x));
  previewOffsetY = max(0, min(height, previewFocus.y));
}

function playCrowdAudio() {
  if (finalAudioLockActive) {
    return;
  }

  initCrowdAudio();

  if (!crowdAudio) {
    return;
  }

  if (!crowdAudio.paused) {
    crowdAudio.pause();
  }

  if (crowdAudio.currentTime > 0) {
    crowdAudio.currentTime = 0;
  }

  crowdAudio.muted = false;
  crowdAudio.preload = "auto";
  crowdAudio.play().catch(() => {
    // Ignore autoplay rejections; assimilation begins from a user gesture in normal use.
  });
}

function primeCrowdAudio() {
  initCrowdAudio();
  initFabricCollisionAudio();
  initFabricDropAudio();
  initPickupAudio();
  initMouseClickAudio();
  initTextPopupAudio();
  initWalkingAudio();
  initTensionAudio();

  if (finalAudioLockActive) {
    primeTensionAudio();
    return;
  }

  primeFabricCollisionAudio();
  primeFabricDropAudio();
  primePickupAudio();
  primeMouseClickAudio();
  primeTextPopupAudio();
  primeWalkingAudio();
  primeTensionAudio();

  if (!crowdAudio || crowdAudioPrimed) {
    return;
  }

  const previousMuted = crowdAudio.muted;
  crowdAudio.muted = true;
  crowdAudio
    .play()
    .then(() => {
      crowdAudio.pause();
      crowdAudio.currentTime = 0;
      crowdAudio.muted = previousMuted;
      crowdAudioPrimed = true;
    })
    .catch(() => {
      crowdAudio.muted = previousMuted;
    });
}

function stopCrowdAudio() {
  if (!crowdAudio) {
    return;
  }

  crowdAudio.pause();
  crowdAudio.currentTime = 0;
  crowdAudio.muted = false;
}

function getCurrentPhaseProfile() {
  return CYCLE_PHASES[cyclePhaseIndex % CYCLE_PHASES.length];
}

function getWorldCenterPoint() {
  return createVector(width * 0.5, height * 0.5);
}

function getNarrativePromptCenterY(textSizePx = getOverlayTextSizePx(1, 24, 0)) {
  const promptTextSize = max(22, textSizePx);
  return constrain(
    height * NARRATIVE_PROMPT_Y_RATIO,
    promptTextSize * 0.7 + 12,
    height - promptTextSize * 0.7 - 20,
  );
}

function getUserStagePoint() {
  const promptY = getNarrativePromptCenterY();
  const leaderSize =
    userLeader && Number.isFinite(userLeader.size) ? userLeader.size : 42;
  const gap = constrain(
    max(USER_STAGE_MIN_GAP_PX, leaderSize * 1.75),
    USER_STAGE_MIN_GAP_PX,
    max(USER_STAGE_MIN_GAP_PX, height * USER_STAGE_MAX_GAP_RATIO),
  );

  return createVector(width * 0.5, max(leaderSize * 1.2, promptY - gap));
}

function getPreviewFocusPoint() {
  const stagePoint = getUserStagePoint();
  const dialogueY = getNarrativePromptCenterY();
  return createVector(stagePoint.x, lerp(stagePoint.y, dialogueY, 0.38));
}

function shouldIntroCarryFollowPointer() {
  return getResponsiveEntityScale() >= LAPTOP_ENTITY_SCALE;
}

function centerUserLeaderForSpawn() {
  if (!userLeader) {
    return;
  }

  const stagePoint = getUserStagePoint();
  userLeader.pos.x = stagePoint.x;
  userLeader.pos.y = stagePoint.y;
  userLeader.vel.x = 0;
  userLeader.vel.y = 0;
  userLeader.acc.x = 0;
  userLeader.acc.y = 0;
  userLeader.angle = -HALF_PI;
  userLeader.displayAngle = -HALF_PI;
  userLeader.portalProjection = null;
}

function advanceToNextCyclePhase() {
  cyclePhaseIndex = (cyclePhaseIndex + 1) % CYCLE_PHASES.length;
}

function isFinalAssimilationCycle() {
  return completedCycleCount + 1 >= MAX_ASSIMILATION_CYCLES;
}

function getSmallLeaderCycleSpeedFactor() {
  // Control: cycleLeaderSpeedGrowthPerCycle adds extra small-leader speed after each completed cycle.
  const growth = max(0, boidConfig.cycleLeaderSpeedGrowthPerCycle ?? 0);
  return 1 + completedCycleCount * growth;
}

function getSmallFollowerCycleSpeedFactor() {
  // Control: cycleFollowerSpeedGrowthPerCycle keeps small-swarm followers fast enough to stay visually synced.
  const growth = max(0, boidConfig.cycleFollowerSpeedGrowthPerCycle ?? 0);
  return 1 + completedCycleCount * growth;
}

function applySmallSwarmCycleMotionProfile(swarm) {
  if (!swarm || !swarm.leader) {
    return;
  }

  const leaderSpeedFactor = getSmallLeaderCycleSpeedFactor();
  const steeringFactor = 1 + (leaderSpeedFactor - 1) * 0.38;

  // Control: leaderMaxSpeed is the base pace, then cycleLeaderSpeedGrowthPerCycle stacks on top every cycle.
  swarm.leader.maxSpeed = boidConfig.leaderMaxSpeed * leaderSpeedFactor;
  // Keep turning responsive as the cycle-speed control pushes the leaders faster and farther each round.
  swarm.leader.maxForce = boidConfig.leaderMaxForce * steeringFactor;
  swarm.leader.wanderWeight = boidConfig.wanderWeight;
}

function getCycleFollowerFactor() {
  const startFactor = constrain(boidConfig.cycleFollowerStartFactor, 0.05, 2);
  const growthPerCycle = max(0, boidConfig.cycleFollowerGrowthPerCycle);
  const maxFactor = max(startFactor, boidConfig.cycleFollowerMaxFactor);

  return min(maxFactor, startFactor + completedCycleCount * growthPerCycle);
}

function getResponsiveEntityScale() {
  const viewportWidth =
    typeof window !== "undefined" && Number.isFinite(window.innerWidth)
      ? window.innerWidth
      : width;
  const viewportHeight =
    typeof window !== "undefined" && Number.isFinite(window.innerHeight)
      ? window.innerHeight
      : height;
  const shortSide = min(viewportWidth, viewportHeight);

  if (shortSide <= 560 || viewportWidth <= 600) {
    return PHONE_ENTITY_SCALE;
  }

  if (shortSide <= 820 || viewportWidth <= 1100) {
    return TABLET_ENTITY_SCALE;
  }

  if (viewportWidth <= 1366) {
    return LAPTOP_ENTITY_SCALE;
  }

  return 1;
}

function getResponsiveCount(baseCount, minCount = 0) {
  const scaledCount = round(max(0, baseCount) * getResponsiveEntityScale());
  return max(minCount, scaledCount);
}

function getCycleFollowerRange() {
  const scale = getCycleFollowerFactor();
  const minCount = max(1, round(boidConfig.minFollowersPerLeader * scale));
  const maxCount = max(
    minCount,
    round(boidConfig.maxFollowersPerLeader * scale),
  );

  return { minCount, maxCount };
}

function getFastCycleStepSeconds() {
  const ramp = max(0.1, boidConfig.assimilationRampPerCycle ?? 1);
  const accelerationBias = max(0, boidConfig.cycleReturnAccelerationPerCycle);
  // Profile target requested: 6 -> 4 -> 2 -> 1 -> 0.5 seconds, then hold.
  const profileStep = floor(
    completedCycleCount * ramp + completedCycleCount * accelerationBias * 0.5,
  );
  const clampedStep = constrain(
    profileStep,
    0,
    FAST_SEQUENCE_PROFILE_SECONDS.length - 1,
  );
  const baseDelay = max(0.1, boidConfig.cycleReturnDelaySeconds);
  const minDelay = max(0, boidConfig.minCycleReturnDelaySeconds);
  const baseScale = baseDelay / FAST_SEQUENCE_PROFILE_SECONDS[0];

  return max(minDelay, FAST_SEQUENCE_PROFILE_SECONDS[clampedStep] * baseScale);
}

function getSecondsToFinalCycle() {
  if (!boidConfig || typeof boidConfig.secondsToFinalCycle !== "number") {
    return 7;
  }

  return max(0.25, boidConfig.secondsToFinalCycle);
}

function isPreFinalCyclePhase() {
  return completedCycleCount < MAX_ASSIMILATION_CYCLES - 1;
}

function getExactPreFinalCycleWindowMs() {
  return (
    (getSecondsToFinalCycle() * 1000) / max(1, MAX_ASSIMILATION_CYCLES - 1)
  );
}

function getCurrentCycleReturnDelaySeconds() {
  if (isPreFinalCyclePhase()) {
    const configuredMinDelay =
      boidConfig && typeof boidConfig.minCycleReturnDelaySeconds === "number"
        ? boidConfig.minCycleReturnDelaySeconds
        : 0;
    // Give the surviving small swarms a short boid-only beat after each macro
    // exit so they keep moving without snapping toward the next target.
    return max(0.45, configuredMinDelay);
  }

  const sequenceSpeed = getSequenceSpeedMultiplier();

  return getFastCycleStepSeconds() / sequenceSpeed;
}

function getFinalCycleInfluenceWindowMs() {
  const exactWindowMs = getExactPreFinalCycleWindowMs();
  // Give the final macro leader enough on-screen time to actually register before the closing exit starts.
  return max(
    FINAL_CYCLE_INFLUENCE_MIN_MS,
    exactWindowMs * FINAL_CYCLE_INFLUENCE_SHARE,
  );
}

function getFinalCycleMacroExitWindowMs() {
  const exactWindowMs = getExactPreFinalCycleWindowMs();
  return max(
    FINAL_CYCLE_MACRO_EXIT_MIN_MS,
    exactWindowMs * FINAL_CYCLE_MACRO_EXIT_SHARE,
    getFinalCycleInfluenceWindowMs() * 0.78,
  );
}

function getCurrentInfluenceForceConvertMs() {
  if (isPreFinalCyclePhase()) {
    return max(
      250,
      getExactPreFinalCycleWindowMs() * PRE_FINAL_CYCLE_INFLUENCE_SHARE,
    );
  }

  if (isFinalAssimilationCycle()) {
    return getFinalCycleInfluenceWindowMs();
  }

  const sequenceSpeed = getSequenceSpeedMultiplier();
  return max(250, (getFastCycleStepSeconds() * 1000) / sequenceSpeed);
}

function getCurrentMacroExitDurationMs() {
  if (isPreFinalCyclePhase()) {
    return max(
      250,
      getExactPreFinalCycleWindowMs() - getCurrentInfluenceForceConvertMs(),
    );
  }

  if (isFinalAssimilationCycle()) {
    return getFinalCycleMacroExitWindowMs();
  }

  return max(320, getCurrentInfluenceForceConvertMs() * 0.9);
}

function getTravelDurationMs(distancePx, speedPerFrame, minDurationMs = 650) {
  // Movement constants in this sketch are pixels-per-frame, not pixels-per-ms.
  const framesNeeded = distancePx / max(0.1, speedPerFrame);
  return max(minDurationMs, framesNeeded * (1000 / 60));
}

function shouldUseTimedMacroExit() {
  return isPreFinalCyclePhase() || isFinalAssimilationCycle();
}

function hasCurrentInfluenceWindowElapsed() {
  if (!influenceCycleStartedAtMs) {
    return false;
  }

  return (
    millis() - influenceCycleStartedAtMs >= getCurrentInfluenceForceConvertMs()
  );
}

function hasMacroExitWindowElapsed(trend) {
  if (!trend || !trend.exitStartedAtMs) {
    return false;
  }

  const timeElapsed =
    millis() - trend.exitStartedAtMs >= max(1, trend.exitDurationMs || 1);
  if (!timeElapsed) {
    return false;
  }

  if (!trend.leader || !trend.leader.pos || !trend.exitTarget) {
    return true;
  }

  const dx = trend.leader.pos.x - trend.exitTarget.x;
  const dy = trend.leader.pos.y - trend.exitTarget.y;
  const snapRadius = max(8, trend.leader.size * 0.12);
  return dx * dx + dy * dy <= snapRadius * snapRadius;
}

function scheduleCycleReturn() {
  completedCycleCount += 1;

  // Hard cap requested: stop spawning additional cycles once cycle 5 has completed.
  if (completedCycleCount >= MAX_ASSIMILATION_CYCLES) {
    cycleLimitReached = true;
    cycleWaitingForReturn = false;
    cycleReturnAtMs = 0;
    cycleReturnForceStartAtMs = 0;
    influenceActive = false;
    influenceCycleStartedAtMs = 0;
    cycleCompletionMessageDelayUntilMs = millis();
    return;
  }

  advanceToNextCyclePhase();
  const returnDelaySeconds = getCurrentCycleReturnDelaySeconds();

  if (returnDelaySeconds <= 0) {
    cycleWaitingForReturn = false;
    cycleReturnAtMs = 0;
    cycleReturnForceStartAtMs = 0;
    buildBigTrendLeaders();

    // Small swarms now persist across cycles 1-4; only rebuild if they were fully cleared.
    if (smallSwarms.length === 0) {
      buildSmallSwarms();
    }

    startInfluenceCycle();
    return;
  }

  cycleWaitingForReturn = true;
  cycleReturnAtMs = millis() + returnDelaySeconds * 1000;
  cycleReturnForceStartAtMs =
    cycleReturnAtMs +
    max(CYCLE_RETURN_REGROUP_GRACE_MS, returnDelaySeconds * 900);
}

function getOffscreenCornerPoint(cornerIndex, margin) {
  const pad = max(16, margin);
  const normalized = ((cornerIndex % 4) + 4) % 4;

  if (normalized === 0) {
    return createVector(-pad, -pad);
  }

  if (normalized === 1) {
    return createVector(width + pad, -pad);
  }

  if (normalized === 2) {
    return createVector(width + pad, height + pad);
  }

  return createVector(-pad, height + pad);
}

function getScreenCornerPoint(cornerIndex, inset) {
  const pad = max(8, inset);
  const normalized = ((cornerIndex % 4) + 4) % 4;

  if (normalized === 0) {
    return createVector(pad, pad);
  }

  if (normalized === 1) {
    return createVector(width - pad, pad);
  }

  if (normalized === 2) {
    return createVector(width - pad, height - pad);
  }

  return createVector(pad, height - pad);
}

function getOffscreenEdgePoint(edgeIndex, edgeT, margin) {
  const pad = max(16, margin);
  const t = constrain(Number.isFinite(edgeT) ? edgeT : 0.5, 0.08, 0.92);
  const normalized = ((edgeIndex % 4) + 4) % 4;

  if (normalized === 0) {
    return createVector(lerp(0, width, t), -pad);
  }

  if (normalized === 1) {
    return createVector(width + pad, lerp(0, height, t));
  }

  if (normalized === 2) {
    return createVector(lerp(width, 0, t), height + pad);
  }

  return createVector(-pad, lerp(height, 0, t));
}

function getScreenEdgePoint(edgeIndex, edgeT, inset) {
  const pad = max(8, inset);
  const t = constrain(Number.isFinite(edgeT) ? edgeT : 0.5, 0.08, 0.92);
  const normalized = ((edgeIndex % 4) + 4) % 4;

  if (normalized === 0) {
    return createVector(lerp(pad, width - pad, t), pad);
  }

  if (normalized === 1) {
    return createVector(width - pad, lerp(pad, height - pad, t));
  }

  if (normalized === 2) {
    return createVector(lerp(width - pad, pad, t), height - pad);
  }

  return createVector(pad, lerp(height - pad, pad, t));
}

function createMacroLeaderRouteCandidate(spawnMargin, entryInset) {
  const spawnEdge = floor(random(4));
  const exitOffsetOptions = [1, 2, 3];
  const exitOffset = exitOffsetOptions[floor(random(exitOffsetOptions.length))];
  const exitEdge = (spawnEdge + exitOffset) % 4;
  const spawnT = random(0.1, 0.9);
  const exitT = random(0.1, 0.9);

  return {
    spawnEdge,
    exitEdge,
    spawnT,
    exitT,
    anchor: getOffscreenEdgePoint(spawnEdge, spawnT, spawnMargin),
    entryTarget: getScreenEdgePoint(exitEdge, exitT, entryInset),
  };
}

function getEdgeRouteDistance(edgeA, tA, edgeB, tB) {
  if (edgeA !== edgeB) {
    return 1 + abs(tA - tB) * 0.25;
  }

  return abs(tA - tB);
}

function getMacroRouteSeparationScore(route, previousRoute) {
  if (!previousRoute) {
    return Number.POSITIVE_INFINITY;
  }

  const spawnDistance = getEdgeRouteDistance(
    route.spawnEdge,
    route.spawnT,
    previousRoute.spawnEdge,
    previousRoute.spawnT,
  );
  const exitDistance = getEdgeRouteDistance(
    route.exitEdge,
    route.exitT,
    previousRoute.exitEdge,
    previousRoute.exitT,
  );

  // Favor different start and end zones so repeated macro cycles do not stamp
  // the same offscreen path, while still accepting any route after a few tries.
  return min(spawnDistance, exitDistance) + (spawnDistance + exitDistance) * 0.35;
}

function createMacroLeaderRoute(spawnMargin, entryInset) {
  let bestRoute = null;
  let bestScore = -Infinity;

  for (let attempt = 0; attempt < MACRO_ROUTE_ATTEMPTS; attempt += 1) {
    const route = createMacroLeaderRouteCandidate(spawnMargin, entryInset);
    const score = getMacroRouteSeparationScore(route, lastMacroLeaderRoute);

    if (score > bestScore) {
      bestRoute = route;
      bestScore = score;
    }

    if (score >= MACRO_ROUTE_MIN_SEPARATION_SCORE) {
      break;
    }
  }

  lastMacroLeaderRoute = bestRoute;
  return bestRoute;
}

function getFarthestOffscreenCornerPoint(position, margin) {
  let selectedCorner = getOffscreenCornerPoint(0, margin);
  let farthestDistanceSq = -1;

  for (let i = 0; i < 4; i += 1) {
    const corner = getOffscreenCornerPoint(i, margin);
    const dx = corner.x - position.x;
    const dy = corner.y - position.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq > farthestDistanceSq) {
      farthestDistanceSq = distanceSq;
      selectedCorner = corner;
    }
  }

  return selectedCorner;
}

function getMacroRouteExitPoint(trend, margin) {
  if (
    trend &&
    Number.isFinite(trend.entryExitEdge) &&
    Number.isFinite(trend.entryExitT)
  ) {
    return getOffscreenEdgePoint(trend.entryExitEdge, trend.entryExitT, margin);
  }

  if (trend && Number.isFinite(trend.entryTargetCorner)) {
    return getOffscreenCornerPoint(trend.entryTargetCorner, margin);
  }

  const position = trend && trend.leader ? trend.leader.pos : null;
  return getFarthestOffscreenCornerPoint(
    position || createVector(width * 0.5, height * 0.5),
    margin,
  );
}

function buildBigTrendLeaders() {
  bigTrendLeaders = [];
  lastMacroLeaderDespawnPoint = null;
  const phase = getCurrentPhaseProfile();
  const spawnMargin = boidConfig.bigLeaderSize * SHAPE_SIZE_BOOST * 1.9;
  const entryInset = max(28, boidConfig.bigLeaderSize * SHAPE_SIZE_BOOST);

  for (let i = 0; i < 1; i += 1) {
    const route = createMacroLeaderRoute(spawnMargin, entryInset);
    const anchor = route.anchor;
    // Enter from offscreen but settle on-screen so crossing remains visible.
    const entryTarget = route.entryTarget;

    const colorData = phase.leaderColor.slice();
    // Cycle the macro-imposed follower silhouette so each wave can land with a
    // distinct product language instead of repeating squares forever.
    const followerShape =
      FOLLOWER_SHAPE_TYPES[
        (cyclePhaseIndex + completedCycleCount + i) %
          FOLLOWER_SHAPE_TYPES.length
      ];
    const patternStyle =
      PATTERN_STYLES[
        (i + cyclePhaseIndex + completedCycleCount) % PATTERN_STYLES.length
      ];
    const accent = phase.accent.slice();

    const leader = createLeader(
      anchor,
      boidConfig.bigLeaderSize,
      colorData,
      false,
      "macroLeaderScale",
    );
    leader.maxSpeed = boidConfig.bigLeaderSpeed;
    leader.maxForce = boidConfig.bigLeaderForce;
    leader.wanderWeight = boidConfig.bigLeaderWander;
    leader.patternStyle = patternStyle;
    leader.patternAccent = accent.slice();
    leader.patternSeed = random(TWO_PI);
    leader.patternScale = random(0.8, 1.2);
    leader.entryActive = true;
    leader.exitActive = false;
    leader.entryStartedAtMs = millis();
    leader.exitStartedAtMs = 0;

    // Macro routes are randomized per cycle so leaders do not stamp the same
    // starting and ending positions across the performance.
    leader.vel = p5.Vector.sub(entryTarget, anchor);
    if (leader.vel.magSq() > 0.0001) {
      const entryDistance = leader.vel.mag();
      leader.entrySpeed = max(
        leader.maxSpeed * 1.02,
        entryDistance / 150,
      );
      leader.vel.setMag(leader.entrySpeed);
      leader.angle = leader.vel.heading();
      leader.displayAngle = leader.angle;
    }

    bigTrendLeaders.push({
      id: i,
      colorData,
      phaseProfile: phase,
      followerShape,
      leader,
      // Macro leaders intentionally carry no follower shapes; the small swarms
      // provide all consumer-item clutter and collisions.
      followers: [],
      exitOrigin: null,
      exitTarget: null,
      exitStartedAtMs: 0,
      exitDurationMs: 0,
      entrySpawnEdge: route.spawnEdge,
      entrySpawnT: route.spawnT,
      entryExitEdge: route.exitEdge,
      entryExitT: route.exitT,
      entryTarget,
      entryActive: true,
      entryFrames: 0,
      entryStartedAtMs: leader.entryStartedAtMs,
      dormant: false,
    });
  }
}

function buildSmallSwarms() {
  smallSwarms = [];
  const followerRange = getCycleFollowerRange();
  const swarmCount = getResponsiveCount(boidConfig.autonomousLeaderCount, 1);

  for (let i = 0; i < swarmCount; i += 1) {
    const baseColor = AUTONOMOUS_SWARM_BASE_COLOR.slice();
    const leader = createLeader(
      createVector(random(width), random(height)),
      boidConfig.leaderSize,
      baseColor,
      false,
      "smallLeaderScale",
    );

    const followerCount = floor(
      random(followerRange.minCount, followerRange.maxCount + 1),
    );

    const followers = createFollowers(leader, followerCount, {
      colorData: baseColor,
      forceShape: null,
    });

    smallSwarms.push({
      id: i,
      leader,
      followers,
      assignedTrend: null,
      exitTarget: null,
      currentColor: baseColor.slice(),
      assimilationBlend: random(0.15, 0.88),
      assimilationProgress: 0,
      grainRevealProgress: 0,
      grainRevealWeight: followers.length,
      droppedThisCycle: false,
      fullyAssimilated: false,
    });
  }
}

function applyResponsivePopulationLimits() {
  if (!boidConfig) {
    return;
  }

  const swarmCap = getResponsiveCount(boidConfig.autonomousLeaderCount, 1);
  if (smallSwarms.length > swarmCap) {
    smallSwarms.splice(swarmCap);
  }

  const followerRange = getCycleFollowerRange();
  for (const swarm of smallSwarms) {
    if (
      Array.isArray(swarm.followers) &&
      swarm.followers.length > followerRange.maxCount
    ) {
      swarm.followers.splice(followerRange.maxCount);
    }
  }

  const droppedShapeCap = getResponsiveCount(DROPPED_SHAPE_MAX, 24);
  if (droppedShapes.length > droppedShapeCap) {
    droppedShapes.splice(0, droppedShapes.length - droppedShapeCap);
    markDroppedCollisionCacheDirty();
  }

  if (pendingDroppedShapes.length > droppedShapeCap) {
    pendingDroppedShapes.splice(
      0,
      pendingDroppedShapes.length - droppedShapeCap,
    );
  }
}

function createLeader(position, size, colorData, isUser, scaleKey) {
  const scaledSize =
    size * SHAPE_SIZE_BOOST * getCombinedScale(scaleKey || "smallLeaderScale");

  const velocity = isUser
    ? createVector(0, 0)
    : p5.Vector.random2D().mult(random(0.2, boidConfig.leaderMaxSpeed));

  const initialHeading = velocity.magSq() > 0 ? velocity.heading() : -HALF_PI;

  return {
    pos: position.copy(),
    vel: velocity,
    acc: createVector(0, 0),
    angle: initialHeading,
    displayAngle: initialHeading,
    size: scaledSize,
    colorData: colorData.slice(),
    patternStyle: randomPatternStyle(),
    patternAccent: randomPatternAccent(),
    patternSeed: random(TWO_PI),
    patternScale: random(0.8, 1.24),
    wanderAngle: random(TWO_PI),
    portalProjection: null,
    isUser,
    // The player starts pristine and accrues V-cuts as soon as the final
    // end-state liquid begins, so the decay reads as the source of the blob.
    vCutCount: isUser ? 0 : null,
    finalHurtTouched: isUser ? false : null,
    finalHurtTouchedAtMs: isUser ? 0 : null,
    nextVCutAtMs: isUser ? 0 : null,
    controlsLocked: isUser ? false : null,
    grayBlend: isUser ? 0 : null,
    maxSpeed: boidConfig.leaderMaxSpeed,
    maxForce: boidConfig.leaderMaxForce,
    wanderWeight: boidConfig.wanderWeight,
  };
}

function createFollowers(leader, count, options) {
  const spawnOptions = options || {};
  const followerCount = max(0, floor(count));
  const followers = new Array(followerCount);
  const minOrbit = min(
    boidConfig.followerOrbitRadiusMin,
    boidConfig.followerOrbitRadiusMax,
  );
  const maxOrbit = max(
    boidConfig.followerOrbitRadiusMin,
    boidConfig.followerOrbitRadiusMax,
  );
  const minSize = min(boidConfig.followerSizeMin, boidConfig.followerSizeMax);
  const maxSize = max(boidConfig.followerSizeMin, boidConfig.followerSizeMax);
  const followerScale = getCombinedScale("followerScale");
  const forcedShape = spawnOptions.forceShape || null;
  const forcedPatternStyle = spawnOptions.forcePatternStyle || null;
  const forcedPatternAccent = spawnOptions.forcePatternAccent || null;
  const tintSource = Array.isArray(spawnOptions.colorData)
    ? spawnOptions.colorData
    : leader.colorData || COLOR_WHITE;

  for (let i = 0; i < followerCount; i += 1) {
    // Compute spawn offsets directly to avoid temporary vector allocation during mass follower creation.
    const orbitRadius = random(minOrbit, maxOrbit) * 1.08;
    const phase = random(TWO_PI);
    const spawnX = leader.pos.x + cos(phase) * orbitRadius;
    const spawnY = leader.pos.y + sin(phase) * orbitRadius;
    const velocityAngle = random(TWO_PI);
    const velocityMagnitude = random(0.35, 1.7);

    followers[i] = {
      type: forcedShape || randomFollowerShape(),
      pos: createVector(spawnX, spawnY),
      vel: createVector(
        cos(velocityAngle) * velocityMagnitude,
        sin(velocityAngle) * velocityMagnitude,
      ),
      angle: random(TWO_PI),
      size: random(minSize, maxSize) * SHAPE_SIZE_BOOST * followerScale,
      baseRadius: orbitRadius,
      orbitPhase: phase,
      orbitSpeed: random(-0.052, 0.052),
      tint: tintSource.slice(),
      colorBlend: random(0.08, 0.92),
      patternStyle: forcedPatternStyle || randomPatternStyle(),
      patternAccent: forcedPatternAccent
        ? forcedPatternAccent.slice()
        : randomPatternAccent(),
      patternSeed: random(TWO_PI),
      patternScale: random(0.74, 1.3),
      portalProjection: null,
    };
  }

  return followers;
}

function randomFollowerShape() {
  return FOLLOWER_SHAPE_TYPES[floor(random(FOLLOWER_SHAPE_TYPES.length))];
}

function randomPatternStyle() {
  return PATTERN_STYLES[floor(random(PATTERN_STYLES.length))];
}

function randomPatternAccent() {
  const swatch = PATTERN_ACCENTS[floor(random(PATTERN_ACCENTS.length))];
  return swatch.slice();
}

function blendColors(left, right, amount) {
  return [
    lerp(left[0], right[0], amount),
    lerp(left[1], right[1], amount),
    lerp(left[2], right[2], amount),
  ];
}

function getScaleValue(key, fallback = 1) {
  if (!boidConfig || typeof boidConfig[key] !== "number") {
    return fallback;
  }

  return max(0.01, boidConfig[key]);
}

function getCombinedScale(scaleKey) {
  return getScaleValue("globalElementScale", 1) * getScaleValue(scaleKey, 1);
}

function getCanvasTextBasePx() {
  const configSize =
    boidConfig && typeof boidConfig.overlayTextScale === "number"
      ? boidConfig.overlayTextScale
      : null;
  const quickTuneSize =
    typeof window !== "undefined" &&
    window.BoidQuickTunes &&
    typeof window.BoidQuickTunes.canvasTextScale === "number"
      ? window.BoidQuickTunes.canvasTextScale
      : null;

  // overlayTextScale is now the direct pixel driver; quick-tune is only fallback.
  return max(12, configSize ?? quickTuneSize ?? OVERLAY_TEXT_REFERENCE_SIZE_PX);
}

function getOverlayTextSizePx(
  multiplier = 1,
  minPx = 12,
  viewportCapRatio = 0.18,
) {
  const scaledSize = getCanvasTextBasePx() * multiplier;
  if (!Number.isFinite(viewportCapRatio) || viewportCapRatio <= 0) {
    return max(minPx, scaledSize);
  }

  const viewportCap = max(minPx, min(width, height) * viewportCapRatio);
  return max(minPx, min(scaledSize, viewportCap));
}

function getGridSpacing() {
  const value =
    boidConfig && typeof boidConfig.gridDensity === "number"
      ? boidConfig.gridDensity
      : 28;
  return max(4, floor(value));
}

function getSequenceSpeedMultiplier() {
  if (!boidConfig || typeof boidConfig.sequenceSpeedMultiplier !== "number") {
    return 1;
  }

  // Keep timing stable while still allowing very fast cycles for live demos.
  return max(0.1, boidConfig.sequenceSpeedMultiplier);
}

function updateInfluenceState() {
  if (influenceActive && !macroExitActive) {
    const elapsed = millis() - influenceCycleStartedAtMs;
    if (elapsed >= getCurrentInfluenceForceConvertMs()) {
      forceConvertRemainingSwarms();
    }
  }

  if (!cycleWaitingForReturn) {
    return;
  }

  if (millis() >= cycleReturnAtMs) {
    if (
      smallSwarms.length > 0 &&
      millis() < cycleReturnForceStartAtMs &&
      !areSmallSwarmsReadyForCycleStart()
    ) {
      return;
    }

    cycleWaitingForReturn = false;
    cycleReturnAtMs = 0;
    cycleReturnForceStartAtMs = 0;
    buildBigTrendLeaders();

    // Small swarms now persist across cycles 1-4; only rebuild if they were fully cleared.
    if (smallSwarms.length === 0) {
      buildSmallSwarms();
    }

    startInfluenceCycle();
  }
}

// Evenly distribute small leaders across the 3 macro trends.
function startInfluenceCycle() {
  if (
    smallSwarms.length === 0 ||
    bigTrendLeaders.length === 0 ||
    macroExitActive
  ) {
    return;
  }

  influenceActive = true;
  const nowMs = millis();
  influenceCycleStartedAtMs = nowMs;
  const followerRange = getCycleFollowerRange();

  const shuffled = smallSwarms.slice();
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = floor(random(i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  for (let i = 0; i < shuffled.length; i += 1) {
    const swarm = shuffled[i];
    const trend = bigTrendLeaders[i % bigTrendLeaders.length];

    if (!swarm.followers || swarm.followers.length === 0) {
      const refillCount = floor(
        random(followerRange.minCount, followerRange.maxCount + 1),
      );

      swarm.followers = createFollowers(swarm.leader, refillCount, {
        colorData: swarm.leader.colorData.slice(),
        forceShape: null,
      });
    }

    swarm.currentColor = swarm.leader.colorData.slice();
    swarm.assignedTrend = trend;
    swarm.exitTarget = null;
    swarm.fullyAssimilated = false;
    swarm.assimilationProgress = 0;
    swarm.grainRevealProgress = 0;
    swarm.grainRevealWeight = Array.isArray(swarm.followers)
      ? swarm.followers.length
      : 0;
    swarm.assimilationBlend = random(0.15, 0.88);
    swarm.droppedThisCycle = false;

    // Reapply the live control-driven speed profile at each cycle start.
    applySmallSwarmCycleMotionProfile(swarm);
  }
}

function forceConvertRemainingSwarms() {
  if (!influenceActive || macroExitActive || bigTrendLeaders.length === 0) {
    return;
  }

  // Enforce deadline: any incomplete swarm is finalized immediately and drops shapes.
  for (let i = 0; i < smallSwarms.length; i += 1) {
    const swarm = smallSwarms[i];

    if (swarm.fullyAssimilated) {
      continue;
    }

    const fallbackTrend = bigTrendLeaders[i % bigTrendLeaders.length];
    const trend = swarm.assignedTrend || fallbackTrend;

    if (!trend) {
      continue;
    }

    swarm.assignedTrend = trend;
    finalizeSwarmAssimilation(swarm, trend);
  }

  startMacroExit();
}

function startMacroExit() {
  if (
    macroExitActive ||
    (bigTrendLeaders.length === 0 && smallSwarms.length === 0)
  ) {
    return;
  }

  macroExitActive = true;
  smallSwarmExitActive = false;
  smallSwarmExitQueued = isFinalAssimilationCycle();
  influenceActive = false;
  influenceCycleStartedAtMs = 0;
  macroExitFrames = 0;
  const macroExitPad = max(
    getMacroExitDespawnMargin(),
    boidConfig.bigLeaderSize *
      SHAPE_SIZE_BOOST *
      getCombinedScale("macroLeaderScale"),
  );

  for (const trend of bigTrendLeaders) {
    trend.leader.maxSpeed = boidConfig.macroExitSpeed;
    trend.leader.maxForce = boidConfig.macroExitForce;
    trend.dormant = false;
    trend.entryActive = false;
    trend.leader.entryActive = false;
    trend.leader.exitActive = true;
    trend.leader.exitStartedAtMs = millis();
    trend.exitOrigin = shouldUseTimedMacroExit()
      ? trend.leader.pos.copy()
      : null;
    trend.exitStartedAtMs = shouldUseTimedMacroExit()
      ? trend.leader.exitStartedAtMs
      : 0;
    trend.exitDurationMs = shouldUseTimedMacroExit()
      ? getCurrentMacroExitDurationMs()
      : 0;
    // Continue through the paired offscreen corner so every randomized route
    // visibly crosses the canvas before despawn.
    trend.exitTarget = getMacroRouteExitPoint(trend, macroExitPad);
    if (shouldUseTimedMacroExit() && trend.exitOrigin && trend.exitTarget) {
      const dx = trend.exitTarget.x - trend.exitOrigin.x;
      const dy = trend.exitTarget.y - trend.exitOrigin.y;
      const routeDistance = Math.sqrt(dx * dx + dy * dy);
      const routeSpeed = max(0.35, boidConfig.macroExitSpeed);
      // Timed exits must still be long enough to visibly complete the route.
      trend.exitDurationMs = max(
        trend.exitDurationMs,
        getTravelDurationMs(routeDistance, routeSpeed, 700),
      );
    }
  }

  for (const swarm of smallSwarms) {
    const trend = swarm.assignedTrend || bigTrendLeaders[0] || null;

    if (trend) {
      swarm.assignedTrend = trend;
      finalizeSwarmAssimilation(swarm, trend);
      swarm.macroChaseFallback = trend.leader.pos.copy();
    } else if (lastMacroLeaderDespawnPoint) {
      swarm.macroChaseFallback = lastMacroLeaderDespawnPoint.copy();
    }

    // Keep the macro assignment alive for color/pattern continuity. Inter-cycle
    // motion now uses regular boid drift instead of chasing the exit path.
    swarm.exitTarget = null;
  }
}

function startFinalSmallSwarmExit() {
  if (smallSwarmExitActive || smallSwarms.length === 0) {
    return;
  }

  smallSwarmExitActive = true;
  const center = createVector(width * 0.5, height * 0.5);

  for (const swarm of smallSwarms) {
    // Final shutdown: small leaders only get their exit target after the big leaders are gone.
    swarm.leader.maxSpeed = boidConfig.macroExitSpeed;
    swarm.leader.maxForce = boidConfig.macroExitForce;
    swarm.leader.wanderWeight = 0;

    const away = p5.Vector.sub(swarm.leader.pos, center);
    if (away.magSq() < 0.0001) {
      away.set(random(-1, 1), random(-1, 1));
    }

    away.normalize();
    swarm.exitTarget = p5.Vector.add(
      swarm.leader.pos,
      away.mult(max(width, height) * 3.2),
    );
  }
}

function getSwarmCooldownSafeInset(swarm) {
  const leaderSize =
    swarm && swarm.leader && typeof swarm.leader.size === "number"
      ? swarm.leader.size
      : boidConfig.leaderSize * SHAPE_SIZE_BOOST;
  const followerOrbit =
    boidConfig && typeof boidConfig.followerOrbitRadiusMax === "number"
      ? boidConfig.followerOrbitRadiusMax
      : 75;
  const followerSize =
    boidConfig && typeof boidConfig.followerSizeMax === "number"
      ? boidConfig.followerSizeMax * SHAPE_SIZE_BOOST * getCombinedScale("followerScale")
      : 42 * SHAPE_SIZE_BOOST;

  return max(leaderSize * 1.4, followerOrbit * 1.18 + followerSize);
}

function getSwarmCooldownOffscreenMargin(swarm) {
  return max(56, getSwarmCooldownSafeInset(swarm) * 0.42);
}

function getViewportOuterRange(margin, span) {
  const outerMargin = max(0, margin);
  return {
    minBound: -outerMargin,
    maxBound: span + outerMargin,
  };
}

function isLeaderInsideCycleStartBounds(swarm) {
  if (!swarm || !swarm.leader || !swarm.leader.pos) {
    return false;
  }

  const offscreenMargin = getSwarmCooldownOffscreenMargin(swarm);
  const xRange = getViewportOuterRange(offscreenMargin, width);
  const yRange = getViewportOuterRange(offscreenMargin, height);
  return (
    swarm.leader.pos.x >= xRange.minBound &&
    swarm.leader.pos.x <= xRange.maxBound &&
    swarm.leader.pos.y >= yRange.minBound &&
    swarm.leader.pos.y <= yRange.maxBound
  );
}

function getSwarmCycleStartGatherRadius(swarm) {
  if (!swarm || !swarm.leader) {
    return 0;
  }

  return max(
    boidConfig.followerOrbitRadiusMax * 2.35,
    boidConfig.followerOrbitRadiusMin * 1.9,
    swarm.leader.size * 2.2,
  );
}

function isSmallSwarmReadyForCycleStart(swarm) {
  if (!swarm || !swarm.leader || !Array.isArray(swarm.followers)) {
    return false;
  }

  if (!isLeaderInsideCycleStartBounds(swarm)) {
    return false;
  }

  const gatherRadius = getSwarmCycleStartGatherRadius(swarm);
  for (const follower of swarm.followers) {
    if (!follower || !follower.pos) {
      continue;
    }

    if (p5.Vector.dist(follower.pos, swarm.leader.pos) > gatherRadius) {
      return false;
    }
  }

  return true;
}

function areSmallSwarmsReadyForCycleStart() {
  if (smallSwarms.length === 0) {
    return true;
  }

  for (const swarm of smallSwarms) {
    if (!isSmallSwarmReadyForCycleStart(swarm)) {
      return false;
    }
  }

  return true;
}

function resetSmallSwarmsForCooldown() {
  for (const swarm of smallSwarms) {
    swarm.assignedTrend = null;
    swarm.exitTarget = null;
    swarm.macroChaseTarget = null;
    swarm.macroChaseFallback = null;
    swarm.fullyAssimilated = false;
    swarm.assimilationProgress = 0;

    if (swarm.leader) {
      // Cooldown keeps normal boid drift alive without the old random scatter
      // kick or a macro target pull.
      swarm.leader.portalProjection = null;
      applySmallSwarmCycleMotionProfile(swarm);
      swarm.leader.vel.mult(0.72);
      swarm.leader.acc.mult(0);
    }

    for (const follower of swarm.followers) {
      if (!follower || !follower.vel) {
        continue;
      }

      follower.portalProjection = null;
      follower.vel.mult(0.82);
    }
  }
}

function finishMacroExit(clearSmallSwarms) {
  rememberMacroLeaderDespawnPoint();
  bigTrendLeaders = [];

  if (clearSmallSwarms) {
    smallSwarms = [];
  } else {
    resetSmallSwarmsForCooldown();
  }

  macroExitActive = false;
  smallSwarmExitActive = false;
  smallSwarmExitQueued = false;
  scheduleCycleReturn();
}

function rememberMacroLeaderDespawnPoint() {
  if (!bigTrendLeaders || bigTrendLeaders.length === 0) {
    return;
  }

  const trend = bigTrendLeaders[0];
  if (trend && trend.leader && trend.leader.pos) {
    lastMacroLeaderDespawnPoint = trend.leader.pos.copy();
    trend.despawnPoint = lastMacroLeaderDespawnPoint.copy();
  } else if (trend && trend.exitTarget) {
    lastMacroLeaderDespawnPoint = trend.exitTarget.copy();
    trend.despawnPoint = lastMacroLeaderDespawnPoint.copy();
  }
}

function getTrendChasePosition(trend) {
  if (trend && trend.leader && trend.leader.pos) {
    return trend.leader.pos;
  }

  if (trend && trend.despawnPoint) {
    return trend.despawnPoint;
  }

  return lastMacroLeaderDespawnPoint;
}

function getSwarmMacroChasePosition(swarm) {
  if (!swarm) {
    return null;
  }

  const assignedPoint = getTrendChasePosition(swarm.assignedTrend);
  if (assignedPoint) {
    return assignedPoint;
  }

  if (bigTrendLeaders.length > 0) {
    return getTrendChasePosition(bigTrendLeaders[0]);
  }

  return swarm.macroChaseFallback || lastMacroLeaderDespawnPoint;
}

function getSwarmMacroChaseTarget(swarm, basePosition) {
  if (!swarm || !basePosition) {
    return null;
  }

  const target = swarm.macroChaseTarget || { x: 0, y: 0 };
  const angle =
    ((swarm.id || 0) * 2.399963 + completedCycleCount * 0.71) % TWO_PI;
  const spread = max(
    42,
    boidConfig.leaderSize *
      SHAPE_SIZE_BOOST *
      getCombinedScale("smallLeaderScale") *
      1.35,
  );
  const ringScale = 0.75 + ((swarm.id || 0) % 5) * 0.13;

  target.x = basePosition.x + cos(angle) * spread * ringScale;
  target.y = basePosition.y + sin(angle) * spread * ringScale;

  swarm.macroChaseTarget = target;

  return target;
}

function updateBigTrendLeaders() {
  if (bigTrendLeaders.length === 0 && !macroExitActive) {
    return;
  }

  if (bigTrendLeaders.length > 0) {
    // Reuse one scratch array to avoid per-frame allocation churn.
    BIG_LEADER_SCRATCH.length = 0;
    for (const trend of bigTrendLeaders) {
      BIG_LEADER_SCRATCH.push(trend.leader);
    }
    const leaders = BIG_LEADER_SCRATCH;

    for (const trend of bigTrendLeaders) {
      if (trend.dormant) {
        continue;
      }

      const leader = trend.leader;

      if (macroExitActive) {
        if (shouldUseTimedMacroExit()) {
          leader.acc.mult(0);
        } else {
          const flee = seekTarget(
            leader,
            trend.exitTarget,
            leader.maxSpeed,
            leader.maxForce,
          );
          leader.acc.add(flee.mult(1.2));
        }
      } else if (trend.entryActive) {
        // Entry flight is intentionally force-free; it follows a strict straight line to the opposite corner.
        leader.acc.mult(0);
      } else {
        const spacing = steerSeparationCustom(
          leader,
          leaders,
          boidConfig.bigLeaderSpacingRadius,
        );
        const wander = steerWander(leader).mult(leader.wanderWeight);

        leader.acc.add(spacing.mult(1.08));
        leader.acc.add(wander);
      }
    }

    for (const trend of bigTrendLeaders) {
      if (trend.dormant) {
        continue;
      }

      if (macroExitActive && shouldUseTimedMacroExit()) {
        // Timed exits keep the full route readable, including the deliberately slower final cycle.
        updateMacroExitLeaderPosition(trend);
        continue;
      }

      if (trend.entryActive) {
        const leader = trend.leader;
        const toTarget = p5.Vector.sub(trend.entryTarget, leader.pos);
        const entrySpeed = max(
          0.75,
          typeof leader.entrySpeed === "number"
            ? leader.entrySpeed
            : leader.maxSpeed * 1.04,
        );

        if (toTarget.magSq() > entrySpeed * entrySpeed) {
          toTarget.setMag(entrySpeed);
          leader.vel.x = toTarget.x;
          leader.vel.y = toTarget.y;
          leader.pos.add(leader.vel);
        } else {
          leader.pos.x = trend.entryTarget.x;
          leader.pos.y = trend.entryTarget.y;
          leader.vel.x = 0;
          leader.vel.y = 0;
          trend.entryActive = false;
        }

        if (leader.vel.magSq() > 0.0001) {
          leader.angle = leader.vel.heading();
        }

        leader.displayAngle = lerpAngle(
          leader.displayAngle,
          leader.angle,
          boidConfig.headingSmoothing,
        );

        trend.entryFrames += 1;
        if (trend.entryFrames > 1800) {
          trend.entryActive = false;
        }

        if (!trend.entryActive) {
          leader.entryActive = false;
          // After diagonal fly-through completes, macro leaders resume normal wrapping motion.
          wrapPosition(leader.pos, leader.size);
        }

        leader.portalProjection = null;
        continue;
      }

      integrateLeader(trend.leader);

      if (!macroExitActive) {
        // Macro leaders bypass room portal routing and only world-wrap during normal on-screen behavior.
        wrapPosition(trend.leader.pos, trend.leader.size);
      }
      trend.leader.portalProjection = null;
    }
  }

  if (macroExitActive) {
    macroExitFrames += 1;

    let allOutside = true;
    if (shouldUseTimedMacroExit()) {
      for (const trend of bigTrendLeaders) {
        if (!hasMacroExitWindowElapsed(trend)) {
          allOutside = false;
          break;
        }
      }
    } else {
      const margin = getMacroExitDespawnMargin();

      for (const trend of bigTrendLeaders) {
        const p = trend.leader.pos;
        if (
          p.x > -margin &&
          p.x < width + margin &&
          p.y > -margin &&
          p.y < height + margin
        ) {
          allOutside = false;
          break;
        }
      }
    }

    if (allOutside && bigTrendLeaders.length > 0) {
      rememberMacroLeaderDespawnPoint();
      bigTrendLeaders = [];
    }

    if (
      smallSwarmExitQueued &&
      bigTrendLeaders.length === 0 &&
      !smallSwarmExitActive
    ) {
      if (smallSwarms.length === 0) {
        finishMacroExit(true);
        return;
      }

      startFinalSmallSwarmExit();
    }

    const bigLeaderExitComplete = bigTrendLeaders.length === 0;
    const smallLeaderExitComplete =
      !smallSwarmExitQueued ||
      (smallSwarmExitActive && smallSwarms.length === 0);

    if (bigLeaderExitComplete && smallLeaderExitComplete) {
      finishMacroExit(smallSwarmExitQueued || smallSwarmExitActive);
      return;
    }

    if (macroExitFrames > MACRO_EXIT_FAILSAFE_FRAMES) {
      finishMacroExit(smallSwarmExitQueued || smallSwarmExitActive);
    }
  }
}

function isPositionOutsideDespawnBounds(position, margin) {
  return (
    position.x <= -margin ||
    position.x >= width + margin ||
    position.y <= -margin ||
    position.y >= height + margin
  );
}

function getMacroExitDespawnMargin() {
  const biggestElement = max(
    boidConfig.bigLeaderSize *
      SHAPE_SIZE_BOOST *
      getCombinedScale("macroLeaderScale"),
    boidConfig.leaderSize *
      SHAPE_SIZE_BOOST *
      getCombinedScale("smallLeaderScale"),
    boidConfig.followerSizeMax *
      SHAPE_SIZE_BOOST *
      getCombinedScale("followerScale"),
  );
  const marginScale =
    boidConfig && typeof boidConfig.macroDespawnMargin === "number"
      ? max(0.25, boidConfig.macroDespawnMargin)
      : 1.15;

  // Keep the despawn buffer tight so the end-card timing follows what is visible on screen.
  return max(96, biggestElement * marginScale);
}

function updateMacroExitLeaderPosition(trend) {
  const leader = trend && trend.leader ? trend.leader : null;
  if (!leader || !trend.exitTarget) {
    return;
  }

  const durationMs = max(1, trend.exitDurationMs || 1);
  const progress = constrain(
    (millis() - (trend.exitStartedAtMs || 0)) / durationMs,
    0,
    1,
  );
  const origin = trend.exitOrigin || leader.pos;

  leader.pos.x = lerp(origin.x, trend.exitTarget.x, progress);
  leader.pos.y = lerp(origin.y, trend.exitTarget.y, progress);

  const dx = trend.exitTarget.x - origin.x;
  const dy = trend.exitTarget.y - origin.y;
  if (dx * dx + dy * dy > 0.0001) {
    leader.angle = atan2(dy, dx);
    leader.displayAngle = lerpAngle(
      leader.displayAngle,
      leader.angle,
      boidConfig.headingSmoothing,
    );
  }

  leader.vel.x = dx / durationMs;
  leader.vel.y = dy / durationMs;
  leader.portalProjection = null;
}

function isSwarmOutsideDespawnBounds(swarm, margin) {
  if (!swarm || !swarm.leader || !swarm.leader.pos) {
    return true;
  }

  if (!isPositionOutsideDespawnBounds(swarm.leader.pos, margin)) {
    return false;
  }

  for (const follower of swarm.followers) {
    if (!follower || !follower.pos) {
      continue;
    }

    if (!isPositionOutsideDespawnBounds(follower.pos, margin)) {
      return false;
    }
  }

  return true;
}

function pruneExitedSmallSwarmsForMacroExit() {
  if (!smallSwarmExitActive || smallSwarms.length === 0) {
    return;
  }

  const margin = getMacroExitDespawnMargin();

  // Despawn small swarms only after both leader and remaining followers are fully outside bounds.
  for (let i = smallSwarms.length - 1; i >= 0; i -= 1) {
    if (isSwarmOutsideDespawnBounds(smallSwarms[i], margin)) {
      smallSwarms.splice(i, 1);
    }
  }
}

function updateSmallLeaders() {
  SMALL_LEADER_SCRATCH.length = 0;
  for (const swarm of smallSwarms) {
    SMALL_LEADER_SCRATCH.push(swarm.leader);
  }
  const leaders = SMALL_LEADER_SCRATCH;
  const assimilationRadiusSq =
    boidConfig.assimilationRadius * boidConfig.assimilationRadius;

  for (const swarm of smallSwarms) {
    const leader = swarm.leader;
    const swarmIsExiting = smallSwarmExitActive && swarm.exitTarget;

    if (swarmIsExiting) {
      const flee = seekTarget(
        leader,
        swarm.exitTarget,
        leader.maxSpeed,
        leader.maxForce,
      );
      leader.acc.add(flee.mult(1.2));
      continue;
    }

    applySmallSwarmCycleMotionProfile(swarm);
    const macroChaseActive = influenceActive;
    const macroChasePosition = macroChaseActive
      ? getSwarmMacroChasePosition(swarm)
      : null;
    const macroChaseTarget =
      macroChaseActive && macroChasePosition
        ? getSwarmMacroChaseTarget(swarm, macroChasePosition)
        : null;
    const shouldChaseMacro = Boolean(macroChaseTarget);

    if (shouldChaseMacro && macroExitActive) {
      // The seek force below can ask for macro speed, but integrateLeader still
      // clamps by the leader's own caps. Lift those caps while chasing the exit.
      leader.maxSpeed = max(leader.maxSpeed, boidConfig.macroExitSpeed * 1.15);
      leader.maxForce = max(leader.maxForce, boidConfig.macroExitForce * 2.2);
      leader.wanderWeight = 0;
    }

    const separation = steerSeparationCustom(
      leader,
      leaders,
      boidConfig.separationRadius,
    ).mult(boidConfig.separationWeight * (shouldChaseMacro ? 0.55 : 1));
    const alignment = steerAlignmentCustom(
      leader,
      leaders,
      boidConfig.alignmentRadius,
    ).mult(boidConfig.alignmentWeight * (shouldChaseMacro ? 0.35 : 1));
    const cohesion = steerCohesionCustom(
      leader,
      leaders,
      boidConfig.cohesionRadius,
    ).mult(boidConfig.cohesionWeight * (shouldChaseMacro ? 0.25 : 1));
    const wander = steerWander(leader).mult(
      leader.wanderWeight * (shouldChaseMacro ? 0.08 : 1),
    );

    leader.acc.add(separation);
    leader.acc.add(alignment);
    leader.acc.add(cohesion);
    leader.acc.add(wander);

    if (shouldChaseMacro) {
      const dx = leader.pos.x - macroChaseTarget.x;
      const dy = leader.pos.y - macroChaseTarget.y;
      const distToTrendSq = dx * dx + dy * dy;
      const chaseSpeed = macroExitActive
        ? max(leader.maxSpeed, boidConfig.macroExitSpeed)
        : leader.maxSpeed;
      const chaseForce = macroExitActive
        ? max(leader.maxForce * 2.4, boidConfig.macroExitForce * 1.8)
        : leader.maxForce;
      const chaseWeight =
        boidConfig.influenceFollowWeight * (macroExitActive ? 2.2 : 1);

      const followTrend = seekTarget(
        leader,
        macroChaseTarget,
        chaseSpeed,
        chaseForce,
      ).mult(chaseWeight);
      leader.acc.add(followTrend);

      if (!macroExitActive && swarm.assignedTrend && distToTrendSq <= assimilationRadiusSq) {
        assimilateSwarmLook(swarm, swarm.assignedTrend);
      }
    }
  }

  for (const swarm of smallSwarms) {
    const previousPos = { x: swarm.leader.pos.x, y: swarm.leader.pos.y };
    integrateLeader(swarm.leader);
    const movedDistance = dist(
      previousPos.x,
      previousPos.y,
      swarm.leader.pos.x,
      swarm.leader.pos.y,
    );

    if (movedDistance > 0.2) {
      swarm.walkingDistance = (swarm.walkingDistance || 0) + movedDistance;
      const stepDistance = max(
        WALKING_AUDIO_STEP_DISTANCE,
        swarm.leader.size * 0.65,
      );
      if (swarm.walkingDistance >= stepDistance) {
        swarm.walkingDistance %= stepDistance;
        const volume = map(
          constrain(movedDistance, 0.2, max(1.6, swarm.leader.maxSpeed)),
          0.2,
          max(1.6, swarm.leader.maxSpeed),
          0.2,
          0.46,
        );
        playWalkingSound(volume);
      }
    }

    if (smallSwarmExitActive && swarm.exitTarget) {
      // Final small-swarm exits intentionally bypass room routing.
      swarm.leader.portalProjection = null;
    } else {
      routeLeaderThroughRooms(swarm.leader, previousPos, swarm.followers);
    }
  }

  if (influenceActive && !macroExitActive && smallSwarms.length > 0) {
    let allAssimilated = true;

    for (const swarm of smallSwarms) {
      if (!swarm.fullyAssimilated) {
        allAssimilated = false;
        break;
      }
    }

    if (
      allAssimilated &&
      (!isPreFinalCyclePhase() || hasCurrentInfluenceWindowElapsed())
    ) {
      startMacroExit();
    }
  }
}

function assimilateSwarmLook(swarm, trend) {
  const sequenceSpeed = getSequenceSpeedMultiplier();
  const amount = constrain(
    boidConfig.influenceColorLerp * sequenceSpeed,
    0.0005,
    1,
  );

  swarm.assimilationProgress = min(1, swarm.assimilationProgress + amount);
  updateSwarmGrainRevealFromAssimilation(swarm);
  const leaderTarget = getSwarmAssimilationColor(swarm, trend.phaseProfile);

  for (let i = 0; i < 3; i += 1) {
    swarm.currentColor[i] = lerp(
      swarm.currentColor[i],
      leaderTarget[i],
      amount,
    );
    swarm.leader.colorData[i] = swarm.currentColor[i];
  }

  swarm.leader.patternStyle = trend.leader.patternStyle;
  swarm.leader.patternAccent = trend.leader.patternAccent.slice();

  if (swarm.assimilationProgress >= 0.35) {
    for (const follower of swarm.followers) {
      follower.type = trend.followerShape;
      follower.patternStyle = trend.leader.patternStyle;
      follower.patternAccent = trend.leader.patternAccent.slice();
    }
  }

  for (const follower of swarm.followers) {
    const targetTint = getFollowerAssimilationTint(
      follower,
      trend.phaseProfile,
    );
    follower.tint[0] = lerp(follower.tint[0], targetTint[0], amount);
    follower.tint[1] = lerp(follower.tint[1], targetTint[1], amount);
    follower.tint[2] = lerp(follower.tint[2], targetTint[2], amount);
  }

  if (swarm.assimilationProgress >= 0.985) {
    finalizeSwarmAssimilation(swarm, trend);
  }
}

function updateSwarmGrainRevealFromAssimilation(swarm) {
  if (!assimilationSequenceStarted || !swarm) {
    return;
  }

  const currentProgress = constrain(
    Number.isFinite(swarm.assimilationProgress)
      ? swarm.assimilationProgress
      : 0,
    0,
    1,
  );
  const previousProgress = constrain(
    Number.isFinite(swarm.grainRevealProgress)
      ? swarm.grainRevealProgress
      : 0,
    0,
    1,
  );

  if (currentProgress <= previousProgress) {
    return;
  }

  const fallbackWeight = Array.isArray(swarm.followers)
    ? swarm.followers.length
    : 0;
  const revealWeight = max(
    0,
    Number.isFinite(swarm.grainRevealWeight)
      ? swarm.grainRevealWeight
      : fallbackWeight,
  );

  grainRevealDropCount += (currentProgress - previousProgress) * revealWeight;
  swarm.grainRevealProgress = currentProgress;
}

function getFollowerAssimilationTint(follower, phaseProfile) {
  const blend =
    typeof follower.colorBlend === "number" ? follower.colorBlend : 0.5;
  return sampleAssimilationColor(blend, phaseProfile);
}

function sampleAssimilationColor(amount, phaseProfile) {
  const phase = phaseProfile || getCurrentPhaseProfile();
  const blend = constrain(amount, 0, 1);
  return [
    lerp(phase.low[0], phase.high[0], blend),
    lerp(phase.low[1], phase.high[1], blend),
    lerp(phase.low[2], phase.high[2], blend),
  ];
}

function getSwarmAssimilationColor(swarm, phaseProfile) {
  const blend =
    typeof swarm.assimilationBlend === "number" ? swarm.assimilationBlend : 0.5;
  return sampleAssimilationColor(blend, phaseProfile);
}

function finalizeSwarmAssimilation(swarm, trend) {
  if (!swarm || !trend || swarm.fullyAssimilated) {
    return;
  }

  // Force exact final style so no residual yellow/old shape state remains.
  swarm.assimilationProgress = 1;
  updateSwarmGrainRevealFromAssimilation(swarm);
  swarm.fullyAssimilated = true;
  const target = getSwarmAssimilationColor(swarm, trend.phaseProfile);

  for (let i = 0; i < 3; i += 1) {
    swarm.currentColor[i] = target[i];
    swarm.leader.colorData[i] = target[i];
  }

  swarm.leader.patternStyle = trend.leader.patternStyle;
  swarm.leader.patternAccent = trend.leader.patternAccent.slice();

  for (const follower of swarm.followers) {
    follower.type = trend.followerShape;
    follower.patternStyle = trend.leader.patternStyle;
    follower.patternAccent = trend.leader.patternAccent.slice();

    const targetTint = getFollowerAssimilationTint(
      follower,
      trend.phaseProfile,
    );
    follower.tint[0] = targetTint[0];
    follower.tint[1] = targetTint[1];
    follower.tint[2] = targetTint[2];
  }

  // Assimilation event: dump followers to the ground and start desaturation.
  if (!swarm.droppedThisCycle) {
    const droppedCount = dropSwarmFollowers(swarm);
    respawnSwarmFollowersFromTrend(swarm, trend, droppedCount);
    swarm.droppedThisCycle = true;
  }
}

function markDroppedCollisionCacheDirty() {
  droppedStaticCacheDirty = true;
}

function enforceDroppedShapeCap() {
  const droppedShapeCap = getResponsiveCount(DROPPED_SHAPE_MAX, 24);
  if (droppedShapes.length <= droppedShapeCap) {
    return;
  }

  const overflow = droppedShapes.length - droppedShapeCap;
  droppedShapes.splice(0, overflow);
  markDroppedCollisionCacheDirty();
}

function processPendingDroppedShapes() {
  if (pendingDroppedShapes.length === 0) {
    return;
  }

  const releaseCount = min(
    getResponsiveCount(DROPPED_SHAPE_RELEASE_PER_FRAME, 1),
    pendingDroppedShapes.length,
  );
  const released = pendingDroppedShapes.splice(0, releaseCount);

  for (const shape of released) {
    droppedShapes.push(shape);
  }

  markDroppedCollisionCacheDirty();
  enforceDroppedShapeCap();
}

function dropSwarmFollowers(swarm) {
  if (!swarm.followers || swarm.followers.length === 0) {
    return 0;
  }

  const droppedCount = swarm.followers.length;
  const nowMs = millis();
  playFabricDropSound();
  const staticShrinkRatio = constrain(
    boidConfig && typeof boidConfig.droppedStaticShrinkRatio === "number"
      ? boidConfig.droppedStaticShrinkRatio
      : 1,
    0.5,
    1,
  );
  const staticShrinkDurationMs = max(
    0,
    boidConfig && typeof boidConfig.droppedStaticShrinkDurationMs === "number"
      ? boidConfig.droppedStaticShrinkDurationMs
      : 220,
  );

  for (const follower of swarm.followers) {
    const droppedSize = follower.size;
    const targetSize = max(1, droppedSize * staticShrinkRatio);

    pendingDroppedShapes.push({
      type: follower.type,
      pos: follower.pos.copy(),
      vel: createVector(0, 0),
      angle: follower.angle,
      spin: 0,
      size: droppedSize,
      baseSize: droppedSize,
      targetSize,
      shrinkStartedAtMs: nowMs,
      shrinkDurationMs: staticShrinkDurationMs,
      dropMode: "static-shrink",
      desaturateDelayUntilMs: nowMs + staticShrinkDurationMs,
      tint: follower.tint.slice(),
      patternStyle: follower.patternStyle || null,
      patternAccent: Array.isArray(follower.patternAccent)
        ? follower.patternAccent.slice()
        : null,
      patternSeed:
        typeof follower.patternSeed === "number"
          ? follower.patternSeed
          : random(TWO_PI),
      patternScale:
        typeof follower.patternScale === "number" ? follower.patternScale : 1,
      patternAlpha: 1,
      grainSeed:
        typeof follower.patternSeed === "number"
          ? follower.patternSeed
          : random(TWO_PI),
      groundOffset: 0,
      groundY: follower.pos.y,
      dynamicUntilMs: nowMs,
      settledFrames: 0,
      frozen: true,
    });
  }

  swarm.followers = [];
  const droppedShapeCap = getResponsiveCount(DROPPED_SHAPE_MAX, 24);
  if (pendingDroppedShapes.length > droppedShapeCap) {
    pendingDroppedShapes.splice(
      0,
      pendingDroppedShapes.length - droppedShapeCap,
    );
  }

  return droppedCount;
}

function respawnSwarmFollowersFromTrend(swarm, trend, count) {
  if (!swarm || !trend) {
    return;
  }

  const nextCount = max(1, count || 0);
  swarm.followers = createFollowers(swarm.leader, nextCount, {
    colorData: swarm.leader.colorData.slice(),
    forceShape: trend.followerShape,
    forcePatternStyle: trend.leader.patternStyle,
    forcePatternAccent: trend.leader.patternAccent,
  });

  for (const follower of swarm.followers) {
    // New replacement items immediately inherit the active macro trend identity.
    follower.type = trend.followerShape;
    follower.patternStyle = trend.leader.patternStyle;
    follower.patternAccent = trend.leader.patternAccent.slice();

    const targetTint = getFollowerAssimilationTint(
      follower,
      trend.phaseProfile,
    );
    follower.tint[0] = targetTint[0];
    follower.tint[1] = targetTint[1];
    follower.tint[2] = targetTint[2];
  }
}

function updateDroppedShapes() {
  const nowMs = millis();
  const maxDynamicBodies = getResponsiveCount(
    boidConfig.maxDynamicDroppedShapes,
    0,
  );

  if (maxDynamicBodies === 0) {
    for (const shape of droppedShapes) {
      freezeDroppedShape(shape, true);
    }
  } else {
    let activeBodies = 0;
    for (let i = droppedShapes.length - 1; i >= 0; i -= 1) {
      const shape = droppedShapes[i];

      if (shape.frozen) {
        continue;
      }

      activeBodies += 1;
      if (activeBodies > maxDynamicBodies) {
        // Iterate newest-to-oldest so older dropped bodies are frozen first.
        freezeDroppedShape(shape, true);
      }
    }
  }

  for (const shape of droppedShapes) {
    if (shape.frozen) {
      // Static-shrink mode: stays in-place and shrinks to imply depth from top-down view.
      if (shape.dropMode === "static-shrink") {
        const fromSize =
          typeof shape.baseSize === "number"
            ? shape.baseSize
            : max(1, shape.size);
        const targetSize =
          typeof shape.targetSize === "number" ? shape.targetSize : fromSize;
        const startedAt =
          typeof shape.shrinkStartedAtMs === "number"
            ? shape.shrinkStartedAtMs
            : nowMs;
        const durationMs = max(
          1,
          typeof shape.shrinkDurationMs === "number"
            ? shape.shrinkDurationMs
            : 1,
        );
        const progress = constrain((nowMs - startedAt) / durationMs, 0, 1);

        shape.size = lerp(fromSize, targetSize, easeInOutCirc(progress));
        if (progress < 1 && abs(fromSize - targetSize) > 0.5) {
          // Radius changes while static-shrink is in progress.
          markDroppedCollisionCacheDirty();
        }

        if (progress >= 1) {
          shape.size = targetSize;
          shape.baseSize = targetSize;
        }
      } else if (typeof shape.baseSize === "number") {
        // Fully pin frozen items so floor alignment cannot ratchet upward across resize/fullscreen toggles.
        shape.size = max(1, shape.baseSize);
      }

      shape.pos.y = shape.groundY;
      shape.pos.x = constrain(shape.pos.x, -shape.size, width + shape.size);

      const desaturateReadyAt =
        typeof shape.desaturateDelayUntilMs === "number"
          ? shape.desaturateDelayUntilMs
          : 0;
      if (nowMs >= desaturateReadyAt) {
        desaturateColorInPlace(shape.tint, 0.028);
        fadePatternAlphaInPlace(shape, 0.028);
      }

      continue;
    }

    if (typeof shape.baseSize !== "number") {
      shape.baseSize = max(1, shape.size);
    }

    if (typeof shape.renderScale !== "number") {
      shape.renderScale = 1;
    }

    if (shape.pos.y < shape.groundY - 0.001) {
      shape.renderScale = lerp(
        shape.renderScale,
        DROPPED_SHRINK_MIN_RATIO,
        DROPPED_SHRINK_LERP_RATE,
      );
      shape.size = max(1, shape.baseSize * shape.renderScale);
    }

    shape.vel.y += 0.03;
    shape.vel.x *= 0.994;
    shape.pos.add(shape.vel);

    if (shape.pos.y > shape.groundY) {
      shape.pos.y = shape.groundY;

      if (!shape.landedShrinkApplied) {
        shape.landedShrinkApplied = true;
        shape.baseSize = max(1, shape.baseSize * DROPPED_GROUND_SQUASH_RATIO);
        shape.renderScale = 1;
        shape.size = shape.baseSize;
        shape.desaturateDelayUntilMs = nowMs + 40;
      }

      shape.vel.y *= -0.08;

      if (abs(shape.vel.y) < 0.025) {
        shape.vel.y = 0;
      }

      shape.vel.x *= 0.94;
    }

    const freezeSpeed = max(0.01, boidConfig.droppedFreezeVelocity);
    const freezeSpeedSq = freezeSpeed * freezeSpeed;
    const minSettledFrames = max(0, floor(boidConfig.droppedMinSettledFrames));

    if (
      shape.pos.y >= shape.groundY - 0.001 &&
      shape.vel.magSq() <= freezeSpeedSq
    ) {
      shape.settledFrames = (shape.settledFrames || 0) + 1;
    } else {
      shape.settledFrames = 0;
    }

    const dynamicUntilMs =
      typeof shape.dynamicUntilMs === "number" ? shape.dynamicUntilMs : nowMs;

    if (nowMs >= dynamicUntilMs && shape.settledFrames >= minSettledFrames) {
      freezeDroppedShape(shape, false);
    }

    if (shape.pos.y >= shape.groundY - 0.001 && !shape.landedShrinkApplied) {
      shape.landedShrinkApplied = true;
      shape.baseSize = max(1, shape.baseSize * DROPPED_GROUND_SQUASH_RATIO);
      shape.renderScale = 1;
      shape.size = shape.baseSize;
      shape.desaturateDelayUntilMs = nowMs + 40;
    }

    shape.pos.x = constrain(shape.pos.x, -shape.size, width + shape.size);
    shape.angle += shape.spin;

    const desaturateReadyAt =
      typeof shape.desaturateDelayUntilMs === "number"
        ? shape.desaturateDelayUntilMs
        : Number.POSITIVE_INFINITY;
    if (nowMs >= desaturateReadyAt) {
      desaturateColorInPlace(shape.tint, 0.0085);
      fadePatternAlphaInPlace(shape, 0.0085);
    }
  }
}

function freezeDroppedShape(shape, forceGroundSnap) {
  if (!shape || shape.frozen) {
    return;
  }

  if (typeof shape.baseSize !== "number") {
    shape.baseSize = max(1, shape.size);
  }

  if (!shape.landedShrinkApplied) {
    shape.landedShrinkApplied = true;
    shape.baseSize = max(1, shape.baseSize * DROPPED_GROUND_SQUASH_RATIO);
    shape.size = shape.baseSize;
    shape.renderScale = 1;
  }

  if (!Number.isFinite(shape.desaturateDelayUntilMs)) {
    shape.desaturateDelayUntilMs = millis() + 40;
  }

  shape.frozen = true;
  markDroppedCollisionCacheDirty();
  shape.vel.x = 0;
  shape.vel.y = 0;
  shape.spin = 0;

  if (forceGroundSnap || shape.pos.y > shape.groundY) {
    shape.pos.y = shape.groundY;
  } else {
    shape.pos.y = min(shape.pos.y, shape.groundY);
  }
}

function getDroppedGroundOffsetForShape(shapeLike) {
  const size =
    shapeLike && typeof shapeLike.size === "number" ? shapeLike.size : 10;
  const minOffset = max(4, size * 0.5 + DROPPED_FLOOR_INSET_MIN);
  const maxOffset = max(minOffset + 1, size * 0.5 + DROPPED_FLOOR_INSET_MAX);
  return random(minOffset, maxOffset);
}

function getCollisionHashKey(cellX, cellY) {
  return (
    (cellX + COLLISION_HASH_COORD_OFFSET) * COLLISION_HASH_ROW_STRIDE +
    (cellY + COLLISION_HASH_COORD_OFFSET)
  );
}

function getDroppedShapeCollisionOwner(shape) {
  if (shape && shape.dropSource === "intro-cube") {
    return "intro-drop";
  }

  return "world";
}

function rebuildStaticDroppedCollisionBodies() {
  droppedStaticCollisionBodies = [];

  for (const shape of droppedShapes) {
    if (!shape.frozen) {
      continue;
    }

    droppedStaticCollisionBodies.push({
      entity: shape,
      pos: shape.pos,
      // Resting drops stay cheap via caching, but keep finite mass so they can
      // separate from fresh overlaps and slide when the player shoves them.
      vel: shape.vel || createVector(0, 0),
      radius: getFollowerCollisionRadius(shape),
      invMass: 1 / max(0.0001, getRestingDroppedCollisionMass(shape)),
      kind: "dropped-static",
      owner: getDroppedShapeCollisionOwner(shape),
      source: shape.dropSource || null,
      audioEntityId: getCollisionAudioEntityId(shape),
    });
  }

  droppedStaticCacheDirty = false;
}

function resolveGlobalCollisionPhysics() {
  if (!boidConfig) {
    return;
  }

  const bodies = collectCollisionBodies();

  if (bodies.length < 2) {
    return;
  }

  // Multiple narrow-phase passes reduce visible clipping on dense stacks. The
  // bucket size is based on actual radii so scaled-up followers cannot skip
  // each other by landing in non-neighboring cells.
  const cellSize = getCollisionBucketCellSize(bodies);

  for (let pass = 0; pass < COLLISION_SOLVER_ITERATIONS; pass += 1) {
    const buckets = new Map();

    for (let i = 0; i < bodies.length; i += 1) {
      const body = bodies[i];
      const cellX = floor(body.pos.x / cellSize);
      const cellY = floor(body.pos.y / cellSize);
      const key = getCollisionHashKey(cellX, cellY);
      let bucket = buckets.get(key);

      if (!bucket) {
        bucket = [];
        buckets.set(key, bucket);
      }

      bucket.push(i);
    }

    for (let i = 0; i < bodies.length; i += 1) {
      const a = bodies[i];
      const cellX = floor(a.pos.x / cellSize);
      const cellY = floor(a.pos.y / cellSize);

      for (const [ox, oy] of COLLISION_NEIGHBOR_OFFSETS) {
        const key = getCollisionHashKey(cellX + ox, cellY + oy);
        const list = buckets.get(key);

        if (!list) {
          continue;
        }

        for (const j of list) {
          if (j <= i) {
            continue;
          }

          resolveCollisionPair(a, bodies[j]);
        }
      }
    }
  }

  for (const shape of droppedShapes) {
    if (shape.frozen) {
      stabilizeRestingDroppedShape(shape);
      continue;
    }

    stabilizeDroppedShape(shape);
  }
}

function collectCollisionBodies() {
  const bodies = [];

  for (const cube of narrativeCubes) {
    addCollisionBody(
      bodies,
      cube,
      getNarrativeCubeCollisionRadius(cube),
      getNarrativeCubeCollisionMass(cube),
      "narrative",
      "narrative",
    );
  }

  for (const swarm of smallSwarms) {
    const swarmOwner = `cluster-small-${swarm.id}`;
    for (const follower of swarm.followers) {
      addCollisionBody(
        bodies,
        follower,
        getFollowerCollisionRadius(follower),
        getFollowerCollisionMass(follower),
        "follower",
        swarmOwner,
      );
    }
  }

  for (const follower of userFollowers) {
    addCollisionBody(
      bodies,
      follower,
      getFollowerCollisionRadius(follower),
      getFollowerCollisionMass(follower),
      "follower",
      userOwner,
    );
  }

  // Macro leaders stay collision-immune chase targets and carry no followers.

  if (droppedStaticCacheDirty) {
    rebuildStaticDroppedCollisionBodies();
  }

  for (const shape of droppedShapes) {
    if (shape.frozen) {
      continue;
    }

    addCollisionBody(
      bodies,
      shape,
      getFollowerCollisionRadius(shape),
      getDroppedCollisionMass(shape),
      "dropped",
      getDroppedShapeCollisionOwner(shape),
      false,
      shape.dropSource || null,
    );
  }

  for (const staticBody of droppedStaticCollisionBodies) {
    bodies.push(staticBody);
  }

  return bodies;
}

function getCollisionBucketCellSize(bodies) {
  let largestRadius = 0;

  for (const body of bodies) {
    largestRadius = max(largestRadius, body.radius || 0);
  }

  return max(14, largestRadius * 2.2);
}

function addCollisionBody(
  bodies,
  entity,
  radius,
  mass,
  kind,
  owner = "world",
  isStatic = false,
  source = null,
) {
  if (!entity || !entity.pos) {
    return;
  }

  const velocity =
    entity.vel || (isStatic ? ZERO_VELOCITY : createVector(0, 0));

  bodies.push({
    entity,
    pos: entity.pos,
    vel: velocity,
    radius,
    invMass: isStatic ? 0 : 1 / max(0.0001, mass),
    kind,
    owner,
    source,
    audioEntityId: getCollisionAudioEntityId(entity),
  });
}

function getLeaderCollisionRadius(leader) {
  return max(6, leader.size * 0.56);
}

function getFollowerCollisionRadius(follower) {
  return max(3, follower.size * 0.42);
}

function getNarrativeCubeCollisionRadius(cube) {
  return max(4, cube.size * 0.46);
}

function getLeaderCollisionMass(leader) {
  if (leader === userLeader) {
    // Give the player more authority against resting debris so shove interactions
    // read clearly instead of feeling like equal-mass bumper collisions.
    return 9.4;
  }

  const sizeFactor = max(1, leader.size / max(1, boidConfig.leaderSize));
  return 2.6 * sizeFactor;
}

function getNarrativeCubeCollisionMass(cube) {
  return max(1.35, cube.size * 0.2);
}

function getFollowerCollisionMass(follower) {
  return max(0.75, follower.size * 0.14);
}

function getDroppedCollisionMass(shape) {
  return max(1.1, shape.size * 0.18);
}

function getRestingDroppedCollisionMass(shape) {
  return getDroppedCollisionMass(shape) * 1.05;
}

function resolveCollisionPair(a, b) {
  // Apply the few intentional exemptions first; follower/follower pairs remain live.
  if (shouldSkipCollisionPair(a, b)) {
    return;
  }

  let dx = b.pos.x - a.pos.x;
  let dy = b.pos.y - a.pos.y;
  let distSq = dx * dx + dy * dy;
  const minDist = a.radius + b.radius;

  if (distSq >= minDist * minDist) {
    markFabricCollisionPairSeparation(a, b, sqrt(distSq) - minDist);
    return;
  }

  if (distSq <= 0.000001) {
    const angle = random(TWO_PI);
    dx = cos(angle);
    dy = sin(angle);
    distSq = 1;
  }

  const dist = sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;

  const invMassSum = a.invMass + b.invMass;
  if (invMassSum <= 0) {
    return;
  }

  const penetration = minDist - dist;
  const correctedPenetration = max(0, penetration - 0.0001);
  const correction = correctedPenetration / invMassSum;

  a.pos.x -= nx * correction * a.invMass;
  a.pos.y -= ny * correction * a.invMass;
  b.pos.x += nx * correction * b.invMass;
  b.pos.y += ny * correction * b.invMass;

  const rvx = b.vel.x - a.vel.x;
  const rvy = b.vel.y - a.vel.y;
  const relAlongNormal = rvx * nx + rvy * ny;

  if (relAlongNormal > 0) {
    return;
  }

  const impactStrength = max(0, -relAlongNormal) + correctedPenetration * 0.025;
  queueFabricCollisionSoundForBodies(a, b, impactStrength);

  const profile = getCollisionResponseProfile(a.kind, b.kind);
  const impulseMag = (-(1 + profile.restitution) * relAlongNormal) / invMassSum;

  a.vel.x -= impulseMag * nx * a.invMass;
  a.vel.y -= impulseMag * ny * a.invMass;
  b.vel.x += impulseMag * nx * b.invMass;
  b.vel.y += impulseMag * ny * b.invMass;

  const txRaw = rvx - relAlongNormal * nx;
  const tyRaw = rvy - relAlongNormal * ny;
  const tLen = sqrt(txRaw * txRaw + tyRaw * tyRaw);

  if (tLen > 0.0001) {
    const tx = txRaw / tLen;
    const ty = tyRaw / tLen;
    let frictionImpulse = -((rvx * tx + rvy * ty) / invMassSum);
    const maxFriction = impulseMag * profile.friction;
    frictionImpulse = constrain(frictionImpulse, -maxFriction, maxFriction);

    a.vel.x -= frictionImpulse * tx * a.invMass;
    a.vel.y -= frictionImpulse * ty * a.invMass;
    b.vel.x += frictionImpulse * tx * b.invMass;
    b.vel.y += frictionImpulse * ty * b.invMass;
  }
}

function shouldSkipCollisionPair(a, b) {
  // User followers should collide with each other, but not shove the fixed
  // narrative leader away from its staged dialogue position.
  if (
    a.owner === "cluster-user" &&
    b.owner === "cluster-user" &&
    (a.kind === "leader" || b.kind === "leader")
  ) {
    return true;
  }

  // Intro cubes should never physically push the user while they are being collected.
  if (
    (a.owner === "cluster-user" && b.kind === "narrative") ||
    (b.owner === "cluster-user" && a.kind === "narrative")
  ) {
    return true;
  }

  const aIsIntroDrop = a.owner === "intro-drop" || a.source === "intro-cube";
  const bIsIntroDrop = b.owner === "intro-drop" || b.source === "intro-cube";

  // Intro dropped cubes are exempt from colliding with the entire user cluster.
  if (
    (a.owner === "cluster-user" && bIsIntroDrop) ||
    (b.owner === "cluster-user" && aIsIntroDrop)
  ) {
    return true;
  }

  // Small-swarm followers pass through dropped shapes to prevent pile lockups.
  const aIsSmallFollower =
    a.kind === "follower" &&
    typeof a.owner === "string" &&
    a.owner.startsWith("cluster-small-");
  const bIsSmallFollower =
    b.kind === "follower" &&
    typeof b.owner === "string" &&
    b.owner.startsWith("cluster-small-");
  const aIsDroppedShape = a.kind === "dropped" || a.kind === "dropped-static";
  const bIsDroppedShape = b.kind === "dropped" || b.kind === "dropped-static";

  if (
    (aIsSmallFollower && bIsDroppedShape) ||
    (bIsSmallFollower && aIsDroppedShape)
  ) {
    return true;
  }

  return false;
}

function getCollisionResponseProfile(kindA, kindB) {
  if (kindA === "dropped-static" && kindB === "dropped-static") {
    return { restitution: 0.01, friction: 0.5 };
  }

  if (kindA === "dropped-static" || kindB === "dropped-static") {
    return { restitution: 0.06, friction: 0.44 };
  }

  if (kindA === "narrative" && kindB === "narrative") {
    return { restitution: 0.08, friction: 0.38 };
  }

  if (kindA === "narrative" || kindB === "narrative") {
    return { restitution: 0.12, friction: 0.32 };
  }

  if (kindA === "dropped" && kindB === "dropped") {
    return { restitution: 0.1, friction: 0.34 };
  }

  if (kindA === "dropped" || kindB === "dropped") {
    return { restitution: 0.16, friction: 0.26 };
  }

  if (kindA === "leader" && kindB === "leader") {
    return { restitution: 0.2, friction: 0.18 };
  }

  return { restitution: 0.24, friction: 0.22 };
}

function stabilizeDroppedShape(shape) {
  shape.pos.x = constrain(shape.pos.x, -shape.size, width + shape.size);

  if (shape.pos.y > shape.groundY) {
    shape.pos.y = shape.groundY;

    if (shape.vel.y > 0) {
      shape.vel.y *= -0.12;
    }

    if (abs(shape.vel.y) < 0.025) {
      shape.vel.y = 0;
    }
  }
}

function drawDroppedShapes() {
  for (const shape of droppedShapes) {
    if (!isShapeNearViewport(shape)) {
      continue;
    }

    const decayState = getFinalBlobDroppedShapeDecayState(shape);
    if (decayState.hidden) {
      continue;
    }

    drawSolidFollowerShape(shape, decayState);
  }
}

function getFinalBlobDroppedShapeDecayState(shape) {
  if (
    !shape ||
    !Number.isFinite(shape.finalBlobTouchedAtMs) ||
    shape.finalBlobTouchedAtMs <= 0
  ) {
    return {
      shadeProgress: 0,
      renderScale: 1,
      hidden: false,
    };
  }

  const elapsedMs = max(0, millis() - shape.finalBlobTouchedAtMs);
  const shadeProgress = constrain(
    elapsedMs / FINAL_HURT_DROPPED_SHADE_LOSS_MS,
    0,
    1,
  );
  const shrinkElapsedMs =
    elapsedMs -
    FINAL_HURT_DROPPED_SHADE_LOSS_MS -
    FINAL_HURT_DROPPED_DISAPPEAR_DELAY_MS;

  if (shrinkElapsedMs <= 0) {
    return {
      shadeProgress,
      renderScale: 1,
      hidden: false,
    };
  }

  const shrinkProgress = constrain(
    shrinkElapsedMs / FINAL_HURT_DROPPED_DISAPPEAR_MS,
    0,
    1,
  );
  const easedShrink = shrinkProgress * shrinkProgress * (3 - 2 * shrinkProgress);
  const renderScale = max(0, 1 - easedShrink);

  return {
    shadeProgress,
    renderScale,
    hidden: renderScale <= FINAL_HURT_DROPPED_SINK_MIN_SCALE,
  };
}

function stabilizeRestingDroppedShape(shape) {
  if (!shape) {
    return;
  }

  shape.pos.x = constrain(shape.pos.x, -shape.size, width + shape.size);
  shape.pos.y = shape.groundY;

  if (!shape.vel) {
    shape.vel = createVector(0, 0);
    return;
  }

  // Frozen drops should feel heavy but still yield when the player leans into them.
  shape.vel.x *= 0.78;
  shape.vel.y = 0;

  if (abs(shape.vel.x) < 0.006) {
    shape.vel.x = 0;
  }
}

function isShapeNearViewport(shape) {
  if (!shape || !shape.pos) {
    return false;
  }

  const margin = max(24, (shape.size || 0) * 1.8);
  return (
    shape.pos.x > -margin &&
    shape.pos.x < width + margin &&
    shape.pos.y > -margin &&
    shape.pos.y < height + margin
  );
}

function getMouseWorldPosition() {
  const wrapper = document.getElementById("p5-canvas-wrap");

  if (!wrapper) {
    return createVector(
      constrain(mouseX, 0, width),
      constrain(mouseY, 0, height),
    );
  }

  const bounds = wrapper.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    return createVector(width * 0.5, height * 0.5);
  }

  const localX = constrain(winMouseX - bounds.left, 0, bounds.width);
  const localY = constrain(winMouseY - bounds.top, 0, bounds.height);
  const host = getP5Host();
  const fullscreen = isArtOnlyMode() || (host ? isP5HostFullscreen(host) : false);

  if (fullscreen) {
    return createVector(
      constrain(localX, 0, width),
      constrain(localY, 0, height),
    );
  }

  return createVector(
    constrain(localX + previewOffsetX, 0, width),
    constrain(localY + previewOffsetY, 0, height),
  );
}

function getNarrativeCubeSize() {
  const source = max(boidConfig.followerSizeMin, boidConfig.followerSizeMax);
  const narrativeScale = getCombinedScale("narrativeCubeScale");
  return constrain(
    source * SHAPE_SIZE_BOOST * 1.08 * narrativeScale,
    14 * narrativeScale,
    46 * narrativeScale,
  );
}

function initNarrativeSequence() {
  narrativeCubes = [];
  narrativePrompt = NARRATIVE_PROMPTS[0] || "";
  narrativePromptHideAtMs = 0;
  narrativeClicks = 0;
  nextNarrativeCubeId = 1;
  spawnNarrativeCube();
}

function isArtOnlyMode() {
  return Boolean(document.body && document.body.classList.contains("art-only"));
}

function isPreviewMode() {
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

function spawnNarrativeCube() {
  if (!boidConfig) {
    return;
  }

  const cubeSize = getNarrativeCubeSize();
  const spawnIndex = nextNarrativeCubeId - 1;
  const anchorOffset =
    NARRATIVE_CUBE_ANCHOR_OFFSETS[
      min(spawnIndex, NARRATIVE_CUBE_ANCHOR_OFFSETS.length - 1)
    ];
  const anchor = createVector(
    constrain(width * 0.5 + anchorOffset, cubeSize, width - cubeSize),
    height * 0.5 + (spawnIndex % 2 === 0 ? 0 : 20),
  );

  narrativeCubes.push({
    id: nextNarrativeCubeId,
    pos: createVector(anchor.x, -cubeSize * 2.2),
    vel: createVector(random(-0.85, 0.85), random(0.35, 1.15)),
    angle: random(-0.35, 0.35),
    spin: random(-0.026, 0.026),
    size: cubeSize,
    tint: WEBSITE_MAIN_PALETTE[spawnIndex % WEBSITE_MAIN_PALETTE.length].slice(),
    patternStyle: PATTERN_STYLES[spawnIndex % PATTERN_STYLES.length],
    patternAccent: PATTERN_ACCENTS[spawnIndex % PATTERN_ACCENTS.length].slice(),
    patternSeed: nextNarrativeCubeId * 0.413 + random(TWO_PI),
    patternScale: 1,
    anchor,
    pickedUp: false,
    carryOrder: -1,
    hovered: false,
  });

  nextNarrativeCubeId += 1;
}

function updateNarrativeSequence() {
  if (assimilationSequenceStarted) {
    return;
  }

  if (narrativeCubes.length === 0 && narrativeClicks < NARRATIVE_CUBE_COUNT) {
    spawnNarrativeCube();
  }

  updateNarrativeCubeHoverState();

  for (const cube of narrativeCubes) {
    if (cube.pickedUp) {
      const carryTarget = getNarrativeCarryTarget(cube.carryOrder);
      const follow = seekTarget(
        cube,
        carryTarget,
        max(boidConfig.userMaxSpeed * 3.1, 4.4),
        max(boidConfig.leaderMaxForce * 3.2, 0.55),
      );
      cube.vel.add(follow);
      cube.vel.mult(0.94);
    } else {
      // Spring-to-anchor now keeps a nervous, under-damped settle.
      const spring = p5.Vector.sub(cube.anchor, cube.pos);
      spring.mult(0.04);
      cube.vel.add(spring);
      cube.vel.y += 0.07;
      cube.vel.mult(0.97);
      cube.vel.limit(4.2);
    }

    cube.pos.add(cube.vel);
    cube.pos.x = constrain(cube.pos.x, -cube.size, width + cube.size);
    cube.pos.y = constrain(cube.pos.y, -cube.size * 2.4, height + cube.size);
    cube.angle += cube.spin;
  }
}

function updateNarrativeCubeHoverState() {
  for (const cube of narrativeCubes) {
    cube.hovered = false;
  }

  const pointer = getMouseWorldPosition();
  let hovered = null;

  for (let i = narrativeCubes.length - 1; i >= 0; i -= 1) {
    const cube = narrativeCubes[i];
    if (cube.pickedUp) {
      continue;
    }

    const hitRadius = cube.size * 0.56;
    const dx = pointer.x - cube.pos.x;
    const dy = pointer.y - cube.pos.y;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      hovered = cube;
      break;
    }
  }

  if (hovered) {
    hovered.hovered = true;
  }
}

function getNarrativeCarryTarget(order) {
  const cubeGap = getNarrativeCubeSize() * 0.95;
  const basePoint = shouldIntroCarryFollowPointer()
    ? getMouseWorldPosition()
    : getUserStagePoint();
  const orbitRadius = cubeGap * (0.82 + max(0, order) * 0.16);
  const orbitAngle =
    millis() * 0.0022 + (TWO_PI * max(0, order)) / NARRATIVE_CUBE_COUNT;

  return createVector(
    constrain(basePoint.x + cos(orbitAngle) * orbitRadius, 0, width),
    constrain(basePoint.y + sin(orbitAngle) * orbitRadius, 0, height),
  );
}

function handleNarrativeCubeClick(cube) {
  if (!cube || cube.pickedUp || assimilationSequenceStarted) {
    return;
  }

  playPickupSound();
  cube.pickedUp = true;
  cube.hovered = false;
  cube.carryOrder = narrativeClicks;
  narrativeClicks += 1;

  const introPromptCount = min(NARRATIVE_PROMPTS.length, NARRATIVE_CUBE_COUNT);
  const nextPromptIndex = narrativeClicks;
  if (nextPromptIndex >= 0 && nextPromptIndex < introPromptCount) {
    narrativePrompt = NARRATIVE_PROMPTS[nextPromptIndex];
  }

  if (narrativeClicks < NARRATIVE_CUBE_COUNT) {
    spawnNarrativeCube();
    return;
  }

  // Clear intro dialogue here; the final warning returns only at the end state.
  narrativePrompt = "";
  narrativePromptHideAtMs = 0;
  startAssimilationSequence();
}

function releaseNarrativeCubesToDroppedShapes() {
  const nowMs = millis();
  const dynamicDurationMs =
    max(0, boidConfig.droppedPhysicsDurationSeconds) * 1000;
  const droppedScale = getCombinedScale("droppedShapeScale");
  grainRevealDropCount += narrativeCubes.length;

  for (const cube of narrativeCubes) {
    const droppedSize = cube.size * droppedScale;
    const groundOffset = getDroppedGroundOffsetForShape(cube);

    droppedShapes.push({
      type: "square",
      pos: cube.pos.copy(),
      vel: cube.vel
        .copy()
        .add(createVector(random(-0.15, 0.15), random(0.18, 0.9))),
      angle: cube.angle,
      spin: random(-0.01, 0.01),
      size: droppedSize,
      baseSize: droppedSize,
      renderScale: 1,
      landedShrinkApplied: false,
      desaturateDelayUntilMs: Number.POSITIVE_INFINITY,
      tint: cube.tint.slice(),
      patternStyle: cube.patternStyle || null,
      patternAccent: Array.isArray(cube.patternAccent)
        ? cube.patternAccent.slice()
        : null,
      patternSeed:
        typeof cube.patternSeed === "number"
          ? cube.patternSeed
          : random(TWO_PI),
      patternScale:
        typeof cube.patternScale === "number" ? cube.patternScale : 1,
      patternAlpha: 1,
      grainSeed:
        typeof cube.patternSeed === "number"
          ? cube.patternSeed
          : random(TWO_PI),
      groundOffset,
      groundY: height - groundOffset,
      dynamicUntilMs: nowMs + dynamicDurationMs,
      settledFrames: 0,
      frozen: false,
      // Track intro-origin drops so we can selectively disable user-leader collisions.
      dropSource: "intro-cube",
    });
  }
  enforceDroppedShapeCap();
}

function startAssimilationSequence() {
  if (assimilationSequenceStarted) {
    return;
  }

  assimilationSequenceStarted = true;
  playCrowdAudio();
  if (narrativePrompt && narrativePromptHideAtMs <= 0) {
    narrativePromptHideAtMs = millis() + NARRATIVE_FINAL_PROMPT_HOLD_MS;
  }
  releaseNarrativeCubesToDroppedShapes();
  narrativeCubes = [];

  // Assimilation starts with the user stripped back to the core triangle only.
  userFollowers = [];

  buildBigTrendLeaders();
  buildSmallSwarms();
  startInfluenceCycle();
}

function mousePressed() {
  primeCrowdAudio();
  playMouseClickSound();

  if (!simulationStarted || assimilationSequenceStarted) {
    return;
  }

  const pointer = getMouseWorldPosition();

  for (let i = narrativeCubes.length - 1; i >= 0; i -= 1) {
    const cube = narrativeCubes[i];

    if (cube.pickedUp) {
      continue;
    }

    const hitRadius = cube.size * 0.56;
    const dx = pointer.x - cube.pos.x;
    const dy = pointer.y - cube.pos.y;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      handleNarrativeCubeClick(cube);
      return;
    }
  }
}

function desaturateColorInPlace(colorData, amount) {
  const gray = (colorData[0] + colorData[1] + colorData[2]) / 3;
  colorData[0] = lerp(colorData[0], gray, amount);
  colorData[1] = lerp(colorData[1], gray, amount);
  colorData[2] = lerp(colorData[2], gray, amount);
}

function fadePatternAlphaInPlace(shape, amount) {
  if (!shape || !shape.patternStyle) {
    return;
  }

  const currentAlpha = Number.isFinite(shape.patternAlpha)
    ? shape.patternAlpha
    : 1;
  // Keep a faint 15% pattern ghost even after the color has fully desaturated.
  shape.patternAlpha = max(
    PATTERN_ALPHA_FLOOR,
    lerp(currentAlpha, PATTERN_ALPHA_FLOOR, amount),
  );
}

function updateUserLeader() {
  if (!userLeader) {
    return;
  }

  const stagePoint = getUserStagePoint();
  userLeader.pos.x = stagePoint.x;
  userLeader.pos.y = stagePoint.y;
  userLeader.vel.x = 0;
  userLeader.vel.y = 0;
  userLeader.acc.x = 0;
  userLeader.acc.y = 0;

  // User stays fixed above the dialogue; keyboard movement has been intentionally removed.
  userLeader.portalProjection = null;
  userLeader.angle = -HALF_PI;

  userLeader.displayAngle = lerpAngle(
    userLeader.displayAngle,
    userLeader.angle,
    boidConfig.headingSmoothing,
  );
}

function updateFollowersForLeader(followers, leader, options = {}) {
  if (!leader) {
    return;
  }

  const allowIndividualWrap = options.allowIndividualWrap !== false;
  const usePortalRouting = options.usePortalRouting !== false;
  const maxSpeedMultiplier =
    typeof options.maxSpeedMultiplier === "number"
      ? max(0.01, options.maxSpeedMultiplier)
      : 1;
  const followStrengthMultiplier =
    typeof options.followStrengthMultiplier === "number"
      ? max(0.01, options.followStrengthMultiplier)
      : 1;
  // Control: followerMaxSpeed remains the base follower pace; per-cycle speed controls scale it from here.
  const followerMaxSpeed = boidConfig.followerMaxSpeed * maxSpeedMultiplier;
  // Faster follower steering keeps the orbit stable when the cycle-speed controls push swarms harder.
  const followerFollowStrength =
    boidConfig.followerFollowStrength * followStrengthMultiplier;

  for (let i = 0; i < followers.length; i += 1) {
    const follower = followers[i];
    const previousPos = { x: follower.pos.x, y: follower.pos.y };

    const pulse =
      1 +
      sin(frameCount * 0.017 + follower.orbitPhase) *
        boidConfig.followerOrbitJitter *
        0.42 +
      sin(frameCount * 0.071 + follower.patternSeed * 1.7) *
        boidConfig.followerOrbitJitter *
        0.22;
    const radius = follower.baseRadius * pulse;
    const orbitAngle =
      follower.orbitPhase +
      frameCount * follower.orbitSpeed +
      sin(frameCount * 0.049 + follower.patternSeed) *
        boidConfig.followerOrbitJitter *
        0.42;

    let targetX = leader.pos.x + cos(orbitAngle) * radius;
    let targetY = leader.pos.y + sin(orbitAngle) * radius;

    if (boidConfig.followerTrailBias > 0 && i > 0) {
      const prevFollower = followers[i - 1];
      targetX = lerp(targetX, prevFollower.pos.x, boidConfig.followerTrailBias);
      targetY = lerp(targetY, prevFollower.pos.y, boidConfig.followerTrailBias);
    }

    const steering = seekTargetXY(
      follower,
      targetX,
      targetY,
      followerMaxSpeed,
      followerFollowStrength,
    );

    follower.vel.add(steering);
    follower.vel.mult(boidConfig.followerDrag);
    follower.vel.limit(followerMaxSpeed);
    follower.pos.add(follower.vel);

    if (allowIndividualWrap) {
      if (usePortalRouting && assimilationSequenceStarted) {
        routeLeaderThroughRooms(follower, previousPos, [], {
          renderProjection: false,
        });
      } else {
        wrapPosition(follower.pos, follower.size);
        follower.portalProjection = null;
      }
    } else {
      follower.portalProjection = null;
    }

    if (follower.vel.magSq() > 0.0001) {
      follower.angle = follower.vel.heading();
    }
  }
}

function drawAllEntities() {
  drawNarrativeCubes();
  drawFollowers(userFollowers);

  for (const swarm of smallSwarms) {
    drawFollowers(swarm.followers);
  }

  for (const swarm of smallSwarms) {
    drawLeader(swarm.leader, false, false);
    drawSmallLeaderDialogue(swarm);
  }

  // Render big trend leaders last so they always appear on top of other entities.
  for (const trend of bigTrendLeaders) {
    if (trend.dormant) {
      continue;
    }
    drawLeader(trend.leader, false, true);
  }
}

function getFinalHurtSinkProgress() {
  if (!isFinalHurtPhaseActive()) {
    return 0;
  }

  const sinkElapsedMs =
    getFinalHurtElapsedMs() -
    getFinalHurtBlobCoverDurationMs() * FINAL_HURT_SINK_START_COVER_RATIO;

  if (sinkElapsedMs <= 0) {
    return 0;
  }

  const progress = constrain(
    sinkElapsedMs / FINAL_HURT_SINK_DURATION_MS,
    0,
    1,
  );
  return progress * progress * (3 - 2 * progress);
}

function drawWorldEntitiesWithFinalHurtSink() {
  const sinkProgress = getFinalHurtSinkProgress();

  if (sinkProgress <= 0) {
    drawDroppedShapes();
    drawAllEntities();
    return;
  }

  const sinkScale = 1 - FINAL_HURT_SINK_SCALE_LOSS * sinkProgress;
  const sinkAlpha = 1 - sinkProgress;
  const ctx = drawingContext;

  drawDroppedShapes();

  if (sinkAlpha <= 0.001) {
    return;
  }

  ctx.save();
  ctx.globalAlpha *= sinkAlpha;
  push();
  translate(width * 0.5, height * 0.5);
  scale(sinkScale);
  translate(-width * 0.5, -height * 0.5);
  drawAllEntities();
  pop();
  ctx.restore();
}

function drawFollowers(followers) {
  for (const follower of followers) {
    drawFollowerShape(follower);
  }
}

function drawNarrativeCubes() {
  for (const cube of narrativeCubes) {
    drawNarrativeCube(cube);
  }
}

function getSmallLeaderDialogueText(swarm) {
  if (!swarm || SMALL_LEADER_DIALOGUE_LINES.length === 0) {
    return "";
  }

  const globalDialogue = getGlobalConsumptionDialogueState();
  if (globalDialogue && globalDialogue.message !== "I NEED IT") {
    return globalDialogue.message;
  }

  const seed = Number.isFinite(swarm.id) ? swarm.id : 0;
  const index = abs(floor(seed * 7)) % SMALL_LEADER_DIALOGUE_LINES.length;
  return SMALL_LEADER_DIALOGUE_LINES[index];
}

function drawSmallLeaderDialogue(swarm) {
  const leader = swarm && swarm.leader;
  if (!leader || !leader.pos) {
    return;
  }

  const message = getSmallLeaderDialogueText(swarm);
  if (!message) {
    return;
  }
  noteTextPopupVisible(`small:${swarm.id || 0}:${message}`);

  const textSizePx = constrain(leader.size * 0.42, 18, 28);
  const paddingX = max(13, textSizePx * 0.88);
  const paddingY = max(8, textSizePx * 0.56);
  const offsetY = leader.size * 1.24 + textSizePx * 1.32;
  const centerX = leader.pos.x;
  const centerY = leader.pos.y + offsetY;

  drawSpec1DialogueBox(message, centerX, centerY, textSizePx, 255, {
    paddingX,
    paddingY,
    shadowStep: max(5, leader.size * 0.12),
    borderWidth: max(2.5, textSizePx * 0.15),
  });
}

function drawSpec1DialogueBox(
  message,
  centerX,
  centerY,
  textSizePx,
  alpha = 255,
  options = {},
) {
  if (!message) {
    return;
  }

  const size = max(10, textSizePx);
  const ctx = drawingContext;
  const opacity = constrain(alpha, 0, 255) / 255;
  const paddingX =
    typeof options.paddingX === "number" ? options.paddingX : size * 1.15;
  const paddingY =
    typeof options.paddingY === "number" ? options.paddingY : size * 0.72;
  const paddingTop =
    typeof options.paddingTop === "number" ? options.paddingTop : paddingY;
  const paddingBottom =
    typeof options.paddingBottom === "number" ? options.paddingBottom : paddingY;
  const borderWidth =
    typeof options.borderWidth === "number" ? options.borderWidth : 3;
  const maxWidth =
    typeof options.maxWidth === "number" ? max(size * 4, options.maxWidth) : null;
  const lineHeight =
    typeof options.lineHeight === "number" ? options.lineHeight : size * 1.35;
  const shadowStep =
    typeof options.shadowStep === "number" ? options.shadowStep : 6;
  const backShadowColor = Array.isArray(options.backShadowColor)
    ? options.backShadowColor
    : COLOR_CYAN;
  const frontShadowColor = Array.isArray(options.frontShadowColor)
    ? options.frontShadowColor
    : COLOR_PINK;
  const borderColor = Array.isArray(options.borderColor)
    ? options.borderColor
    : COLOR_YELLOW;
  const textColor = Array.isArray(options.textColor)
    ? options.textColor
    : COLOR_WHITE;
  const textShadowColor = Array.isArray(options.textShadowColor)
    ? options.textShadowColor
    : COLOR_PINK;

  ctx.save();
  ctx.font = `400 ${size}px ${P5_DIALOG_FONT_STACK}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2.5px";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxTextWidth = maxWidth ? max(1, maxWidth - paddingX * 2) : null;
  const lines = wrapCanvasTextLines(ctx, String(message).toUpperCase(), maxTextWidth);
  let textWidth = 0;
  for (const line of lines) {
    textWidth = max(textWidth, ctx.measureText(line).width);
  }

  const boxWidth = maxWidth
    ? min(maxWidth, textWidth + paddingX * 2)
    : textWidth + paddingX * 2;
  const textBlockHeight = lineHeight * max(1, lines.length);
  const boxHeight = textBlockHeight + paddingTop + paddingBottom;
  const left = centerX - boxWidth * 0.5;
  const top = centerY - boxHeight * 0.5;

  ctx.globalAlpha *= opacity;
  ctx.fillStyle = rgbToRgba(backShadowColor, 1);
  ctx.fillRect(left + shadowStep * 2, top + shadowStep * 2, boxWidth, boxHeight);
  ctx.fillStyle = rgbToRgba(frontShadowColor, 1);
  ctx.fillRect(left + shadowStep, top + shadowStep, boxWidth, boxHeight);
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(left, top, boxWidth, boxHeight);
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = rgbToRgba(borderColor, 1);
  ctx.strokeRect(left, top, boxWidth, boxHeight);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  const firstLineY = top + paddingTop + size * 0.62;
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillStyle = rgbToRgba(textShadowColor, 1);
    ctx.fillText(lines[i], centerX + 2, firstLineY + i * lineHeight + 2);
    ctx.fillStyle = rgbToRgba(textColor, 1);
    ctx.fillText(lines[i], centerX, firstLineY + i * lineHeight);
  }
  ctx.restore();
}

function wrapCanvasTextLines(ctx, message, maxTextWidth) {
  if (!maxTextWidth || ctx.measureText(message).width <= maxTextWidth) {
    return [message];
  }

  const words = String(message).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxTextWidth || !currentLine) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [message];
}

function applyAdaptiveDropShadow(position, span, alphaMultiplier = 1) {
  if (!position) {
    return;
  }

  // Fixed bottom-right shadow: cheaper than sampling a moving light per shape.
  const minOffsetPx =
    boidConfig && typeof boidConfig.shadowOffsetMinPx === "number"
      ? max(0, boidConfig.shadowOffsetMinPx)
      : 0.8;
  const baseFactor =
    boidConfig && typeof boidConfig.shadowOffsetBaseFactor === "number"
      ? max(0, boidConfig.shadowOffsetBaseFactor)
      : 0.04;
  const influenceFactor =
    boidConfig && typeof boidConfig.shadowOffsetInfluenceFactor === "number"
      ? max(0, boidConfig.shadowOffsetInfluenceFactor)
      : 0.07;
  const offset = max(minOffsetPx, span * (baseFactor + influenceFactor));
  const ctx = drawingContext;
  const alpha = constrain(alphaMultiplier, 0, 1);

  // Fixed opaque shadow treatment keeps the print-like edge, but the alpha can
  // be faded for the late-stage corruption pass without triggering blur cost.
  ctx.shadowColor = `rgba(255,255,255,${alpha})`;
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = offset;
  ctx.shadowOffsetY = offset;
}

function clearAdaptiveDropShadow() {
  const ctx = drawingContext;
  // Keep shadow reset deterministic so subsequent draws never inherit stale blur/offset.
  ctx.shadowColor = "rgb(255,255,255)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawOpaqueCellShading(pathBuilder, span, position, seed = 0) {
  // White interior cel patches removed by request.
  return;
}

function drawNarrativeCube(cube) {
  push();
  translate(cube.pos.x, cube.pos.y);
  rotate(cube.angle);

  const geometry = getEntityShapeGeometry(cube, "square", "introCube");
  const cubePoints = geometry.points;
  const cubePath = geometry.path;
  const cubePathBuilder = cubePath
    ? null
    : (ctx) => {
        tracePolygonPath(ctx, cubePoints);
      };

  applyAdaptiveDropShadow(cube.pos, cube.size);
  // Narrative cubes are now intentionally fully opaque (stroke + fill).
  fillPolygonFromPoints(cubePoints, cube.tint, cubePath);
  clearAdaptiveDropShadow();
  drawFollowerBuiltInPattern(
    cubePathBuilder,
    geometry.span,
    cube,
    cube.patternSeed,
    cubePath,
  );
  // Redraw the border after clipping patterns so the intro pieces stay crisp.
  strokePolygonFromPoints(
    cubePoints,
    COLOR_WHITE,
    cube.hovered ? 3 : 1.5,
    cubePath,
  );
  drawOpaqueCellShading(cubePathBuilder, cube.size * 0.62, cube.pos, cube.id);

  pop();
}

function drawLeader(leader, isUser, isBig) {
  if (!leader) {
    return;
  }

  const projection = leader.portalProjection;
  if (
    projection &&
    projection.active &&
    projection.pos &&
    projection.sourceBounds &&
    projection.destinationBounds
  ) {
    // Split render: source-room fragment + destination-room fragment.
    drawLeaderInstance(
      leader,
      leader.pos,
      isUser,
      isBig,
      projection.sourceBounds,
    );
    drawLeaderInstance(
      leader,
      projection.pos,
      isUser,
      isBig,
      projection.destinationBounds,
    );
    return;
  }

  drawLeaderInstance(leader, leader.pos, isUser, isBig);

  if (!isBig || leader.entryActive || leader.exitActive) {
    return;
  }

  const wrapOffsets = getViewportWrapRenderOffsets(leader.pos, leader.size);
  for (const offset of wrapOffsets) {
    drawLeaderInstance(
      leader,
      {
        x: leader.pos.x + offset.x,
        y: leader.pos.y + offset.y,
      },
      isUser,
      isBig,
    );
  }
}

function getDistanceOutsideViewport(position) {
  if (!position) {
    return 0;
  }

  const outsideLeft = max(0, -position.x);
  const outsideRight = max(0, position.x - width);
  const outsideTop = max(0, -position.y);
  const outsideBottom = max(0, position.y - height);

  return max(outsideLeft, outsideRight, outsideTop, outsideBottom);
}

function getBigLeaderRenderAlpha(leader) {
  if (!leader) {
    return 255;
  }

  if (leader.entryActive) {
    const fadeProgress = constrain(
      (millis() - (leader.entryStartedAtMs || 0)) / BIG_LEADER_FADE_IN_MS,
      0,
      1,
    );
    return 255 * fadeProgress;
  }

  if (leader.exitActive) {
    const fadeDistance = max(36, leader.size * 0.28);
    const outsideDistance = getDistanceOutsideViewport(leader.pos);
    const fadeProgress = constrain(outsideDistance / fadeDistance, 0, 1);
    return 255 * (1 - fadeProgress);
  }

  return 255;
}

function getUserLeaderGeometryRole(leader) {
  const cutCount =
    leader && Number.isFinite(leader.vCutCount)
      ? constrain(floor(leader.vCutCount), 0, FINAL_HURT_MAX_VCUTS)
      : 0;
  return cutCount > 0 ? `userLeaderCuts-${cutCount}` : "userLeader";
}

function getUserLeaderShapeType(leader) {
  return leader && Number.isFinite(leader.vCutCount) && leader.vCutCount > 0
    ? "userLeaderTriangle"
    : "leaderTriangle";
}

function getLeaderRenderColor(leader, isUser) {
  if (!leader || !Array.isArray(leader.colorData)) {
    return COLOR_WHITE;
  }

  if (!isUser) {
    return leader.colorData;
  }

  const grayBlend =
    leader && Number.isFinite(leader.grayBlend)
      ? constrain(leader.grayBlend, 0, 1)
      : 0;

  return grayBlend > 0
    ? blendColors(leader.colorData, FINAL_HURT_GRAY, grayBlend)
    : leader.colorData;
}

function getUserLeaderShadowDecayProgress(leader) {
  if (
    !leader ||
    !leader.finalHurtTouched ||
    !Number.isFinite(leader.finalHurtTouchedAtMs) ||
    leader.finalHurtTouchedAtMs <= 0
  ) {
    return 0;
  }

  const progress = constrain(
    (millis() - leader.finalHurtTouchedAtMs) / FINAL_HURT_BLEED_DURATION_MS,
    0,
    1,
  );
  const eased = easeInOutCirc(progress);
  return eased * eased;
}

function getViewportWrapRenderOffsets(position, radius) {
  if (!position) {
    return [];
  }

  const margin = max(6, radius * 0.85);
  let offsetX = 0;
  let offsetY = 0;

  if (position.x - radius < 0 || position.x < -margin) {
    offsetX = width;
  } else if (position.x + radius > width || position.x > width + margin) {
    offsetX = -width;
  }

  if (position.y - radius < 0 || position.y < -margin) {
    offsetY = height;
  } else if (position.y + radius > height || position.y > height + margin) {
    offsetY = -height;
  }

  const offsets = [];

  if (offsetX !== 0) {
    offsets.push({ x: offsetX, y: 0 });
  }

  if (offsetY !== 0) {
    offsets.push({ x: 0, y: offsetY });
  }

  if (offsetX !== 0 && offsetY !== 0) {
    offsets.push({ x: offsetX, y: offsetY });
  }

  return offsets;
}

function drawLeaderInstance(
  leader,
  drawPosition,
  isUser,
  isBig,
  clipBounds = null,
) {
  if (!drawPosition) {
    return;
  }

  const ctx = drawingContext;
  ctx.save();
  if (clipBounds) {
    ctx.beginPath();
    ctx.rect(
      clipBounds.left,
      clipBounds.top,
      max(0, clipBounds.right - clipBounds.left),
      max(0, clipBounds.bottom - clipBounds.top),
    );
    ctx.clip();
  }

  const leaderAlpha = isBig ? getBigLeaderRenderAlpha(leader) : 255;
  if (leaderAlpha <= 0) {
    ctx.restore();
    return;
  }

  ctx.globalAlpha *= leaderAlpha / 255;

  const size = leader.size;
  const leaderRole = isBig
    ? "bigLeader"
    : isUser
      ? getUserLeaderGeometryRole(leader)
      : "smallLeader";
  const leaderShapeType =
    isUser && !isBig ? getUserLeaderShapeType(leader) : "leaderTriangle";
  const leaderGeometry = getEntityShapeGeometry(
    leader,
    leaderShapeType,
    leaderRole,
  );
  const leaderPoints = leaderGeometry.points;
  const leaderPath = leaderGeometry.path;
  const renderColor = getLeaderRenderColor(leader, isUser);

  push();
  translate(drawPosition.x, drawPosition.y);
  rotate((leader.displayAngle || leader.angle) + HALF_PI);
  noStroke();

  const shadowAlpha =
    isUser && !isBig ? 1 - getUserLeaderShadowDecayProgress(leader) : 1;
  applyAdaptiveDropShadow(drawPosition, size, shadowAlpha);
  // Macro leaders now share the same geometry draw path, but their transition alpha
  // is applied through the canvas context for fast spawn/despawn fades.
  fillPolygonFromPoints(leaderPoints, renderColor, leaderPath);
  clearAdaptiveDropShadow();

  const leaderPathBuilder = (ctx) => {
    tracePolygonPath(ctx, leaderPoints);
  };
  drawOpaqueCellShading(
    leaderPathBuilder,
    size * 0.95,
    drawPosition,
    leader.patternSeed,
  );

  pop();
  ctx.restore();
}

function drawFollowerShape(follower) {
  drawFollowerShapeCore(follower, true, "follower");
}

function drawSolidFollowerShape(follower, decayState = null) {
  drawFollowerShapeCore(
    follower,
    Boolean(follower && follower.patternStyle),
    "droppedShape",
    1,
    decayState,
  );
}

function drawFollowerShapeCore(
  follower,
  renderPattern,
  geometryRole = "follower",
  renderScale = 1,
  droppedDecayState = null,
) {
  if (!follower || !follower.pos) {
    return;
  }

  const activeDroppedDecayState =
    geometryRole === "droppedShape"
      ? droppedDecayState || getFinalBlobDroppedShapeDecayState(follower)
      : null;
  if (activeDroppedDecayState && activeDroppedDecayState.hidden) {
    return;
  }

  const effectiveRenderScale = constrain(
    activeDroppedDecayState
      ? activeDroppedDecayState.renderScale
      : Number.isFinite(renderScale)
        ? renderScale
        : 1,
    0,
    1,
  );
  if (effectiveRenderScale <= 0) {
    return;
  }

  const shapeType =
    follower && typeof follower.type === "string" ? follower.type : "square";
  const seed = getShapeRenderSeed(follower);
  const geometry = getEntityShapeGeometry(follower, shapeType, geometryRole);
  const points = geometry.points;
  const span = geometry.span;
  const cachedPath = geometry.path;
  const tint = Array.isArray(follower.tint) ? follower.tint : COLOR_WHITE;
  const shadeProgress = activeDroppedDecayState
    ? activeDroppedDecayState.shadeProgress
    : 0;
  const renderTint =
    shadeProgress > 0
      ? blendColors(tint, FINAL_HURT_GRAY, shadeProgress)
      : tint;
  const shadeAlpha = 1 - shadeProgress;
  const pathBuilder = cachedPath
    ? null
    : (ctx) => {
        tracePolygonPath(ctx, points);
      };

  push();
  translate(follower.pos.x, follower.pos.y);
  rotate(follower.angle);
  if (effectiveRenderScale < 1) {
    scale(effectiveRenderScale);
  }
  noStroke();
  applyAdaptiveDropShadow(
    follower.pos,
    follower.size * effectiveRenderScale,
    shadeAlpha,
  );
  fillPolygonFromPoints(points, renderTint, cachedPath);
  clearAdaptiveDropShadow();

  if (renderPattern && shadeAlpha > 0.01) {
    drawFollowerBuiltInPattern(
      pathBuilder,
      span,
      follower,
      seed,
      cachedPath,
      shadeAlpha,
    );
  }

  pop();
}

function drawGrainInsideClip(pathBuilder, span, seed, alpha = 74, cachedPath = null) {
  if (!pathBuilder && !cachedPath) {
    return;
  }

  const ctx = drawingContext;
  ctx.save();
  applyClipFromPolygon(ctx, pathBuilder, cachedPath);

  drawBlackGrainTexture(span, seed, alpha);
  ctx.restore();
}

function drawBlackGrainTexture(span, seed, alpha) {
  const radius = max(3, span);
  const points = getCachedGrainPoints(radius, seed);

  push();
  noStroke();
  fill(0, 0, 0, alpha);

  // Same radial distribution idea from the reference sketch, but clipped per-shape.
  for (const point of points) {
    circle(point.x, point.y, point.size);
  }

  pop();
}

function getCachedGrainPoints(radius, seed) {
  const key = `${radius}|${seed}`;
  const cached = GRAIN_POINT_CACHE.get(key);

  if (cached) {
    return cached;
  }

  const rng = createDeterministicRng(seed);
  const grainCount = floor(constrain(radius * radius * 0.09, 4, 16));
  const points = new Array(grainCount);

  for (let i = 0; i < grainCount; i += 1) {
    const grainSample = formula(1, radius * 0.95, rng).value;
    const angle = rng() * TWO_PI;
    points[i] = {
      x: cos(angle) * grainSample,
      y: sin(angle) * grainSample,
      size: 0.45 + rng() * min(2.8, radius * 0.14),
    };
  }

  GRAIN_POINT_CACHE.set(key, points);
  if (GRAIN_POINT_CACHE.size > GRAIN_POINT_CACHE_MAX) {
    const oldestKey = GRAIN_POINT_CACHE.keys().next().value;
    if (oldestKey !== undefined) {
      GRAIN_POINT_CACHE.delete(oldestKey);
    }
  }

  return points;
}

function createDeterministicRng(seedValue) {
  let state = floor(abs((seedValue || 0.137) * 1000000)) >>> 0;
  if (state === 0) {
    state = 1;
  }

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function easeInOutCirc(x) {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

function formula(num, r, rng) {
  const randomValue =
    typeof rng === "function"
      ? (maxValue = 1) => rng() * maxValue
      : (maxValue = 1) => random(maxValue);
  let value;

  switch (num) {
    case 0:
      value = randomValue(r);
      break;
    case 1:
      value = (1 - randomValue(randomValue())) * r;
      break;
    case 2:
      value = (1 - randomValue(randomValue(randomValue()))) * r;
      break;
    case 3:
      value = (1 - randomValue(randomValue(randomValue(randomValue())))) * r;
      break;
    case 4:
      value = (1 - sqrt(randomValue())) * r;
      break;
    case 5:
      value = sqrt(randomValue()) * r;
      break;
    case 6:
      value = pow(1 - pow(randomValue(), 10), 10) * r;
      break;
    case 7:
      value = tan(randomValue(TWO_PI)) * r;
      break;
    case 8:
      value = (atan(randomValue(TWO_PI)) * r) / sqrt(2);
      break;
    default:
      value = (1 - randomValue(randomValue())) * r;
      break;
  }

  return {
    value,
  };
}

function createRegularPolygonPoints(sides, radius) {
  const points = [];

  for (let i = 0; i < sides; i += 1) {
    const angle = (TWO_PI * i) / sides - HALF_PI;
    points.push({
      x: cos(angle) * radius,
      y: sin(angle) * radius,
    });
  }

  return points;
}

function getCachedRegularPolygonPoints(sides, radius) {
  // Quantize radius so nearby sizes reuse one cached polygon template.
  const quantizedRadius = round(max(0.5, radius) * 4) / 4;
  const key = `${sides}:${quantizedRadius}`;

  let points = REGULAR_POLYGON_POINT_CACHE.get(key);
  if (!points) {
    points = createRegularPolygonPoints(sides, quantizedRadius);
    REGULAR_POLYGON_POINT_CACHE.set(key, points);
  }

  return points;
}

function tracePolygonPath(ctx, points) {
  if (!points || points.length === 0) {
    return;
  }

  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
}

function createPath2DFromPoints(points) {
  if (
    typeof Path2D !== "function" ||
    !points ||
    points.length < 3
  ) {
    return null;
  }

  const path = new Path2D();
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    path.lineTo(points[i].x, points[i].y);
  }
  path.closePath();
  return path;
}

function applyClipFromPolygon(ctx, pathBuilder, cachedPath = null) {
  if (cachedPath) {
    ctx.clip(cachedPath);
    return;
  }

  ctx.beginPath();
  pathBuilder(ctx);
  ctx.clip();
}

function fillPolygonFromPoints(points, fillColor, cachedPath = null) {
  if (!points || points.length < 3) {
    return;
  }

  const ctx = drawingContext;
  ctx.fillStyle = rgbToRgba(fillColor || COLOR_WHITE, 1);

  if (cachedPath) {
    ctx.fill(cachedPath);
    return;
  }

  ctx.beginPath();
  tracePolygonPath(ctx, points);
  ctx.fill();
}

function strokePolygonFromPoints(
  points,
  strokeColor,
  strokeWidth = 1.5,
  cachedPath = null,
) {
  if (!points || points.length < 3 || strokeWidth <= 0) {
    return;
  }

  const ctx = drawingContext;
  ctx.strokeStyle = rgbToRgba(strokeColor || COLOR_WHITE, 1);
  ctx.lineWidth = strokeWidth;

  if (cachedPath) {
    ctx.stroke(cachedPath);
    return;
  }

  ctx.beginPath();
  tracePolygonPath(ctx, points);
  ctx.stroke();
}

function getUserLeaderCutCountFromRole(role) {
  if (typeof role !== "string" || !role.startsWith("userLeaderCuts-")) {
    return null;
  }

  const parsed = Number.parseInt(role.slice("userLeaderCuts-".length), 10);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return constrain(parsed, 0, FINAL_HURT_MAX_VCUTS);
}

function isUserLeaderGeometryRole(role) {
  return role === "userLeader" || getUserLeaderCutCountFromRole(role) !== null;
}

function getShapeGeometryRoleProfile(role) {
  const userCutCount = getUserLeaderCutCountFromRole(role);
  if (userCutCount !== null) {
    return {
      ...SHAPE_GEOMETRY_ROLE_PROFILES.userLeaderCorrupted,
      maxCuts: userCutCount,
    };
  }

  return SHAPE_GEOMETRY_ROLE_PROFILES[role] || SHAPE_GEOMETRY_ROLE_PROFILES.default;
}

function getEntityShapeGeometry(entity, shapeType, role) {
  const size = entity && Number.isFinite(entity.size) ? entity.size : 1;
  const seed = getShapeRenderSeed(entity);
  const cacheEntry = getChippedShapeCacheEntry(shapeType, size, seed, role);
  const geometryKey = cacheEntry.key;

  if (
    entity &&
    entity._shapeGeometryKey === geometryKey &&
    Array.isArray(entity._shapePoints) &&
    entity._shapePath === cacheEntry.path
  ) {
    return {
      points: entity._shapePoints,
      span: entity._shapeSpan || cacheEntry.span || size * 0.5,
      path: entity._shapePath || cacheEntry.path || null,
    };
  }

  if (entity) {
    // Object-local memoization avoids Map/string work on every animation frame.
    entity._shapeGeometryKey = geometryKey;
    entity._shapePoints = cacheEntry.points;
    entity._shapeSpan = cacheEntry.span;
    entity._shapePath = cacheEntry.path;
  }

  return cacheEntry;
}

function getChippedShapeQuantizedSize(size, role) {
  const step = getShapeGeometryRoleProfile(role).sizeStep || 1;
  return Math.max(1, Math.round((size || 1) / step) * step);
}

function getChippedShapeSeedKey(seed, role) {
  const numericSeed = Number.isFinite(seed) ? seed : 0.137;
  const profile = getShapeGeometryRoleProfile(role);
  const bucketCount = max(1, floor(profile.seedBuckets || 1));
  return Math.floor(Math.abs(numericSeed) * 10000) % bucketCount;
}

function getChippedShapeCacheEntry(shapeType, size, seed, role = "follower") {
  const quantizedSize = getChippedShapeQuantizedSize(size, role);
  const numericSeed = Number.isFinite(seed) ? seed : 0.137;
  const seedKey = getChippedShapeSeedKey(numericSeed, role);
  const key = `${shapeType}:${role}:${quantizedSize}:${seedKey}`;
  const cached = CHIPPED_SHAPE_POINT_CACHE.get(key);

  if (cached) {
    return cached;
  }

  const profile = getShapeGeometryRoleProfile(role);
  const basePoints = getBaseShapePoints(shapeType, quantizedSize);
  const roleOffset =
    role === "bigLeader"
      ? 0.73
      : isUserLeaderGeometryRole(role)
        ? 0.47
        : 0.19;
  const geometrySeed =
    role === "follower" || role === "droppedShape"
      ? seedKey * 0.017
      : numericSeed;
  const rng = createDeterministicRng(
    geometrySeed +
      quantizedSize * 0.013 +
      shapeType.length * 0.071 +
      roleOffset,
  );
  const chippedPoints =
    quantizedSize < profile.minChipSize
      ? basePoints
      : applyVCutsToShapePoints(basePoints, shapeType, profile, rng);
  const cacheEntry = {
    key,
    points: chippedPoints,
    span: getPointCloudSpan(chippedPoints, quantizedSize * 0.5),
    path: createPath2DFromPoints(chippedPoints),
  };

  CHIPPED_SHAPE_POINT_CACHE.set(key, cacheEntry);
  if (CHIPPED_SHAPE_POINT_CACHE.size > CHIPPED_SHAPE_POINT_CACHE_MAX) {
    const oldestKey = CHIPPED_SHAPE_POINT_CACHE.keys().next().value;
    if (oldestKey !== undefined) {
      CHIPPED_SHAPE_POINT_CACHE.delete(oldestKey);
    }
  }

  return cacheEntry;
}

function getChippedShapePoints(shapeType, size, seed, role = "follower") {
  return getChippedShapeCacheEntry(shapeType, size, seed, role).points;
}

function getBaseShapePoints(shapeType, size) {
  const key = `${shapeType}:${size}`;
  const cached = BASE_SHAPE_POINT_CACHE.get(key);

  if (cached) {
    return cached;
  }

  const points = createBaseShapePoints(shapeType, size);
  BASE_SHAPE_POINT_CACHE.set(key, points);
  return points;
}

function createSegmentedLeaderTrianglePoints(size, segmentsPerEdge = 4) {
  const vertices = [
    { x: 0, y: -size },
    { x: -size * 0.76, y: size * 0.9 },
    { x: size * 0.76, y: size * 0.9 },
  ];
  const points = [];

  for (let edgeIndex = 0; edgeIndex < vertices.length; edgeIndex += 1) {
    const a = vertices[edgeIndex];
    const b = vertices[(edgeIndex + 1) % vertices.length];
    for (let step = 0; step < segmentsPerEdge; step += 1) {
      const t = step / segmentsPerEdge;
      points.push({
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
      });
    }
  }

  return points;
}

function createBaseShapePoints(shapeType, size) {
  if (shapeType === "leaderTriangle") {
    return [
      { x: 0, y: -size },
      { x: -size * 0.76, y: size * 0.9 },
      { x: size * 0.76, y: size * 0.9 },
    ];
  }

  if (shapeType === "userLeaderTriangle") {
    return createSegmentedLeaderTrianglePoints(size, 4);
  }

  if (shapeType === "circle") {
    return getCachedRegularPolygonPoints(12, size * 0.5);
  }

  if (shapeType === "square") {
    const half = size * 0.5;
    return [
      { x: -half, y: -half },
      { x: half, y: -half },
      { x: half, y: half },
      { x: -half, y: half },
    ];
  }

  if (shapeType === "diamond") {
    const half = size * 0.56;
    return [
      { x: 0, y: -half },
      { x: half, y: 0 },
      { x: 0, y: half },
      { x: -half, y: 0 },
    ];
  }

  if (shapeType === "hexagon") {
    return getCachedRegularPolygonPoints(6, size * 0.58);
  }

  return getCachedRegularPolygonPoints(5, size * 0.6);
}

function applyVCutsToShapePoints(basePoints, shapeType, profile, rng) {
  if (!basePoints || basePoints.length < 3) {
    return [];
  }

  const randomRange = (minValue, maxValue) => minValue + rng() * (maxValue - minValue);
  let cutChance = randomRange(profile.cutChanceMin, profile.cutChanceMax);
  let cutDepth = randomRange(profile.cutDepthMin, profile.cutDepthMax);
  const maxCuts = min(basePoints.length, max(0, profile.maxCuts || 0));

  if (shapeType === "circle") {
    cutChance *= 0.42;
    cutDepth *= 0.82;
  }

  if (maxCuts <= 0) {
    return basePoints;
  }

  const output = new Array(basePoints.length + maxCuts * 3);
  let outputIndex = 0;
  let cutsAdded = 0;
  for (let i = 0; i < basePoints.length; i += 1) {
    const a = basePoints[i];
    const b = basePoints[(i + 1) % basePoints.length];
    output[outputIndex] = { x: a.x, y: a.y };
    outputIndex += 1;

    if (cutsAdded >= maxCuts || rng() > cutChance) {
      continue;
    }

    const edgeX = b.x - a.x;
    const edgeY = b.y - a.y;
    const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
    if (edgeLength < 3.5) {
      continue;
    }

    const normalX = -edgeY / edgeLength;
    const normalY = edgeX / edgeLength;
    const midX = a.x + edgeX * 0.5;
    const midY = a.y + edgeY * 0.5;
    // Base templates are centered around the origin, so we can derive the
    // inward-facing normal from the edge midpoint without recomputing centroids.
    const midToCenterX = -midX;
    const midToCenterY = -midY;
    const normalDot = normalX * midToCenterX + normalY * midToCenterY;
    const inwardX = normalDot >= 0 ? normalX : -normalX;
    const inwardY = normalDot >= 0 ? normalY : -normalY;

    const t = randomRange(0.24, 0.76);
    const cutMidX = a.x + edgeX * t;
    const cutMidY = a.y + edgeY * t;
    const cutWidthMin = Number.isFinite(profile.cutWidthMin)
      ? profile.cutWidthMin
      : 0.06;
    const cutWidthMax = Number.isFinite(profile.cutWidthMax)
      ? profile.cutWidthMax
      : 0.15;
    const cutWidth = Math.min(
      edgeLength * 0.38,
      Math.max(1.25, edgeLength * randomRange(cutWidthMin, cutWidthMax)),
    );
    const cutDepthPx = Math.min(
      edgeLength * 0.46,
      Math.max(1.15, edgeLength * cutDepth),
    );
    const unitX = edgeX / edgeLength;
    const unitY = edgeY / edgeLength;

    output[outputIndex] = {
      x: cutMidX - unitX * cutWidth,
      y: cutMidY - unitY * cutWidth,
    };
    output[outputIndex + 1] = {
      x: cutMidX + inwardX * cutDepthPx,
      y: cutMidY + inwardY * cutDepthPx,
    };
    output[outputIndex + 2] = {
      x: cutMidX + unitX * cutWidth,
      y: cutMidY + unitY * cutWidth,
    };
    outputIndex += 3;
    cutsAdded += 1;
  }

  output.length = outputIndex;

  if (!profile.notchTip) {
    return output;
  }

  return notchSharpShapeTip(output, shapeType, rng);
}

function notchSharpShapeTip(points, shapeType, rng) {
  if (!points || points.length < 3 || shapeType === "circle") {
    return points;
  }

  let sharpIndex = 0;
  let sharpCos = -Infinity;
  for (let i = 0; i < points.length; i += 1) {
    const prev = points[(i - 1 + points.length) % points.length];
    const point = points[i];
    const next = points[(i + 1) % points.length];
    const ux = prev.x - point.x;
    const uy = prev.y - point.y;
    const vx = next.x - point.x;
    const vy = next.y - point.y;
    const uLength = Math.sqrt(ux * ux + uy * uy);
    const vLength = Math.sqrt(vx * vx + vy * vy);

    if (uLength < 0.001 || vLength < 0.001) {
      continue;
    }

    const angleCos = (ux * vx + uy * vy) / (uLength * vLength);
    if (angleCos > sharpCos) {
      sharpCos = angleCos;
      sharpIndex = i;
    }
  }

  if (sharpCos < 0.24) {
    return points;
  }

  const randomRange = (minValue, maxValue) =>
    minValue + rng() * (maxValue - minValue);
  const prev = points[(sharpIndex - 1 + points.length) % points.length];
  const point = points[sharpIndex];
  const next = points[(sharpIndex + 1) % points.length];
  const prevX = prev.x - point.x;
  const prevY = prev.y - point.y;
  const nextX = next.x - point.x;
  const nextY = next.y - point.y;
  const prevLength = Math.sqrt(prevX * prevX + prevY * prevY);
  const nextLength = Math.sqrt(nextX * nextX + nextY * nextY);

  if (prevLength < 0.001 || nextLength < 0.001) {
    return points;
  }

  const notchSize = Math.min(prevLength, nextLength) * randomRange(0.08, 0.18);
  const leftPoint = {
    x: point.x + (prevX / prevLength) * notchSize,
    y: point.y + (prevY / prevLength) * notchSize,
  };
  const rightPoint = {
    x: point.x + (nextX / nextLength) * notchSize,
    y: point.y + (nextY / nextLength) * notchSize,
  };

  let centerX = 0;
  let centerY = 0;
  for (const current of points) {
    centerX += current.x;
    centerY += current.y;
  }
  centerX /= points.length;
  centerY /= points.length;

  const notchMidX = (leftPoint.x + rightPoint.x) * 0.5;
  const notchMidY = (leftPoint.y + rightPoint.y) * 0.5;
  const inwardX = centerX - notchMidX;
  const inwardY = centerY - notchMidY;
  const inwardLength = Math.sqrt(inwardX * inwardX + inwardY * inwardY) || 1;
  const kick = notchSize * randomRange(0.02, 0.1);
  const middlePoint = {
    x: notchMidX + (inwardX / inwardLength) * kick,
    y: notchMidY + (inwardY / inwardLength) * kick,
  };

  const output = [];
  for (let i = 0; i < points.length; i += 1) {
    if (i === sharpIndex) {
      output.push(leftPoint, middlePoint, rightPoint);
    } else {
      output.push(points[i]);
    }
  }

  return output;
}

function getPointCloudSpan(points, fallback = 1) {
  if (!points || points.length === 0) {
    return fallback;
  }

  let spanSq = 0;
  for (const point of points) {
    const distanceSq = point.x * point.x + point.y * point.y;
    if (distanceSq > spanSq) {
      spanSq = distanceSq;
    }
  }

  const span = Math.sqrt(spanSq);
  return Math.max(span, fallback);
}

function getShapeRenderSeed(shape) {
  if (shape && Number.isFinite(shape.patternSeed)) {
    return shape.patternSeed;
  }

  if (shape && Number.isFinite(shape.grainSeed)) {
    return shape.grainSeed;
  }

  if (shape && Number.isFinite(shape.id)) {
    return shape.id * 0.173;
  }

  return 0.137;
}

function normalizeFollowerPatternStyle(style) {
  if (style === "dots" || style === "dot" || style === "polka") {
    return "polkadots";
  }

  if (style === "checkered") {
    return "checker";
  }

  if (style === "stripe") {
    return "stripes";
  }

  if (style === "waves") {
    return "stripes";
  }

  if (style === "rays") {
    return "polkadots";
  }

  if (PATTERN_STYLES.includes(style)) {
    return style;
  }

  return "polkadots";
}

function drawFollowerBuiltInPattern(
  pathBuilder,
  span,
  follower,
  seed,
  cachedPath = null,
  alphaMultiplier = 1,
) {
  if ((!pathBuilder && !cachedPath) || !follower || !follower.patternStyle) {
    return;
  }

  if (span < FOLLOWER_PATTERN_MIN_SPAN) {
    return;
  }

  const style = normalizeFollowerPatternStyle(follower.patternStyle);
  const patternAlpha = Number.isFinite(follower.patternAlpha)
    ? constrain(follower.patternAlpha, 0, 1)
    : 1;
  const effectivePatternAlpha = patternAlpha * constrain(alphaMultiplier, 0, 1);
  if (effectivePatternAlpha <= 0.01) {
    return;
  }

  const ctx = drawingContext;
  const extent = Math.max(8, span * 1.62);
  const spacing = quantizePatternSpacing(
    getFollowerPatternSpacing(span, follower.patternScale),
  );
  const drift =
    (boidConfig && typeof boidConfig.backdropDrift === "number"
      ? boidConfig.backdropDrift
      : 0) *
    frameCount *
    0.16;
  const ink = getFollowerPatternInk(follower);
  const alpha = (style === "checker" ? 0.58 : 0.72) * effectivePatternAlpha;
  const phase = (Number.isFinite(seed) ? seed : 0.137) * 37.19 + drift;
  const tileEntry = getCachedPatternTile(style, spacing, ink);

  if (!tileEntry || !tileEntry.pattern) {
    return;
  }

  ctx.save();
  applyClipFromPolygon(ctx, pathBuilder, cachedPath);
  ctx.globalAlpha *= alpha;
  drawPatternTileInCurrentTransform(ctx, extent, tileEntry, phase, style);

  ctx.restore();
}

function getFollowerPatternSpacing(span, scale = 1) {
  const baseSpacing =
    boidConfig && typeof boidConfig.halftoneSpacing === "number"
      ? boidConfig.halftoneSpacing
      : 10;
  const scaledSpacing = baseSpacing * (Number.isFinite(scale) ? scale : 1);
  const upperBound = Math.max(6, span * 0.62);

  return Math.max(4, Math.min(scaledSpacing, upperBound));
}

function getFollowerPatternInk(follower) {
  const accent = Array.isArray(follower.patternAccent)
    ? follower.patternAccent
    : COLOR_WHITE;
  const fillColor = Array.isArray(follower.tint) ? follower.tint : COLOR_BLACK;

  if (getRgbDistanceSq(accent, fillColor) > 82 * 82) {
    return accent;
  }

  return getRgbLuma(fillColor) > 150 ? COLOR_BLACK : COLOR_WHITE;
}

function quantizePatternSpacing(spacing) {
  return max(4, round(max(0, spacing)));
}

function getPatternInkKey(ink) {
  return `${round(constrain(ink[0] || 0, 0, 255))},${round(
    constrain(ink[1] || 0, 0, 255),
  )},${round(constrain(ink[2] || 0, 0, 255))}`;
}

function getCachedPatternTile(style, spacing, ink) {
  const quantizedSpacing = quantizePatternSpacing(spacing);
  const key = `${style}:${quantizedSpacing}:${getPatternInkKey(ink)}`;
  let entry = PATTERN_TILE_CACHE.get(key);

  if (!entry) {
    entry = buildPatternTileEntry(style, quantizedSpacing, ink);
    PATTERN_TILE_CACHE.set(key, entry);
    if (PATTERN_TILE_CACHE.size > PATTERN_TILE_CACHE_MAX) {
      const oldestKey = PATTERN_TILE_CACHE.keys().next().value;
      if (oldestKey !== undefined) {
        PATTERN_TILE_CACHE.delete(oldestKey);
      }
    }
  }

  if (
    !entry.pattern &&
    drawingContext &&
    typeof drawingContext.createPattern === "function"
  ) {
    entry.pattern = drawingContext.createPattern(entry.canvas, "repeat");
  }

  return entry;
}

function buildPatternTileEntry(style, spacing, ink) {
  const tile = document.createElement("canvas");
  const tint = rgbToRgba(ink, 1);
  const spec =
    style === "checker"
      ? buildCheckerPatternTile(tile, spacing, tint)
      : style === "stripes"
        ? buildStripePatternTile(tile, spacing, tint)
        : buildPolkadotPatternTile(tile, spacing, tint);

  return {
    canvas: tile,
    pattern: null,
    tileWidth: tile.width,
    tileHeight: tile.height,
    phaseStride: spec.phaseStride,
    drawMode: spec.drawMode,
    rotate: spec.rotate || 0,
  };
}

function buildPolkadotPatternTile(tile, spacing, tint) {
  const dotRadius = Math.max(1.4, spacing * 0.27);
  const rowHeight = spacing * 0.92;
  const tileWidth = max(8, ceil(spacing * 4));
  const tileHeight = max(8, ceil(rowHeight * 2));
  const ctx = tile.getContext("2d");
  tile.width = tileWidth;
  tile.height = tileHeight;
  ctx.clearRect(0, 0, tileWidth, tileHeight);
  ctx.fillStyle = tint;

  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(
      spacing * (0.25 + i),
      rowHeight * 0.5,
      dotRadius,
      0,
      TWO_PI,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      spacing * (0.75 + i),
      rowHeight * 1.5,
      dotRadius,
      0,
      TWO_PI,
    );
    ctx.fill();
  }

  return {
    phaseStride: spacing,
    drawMode: "normal",
    rotate: 0,
  };
}

function buildCheckerPatternTile(tile, spacing, tint) {
  const cellSize = Math.max(3.5, spacing * 0.82);
  const tileSize = max(8, ceil(cellSize * 2));
  const ctx = tile.getContext("2d");
  tile.width = tileSize;
  tile.height = tileSize;
  ctx.clearRect(0, 0, tileSize, tileSize);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, cellSize, cellSize);
  ctx.fillRect(cellSize, cellSize, cellSize, cellSize);

  return {
    phaseStride: cellSize * 2,
    drawMode: "normal",
    rotate: 0,
  };
}

function buildStripePatternTile(tile, spacing, tint) {
  const bandWidth = Math.max(2.4, spacing * 0.34);
  const gap = Math.max(bandWidth + 2, spacing * 0.88);
  const tileSize = max(12, ceil(gap * 4));
  const ctx = tile.getContext("2d");
  tile.width = tileSize;
  tile.height = tileSize;
  ctx.clearRect(0, 0, tileSize, tileSize);
  ctx.fillStyle = tint;

  for (let i = 0; i < 4; i += 1) {
    ctx.fillRect(gap * (0.25 + i), 0, bandWidth, tileSize);
  }

  return {
    phaseStride: gap,
    drawMode: "rotated",
    rotate: -QUARTER_PI,
  };
}

function drawPatternTileInCurrentTransform(ctx, extent, tileEntry, phase, style) {
  if (!tileEntry || !tileEntry.pattern) {
    return;
  }

  const phaseMultiplier =
    style === "checker" ? 0.35 : style === "stripes" ? 0.52 : 1;
  const offset = positiveModulo(
    phase * phaseMultiplier,
    max(1, tileEntry.phaseStride),
  );
  const padX = tileEntry.tileWidth * 2;
  const padY = tileEntry.tileHeight * 2;

  ctx.save();
  if (tileEntry.drawMode === "rotated") {
    ctx.rotate(tileEntry.rotate);
  }
  if (style === "checker") {
    ctx.translate(-offset, -offset);
  } else {
    ctx.translate(-offset, 0);
  }
  ctx.fillStyle = tileEntry.pattern;
  ctx.fillRect(
    -extent - padX,
    -extent - padY,
    extent * 2 + padX * 2,
    extent * 2 + padY * 2,
  );
  ctx.restore();
}

function getRgbDistanceSq(left, right) {
  const dr = (left[0] || 0) - (right[0] || 0);
  const dg = (left[1] || 0) - (right[1] || 0);
  const db = (left[2] || 0) - (right[2] || 0);
  return dr * dr + dg * dg + db * db;
}

function getRgbLuma(rgb) {
  return (rgb[0] || 0) * 0.299 + (rgb[1] || 0) * 0.587 + (rgb[2] || 0) * 0.114;
}

function rgbToRgba(rgb, alpha) {
  const r = Math.round(constrain(rgb[0] || 0, 0, 255));
  const g = Math.round(constrain(rgb[1] || 0, 0, 255));
  const b = Math.round(constrain(rgb[2] || 0, 0, 255));
  return `rgba(${r},${g},${b},${alpha})`;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function rebuildBackdropLayers() {
  // Backdrop keeps only consumption-revealed grain; room routing still exists
  // as logic, but the visual grid texture layer is intentionally disabled.
  referencePatternLayer = null;
  referencePatternNoiseLayer = null;
  referencePatternPalette = [];

  backgroundGrainLayer = createGraphics(width, height);
  buildBackgroundGrainLayer(backgroundGrainLayer);

  posterLayer = createGraphics(width, height);
  buildPosterAccentLayer(posterLayer);

  scanlineOverlayLayer = createGraphics(width, height);
  scanlineOverlayLayer.pixelDensity(1);
  buildScanlineOverlayLayer(scanlineOverlayLayer);
}

function prewarmRenderCaches() {
  if (!boidConfig) {
    return;
  }

  const followerScale = SHAPE_SIZE_BOOST * getCombinedScale("followerScale");
  const followerMin =
    min(boidConfig.followerSizeMin, boidConfig.followerSizeMax) *
    followerScale;
  const followerMax =
    max(boidConfig.followerSizeMin, boidConfig.followerSizeMax) *
    followerScale;
  const followerMid = (followerMin + followerMax) * 0.5;
  const leaderSize =
    boidConfig.leaderSize *
    SHAPE_SIZE_BOOST *
    getCombinedScale("smallLeaderScale");
  const bigLeaderSize =
    boidConfig.bigLeaderSize *
    SHAPE_SIZE_BOOST *
    getCombinedScale("macroLeaderScale");
  const userLeaderSize =
    boidConfig.leaderSize *
    1.15 *
    SHAPE_SIZE_BOOST *
    getCombinedScale("userLeaderScale");
  const narrativeSize =
    boidConfig.followerSizeMax *
    SHAPE_SIZE_BOOST *
    getCombinedScale("narrativeCubeScale");
  const narrativeDroppedSize =
    narrativeSize * getCombinedScale("droppedShapeScale");
  const seeds = [0.137, 0.731, 1.619, 2.947, 4.283, 5.911];
  const warmups = [];

  for (const shapeType of FOLLOWER_SHAPE_TYPES) {
    warmups.push({
      shapeType,
      role: "follower",
      sizes: [followerMin, followerMid, followerMax],
    });
    warmups.push({
      shapeType,
      role: "droppedShape",
      sizes: [followerMin, followerMid, followerMax, narrativeDroppedSize],
    });
  }

  warmups.push(
    { shapeType: "square", role: "introCube", sizes: [narrativeSize] },
    { shapeType: "leaderTriangle", role: "smallLeader", sizes: [leaderSize] },
    { shapeType: "leaderTriangle", role: "bigLeader", sizes: [bigLeaderSize] },
    { shapeType: "leaderTriangle", role: "userLeader", sizes: [userLeaderSize] },
    {
      shapeType: "userLeaderTriangle",
      role: "userLeaderCuts-4",
      sizes: [userLeaderSize],
    },
    {
      shapeType: "userLeaderTriangle",
      role: "userLeaderCuts-8",
      sizes: [userLeaderSize],
    },
    {
      shapeType: "userLeaderTriangle",
      role: "userLeaderCuts-10",
      sizes: [userLeaderSize],
    },
  );

  // Do the cache work during setup/rebuild instead of during the first drop wave.
  for (const warmup of warmups) {
    for (const size of warmup.sizes) {
      if (!Number.isFinite(size) || size <= 0) {
        continue;
      }

      for (const seed of seeds) {
        getChippedShapePoints(warmup.shapeType, size, seed, warmup.role);
        getCachedGrainPoints(max(3, size * 0.5), seed);
      }
    }
  }

  const patternInks = [COLOR_BLACK, COLOR_WHITE, ...PATTERN_ACCENTS];
  const patternSpans = [
    followerMin * 0.5,
    followerMid * 0.5,
    followerMax * 0.5,
    narrativeSize * 0.5,
  ];

  for (const style of PATTERN_STYLES) {
    for (const span of patternSpans) {
      if (!Number.isFinite(span) || span <= 0) {
        continue;
      }

      const spacing = quantizePatternSpacing(getFollowerPatternSpacing(span, 1));
      for (const ink of patternInks) {
        getCachedPatternTile(style, spacing, ink);
      }
    }
  }
}

function initReferencePatternBackdrop() {
  referencePatternLayer = createGraphics(width, height);
  // RGB mode keeps white separator strokes neutral instead of hue-shifted blue.
  referencePatternLayer.colorMode(RGB, 255, 255, 255, 255);
  referencePatternLayer.angleMode(DEGREES);
  referencePatternLayer.rectMode(CENTER);

  referencePatternNoiseLayer = createGraphics(width, height);
  referencePatternNoiseLayer.clear();
  referencePatternNoiseLayer.strokeWeight(1);

  referencePatternSeed = int(random(10000));
  const selectedScheme = random(REFERENCE_COLOR_SCHEMES);
  referencePatternPalette = shuffle(selectedScheme.colors.concat());

  const radius = (sqrt(2) * width) / 2;
  const sampleCount = floor(
    referencePatternNoiseLayer.width * referencePatternNoiseLayer.height * 0.1,
  );

  for (let i = 0; i < sampleCount; i += 1) {
    const pointRadius = formula(1, radius).value;
    const angle = random(TWO_PI);
    const pointX =
      referencePatternNoiseLayer.width * 0.5 + cos(angle) * pointRadius;
    const pointY =
      referencePatternNoiseLayer.height * 0.5 + sin(angle) * pointRadius;

    referencePatternNoiseLayer.stroke(255, (30 / 100) * 255);
    referencePatternNoiseLayer.point(pointX, pointY);
  }
}

function renderReferencePatternBackdrop() {
  if (
    !referencePatternLayer ||
    !referencePatternNoiseLayer ||
    referencePatternPalette.length === 0
  ) {
    return;
  }

  const layer = referencePatternLayer;
  layer.clear();
  layer.background(0, 0, 0, 0);
  // Keep cell partitioning visuals, but freeze per-cell animation for narrative readability.
  const patternRng = createDeterministicRng(referencePatternSeed);
  const randomFloat = () => patternRng();
  const randomRange = (minValue, maxValue) =>
    minValue + randomFloat() * (maxValue - minValue);
  const randomInt = (minValue, maxValue) =>
    floor(randomRange(minValue, maxValue));

  const cells =
    boidConfig && typeof boidConfig.referencePatternCells === "number"
      ? max(16, floor(boidConfig.referencePatternCells))
      : 24;
  const offset = (width * (sqrt(2) - 1)) / 2;
  const d = (width + offset * 2) / cells;

  for (let j = 0; j < cells; ) {
    const stepUpper = max(2, cells / 16);
    let jStep = randomInt(1, stepUpper);
    if (j + jStep > cells || abs(cells - (j + jStep)) < 3) {
      jStep = cells - j;
    }

    for (let i = 0; i < cells; ) {
      let iStep = jStep;
      if (i + iStep > cells || abs(cells - (i + iStep)) <= cells / 15) {
        iStep = cells - i;
      }

      const x = -offset + i * d + (d / 2) * iStep;
      const y = -offset + j * d + (d / 2) * jStep;
      drawReferenceLinePattern(layer, x, y, d * iStep, d * jStep, {
        randomFloat,
        randomRange,
        randomInt,
      });
      i += iStep;
    }

    j += jStep;
  }

  layer.blendMode(ADD);
  layer.image(referencePatternNoiseLayer, 0, 0);
  layer.blendMode(BLEND);
}

function drawReferenceLinePattern(
  layer,
  centerX,
  centerY,
  patternW,
  patternH,
  randomTools,
) {
  // Static separators: no time-based warp or dash motion.
  const { randomFloat, randomInt } = randomTools;
  const lineScale = getCombinedScale("referenceLineScale");

  layer.push();
  layer.translate(centerX, centerY);

  const ctx = layer.drawingContext;
  ctx.save();
  // Neutral white separators only; remove per-cell color fills.
  ctx.globalAlpha = 0.3;
  layer.noFill();
  layer.stroke(255, 255, 255, 132);
  layer.strokeWeight(max(0.45, min(patternW, patternH) * 0.05 * lineScale));
  layer.rect(0, 0, patternW, patternH);

  ctx.globalAlpha = 0.24;
  layer.stroke(255, 255, 255, 118);
  layer.strokeWeight(max(0.4, min(patternW, patternH) * 0.03 * lineScale));
  if (randomFloat() > 0.5) {
    layer.line(0, -patternH / 2, 0, patternH / 2);
  } else {
    layer.line(-patternW / 2, 0, patternW / 2, 0);
  }

  if (randomInt(0, 4) === 0) {
    ctx.globalAlpha = 0.2;
    layer.stroke(255, 255, 255, 102);
    layer.strokeWeight(max(0.35, min(patternW, patternH) * 0.02 * lineScale));
    layer.line(-patternW / 2, -patternH / 2, patternW / 2, patternH / 2);
  }

  ctx.restore();
  layer.pop();
}

function drawSineWaveBlob(layer, centerX, centerY, baseRadius) {
  const radius = max(4, baseRadius);
  const lobeA = floor(random(2, 9));
  const lobeB = floor(random(7, 16));
  const lobeC = floor(random(10, 23));
  const ampA = random(0.09, 0.28);
  const ampB = random(0.05, 0.18);
  const ampC = random(0.03, 0.13);
  const phaseA = random(TWO_PI);
  const phaseB = random(TWO_PI);
  const phaseC = random(TWO_PI);
  const stretchX = random(0.62, 1.52);
  const stretchY = random(0.56, 1.46);
  const twist = random(-0.4, 0.4);
  const vertices = max(30, floor(radius * 3.3));

  layer.push();
  layer.translate(centerX, centerY);
  layer.rotate(random(TWO_PI));

  layer.beginShape();
  for (let i = 0; i < vertices; i += 1) {
    const angle = (TWO_PI * i) / vertices;
    const wave =
      sin(angle * lobeA + phaseA) * ampA +
      sin(angle * lobeB + phaseB) * ampB +
      sin(angle * lobeC + phaseC) * ampC;
    const r = radius * (1 + wave);
    const localAngle = angle + twist * sin(angle * 2 + phaseB);
    layer.vertex(
      cos(localAngle) * r * stretchX,
      sin(localAngle) * r * stretchY,
    );
  }
  layer.endShape(CLOSE);

  if (random() > 0.63) {
    layer.fill(255, 255, 255, random(1, 6));
    layer.beginShape();
    const secondaryRadius = radius * random(0.34, 0.66);
    const secondaryVertices = max(18, floor(secondaryRadius * 2.9));
    const secondaryShiftX = random(-radius * 0.55, radius * 0.55);
    const secondaryShiftY = random(-radius * 0.55, radius * 0.55);

    for (let i = 0; i < secondaryVertices; i += 1) {
      const angle = (TWO_PI * i) / secondaryVertices;
      const wobble = 1 + sin(angle * (2 + floor(random(1, 4))) + phaseA) * 0.2;
      const r = secondaryRadius * wobble;
      layer.vertex(
        secondaryShiftX + cos(angle) * r * random(0.8, 1.25),
        secondaryShiftY + sin(angle) * r * random(0.8, 1.25),
      );
    }

    layer.endShape(CLOSE);
  }

  layer.pop();
}

function buildBackgroundGrainLayer(layer) {
  layer.clear();
  layer.colorMode(RGB, 255, 255, 255, 255);
  layer.strokeWeight(1);

  // Push a heavier film-grain look so the backdrop reads tactile without relying on line grids.
  const whiteGrainCount = floor(width * height * 0.16);
  for (let i = 0; i < whiteGrainCount; i += 1) {
    layer.stroke(255, 255, 255, random(10, 78));
    layer.point(random(width), random(height));
  }

  const darkGrainCount = floor(width * height * 0.074);
  for (let i = 0; i < darkGrainCount; i += 1) {
    layer.stroke(0, 0, 0, random(8, 52));
    layer.point(random(width), random(height));
  }

  const brightSpeckCount = floor(width * height * 0.012);
  for (let i = 0; i < brightSpeckCount; i += 1) {
    layer.stroke(255, 255, 255, random(72, 170));
    layer.point(random(width), random(height));
  }

  layer.noStroke();
  const cloudCount = floor(width * height * 0.00018);
  for (let i = 0; i < cloudCount; i += 1) {
    layer.fill(255, 255, 255, random(4, 14));
    drawSineWaveBlob(
      layer,
      random(width),
      random(height),
      random(max(14, width * 0.02), max(52, width * 0.16)),
    );
  }

  layer.stroke(255, 255, 255, 18);
  layer.strokeWeight(1);
  const scratchCount = floor(width * height * 0.00068);
  for (let i = 0; i < scratchCount; i += 1) {
    const x = random(width);
    const y = random(height);
    const length = random(8, 34);
    const angle = random(TWO_PI);
    layer.line(x, y, x + cos(angle) * length, y + sin(angle) * length);
  }
}

function buildPosterAccentLayer(layer) {
  // Poster ribbon/lightning accents intentionally disabled for cleaner narrative focus.
  layer.clear();
}

function buildScanlineOverlayLayer(layer) {
  layer.clear();
  layer.rectMode(CORNER);
  layer.noStroke();

  // Subtle dark scan rows for a monitor-like texture that does not obscure motion detail.
  for (let y = 0; y < height; y += 2) {
    const alpha = y % 4 === 0 ? 22 : 14;
    layer.fill(0, 0, 0, alpha);
    layer.rect(0, y, width, 1);
  }

  // Light atmospheric tint to blend the filter with the oceanic SDG 13 palette.
  layer.fill(18, 34, 46, 18);
  layer.rect(0, 0, width, height);
}

function drawScanlineOverlay() {
  if (!scanlineOverlayLayer) {
    return;
  }

  image(scanlineOverlayLayer, 0, 0);
}

function getBackgroundGrainRevealTargetAlpha() {
  if (!assimilationSequenceStarted && grainRevealDropCount <= 0) {
    return BACKGROUND_GRAIN_START_ALPHA;
  }

  const minFollowerTarget =
    boidConfig && typeof boidConfig.minFollowersPerLeader === "number"
      ? boidConfig.minFollowersPerLeader
      : 1;
  const maxFollowerTarget =
    boidConfig && typeof boidConfig.maxFollowersPerLeader === "number"
      ? boidConfig.maxFollowersPerLeader
      : 3;
  const leaderTarget =
    boidConfig && typeof boidConfig.autonomousLeaderCount === "number"
      ? boidConfig.autonomousLeaderCount
      : 30;
  const averageFollowerTarget = max(
    1,
    (minFollowerTarget + maxFollowerTarget) * 0.5,
  );
  const dropRevealTarget = max(
    8,
    leaderTarget *
      averageFollowerTarget *
      MAX_ASSIMILATION_CYCLES *
      BACKGROUND_GRAIN_REVEAL_TARGET_FACTOR +
      4,
  );
  const dropProgress = constrain(grainRevealDropCount / dropRevealTarget, 0, 1);
  const shapedProgress = pow(dropProgress, BACKGROUND_GRAIN_REVEAL_POWER);
  const revealProgress =
    shapedProgress * shapedProgress * (3 - 2 * shapedProgress);

  return lerp(BACKGROUND_GRAIN_START_ALPHA, 1, revealProgress);
}

function updateBackgroundGrainRevealAlpha() {
  const targetAlpha = getBackgroundGrainRevealTargetAlpha();

  if (!Number.isFinite(backgroundGrainRevealAlpha)) {
    backgroundGrainRevealAlpha = targetAlpha;
  }

  backgroundGrainRevealAlpha = lerp(
    backgroundGrainRevealAlpha,
    targetAlpha,
    BACKGROUND_GRAIN_REVEAL_LERP,
  );

  if (abs(backgroundGrainRevealAlpha - targetAlpha) < 0.001) {
    backgroundGrainRevealAlpha = targetAlpha;
  }

  return constrain(backgroundGrainRevealAlpha, 0, 1);
}

function paintBackdrop() {
  background(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);

  if (backgroundGrainLayer) {
    const grainAlpha = updateBackgroundGrainRevealAlpha();
    if (grainAlpha > 0.001) {
      const ctx = drawingContext;
      ctx.save();
      // Only the small film-grain/scratch layer fades in with consumption.
      ctx.globalAlpha *= grainAlpha;
      image(backgroundGrainLayer, 0, 0);
      ctx.restore();
    }
  }

  if (posterLayer) {
    const drift = boidConfig ? boidConfig.backdropDrift : 0;
    const driftX = sin(frameCount * 0.0022) * drift * 9;
    const driftY = cos(frameCount * 0.0016) * drift * 7;
    image(posterLayer, driftX - 6, driftY - 5);
  }
}

function applyP5DialogFont(targetLayer = null) {
  if (targetLayer && typeof targetLayer.textFont === "function") {
    targetLayer.textFont(P5_DIALOG_FONT_STACK);
    targetLayer.textStyle(NORMAL);
    return;
  }

  textFont(P5_DIALOG_FONT_STACK);
  textStyle(NORMAL);
}

function applyP5IntroFont(targetLayer = null) {
  if (targetLayer && typeof targetLayer.textFont === "function") {
    targetLayer.textFont(P5_INTRO_FONT_STACK);
    targetLayer.textStyle(NORMAL);
    return;
  }

  textFont(P5_INTRO_FONT_STACK);
  textStyle(NORMAL);
}

function drawSoftShadowIntroText(
  message,
  centerX,
  centerY,
  textSizePx,
  alpha = 255,
  shadowOptions = null,
) {
  if (!message) {
    return;
  }

  const size = max(12, textSizePx);
  drawSpec1DialogueBox(message, centerX, centerY, size, alpha, {
    paddingX: size * 1.25,
    paddingY: size * 0.78,
    shadowStep: max(5, size * 0.34),
    borderWidth: max(2, size * 0.11),
  });
}

function drawNarrativePickupHint() {
  if (
    assimilationSequenceStarted ||
    narrativeClicks >= NARRATIVE_CUBE_COUNT ||
    !narrativeCubes.some((cube) => cube && !cube.pickedUp)
  ) {
    return;
  }

  const promptSize = getOverlayTextSizePx(1, 24, 0);
  const promptCenterY = getNarrativePromptCenterY(promptSize);
  const promptPaddingY = promptSize * 0.78;
  const promptLineHeight = promptSize * 1.35;
  const promptBottomY = promptCenterY + (promptLineHeight + promptPaddingY * 2) * 0.5;
  const size = max(10, min(width, height) * 0.015);
  const y = min(
    height - max(24, size * 2),
    promptBottomY + max(28, min(width, height) * 0.045),
  );
  const alpha = 205 + sin(frameCount * 0.09) * 45;
  const ctx = drawingContext;

  push();
  applyP5DialogFont();
  textAlign(CENTER, CENTER);
  textSize(size);
  textStyle(NORMAL);
  noStroke();
  fill(COLOR_CYAN[0], COLOR_CYAN[1], COLOR_CYAN[2], alpha);
  ctx.save();
  if ("letterSpacing" in ctx) ctx.letterSpacing = "5px";
  text("(CLICK TO PICK UP CLOTH)", width * 0.5, y);
  ctx.restore();
  pop();
}

function drawNarrativeOverlay() {
  const promptVisibleDuringAssimilation =
    assimilationSequenceStarted &&
    narrativePromptHideAtMs > 0 &&
    millis() < narrativePromptHideAtMs;

  if (
    narrativePrompt &&
    userLeader &&
    (!assimilationSequenceStarted || promptVisibleDuringAssimilation)
  ) {
    noteTextPopupVisible(`narrative:${narrativePrompt}`);
    drawNarrativeCubePortalText(
      narrativePrompt,
      // Control: overlayTextScale also scales the subtitle-style prompt text.
      getOverlayTextSizePx(1, 24, 0),
    );
  }

  drawNarrativePickupHint();

  if (assimilationSequenceStarted) {
    drawGlobalConsumptionDialogue();
    return;
  }
}

function getGlobalConsumptionDialogueState() {
  if (!assimilationSequenceStarted) {
    return null;
  }

  if (cycleLimitReached) {
    return {
      message: "Im happy with my choice.",
      textColor: COLOR_CYAN,
      borderColor: COLOR_CYAN,
      frontShadowColor: COLOR_YELLOW,
      backShadowColor: COLOR_PINK,
      desaturate: getFinalHurtLiquidGrowthProgress(),
    };
  }

  if (cycleWaitingForReturn) {
    return {
      message: "Im happy with my choice, right?",
      textColor: COLOR_PINK,
      borderColor: COLOR_PINK,
      frontShadowColor: COLOR_CYAN,
      backShadowColor: COLOR_YELLOW,
    };
  }

  if (macroExitActive) {
    return {
      message: "Im happy with my choice.",
      textColor: COLOR_CYAN,
      borderColor: COLOR_CYAN,
      frontShadowColor: COLOR_YELLOW,
      backShadowColor: COLOR_PINK,
    };
  }

  return {
    message: "I NEED IT",
    textColor: COLOR_YELLOW,
    borderColor: COLOR_YELLOW,
    frontShadowColor: COLOR_PINK,
    backShadowColor: COLOR_CYAN,
  };
}

function drawGlobalConsumptionDialogue() {
  const state = getGlobalConsumptionDialogueState();
  if (!state) {
    return;
  }

  noteTextPopupVisible(`global:${state.message}`);

  const size = constrain(min(width, height) * 0.046, 26, 48);
  const desaturate = constrain(
    Number.isFinite(state.desaturate) ? state.desaturate : 0,
    0,
    1,
  );
  const desaturateColor = (color) =>
    desaturate > 0
      ? blendColors(color, FINAL_HURT_GRAY, desaturate)
      : color;
  drawSpec1DialogueBox(state.message, width * 0.5, height * 0.5, size, 255, {
    paddingX: size * 0.92,
    paddingY: size * 0.5,
    shadowStep: max(6, size * 0.22),
    borderWidth: max(2.5, size * 0.08),
    maxWidth: min(width * 0.58, 620),
    lineHeight: size * 1.05,
    textColor: desaturateColor(state.textColor),
    borderColor: desaturateColor(state.borderColor),
    frontShadowColor: desaturateColor(state.frontShadowColor),
    backShadowColor: desaturateColor(state.backShadowColor),
    textShadowColor: desaturateColor(state.frontShadowColor),
  });
}

function getFinalHurtPhaseStartMs() {
  return cycleLimitReached && cycleCompletionMessageDelayUntilMs > 0
    ? cycleCompletionMessageDelayUntilMs
    : 0;
}

function isFinalHurtPhaseActive() {
  const startMs = getFinalHurtPhaseStartMs();
  return startMs > 0 && millis() >= startMs;
}

function getFinalHurtElapsedMs() {
  if (!isFinalHurtPhaseActive()) {
    return 0;
  }

  return millis() - getFinalHurtPhaseStartMs();
}

function getFinalHurtBleedProgress() {
  const progress = constrain(
    getFinalHurtElapsedMs() / FINAL_HURT_BLEED_DURATION_MS,
    0,
    1,
  );
  const eased = easeInOutCirc(progress);
  return eased * eased;
}

function getFinalHurtBlobCoverDurationMs() {
  const seconds =
    boidConfig && typeof boidConfig.finalHurtBlobCoverSeconds === "number"
      ? boidConfig.finalHurtBlobCoverSeconds
      : FINAL_HURT_LIQUID_GROWTH_MS / 1000;
  return max(250, seconds * 1000);
}

function getFinalHurtLiquidGrowthProgress() {
  const progress = constrain(
    getFinalHurtElapsedMs() / getFinalHurtBlobCoverDurationMs(),
    0,
    1,
  );
  // Smooth coverage rather than radius-only easing so the blob does not feel
  // like it suddenly accelerates once its footprint gets large.
  return progress * progress * (3 - 2 * progress);
}

function getFinalHurtLiquidWaveAmplitude(progress = getFinalHurtLiquidGrowthProgress()) {
  return lerp(8, max(18, min(width, height) * 0.06), progress);
}

function getFinalHurtLiquidBaseRadius(progress = getFinalHurtLiquidGrowthProgress()) {
  const startRadius = max(20, min(width, height) * 0.05);
  const endRadius =
    dist(width * 0.5, height * 0.5, 0, 0) + max(width, height) * 0.36;
  // Interpolate by covered area so the screen takeover reads more evenly over time.
  return Math.sqrt(
    lerp(startRadius * startRadius, endRadius * endRadius, progress),
  );
}

function getFinalHurtLiquidSurfaceRadius(
  angle,
  progress = getFinalHurtLiquidGrowthProgress(),
  elapsedMs = getFinalHurtElapsedMs(),
) {
  const baseRadius = getFinalHurtLiquidBaseRadius(progress);
  const amplitude = getFinalHurtLiquidWaveAmplitude(progress);
  const waveA = sin(angle * 6 + elapsedMs * 0.0048);
  const waveB = sin(angle * 10 - elapsedMs * 0.0036 + 1.2);
  const waveMix = waveA * 0.72 + waveB * 0.34;

  return max(0, baseRadius + amplitude * waveMix);
}

function drawFinalHurtLiquidFlood() {
  if (!isFinalHurtPhaseActive()) {
    return;
  }

  const elapsedMs = getFinalHurtElapsedMs();
  const progress = getFinalHurtLiquidGrowthProgress();
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const vertexCount = 84;

  push();
  noStroke();
  fill(0);
  beginShape();
  for (let i = 0; i <= vertexCount; i += 1) {
    const angle = (TWO_PI * i) / vertexCount;
    const radius = getFinalHurtLiquidSurfaceRadius(angle, progress, elapsedMs);
    vertex(centerX + cos(angle) * radius, centerY + sin(angle) * radius);
  }
  endShape(CLOSE);
  pop();
}

function updateFinalBlobDroppedShapeDecay(progress, elapsedMs) {
  if (!isFinalHurtPhaseActive() || droppedShapes.length === 0) {
    return;
  }

  const centerX = width * 0.5;
  const centerY = height * 0.5;
  let removedAny = false;

  for (let i = droppedShapes.length - 1; i >= 0; i -= 1) {
    const shape = droppedShapes[i];
    if (!shape || !shape.pos) {
      continue;
    }

    if (!Number.isFinite(shape.finalBlobTouchedAtMs)) {
      const dx = shape.pos.x - centerX;
      const dy = shape.pos.y - centerY;
      const angle = atan2(dy, dx);
      const distanceToCenter = sqrt(dx * dx + dy * dy);
      const liquidSurfaceRadius = getFinalHurtLiquidSurfaceRadius(
        angle,
        progress,
        elapsedMs,
      );
      const contactRadius = max(4, shape.size * 0.5);

      if (distanceToCenter <= liquidSurfaceRadius + contactRadius) {
        shape.finalBlobTouchedAtMs = millis();
      }
    }

    if (getFinalBlobDroppedShapeDecayState(shape).hidden) {
      droppedShapes.splice(i, 1);
      removedAny = true;
    }
  }

  if (removedAny) {
    markDroppedCollisionCacheDirty();
  }
}

function updateFinalHurtState() {
  if (!userLeader || !isFinalHurtPhaseActive()) {
    return;
  }

  if (!finalHurtTensionPlayed) {
    finalHurtTensionPlayed = true;
    playTensionWave();
  }

  const elapsedMs = getFinalHurtElapsedMs();
  const progress = getFinalHurtLiquidGrowthProgress();
  updateFinalBlobDroppedShapeDecay(progress, elapsedMs);

  if (!userLeader.finalHurtTouched) {
    const phaseStartMs = getFinalHurtPhaseStartMs();
    userLeader.finalHurtTouched = true;
    userLeader.finalHurtTouchedAtMs = phaseStartMs;
    userLeader.nextVCutAtMs = phaseStartMs;
  }

  if (
    userLeader.finalHurtTouched &&
    Number.isFinite(userLeader.vCutCount) &&
    userLeader.vCutCount < FINAL_HURT_MAX_VCUTS
  ) {
    const nowMs = millis();
    if (!userLeader.nextVCutAtMs) {
      userLeader.nextVCutAtMs = nowMs;
    }

    while (
      userLeader.vCutCount < FINAL_HURT_MAX_VCUTS &&
      nowMs >= userLeader.nextVCutAtMs
    ) {
      userLeader.vCutCount += 1;
      userLeader.nextVCutAtMs += FINAL_HURT_VCUT_INTERVAL_MS;
    }
  }

  if (userLeader.vCutCount >= FINAL_HURT_MAX_VCUTS) {
    userLeader.controlsLocked = true;
    userLeader.grayBlend = 1;
  }
}

function drawNarrativeCubePortalText(message, textSizePx) {
  if (!message) {
    return;
  }

  const promptTextSize = max(22, textSizePx);
  const promptCenterX = width * 0.5;
  const promptCenterY = getNarrativePromptCenterY(promptTextSize);

  // Keep intro prompts anchored like film subtitles instead of following the player.
  drawSoftShadowIntroText(
    message,
    promptCenterX,
    promptCenterY,
    promptTextSize,
    242,
    {
      shadowOffsetX: 0,
      shadowOffsetY: max(5, promptTextSize * 0.2),
      shadowBlur: max(14, promptTextSize * 0.42),
      shadowAlpha: 235,
    },
  );
}

function drawPreStartOverlay() {
  // Instructional pre-start text intentionally removed by request.
}

function updatePreviewWindow() {
  const wrapper = document.getElementById("p5-canvas-wrap");

  if (!wrapper || !climateCanvas) {
    return;
  }

  const host = getP5Host();
  const fullscreen = isArtOnlyMode() || (host ? isP5HostFullscreen(host) : false);

  if (fullscreen) {
    previewOffsetX = 0;
    previewOffsetY = 0;
    climateCanvas.elt.style.transform = "translate3d(0px, 0px, 0)";
    return;
  }

  const bounds = wrapper.getBoundingClientRect();
  const focus = userLeader ? getPreviewFocusPoint() : getWorldCenterPoint();
  const focusX = focus.x;
  const focusY = focus.y;

  const targetX = constrain(
    focusX - bounds.width * 0.5,
    0,
    max(0, width - bounds.width),
  );
  const targetY = constrain(
    focusY - bounds.height * 0.5,
    0,
    max(0, height - bounds.height),
  );

  previewOffsetX = lerp(previewOffsetX, targetX, boidConfig.previewFollowLerp);
  previewOffsetY = lerp(previewOffsetY, targetY, boidConfig.previewFollowLerp);

  climateCanvas.elt.style.transform = `translate3d(${-previewOffsetX}px, ${-previewOffsetY}px, 0)`;
}

function steerSeparationCustom(leader, leaders, radius) {
  const radiusSq = radius * radius;
  const lx = leader.pos.x;
  const ly = leader.pos.y;
  let steerX = 0;
  let steerY = 0;
  let count = 0;

  for (const other of leaders) {
    if (other === leader) {
      continue;
    }

    const dx = lx - other.pos.x;
    const dy = ly - other.pos.y;
    const distSq = dx * dx + dy * dy;

    if (distSq > 0.000001 && distSq < radiusSq) {
      const invDistSq = 1 / distSq;
      steerX += dx * invDistSq;
      steerY += dy * invDistSq;
      count += 1;
    }
  }

  if (count === 0) {
    return createVector(0, 0);
  }

  return finalizeSteer(
    leader,
    {
      x: steerX / count,
      y: steerY / count,
    },
    leader.maxSpeed,
    leader.maxForce,
  );
}

function steerAlignmentCustom(leader, leaders, radius) {
  const radiusSq = radius * radius;
  const lx = leader.pos.x;
  const ly = leader.pos.y;
  let avgX = 0;
  let avgY = 0;
  let count = 0;

  for (const other of leaders) {
    if (other === leader) {
      continue;
    }

    const dx = lx - other.pos.x;
    const dy = ly - other.pos.y;
    const distSq = dx * dx + dy * dy;

    if (distSq > 0.000001 && distSq < radiusSq) {
      avgX += other.vel.x;
      avgY += other.vel.y;
      count += 1;
    }
  }

  if (count === 0) {
    return createVector(0, 0);
  }

  return finalizeSteer(
    leader,
    {
      x: avgX / count,
      y: avgY / count,
    },
    leader.maxSpeed,
    leader.maxForce,
  );
}

function steerCohesionCustom(leader, leaders, radius) {
  const radiusSq = radius * radius;
  const lx = leader.pos.x;
  const ly = leader.pos.y;
  let centerX = 0;
  let centerY = 0;
  let count = 0;

  for (const other of leaders) {
    if (other === leader) {
      continue;
    }

    const dx = lx - other.pos.x;
    const dy = ly - other.pos.y;
    const distSq = dx * dx + dy * dy;

    if (distSq > 0.000001 && distSq < radiusSq) {
      centerX += other.pos.x;
      centerY += other.pos.y;
      count += 1;
    }
  }

  if (count === 0) {
    return createVector(0, 0);
  }

  return finalizeSteer(
    leader,
    {
      x: centerX / count - lx,
      y: centerY / count - ly,
    },
    leader.maxSpeed,
    leader.maxForce,
  );
}

function steerWander(leader) {
  // Let anxious buyers snap between impulses instead of easing back into a calm path.
  const jitter = max(0, boidConfig.wanderJitter);
  leader.wanderAngle += random(-jitter, jitter);

  const heading = leader.vel.copy();

  if (heading.magSq() < 0.0001) {
    heading.set(cos(leader.angle), sin(leader.angle));
  }

  heading.normalize();
  leader.wanderAngle = lerpAngle(leader.wanderAngle, heading.heading(), 0.025);

  const circle = heading.mult(boidConfig.wanderCircleDistance);
  const displacement = p5.Vector.fromAngle(leader.wanderAngle).mult(
    boidConfig.wanderCircleRadius,
  );

  return finalizeSteer(
    leader,
    p5.Vector.add(circle, displacement),
    leader.maxSpeed,
    leader.maxForce,
  );
}

function steerFromPoint(leader, point, radius) {
  if (!point || radius <= 0) {
    return createVector(0, 0);
  }

  const dx = leader.pos.x - point.x;
  const dy = leader.pos.y - point.y;
  const distanceSq = dx * dx + dy * dy;
  const radiusSq = radius * radius;

  if (distanceSq <= 0.000001 || distanceSq >= radiusSq) {
    return createVector(0, 0);
  }

  const distance = sqrt(distanceSq);
  const desiredMag = map(distance, 0, radius, leader.maxSpeed, 0.18);
  const invDistance = desiredMag / distance;

  return finalizeSteer(
    leader,
    {
      x: dx * invDistance,
      y: dy * invDistance,
    },
    leader.maxSpeed,
    leader.maxForce,
  );
}

function steerCurveAroundPoint(leader, point, radius) {
  if (!point || radius <= 0) {
    return createVector(0, 0);
  }

  const away = p5.Vector.sub(leader.pos, point);
  const distance = away.mag();

  if (distance <= 0.0001 || distance >= radius) {
    return createVector(0, 0);
  }

  const pressure = 1 - distance / radius;
  const lateral = createVector(-away.y, away.x);
  const turnSide = leader.vel.x * away.y - leader.vel.y * away.x >= 0 ? 1 : -1;

  lateral.normalize();
  lateral.mult(leader.maxSpeed * (0.45 + pressure * 0.95) * turnSide);

  const steering = p5.Vector.sub(lateral, leader.vel);
  steering.limit(leader.maxForce * 1.35);
  return steering;
}

function finalizeSteer(agent, desiredDirection, maxSpeed, maxForce) {
  const dx = desiredDirection.x;
  const dy = desiredDirection.y;
  const desiredMagSq = dx * dx + dy * dy;

  if (desiredMagSq <= 0.0001) {
    return createVector(0, 0);
  }

  const desiredScale = maxSpeed / sqrt(desiredMagSq);
  const desiredX = dx * desiredScale;
  const desiredY = dy * desiredScale;

  let steerX = desiredX - agent.vel.x;
  let steerY = desiredY - agent.vel.y;
  const steerMagSq = steerX * steerX + steerY * steerY;
  const maxForceSq = maxForce * maxForce;

  if (steerMagSq > maxForceSq && steerMagSq > 0) {
    const forceScale = maxForce / sqrt(steerMagSq);
    steerX *= forceScale;
    steerY *= forceScale;
  }

  return createVector(steerX, steerY);
}

function seekTargetXY(agent, targetX, targetY, maxSpeed, maxForce) {
  const dx = targetX - agent.pos.x;
  const dy = targetY - agent.pos.y;
  const distanceSq = dx * dx + dy * dy;

  if (distanceSq <= 0.0001) {
    return createVector(0, 0);
  }

  const distance = sqrt(distanceSq);
  const desiredSpeed = min(maxSpeed, distance * 0.2 + 0.2);
  const desiredScale = desiredSpeed / distance;
  const desiredX = dx * desiredScale;
  const desiredY = dy * desiredScale;

  let steerX = desiredX - agent.vel.x;
  let steerY = desiredY - agent.vel.y;
  const steerMagSq = steerX * steerX + steerY * steerY;
  const maxForceSq = maxForce * maxForce;

  if (steerMagSq > maxForceSq && steerMagSq > 0) {
    const forceScale = maxForce / sqrt(steerMagSq);
    steerX *= forceScale;
    steerY *= forceScale;
  }

  return createVector(steerX, steerY);
}

function seekTarget(agent, target, maxSpeed, maxForce) {
  return seekTargetXY(agent, target.x, target.y, maxSpeed, maxForce);
}

function getRoomGridSpec() {
  const roomSize = getGridSpacing();
  const cols = max(1, ceil(width / roomSize));
  const rows = max(1, ceil(height / roomSize));

  return {
    roomSize,
    cols,
    rows,
  };
}

function getRoomKey(col, row, gridSpec) {
  return row * gridSpec.cols + col;
}

function getRoomCellForPosition(position, gridSpec) {
  return {
    col: constrain(floor(position.x / gridSpec.roomSize), 0, gridSpec.cols - 1),
    row: constrain(floor(position.y / gridSpec.roomSize), 0, gridSpec.rows - 1),
  };
}

function getRoomBounds(cell, gridSpec) {
  const left = cell.col * gridSpec.roomSize;
  const top = cell.row * gridSpec.roomSize;

  return {
    left,
    right: min(width, left + gridSpec.roomSize),
    top,
    bottom: min(height, top + gridSpec.roomSize),
  };
}

function addEntityToRoomOccupancy(counts, entity, gridSpec) {
  if (!entity || !entity.pos) {
    return;
  }

  const room = getRoomCellForPosition(entity.pos, gridSpec);
  const key = getRoomKey(room.col, room.row, gridSpec);
  counts.set(key, (counts.get(key) || 0) + 1);
}

function buildLockedRoomSet(gridSpec) {
  const threshold = max(
    1,
    floor(
      boidConfig && typeof boidConfig.roomLockShapeThreshold === "number"
        ? boidConfig.roomLockShapeThreshold
        : 90,
    ),
  );

  const counts = new Map();

  for (const cube of narrativeCubes) {
    addEntityToRoomOccupancy(counts, cube, gridSpec);
  }

  for (const swarm of smallSwarms) {
    addEntityToRoomOccupancy(counts, swarm.leader, gridSpec);
    for (const follower of swarm.followers) {
      addEntityToRoomOccupancy(counts, follower, gridSpec);
    }
  }

  // Big leaders and their followers bypass room cell logic completely.

  for (const follower of userFollowers) {
    addEntityToRoomOccupancy(counts, follower, gridSpec);
  }

  for (const shape of droppedShapes) {
    addEntityToRoomOccupancy(counts, shape, gridSpec);
  }

  const locked = new Set();
  for (const [key, count] of counts.entries()) {
    if (count >= threshold) {
      locked.add(key);
    }
  }

  return locked;
}

function getRoomRoutingContext() {
  if (roomRoutingCacheFrame === frameCount && roomRoutingCache) {
    return roomRoutingCache;
  }

  const gridSpec = getRoomGridSpec();
  const lockedRooms = buildLockedRoomSet(gridSpec);
  roomRoutingCache = {
    gridSpec,
    lockedRooms,
    destinationCache: new Map(),
  };
  roomRoutingCacheFrame = frameCount;

  return roomRoutingCache;
}

function getPortalSideCode(side) {
  if (side === "left") {
    return 1;
  }

  if (side === "right") {
    return 2;
  }

  if (side === "top") {
    return 3;
  }

  return 4;
}

function getRoomPortalOverlap(
  position,
  sourceBounds,
  radius,
  commitFactor = 1,
) {
  let strongestSide = null;
  let strongestAmount = 0;
  let strongestCenterPast = 0;

  const leftAmount = sourceBounds.left - (position.x - radius);
  if (leftAmount > strongestAmount) {
    strongestSide = "left";
    strongestAmount = leftAmount;
    strongestCenterPast = sourceBounds.left - position.x;
  }

  const rightAmount = position.x + radius - sourceBounds.right;
  if (rightAmount > strongestAmount) {
    strongestSide = "right";
    strongestAmount = rightAmount;
    strongestCenterPast = position.x - sourceBounds.right;
  }

  const topAmount = sourceBounds.top - (position.y - radius);
  if (topAmount > strongestAmount) {
    strongestSide = "top";
    strongestAmount = topAmount;
    strongestCenterPast = sourceBounds.top - position.y;
  }

  const bottomAmount = position.y + radius - sourceBounds.bottom;
  if (bottomAmount > strongestAmount) {
    strongestSide = "bottom";
    strongestAmount = bottomAmount;
    strongestCenterPast = position.y - sourceBounds.bottom;
  }

  if (!strongestSide || strongestAmount <= 0) {
    return null;
  }

  const commitThreshold = radius * max(0.1, commitFactor);

  return {
    side: strongestSide,
    amount: strongestAmount,
    centerPast: strongestCenterPast,
    commit: strongestCenterPast >= commitThreshold,
  };
}

function choosePortalDestinationRoom(sourceCell, side, context) {
  const { gridSpec, lockedRooms, destinationCache } = context;
  const sideIndex = getPortalSideCode(side) - 1;
  const cacheKey =
    (sourceCell.row * gridSpec.cols + sourceCell.col) * 4 + sideIndex;

  if (destinationCache.has(cacheKey)) {
    return destinationCache.get(cacheKey);
  }

  const candidates = [];

  for (let row = 0; row < gridSpec.rows; row += 1) {
    for (let col = 0; col < gridSpec.cols; col += 1) {
      const key = getRoomKey(col, row, gridSpec);
      const sameRoom = col === sourceCell.col && row === sourceCell.row;
      const adjacent =
        abs(col - sourceCell.col) <= 1 && abs(row - sourceCell.row) <= 1;

      if (sameRoom || adjacent || lockedRooms.has(key)) {
        continue;
      }

      candidates.push({ col, row });
    }
  }

  if (candidates.length === 0) {
    destinationCache.set(cacheKey, null);
    return null;
  }

  // Stable mapping per room-edge avoids frame-to-frame destination flicker.
  const sideCode = getPortalSideCode(side);
  const seed =
    ((sourceCell.col + 1) * 73856093) ^
    ((sourceCell.row + 1) * 19349663) ^
    (sideCode * 83492791) ^
    ((gridSpec.cols + 1) * 2654435761) ^
    ((gridSpec.rows + 1) * 97531);
  const index = (seed >>> 0) % candidates.length;
  const destination = candidates[index];
  destinationCache.set(cacheKey, destination);
  return destination;
}

function blockRoomEntry(leader, side, sourceBounds, radius) {
  if (side === "left") {
    leader.pos.x = sourceBounds.left + radius + ROOM_ENTRY_EPSILON;
    if (leader.vel.x < 0) {
      leader.vel.x *= -ROOM_BLOCKED_BOUNCE_DAMPING;
    }
  } else if (side === "right") {
    leader.pos.x = sourceBounds.right - radius - ROOM_ENTRY_EPSILON;
    if (leader.vel.x > 0) {
      leader.vel.x *= -ROOM_BLOCKED_BOUNCE_DAMPING;
    }
  } else if (side === "top") {
    leader.pos.y = sourceBounds.top + radius + ROOM_ENTRY_EPSILON;
    if (leader.vel.y < 0) {
      leader.vel.y *= -ROOM_BLOCKED_BOUNCE_DAMPING;
    }
  } else if (side === "bottom") {
    leader.pos.y = sourceBounds.bottom - radius - ROOM_ENTRY_EPSILON;
    if (leader.vel.y > 0) {
      leader.vel.y *= -ROOM_BLOCKED_BOUNCE_DAMPING;
    }
  }
}

function getPortalProjectionPoint(
  side,
  position,
  sourceBounds,
  destinationBounds,
  radius,
) {
  const sourceW = max(1, sourceBounds.right - sourceBounds.left);
  const sourceH = max(1, sourceBounds.bottom - sourceBounds.top);
  const destinationW = max(1, destinationBounds.right - destinationBounds.left);
  const destinationH = max(1, destinationBounds.bottom - destinationBounds.top);

  const normalizedX = constrain(
    (position.x - sourceBounds.left) / sourceW,
    0,
    1,
  );
  const normalizedY = constrain(
    (position.y - sourceBounds.top) / sourceH,
    0,
    1,
  );

  let destinationX = destinationBounds.left + normalizedX * destinationW;
  let destinationY = destinationBounds.top + normalizedY * destinationH;

  if (side === "left") {
    const centerOffset = sourceBounds.left - position.x;
    destinationX = destinationBounds.right - centerOffset;
  } else if (side === "right") {
    const centerOffset = position.x - sourceBounds.right;
    destinationX = destinationBounds.left + centerOffset;
  } else if (side === "top") {
    const centerOffset = sourceBounds.top - position.y;
    destinationY = destinationBounds.bottom - centerOffset;
  } else if (side === "bottom") {
    const centerOffset = position.y - sourceBounds.bottom;
    destinationY = destinationBounds.top + centerOffset;
  }

  destinationX = constrain(
    destinationX,
    destinationBounds.left - radius,
    destinationBounds.right + radius,
  );
  destinationY = constrain(
    destinationY,
    destinationBounds.top - radius,
    destinationBounds.bottom + radius,
  );

  return createVector(destinationX, destinationY);
}

// Crossing a room boundary uses a portal projection so transitions look continuous.
function routeLeaderThroughRooms(
  leader,
  previousPos,
  linkedFollowers = [],
  options = {},
) {
  if (!leader || !leader.pos || !previousPos || !boidConfig) {
    return;
  }

  const renderProjection = options.renderProjection !== false;

  const context = getRoomRoutingContext();
  const { gridSpec } = context;

  if (gridSpec.cols * gridSpec.rows <= 1) {
    wrapPosition(leader.pos, leader.size);
    leader.portalProjection = null;
    return;
  }

  const sourceCell = getRoomCellForPosition(previousPos, gridSpec);
  const sourceBounds = getRoomBounds(sourceCell, gridSpec);
  const portalRadiusFactor = constrain(
    boidConfig && typeof boidConfig.roomPortalRadiusFactor === "number"
      ? boidConfig.roomPortalRadiusFactor
      : 0.55,
    0.2,
    0.9,
  );
  const portalCommitFactor = constrain(
    boidConfig && typeof boidConfig.roomPortalCommitFactor === "number"
      ? boidConfig.roomPortalCommitFactor
      : 1,
    0.5,
    1.8,
  );
  const portalRadius = max(
    1.5,
    min(leader.size * portalRadiusFactor, gridSpec.roomSize * 0.48),
  );
  const overlap = getRoomPortalOverlap(
    leader.pos,
    sourceBounds,
    portalRadius,
    portalCommitFactor,
  );

  if (!overlap) {
    leader.portalProjection = null;
    return;
  }

  const destinationCell = choosePortalDestinationRoom(
    sourceCell,
    overlap.side,
    context,
  );

  if (!destinationCell) {
    leader.portalProjection = null;
    blockRoomEntry(leader, overlap.side, sourceBounds, portalRadius);
    return;
  }

  const destinationBounds = getRoomBounds(destinationCell, gridSpec);
  const destinationPoint = getPortalProjectionPoint(
    overlap.side,
    leader.pos,
    sourceBounds,
    destinationBounds,
    portalRadius,
  );

  if (renderProjection) {
    leader.portalProjection = {
      active: true,
      side: overlap.side,
      pos: destinationPoint.copy(),
      sourceBounds: { ...sourceBounds },
      destinationBounds: { ...destinationBounds },
    };
  } else {
    leader.portalProjection = null;
  }

  if (!overlap.commit) {
    return;
  }

  const deltaX = destinationPoint.x - leader.pos.x;
  const deltaY = destinationPoint.y - leader.pos.y;

  leader.pos.x = destinationPoint.x;
  leader.pos.y = destinationPoint.y;

  if (!Array.isArray(linkedFollowers) || linkedFollowers.length === 0) {
    leader.portalProjection = null;
    return;
  }

  for (const follower of linkedFollowers) {
    if (!follower || !follower.pos) {
      continue;
    }

    follower.pos.x += deltaX;
    follower.pos.y += deltaY;
    wrapPosition(follower.pos, follower.size || 0);
  }

  leader.portalProjection = null;
}

function integrateLeader(leader) {
  leader.acc.limit(leader.maxForce * 2);
  leader.vel.add(leader.acc);
  leader.vel.limit(leader.maxSpeed);

  leader.pos.add(leader.vel);

  leader.acc.mult(0);

  if (leader.vel.magSq() > 0.0001) {
    leader.angle = leader.vel.heading();
  }

  // Smooth displayed heading to remove triangle jitter in tight steering updates.
  leader.displayAngle = lerpAngle(
    leader.displayAngle,
    leader.angle,
    boidConfig.headingSmoothing,
  );
}

function resolveSmallSwarmWraps() {
  for (const swarm of smallSwarms) {
    const offset = getWrapOffsetForPosition(
      swarm.leader.pos,
      swarm.leader.size,
    );

    if (!offset) {
      continue;
    }

    if (isSmallSwarmReadyForWrap(swarm)) {
      teleportSmallSwarmTogether(swarm, offset);
    } else {
      // Keep leader at edge until all followers are near for seamless teleport.
      holdLeaderAtWrapBoundary(swarm.leader);
    }
  }
}

function isSmallSwarmReadyForWrap(swarm) {
  if (!swarm || !swarm.leader || !Array.isArray(swarm.followers)) {
    return false;
  }

  if (swarm.followers.length === 0) {
    return true;
  }

  const gatherRadius = max(
    boidConfig.followerOrbitRadiusMax * 2.6,
    boidConfig.followerOrbitRadiusMin * 2,
    swarm.leader.size * 2.3,
  );

  for (const follower of swarm.followers) {
    if (p5.Vector.dist(follower.pos, swarm.leader.pos) > gatherRadius) {
      return false;
    }
  }

  return true;
}

function holdLeaderAtWrapBoundary(leader) {
  const margin = leader.size;
  const minX = -margin;
  const maxX = width + margin;
  const minY = -margin;
  const maxY = height + margin;

  if (leader.pos.x < minX) {
    leader.pos.x = minX;
    if (leader.vel.x < 0) {
      leader.vel.x = 0;
    }
  } else if (leader.pos.x > maxX) {
    leader.pos.x = maxX;
    if (leader.vel.x > 0) {
      leader.vel.x = 0;
    }
  }

  if (leader.pos.y < minY) {
    leader.pos.y = minY;
    if (leader.vel.y < 0) {
      leader.vel.y = 0;
    }
  } else if (leader.pos.y > maxY) {
    leader.pos.y = maxY;
    if (leader.vel.y > 0) {
      leader.vel.y = 0;
    }
  }
}

function teleportSmallSwarmTogether(swarm, offset) {
  swarm.leader.pos.x += offset.x;
  swarm.leader.pos.y += offset.y;
  wrapPosition(swarm.leader.pos, swarm.leader.size);

  for (const follower of swarm.followers) {
    follower.pos.x += offset.x;
    follower.pos.y += offset.y;
    wrapPosition(follower.pos, follower.size);
  }
}

function getWrapOffsetForPosition(position, margin) {
  let offsetX = 0;
  let offsetY = 0;
  const spanX = width + margin * 2;
  const spanY = height + margin * 2;

  if (position.x < -margin) {
    offsetX = spanX;
  } else if (position.x > width + margin) {
    offsetX = -spanX;
  }

  if (position.y < -margin) {
    offsetY = spanY;
  } else if (position.y > height + margin) {
    offsetY = -spanY;
  }

  if (offsetX === 0 && offsetY === 0) {
    return null;
  }

  return { x: offsetX, y: offsetY };
}

function lerpAngle(current, target, amount) {
  const delta = atan2(sin(target - current), cos(target - current));
  return current + delta * amount;
}

function wrapPosition(position, margin) {
  if (position.x < -margin) {
    position.x = width + margin;
  } else if (position.x > width + margin) {
    position.x = -margin;
  }

  if (position.y < -margin) {
    position.y = height + margin;
  } else if (position.y > height + margin) {
    position.y = -margin;
  }
}

function getFallbackConfig() {
  return {
    autonomousLeaderCount: 15,
    minFollowersPerLeader: 3,
    maxFollowersPerLeader: 7,
    userFollowerCount: 6,
    leaderSize: 18,
    bigLeaderSize: 50,
    followerSizeMin: 9,
    followerSizeMax: 17,
    globalElementScale: 1,
    userLeaderScale: 1,
    smallLeaderScale: 1,
    macroLeaderScale: 1,
    followerScale: 1,
    narrativeCubeScale: 1,
    droppedShapeScale: 1,
    // Fallback mirrors the quick-tune number block at the top of control.js.
    overlayTextScale: 128,
    overlayTextShadowOffsetX: 0,
    overlayTextShadowOffsetY: 2,
    overlayTextShadowBlur: 10,
    overlayTextShadowAlpha: 148,
    gridLineScale: 1,
    referenceLineScale: 1,
    bigFollowerCount: 0,
    leaderMaxSpeed: 6.8,
    cycleLeaderSpeedGrowthPerCycle: 0.38,
    leaderMaxForce: 0.34,
    separationRadius: 68,
    alignmentRadius: 116,
    cohesionRadius: 132,
    separationWeight: 1.74,
    alignmentWeight: 0.34,
    cohesionWeight: 0.42,
    wanderWeight: 1.18,
    wanderJitter: 0.66,
    wanderCircleRadius: 62,
    wanderCircleDistance: 18,
    bigLeaderSpeed: 6.4,
    bigLeaderForce: 0.24,
    bigLeaderWander: 1.05,
    bigLeaderSpacingRadius: 180,
    influenceFollowWeight: 3.25,
    influenceColorLerp: 0.024,
    assimilationRadius: 140,
    sequenceSpeedMultiplier: 1,
    secondsToFinalCycle: 7,
    cycleReturnDelaySeconds: 6,
    finalHurtBlobCoverSeconds: 10.8,
    minCycleReturnDelaySeconds: 0.5,
    cycleReturnAccelerationPerCycle: 0,
    assimilationRampPerCycle: 1,
    cycleFollowerStartFactor: 0.55,
    cycleFollowerGrowthPerCycle: 0.16,
    cycleFollowerMaxFactor: 1,
    referencePatternCells: 24,
    referencePatternPhaseDivisor: 420,
    referencePatternMorphDrift: 0.001,
    referencePatternWarpStrength: 10,
    referencePatternLineDriftDivisor: 26,
    referencePatternShuffleIntervalFrames: 500,
    referencePatternOpacity: 85,
    userAcceleration: 0.85,
    userMaxSpeed: 4.6,
    userDrag: 0.95,
    followerFollowStrength: 1.22,
    followerMaxSpeed: 13.8,
    cycleFollowerSpeedGrowthPerCycle: 0.32,
    followerDrag: 0.93,
    followerOrbitRadiusMin: 20,
    followerOrbitRadiusMax: 75,
    followerOrbitJitter: 0.82,
    followerTrailBias: 0.18,
    droppedPhysicsDurationSeconds: 4,
    droppedFreezeVelocity: 0.12,
    droppedMinSettledFrames: 14,
    maxDynamicDroppedShapes: 40,
    droppedStaticShrinkRatio: 1,
    droppedStaticShrinkDurationMs: 220,
    backdropDrift: 0.42,
    shadowOffsetMinPx: 0.8,
    shadowOffsetBaseFactor: 0.04,
    shadowOffsetInfluenceFactor: 0.07,
    gridDensity: 28,
    gridLineOpacity: 77,
    roomLockShapeThreshold: 90,
    roomPortalRadiusFactor: 0.55,
    roomPortalCommitFactor: 1,
    halftoneSpacing: 10,
    headingSmoothing: 0.58,
    macroExitSpeed: 10.2,
    macroExitForce: 0.36,
    macroDespawnMargin: 1.15,
    userRejectRadius: 110,
    userRejectWeight: 0.9,
    previewFollowLerp: 0.08,
  };
}

function getWorldSize() {
  if (isArtOnlyMode()) {
    const wrapper =
      typeof document !== "undefined"
        ? document.getElementById("p5-canvas-wrap")
        : null;
    const bounds = wrapper ? wrapper.getBoundingClientRect() : null;
    if (bounds && bounds.width > 0 && bounds.height > 0) {
      return {
        width: max(320, floor(bounds.width)),
        height: max(320, floor(bounds.height)),
      };
    }
  }

  const viewportWidth =
    typeof window !== "undefined" && Number.isFinite(window.innerWidth)
      ? window.innerWidth
      : 640;
  const viewportHeight =
    typeof window !== "undefined" && Number.isFinite(window.innerHeight)
      ? window.innerHeight
      : 360;

  return {
    width: max(320, floor(viewportWidth)),
    height: max(320, floor(viewportHeight)),
  };
}

function syncCanvasSize() {
  if (!climateCanvas) {
    return;
  }

  const world = getWorldSize();
  const previousHeight = height;

  if (world.width === width && world.height === height) {
    applyResponsivePopulationLimits();
    updatePreviewWindow();
    return;
  }

  resizeCanvas(world.width, world.height);
  rebuildBackdropLayers();
  prewarmRenderCaches();

  ensureInBoundsAfterResize(previousHeight);
  applyResponsivePopulationLimits();
  updatePreviewWindow();
}

function ensureInBoundsAfterResize(previousHeight = height) {
  if (userLeader) {
    centerUserLeaderForSpawn();
  }

  for (const cube of narrativeCubes) {
    cube.pos.x = constrain(cube.pos.x, -cube.size, width + cube.size);
    cube.pos.y = constrain(cube.pos.y, -cube.size * 2.4, height + cube.size);
    cube.anchor.x = constrain(cube.anchor.x, cube.size, width - cube.size);
    cube.anchor.y = constrain(cube.anchor.y, cube.size, height - cube.size);
  }

  for (const swarm of smallSwarms) {
    wrapPosition(swarm.leader.pos, swarm.leader.size);
    for (const follower of swarm.followers) {
      wrapPosition(follower.pos, follower.size);
    }
  }

  for (const trend of bigTrendLeaders) {
    if (!macroExitActive && !trend.dormant) {
      wrapPosition(trend.leader.pos, trend.leader.size);
    }

  }

  for (const follower of userFollowers) {
    wrapPosition(follower.pos, follower.size);
  }

  for (const shape of droppedShapes) {
    shape.pos.x = constrain(shape.pos.x, -shape.size, width + shape.size);

    if (shape.dropMode === "static-shrink") {
      // Static top-down drops should stay where they were created, even across resize/fullscreen changes.
      const persistedY =
        typeof shape.groundY === "number"
          ? shape.groundY
          : typeof shape.pos.y === "number"
            ? shape.pos.y
            : height * 0.5;
      shape.groundY = constrain(persistedY, 0, height);

      if (shape.frozen && shape.vel) {
        shape.pos.y = shape.groundY;
        shape.vel.x = 0;
        shape.vel.y = 0;
      } else {
        shape.pos.y = constrain(shape.pos.y, 0, shape.groundY);
      }

      continue;
    }

    const inferredOffset =
      typeof shape.groundY === "number"
        ? previousHeight - shape.groundY
        : shape.size * 0.5 + 6;
    const fallbackOffset = constrain(
      inferredOffset,
      shape.size * 0.5 + DROPPED_FLOOR_INSET_MIN,
      max(shape.size * 0.5 + DROPPED_FLOOR_INSET_MAX, previousHeight - 2),
    );
    const persistentOffset =
      typeof shape.groundOffset === "number"
        ? shape.groundOffset
        : fallbackOffset;

    // Keep each dropped shape pinned to a stable floor offset across zoom/fullscreen size changes.
    shape.groundOffset = constrain(
      persistentOffset,
      shape.size * 0.5 + DROPPED_FLOOR_INSET_MIN,
      max(shape.size * 0.5 + DROPPED_FLOOR_INSET_MAX, height - 2),
    );
    shape.groundY = height - shape.groundOffset;

    if (shape.frozen && shape.vel) {
      shape.pos.y = shape.groundY;
      shape.vel.x = 0;
      shape.vel.y = 0;
    } else {
      shape.pos.y = min(shape.pos.y, shape.groundY);
    }
  }

  markDroppedCollisionCacheDirty();
}

function getP5Host() {
  return document.getElementById("p5-host");
}

function getFullscreenButton() {
  return document.getElementById("fullscreen-btn");
}

function isP5HostFullscreen(host) {
  return (
    document.fullscreenElement === host ||
    document.webkitFullscreenElement === host
  );
}

function requestAnyFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen().catch(() => {
      // Ignore user gesture and browser policy rejections.
    });
    return;
  }

  if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

function exitAnyFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => {
      // Ignore edge-case exit failures.
    });
    return;
  }

  if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

function toggleCanvasFullscreen() {
  const host = getP5Host();

  if (!host) {
    return;
  }

  startSimulationIfNeeded();

  if (isP5HostFullscreen(host)) {
    exitAnyFullscreen();
  } else {
    requestAnyFullscreen(host);
  }
}

function startSimulationIfNeeded() {
  if (simulationStarted) {
    return;
  }

  primeCrowdAudio();
  centerUserLeaderForSpawn();
  simulationStarted = true;
  loop();
}

function handleFullscreenChange() {
  const host = getP5Host();
  const button = getFullscreenButton();

  if (!host || !button) {
    return;
  }

  const active = isP5HostFullscreen(host);
  host.classList.toggle("is-fullscreen", active);
  button.textContent = active ? "Exit Fullscreen" : "Fullscreen";

  if (active) {
    const focused = document.activeElement;
    const isFormControl =
      focused instanceof HTMLElement &&
      (focused.tagName === "INPUT" ||
        focused.tagName === "TEXTAREA" ||
        focused.tagName === "SELECT" ||
        focused.tagName === "BUTTON");

    if (isFormControl) {
      focused.blur();
    }
  }

  // Fullscreen transitions can shift viewport geometry without a reliable resize event in some browsers.
  syncCanvasSize();

  if (active && !assimilationSequenceStarted && narrativeClicks === 0) {
    centerUserLeaderForSpawn();
  }

  updatePreviewWindow();
}

function preventFullscreenWheelScroll(event) {
  const host = getP5Host();

  if (!host) {
    return;
  }

  if (isP5HostFullscreen(host)) {
    event.preventDefault();
    event.stopPropagation();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const button = getFullscreenButton();

  if (button) {
    button.addEventListener("click", toggleCanvasFullscreen);
  }

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("wheel", preventFullscreenWheelScroll, {
    passive: false,
    capture: true,
  });
  window.addEventListener("wheel", preventFullscreenWheelScroll, {
    passive: false,
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncCanvasSize, {
      passive: true,
    });
  }

  handleFullscreenChange();
});
