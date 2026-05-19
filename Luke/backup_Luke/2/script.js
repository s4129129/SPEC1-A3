const PALETTE = {
  pink: "#FF007F",
  teal: "#1DD9DB",
  yellow: "#FED602",
  blue: "#1722B0",
  black: "#000000",
  white: "#FFFFFF",
};

const SCENE_1_END = 0.2;
const SCENE_2_END = 0.4;
const SCENE_3_END = 0.62;
const SCENE_4_END = 0.82;

const MICRO_TRIANGLE_COUNT = 1100;
const CIRCLE_COUNT = 7;

const SOUND_MANIFEST = {
  pasta: {
    src: "assets/sounds/production/pasta_break_and_dropping_edit.wav",
    volume: 0.86,
  },
  explode: {
    src: "assets/sounds/production/explode.wav",
    volume: 0.9,
  },
  ding: {
    src: "assets/sounds/production/ding.wav",
    volume: 0.8,
  },
  storm: {
    src: "assets/sounds/production/storm.wav",
    volume: 0.5,
    loop: true,
  },
};

let globalTime = 0;
let rawProgress = 0;
let smoothProgress = 0;
let previousRawProgress = 0;
let scrollVelocity = 0;

let microTriangles = [];
let ecosystemCircles = [];
let splashPieces = [];
let boltNewsprintTexture = null;
let interactionTriangles = [];

let shakeTrauma = 0;
let lastImpactShakeTime = -100;
let lastSplitShakeTime = -100;
let circleStressLevel = 0;

let latestCameraState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

let soundPlayers = new Map();
let soundsInitialized = false;
let soundsUnlocked = false;
let splitSceneWasActive = false;
let splitBreakSoundPlayed = false;
let splitTransitionDingPlayed = false;

function preload() {
  // Keep preload defined for p5 lifecycle consistency.
}

function setup() {
  ensureScrollSpace();

  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("art-stage");
  canvas.mousePressed(handleCanvasInteraction);
  canvas.attribute("role", "img");
  canvas.attribute(
    "aria-label",
    "Scroll-driven punk generative art showing production disruption through abstract geometric motion."
  );

  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  noStroke();
  rectMode(CENTER);

  initializeMicroTriangles();
  initializeCircles();
  initializeSplashPieces();
  initializeBoltTexture();
  initializeSoundSystem();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeMicroTriangles();
  initializeCircles();
}

function draw() {
  const dt = constrain(deltaTime / 1000, 1 / 200, 1 / 25);
  globalTime += dt;
  shakeTrauma = Math.max(0, shakeTrauma - dt * 1.65);

  updateScrollProgress(dt);
  updateSceneAudio();

  background(PALETTE.black);

  const hero = computeHeroState();
  const camera = computeCameraState(hero);
  latestCameraState.zoom = camera.zoom;
  latestCameraState.offsetX = camera.offsetX;
  latestCameraState.offsetY = camera.offsetY;

  const scene1Mix = bandMix(smoothProgress, 0.0, 0.24, 0.06);
  const scene2Mix = bandMix(smoothProgress, 0.18, 0.44, 0.06);
  const scene3Mix = bandMix(smoothProgress, 0.38, 0.7, 0.08);
  const scene4Mix = bandMix(smoothProgress, 0.58, 0.9, 0.08);
  const scene5Mix = smoothStep(0.8, 1.0, smoothProgress);
  const scene2Shock = scene2ImpactPulse(smoothProgress);

  push();
  translate(width * 0.5, height * 0.5);

  const baseShake =
    (scene2Mix * 0.52 + scene2Shock * 2.9 + scene5Mix * 0.6) *
    (0.42 + constrain(Math.max(scrollVelocity, 0) * 0.3, 0, 3.2));

  const trauma = shakeTrauma * shakeTrauma;
  const traumaScale = Math.min(width, height) * 0.032 * trauma;
  const traumaX = (noise(globalTime * 71.3, 11.2) - 0.5) * traumaScale;
  const traumaY = (noise(globalTime * 69.1, 23.7) - 0.5) * traumaScale;
  const traumaRot = (noise(globalTime * 57.4, 44.8) - 0.5) * trauma * 0.26;

  translate(
    Math.sin(globalTime * 49.0) * baseShake + traumaX,
    Math.cos(globalTime * 39.0) * baseShake + traumaY
  );
  rotate(traumaRot);

  scale(camera.zoom);
  translate(camera.offsetX, camera.offsetY);

  if (scene4Mix > 0.001 || scene5Mix > 0.001) {
    const microSamples = drawMicroTriangleField(scene4Mix, scene5Mix);
    drawEcosystemCircles(scene4Mix, scene5Mix, microSamples, dt);
  }

  if (scene1Mix > 0.001) {
    drawSceneOneTrail(hero, scene1Mix);
  }

  if (scene2Mix > 0.001) {
    const lineState = drawSceneTwoLineBreak(hero, scene2Mix);
    drawSceneTwoSplash(scene2Mix, lineState, hero);
  }

  if (scene3Mix > 0.001) {
    drawSceneThreeRecursive(hero, scene3Mix);
  }

  updateAndDrawInteractionTriangles(dt);

  drawHeroTriangle(hero, scene1Mix, scene2Mix, scene3Mix);

  pop();

  drawPunkTextOverlays(scene2Mix, scene3Mix, scene5Mix, scene2Shock);
}

function ensureScrollSpace() {
  let scrollSpace = document.getElementById("scroll-space");
  if (!scrollSpace) {
    scrollSpace = document.createElement("div");
    scrollSpace.id = "scroll-space";
    scrollSpace.setAttribute("aria-hidden", "true");
    document.body.appendChild(scrollSpace);
  }
  scrollSpace.style.height = "640vh";
}

function updateScrollProgress(dt) {
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight
  );

  rawProgress = constrain(window.scrollY / maxScroll, 0, 1);
  smoothProgress = lerp(smoothProgress, rawProgress, 0.13);

  const instantVelocity = (rawProgress - previousRawProgress) / dt;
  scrollVelocity = lerp(scrollVelocity, instantVelocity, 0.22);
  previousRawProgress = rawProgress;
}

function computeHeroState() {
  const baseSize = min(width, height);

  let y = -height * 0.82;
  let size = baseSize * 1.05;

  if (smoothProgress < SCENE_1_END) {
    const t = smoothStep(0, SCENE_1_END, smoothProgress);
    y = lerp(-height * 0.82, -height * 0.24, t);
    size = lerp(baseSize * 1.05, baseSize * 0.38, t);
  } else if (smoothProgress < SCENE_2_END) {
    const t = smoothStep(SCENE_1_END, SCENE_2_END, smoothProgress);
    y = lerp(-height * 0.24, height * 0.16, t);
    size = lerp(baseSize * 0.38, baseSize * 0.31, t);
  } else if (smoothProgress < SCENE_3_END) {
    const t = smoothStep(SCENE_2_END, SCENE_3_END, smoothProgress);
    y = lerp(height * 0.16, height * 0.28, easeOutQuart(t));
    size = lerp(baseSize * 0.31, baseSize * 0.46, t);
  } else {
    const t = smoothStep(SCENE_3_END, 1.0, smoothProgress);
    y = lerp(height * 0.28, height * 0.86, t);
    size = lerp(baseSize * 0.46, baseSize * 0.16, t);
  }

  const rotation =
    Math.sin(globalTime * 1.8) * 0.035 + constrain(scrollVelocity, -2.5, 2.5) * 0.02;

  return {
    x: 0,
    y,
    size,
    rotation,
  };
}

function computeCameraState(hero) {
  let zoom = 1;

  if (smoothProgress < SCENE_1_END) {
    const t = smoothStep(0, SCENE_1_END, smoothProgress);
    zoom = lerp(1.16, 0.74, t);
  } else if (smoothProgress < SCENE_2_END) {
    const t = smoothStep(SCENE_1_END, SCENE_2_END, smoothProgress);
    zoom = lerp(0.74, 0.9, t);
  } else if (smoothProgress < SCENE_3_END) {
    const t = smoothStep(SCENE_2_END, SCENE_3_END, smoothProgress);
    zoom = lerp(0.9, 1.55, t);
  } else {
    const t = smoothStep(SCENE_3_END, 1.0, smoothProgress);
    zoom = lerp(1.55, 0.46, t);
  }

  const scene3CenterLock = smoothStep(SCENE_2_END, SCENE_3_END, smoothProgress);
  const baseOffsetY = -hero.y * 0.24;
  const offsetY = lerp(baseOffsetY, 0, scene3CenterLock);

  return {
    zoom,
    offsetX: -hero.x * 0.2,
    offsetY,
  };
}

function drawBackdropPulse() {
  const pulse = smoothStep(0.1, 1.0, smoothProgress);
  const stripeCount = 8;

  for (let i = 0; i < stripeCount; i += 1) {
    const x = (i / (stripeCount - 1)) * width;
    const wave = Math.sin(globalTime * 1.4 + i * 0.8 + smoothProgress * 11.0);
    const h = lerp(height * 0.06, height * 0.32, (wave * 0.5 + 0.5) * pulse);

    const tint = i % 2 === 0 ? PALETTE.blue : PALETTE.teal;
    fillHex(tint, 24 + pulse * 60);
    rect(x, height - h * 0.5, width * 0.16, h);
  }
}

function drawSceneOneTrail(hero, scene1Mix) {
  const intensity = scene1Mix * (1 + constrain(Math.max(scrollVelocity, 0) * 2.8, 0, 4));
  const count = Math.floor(14 + 26 * intensity);

  for (let i = 0; i < count; i += 1) {
    const k = i / Math.max(1, count - 1);
    const trailSize = hero.size * lerp(0.8, 0.08, k);
    const spread = hero.size * 0.07 * (1 - k);

    const x =
      hero.x +
      (noise(i * 0.25, globalTime * 2.6) - 0.5) * spread * 2 +
      Math.sin(globalTime * 8 + i) * spread;
    const y = hero.y - k * hero.size * 1.05;

    const shade = i % 5 === 0 ? PALETTE.blue : i % 3 === 0 ? PALETTE.yellow : PALETTE.pink;
    fillHex(shade, lerp(188, 0, k) * scene1Mix);
    drawJaggedTriangle(x, y, trailSize, hero.rotation + k * 0.45, 0.1 + k * 0.7);
  }
}

function drawSceneTwoLineBreak(hero, scene2Mix) {
  const local = smoothStep(SCENE_1_END, SCENE_2_END, smoothProgress);
  const impact = smoothStep(0.4, 0.6, local);
  const dropKick = smoothStep(0.46, 0.58, local);
  const eject = smoothStep(0.58, 1.0, local);

  let lineY = 0;
  if (local < 0.46) {
    lineY = lerp(height * 1.05, 0, smoothStep(0.0, 0.46, local));
  } else if (local < 0.58) {
    lineY = lerp(0, height * 0.36, dropKick);
  } else {
    lineY = lerp(height * 0.36, -height * 1.45, easeOutQuart(eject));
  }

  const thickness = lerp(74, 48, local);
  const totalSpan = width * 2.7;
  const tearGap = impact * width * (0.9 + dropKick * 0.2);
  const jolt = Math.sin(globalTime * 85) * dropKick * 10;
  const downwardTilt = lerp(2, 24, impact) + dropKick * 22;
  const lineOffsets = [-30, 0, 32];

  for (let i = 0; i < lineOffsets.length; i += 1) {
    const offset = lineOffsets[i];
    const layerY = lineY + offset * (1 - impact * 0.24) + jolt;
    const layerThickness = thickness * (1 - Math.abs(offset) * 0.0036);
    const layerGap = tearGap * (1 + Math.abs(offset) * 0.012);
    const alpha = (255 - Math.abs(offset) * 3.4) * scene2Mix;

    const leftInnerX = -layerGap * 0.5;
    const leftOuterX = leftInnerX - totalSpan;
    const rightInnerX = layerGap * 0.5;
    const rightOuterX = rightInnerX + totalSpan;
    const innerY = layerY - downwardTilt * 0.12;
    const outerY = layerY + downwardTilt * (0.55 + Math.abs(offset) * 0.004);

    fillHex(PALETTE.white, alpha);
    drawSegmentRect(leftOuterX, outerY, leftInnerX, innerY, layerThickness);
    drawSegmentRect(rightInnerX, innerY, rightOuterX, outerY, layerThickness);

    const toothSize = layerThickness * (0.42 + impact * 0.95);
    drawShadowedJaggedTriangle(
      leftInnerX,
      innerY + downwardTilt * 0.08,
      toothSize,
      -PI * 0.06,
      0.78,
      PALETTE.yellow,
      alpha * 0.92,
      1 + impact * 0.4
    );
    drawShadowedJaggedTriangle(
      rightInnerX,
      innerY + downwardTilt * 0.08,
      toothSize,
      PI * 1.06,
      0.78,
      PALETTE.yellow,
      alpha * 0.92,
      1 + impact * 0.4
    );
  }

  if (hero.y > lineY - thickness * 0.85) {
    fillHex(PALETTE.black, 235 * impact);
    rect(0, lineY, thickness * 0.7, thickness * (1.75 + impact * 0.45));
  }

  return {
    lineY,
    impact,
    dropKick,
    eject,
  };
}

function drawSceneTwoSplash(scene2Mix, lineState, hero) {
  const impact = lineState.impact;

  if (impact <= 0.001) {
    return;
  }

  const centerX = hero ? hero.x : 0;
  const centerY = hero ? hero.y : lineState.lineY;
  const anchorSize = hero ? hero.size : Math.min(width, height) * 0.22;

  const monochromeFlash =
    smoothStep(0.08, 0.32, impact) * (1 - smoothStep(0.4, 0.56, impact)) * scene2Mix;
  if (monochromeFlash > 0.01) {
    drawMonochromeFlash(monochromeFlash);
  }

  const lightningBurst = smoothStep(0.54, 0.97, impact);
  if (lightningBurst > 0.001) {
    if (globalTime - lastImpactShakeTime > 0.06) {
      addShake(0.06 + lightningBurst * 0.14);
      lastImpactShakeTime = globalTime;
    }

    const lightningIntensity = scene2Mix * (0.86 + lineState.dropKick * 0.7);
    drawDiagonalImpactBolts(
      centerX,
      centerY,
      lightningBurst,
      lightningIntensity,
      anchorSize
    );
  }
}

function drawSceneThreeRecursive(hero, scene3Mix) {
  if (smoothProgress < SCENE_2_END + 0.002) {
    return;
  }

  const local = smoothStep(SCENE_2_END, SCENE_3_END, smoothProgress);
  const depthFloat = local * 7.4;

  const rootY = 0;
  const rootSize = hero.size * (0.95 + local * 0.08);
  const rootRotation = hero.rotation + Math.sin(globalTime * 1.1) * 0.02;

  const shards = [];
  collectFracturePieces(0, rootY, rootSize, rootRotation, 0, depthFloat, shards);

  const transitionPulse = Math.sin(smoothStep(0.56, 0.9, local) * PI);
  const collapseMix = smoothStep(0.8, 1.0, local);

  const splitShock = smoothStep(0.04, 0.98, local) * (0.35 + transitionPulse * 0.95);
  if (splitShock > 0.001) {
    if (globalTime - lastSplitShakeTime > 0.08) {
      addShake(0.05 + splitShock * 0.11);
      lastSplitShakeTime = globalTime;
    }

    drawSplitRiftBurst(0, rootY, rootSize, rootRotation, splitShock, transitionPulse);
  }

  const tones = [PALETTE.pink, PALETTE.blue, PALETTE.teal, PALETTE.white];

  for (let i = 0; i < shards.length; i += 1) {
    const shard = shards[i];
    const shardAlpha = shard.alphaScale * (1 - collapseMix * 0.46);
    if (shardAlpha <= 0.001) {
      continue;
    }

    const relX = shard.x;
    const relY = shard.y - rootY;
    const expandScale = 1 + transitionPulse * (0.48 + shard.depth * 0.026);

    const expandedX = relX * expandScale;
    const expandedY = relY * expandScale;

    const drawX = lerp(expandedX, 0, collapseMix);
    const drawY = rootY + lerp(expandedY, 0, collapseMix);
    const sizeScale = lerp(1 + transitionPulse * 0.24, 0.24, collapseMix);
    const drawSize = shard.size * sizeScale;
    if (drawSize < 2) {
      continue;
    }

    const shade = tones[(shard.depth + (shard.side > 0 ? 1 : 0)) % tones.length];
    const alpha = 255 * shardAlpha;
    fillHex(shade, alpha);

    if (shard.side === 0) {
      drawJaggedTriangle(
        drawX,
        drawY,
        drawSize,
        shard.rotation,
        0.08 + transitionPulse * 0.08
      );
    } else {
      drawFractureHalf(
        drawX,
        drawY,
        drawSize,
        shard.rotation,
        shard.side,
        0.13 + transitionPulse * 0.06
      );
      fillHex(PALETTE.black, Math.min(255, alpha * (0.84 + shard.seamMix * 0.25)));
      const seamShift =
        Math.cos(shard.rotation + HALF_PI) * shard.side * drawSize * (0.022 + shard.seamMix * 0.014);
      drawSegmentRect(
        drawX + seamShift,
        drawY - drawSize * 0.34,
        drawX + seamShift,
        drawY + drawSize * 0.21,
        drawSize * 0.03
      );
    }
  }
}

function collectFracturePieces(
  x,
  y,
  size,
  rotation,
  depth,
  depthFloat,
  output
) {
  if (size < 3 || depth > 9) {
    return;
  }

  const splitProgress = constrain(depthFloat - depth, 0, 1);
  if (splitProgress <= 0.001) {
    output.push({
      x,
      y,
      size,
      rotation,
      depth,
      side: 0,
      alphaScale: 1,
      seamMix: 0,
    });
    return;
  }

  const splitEase = smoothStep(0, 1, splitProgress);
  const splitAxis = rotation + (depth % 2 === 0 ? HALF_PI : 0);
  const spreadBase = Math.max(size * 0.14, size * (0.3 - depth * 0.016));
  const spread = spreadBase * (0.18 + splitEase * 1.08);
  const offsetX = Math.cos(splitAxis) * spread;
  const offsetY = Math.sin(splitAxis) * spread * 0.42;
  const twist = (0.06 + depth * 0.015) * splitEase;
  const childSize = size * lerp(0.98, 0.62, smoothStep(0.32, 1, splitEase));

  const parentAlpha = 1 - smoothStep(0.45, 0.92, splitProgress);
  if (parentAlpha > 0.02) {
    output.push({
      x,
      y,
      size,
      rotation,
      depth,
      side: 0,
      alphaScale: parentAlpha,
      seamMix: splitEase,
    });
  }

  const nextDepthProgress = depthFloat - (depth + 1);
  const pairAlpha = 1 - smoothStep(0.18, 0.92, nextDepthProgress);
  if (pairAlpha > 0.02) {
    output.push({
      x: x - offsetX,
      y: y - offsetY,
      size: childSize,
      rotation: rotation - twist,
      depth: depth + 1,
      side: -1,
      alphaScale: pairAlpha,
      seamMix: splitEase,
    });

    output.push({
      x: x + offsetX,
      y: y + offsetY,
      size: childSize,
      rotation: rotation + twist,
      depth: depth + 1,
      side: 1,
      alphaScale: pairAlpha,
      seamMix: splitEase,
    });
  }

  if (depth < 8 && nextDepthProgress > 0.001) {
    collectFracturePieces(
      x - offsetX,
      y - offsetY,
      childSize,
      rotation - twist,
      depth + 1,
      depthFloat,
      output
    );

    collectFracturePieces(
      x + offsetX,
      y + offsetY,
      childSize,
      rotation + twist,
      depth + 1,
      depthFloat,
      output
    );
  }
}

function drawFractureHalf(x, y, size, rotation, side, jagAmount) {
  const jitter = size * jagAmount;
  const hand = side < 0 ? -1 : 1;

  push();
  translate(x, y);
  rotate(rotation);

  triangle(
    (noise(size * 0.01, globalTime * 0.82) - 0.5) * jitter,
    -size * 0.58 + (noise(size * 0.02, globalTime * 0.93) - 0.5) * jitter,
    hand * size * 0.56 + (noise(size * 0.03, globalTime * 1.04) - 0.5) * jitter,
    size * 0.46 + (noise(size * 0.04, globalTime * 1.15) - 0.5) * jitter,
    hand * size * 0.06 + (noise(size * 0.05, globalTime * 1.26) - 0.5) * jitter,
    size * 0.06 + (noise(size * 0.06, globalTime * 1.37) - 0.5) * jitter
  );

  pop();
}

function drawMicroTriangleField(scene4Mix, scene5Mix) {
  const drive = Math.max(scene4Mix, scene5Mix);
  const fallScale = lerp(0.55, 2.4, drive) + constrain(Math.max(scrollVelocity, 0) * 1.4, 0, 3);
  const fieldHeight = height * 3.6;

  const samples = [];

  for (let i = 0; i < microTriangles.length; i += 1) {
    const tri = microTriangles[i];
    const y =
      wrapValue(
        tri.baseY + globalTime * tri.speed * fallScale + smoothProgress * height * 2.3,
        -fieldHeight,
        fieldHeight
      ) + Math.sin(globalTime * tri.wave + tri.phase) * tri.drift;

    const x =
      tri.baseX +
      Math.sin(globalTime * tri.wave + tri.phase) * tri.drift * 0.65 +
      (noise(tri.seed, globalTime * 0.3) - 0.5) * tri.drift;

    const alpha = (56 + drive * 170) * tri.alphaScale;
    fillHex(tri.color, alpha);

    drawJaggedTriangle(
      x,
      y,
      tri.size * (0.7 + scene5Mix * 0.45),
      tri.rotation + globalTime * tri.spin,
      tri.jag
    );

    if (scene5Mix > 0.01 && i % 2 === 0) {
      samples.push({
        x,
        y,
        radius: tri.size * 0.46,
      });
    }
  }

  return samples;
}

function drawEcosystemCircles(scene4Mix, scene5Mix, microSamples, dt) {
  const visibility = Math.max(scene4Mix, scene5Mix);
  const dtScale = dt * 60;
  let maxStress = 0;

  for (let i = 0; i < ecosystemCircles.length; i += 1) {
    const circleData = ecosystemCircles[i];
    if (circleData.hitCooldown > 0) {
      circleData.hitCooldown -= dtScale;
    }

    processDelayedCircleDamage(circleData);

    const pendingState = getPendingDamageState(circleData);
    const anticipationBoost = pendingState.fatalPending
      ? map(constrain(1 - pendingState.soonestDelay / 1.3, 0, 1), 0, 1, 0.05, 0.2)
      : map(constrain(1 - pendingState.soonestDelay / 0.8, 0, 1), 0, 1, 0.02, 0.08);

    const panicDamage = circleData.dead
      ? 1
      : Math.min(1, circleData.damage + pendingState.queuedDamage + anticipationBoost);

    if (panicDamage > maxStress) {
      maxStress = panicDamage;
    }

    const panic = circleData.dead
      ? 0
      : smoothStep(0.58, circleData.deadThreshold, panicDamage);

    const motionSlowdown = circleData.dead ? 0.06 : lerp(1.0, 0.64, circleData.damage);
    const noiseSpeed = circleData.baseNoiseSpeed * (circleData.dead ? 0.2 : 1 + panic * 4.2);
    const wobble = circleData.baseWobble * (circleData.dead ? 0.18 : 0.8 + panic * 2.1);

    let targetX =
      map(noise(circleData.seedX, globalTime * noiseSpeed), 0, 1, -width * 0.98, width * 0.98) +
      Math.sin(globalTime * 0.52 + circleData.seedX) * wobble;

    let targetY =
      map(noise(circleData.seedY, globalTime * noiseSpeed), 0, 1, -height * 0.72, height * 0.8) +
      Math.cos(globalTime * 0.46 + circleData.seedY) * wobble;

    if (!circleData.dead) {
      const panicSpeed = 4.0 + panic * 18.0;
      const panicJitter =
        panic *
        (10 + panic * 55) *
        (1 + constrain(Math.max(scrollVelocity, 0) * 0.35, 0, 2.5));

      targetX += (noise(circleData.seedX + 42.4, globalTime * panicSpeed) - 0.5) * panicJitter;
      targetY += (noise(circleData.seedY + 73.2, globalTime * panicSpeed) - 0.5) * panicJitter;
    }

    if (!circleData.isInitialized) {
      circleData.x = targetX;
      circleData.y = targetY;
      circleData.isInitialized = true;
    }

    const response = circleData.dead ? 0.02 : 0.075 + panic * 0.15;
    circleData.x = lerp(circleData.x, targetX, response * motionSlowdown);
    circleData.y = lerp(circleData.y, targetY, response * motionSlowdown);

    if (scene5Mix > 0.01 && microSamples.length > 0) {
      applyCircleCollisions(circleData, microSamples, scene5Mix);
    }

    const radius = circleData.radius * (1 - circleData.damage * 0.12);
    const alphaBase = circleData.dead ? 90 : 100 + visibility * 140;
    const alpha = alphaBase * (1 - circleData.damage * 0.22);

    if (!circleData.dead) {
      const shadowShift = 4 + panic * 12;

      fillHex(PALETTE.white, 255);
      circle(
        circleData.x + shadowShift * 0.52,
        circleData.y + shadowShift * 0.4,
        radius * 2.14
      );

      fillHex(PALETTE.white, 250);
      circle(circleData.x, circleData.y, radius * 2.08);

      fillHex(circleData.color, alpha);
      circle(circleData.x, circleData.y, radius * 1.92);
    } else {
      fillHex("#3A3A3A", 226);
      circle(circleData.x, circleData.y, radius * 2.02);

      fillHex("#1A1A1A", 236);
      circle(circleData.x, circleData.y, radius * 1.82);

      fillHex(PALETTE.black, 96 + visibility * 62);
      circle(circleData.x, circleData.y, radius * 1.56);

      drawCircleDeathBurst(circleData, visibility);
    }

    updateAndDrawCircleFragments(circleData, dtScale);
    updateAndDrawCircleCracks(circleData, dtScale);
    drawPermanentCircleCracks(circleData);
  }

  circleStressLevel = lerp(circleStressLevel, maxStress, 0.1);
}

function getPendingDamageState(circleData) {
  let queuedDamage = 0;
  let fatalPending = false;
  let soonestDelay = Infinity;

  for (let i = 0; i < circleData.pendingHits.length; i += 1) {
    const pendingHit = circleData.pendingHits[i];
    queuedDamage += pendingHit.damageAmount;
    if (pendingHit.fatal) {
      fatalPending = true;
    }

    const remaining = pendingHit.applyAt - globalTime;
    if (remaining < soonestDelay) {
      soonestDelay = remaining;
    }
  }

  return {
    queuedDamage,
    fatalPending,
    soonestDelay: soonestDelay === Infinity ? 0 : Math.max(0, soonestDelay),
  };
}

function processDelayedCircleDamage(circleData) {
  if (circleData.dead || circleData.pendingHits.length === 0) {
    return;
  }

  for (let i = circleData.pendingHits.length - 1; i >= 0; i -= 1) {
    const pendingHit = circleData.pendingHits[i];
    if (globalTime < pendingHit.applyAt) {
      continue;
    }

    circleData.damage = Math.min(1, circleData.damage + pendingHit.damageAmount);
    addShake(pendingHit.fatal ? 0.16 : 0.11);
    const nearDeath = smoothStep(0.7, circleData.deadThreshold, circleData.damage);

    if (random() < 0.58 || nearDeath > 0.4 || pendingHit.fatal) {
      spawnCircleCrack(circleData, pendingHit.sceneMix);
    }

    if (random() >= 0.58 || nearDeath > 0.5 || pendingHit.fatal) {
      spawnCircleFragments(circleData, pendingHit.sceneMix);
    }

    if (circleData.damage >= circleData.deadThreshold || pendingHit.fatal) {
      markCircleDead(circleData);
    }

    circleData.pendingHits.splice(i, 1);

    if (circleData.dead) {
      circleData.pendingHits.length = 0;
      break;
    }
  }
}

function applyCircleCollisions(circleData, microSamples, scene5Mix) {
  if (circleData.dead) {
    return;
  }

  const collisionRadius = circleData.radius * 0.88;

  let hits = 0;
  for (let i = circleData.id % 3; i < microSamples.length; i += 3) {
    const tri = microSamples[i];
    const dx = tri.x - circleData.x;
    const dy = tri.y - circleData.y;
    const total = collisionRadius + tri.radius;

    if (dx * dx + dy * dy <= total * total) {
      hits += 1;

      if (circleData.hitCooldown <= 0) {
        const damageAmount = 0.05 + scene5Mix * 0.14;
        const pendingState = getPendingDamageState(circleData);
        const projectedDamage = Math.min(
          1,
          circleData.damage + pendingState.queuedDamage + damageAmount
        );
        const fatalQueued = projectedDamage >= circleData.deadThreshold;
        const delaySeconds = fatalQueued ? 0.95 : 0.5;

        circleData.pendingHits.push({
          applyAt: globalTime + delaySeconds,
          damageAmount,
          sceneMix: scene5Mix,
          fatal: fatalQueued,
        });

        circleData.hitCooldown = fatalQueued
          ? 48
          : Math.max(18, 34 - projectedDamage * 16);
      }

      if (hits >= 3) {
        break;
      }
    }
  }
}

function spawnCircleCrack(circleData, scene5Mix) {
  const segmentCount = Math.floor(random(4, 8));
  const baseAngle = random(TWO_PI);

  const points = [];
  let prevX = Math.cos(baseAngle) * circleData.radius * random(0.08, 0.24);
  let prevY = Math.sin(baseAngle) * circleData.radius * random(0.08, 0.24);
  points.push({ x: prevX, y: prevY });

  for (let i = 0; i < segmentCount; i += 1) {
    const branchAngle = baseAngle + random(-0.95, 0.95) + i * random(0.12, 0.24);
    const reach = map(i, 0, segmentCount - 1, circleData.radius * 0.16, circleData.radius * 0.96);
    prevX = Math.cos(branchAngle) * reach;
    prevY = Math.sin(branchAngle) * reach;
    points.push({ x: prevX, y: prevY });
  }

  circleData.cracks.push({
    points,
    thickness: random(2.8, 6.3) * (1 + scene5Mix * 0.5),
    life: random(42, 86),
    maxLife: random(42, 86),
  });

  trimList(circleData.cracks, 42);
}

function markCircleDead(circleData) {
  if (circleData.dead) {
    return;
  }

  addShake(0.24);

  circleData.dead = true;
  circleData.damage = 1;
  circleData.hitCooldown = 0;
  circleData.pendingHits = [];
  circleData.permanentCracks = [];
  circleData.deathFxStart = globalTime;
  circleData.deathFxDuration = random(1.35, 2.05);
  circleData.deathFxPrimary = PALETTE.yellow;
  circleData.deathFxSecondary = PALETTE.white;

  const crackCount = Math.floor(map(circleData.radius, 90, 230, 7, 13));
  for (let i = 0; i < crackCount; i += 1) {
    const segmentCount = Math.floor(random(4, 10));
    const baseAngle = random(TWO_PI);
    const points = [];

    points.push({ x: 0, y: 0 });
    for (let s = 0; s < segmentCount; s += 1) {
      const branchAngle = baseAngle + random(-0.65, 0.65) + s * random(0.1, 0.22);
      const reach = map(
        s,
        0,
        segmentCount - 1,
        circleData.radius * 0.08,
        circleData.radius * random(0.82, 1.0)
      );
      points.push({
        x: Math.cos(branchAngle) * reach,
        y: Math.sin(branchAngle) * reach,
      });
    }

    circleData.permanentCracks.push({
      points,
      thickness: random(2.5, 7.5),
    });
  }

  spawnCircleFragments(circleData, 1);
  spawnCircleFragments(circleData, 1);
}

function updateAndDrawCircleCracks(circleData, dtScale) {
  for (let i = circleData.cracks.length - 1; i >= 0; i -= 1) {
    const crack = circleData.cracks[i];
    crack.life -= 0.9 * dtScale;

    const lifeMix = constrain(crack.life / crack.maxLife, 0, 1);
    if (lifeMix <= 0) {
      circleData.cracks.splice(i, 1);
      continue;
    }

    fillHex(PALETTE.black, 220 * lifeMix);
    for (let p = 0; p < crack.points.length - 1; p += 1) {
      const a = crack.points[p];
      const b = crack.points[p + 1];

      drawSegmentRect(
        circleData.x + a.x,
        circleData.y + a.y,
        circleData.x + b.x,
        circleData.y + b.y,
        crack.thickness * lifeMix
      );

      if (p % 2 === 0) {
        const chipSize = crack.thickness * (1.2 + random(0.3, 1.1));
        drawJaggedTriangle(
          circleData.x + b.x,
          circleData.y + b.y,
          chipSize,
          random(-PI, PI),
          0.7
        );
      }
    }
  }
}

function drawPermanentCircleCracks(circleData) {
  if (!circleData.dead || circleData.permanentCracks.length === 0) {
    return;
  }

  fillHex(PALETTE.black, 228);

  for (let i = 0; i < circleData.permanentCracks.length; i += 1) {
    const crack = circleData.permanentCracks[i];
    for (let p = 0; p < crack.points.length - 1; p += 1) {
      const a = crack.points[p];
      const b = crack.points[p + 1];

      drawSegmentRect(
        circleData.x + a.x,
        circleData.y + a.y,
        circleData.x + b.x,
        circleData.y + b.y,
        crack.thickness
      );

      circle(
        circleData.x + b.x,
        circleData.y + b.y,
        crack.thickness * 0.56
      );
    }
  }
}

function spawnCircleFragments(circleData, scene5Mix) {
  const count = Math.floor(random(2, 6));

  for (let i = 0; i < count; i += 1) {
    const angle = random(TWO_PI);
    const speed = random(2.0, 5.5) * (1 + scene5Mix * 0.9);
    circleData.fragments.push({
      x: circleData.x + Math.cos(angle) * circleData.radius,
      y: circleData.y + Math.sin(angle) * circleData.radius,
      vx: Math.cos(angle) * speed + random(-0.8, 0.8),
      vy: Math.sin(angle) * speed + random(-0.8, 0.8),
      size: random(circleData.radius * 0.05, circleData.radius * 0.14),
      life: random(42, 96),
      maxLife: random(42, 96),
      color: circleData.color,
      spin: random(-0.12, 0.12),
      angle: random(TWO_PI),
    });
  }

  trimList(circleData.fragments, 120);
}

function updateAndDrawCircleFragments(circleData, dtScale) {
  for (let i = circleData.fragments.length - 1; i >= 0; i -= 1) {
    const fragment = circleData.fragments[i];
    fragment.life -= 1.05 * dtScale;

    const lifeMix = constrain(fragment.life / fragment.maxLife, 0, 1);
    if (lifeMix <= 0) {
      circleData.fragments.splice(i, 1);
      continue;
    }

    fragment.x += fragment.vx * dtScale;
    fragment.y += fragment.vy * dtScale;
    fragment.vy += 0.05 * dtScale;
    fragment.angle += fragment.spin * dtScale;

    fillHex(fragment.color, 220 * lifeMix);
    circle(fragment.x, fragment.y, fragment.size * (0.5 + lifeMix));

    fillHex(PALETTE.black, 180 * lifeMix);
    drawJaggedTriangle(
      fragment.x + fragment.size * 0.2,
      fragment.y,
      fragment.size * 0.45,
      fragment.angle,
      0.7
    );
  }
}

function drawHeroTriangle(hero, scene1Mix, scene2Mix, scene3Mix) {
  if (smoothProgress >= SCENE_2_END + 0.002) {
    return;
  }

  const visibility =
    constrain(scene1Mix + scene2Mix, 0, 1) *
    (1 - smoothStep(SCENE_3_END, SCENE_4_END + 0.04, smoothProgress));

  if (visibility <= 0.001) {
    return;
  }

  const shadowReach = hero.size * (0.05 + scene2Mix * 0.08 + scene3Mix * 0.04);

  fillHex(PALETTE.white, 255 * visibility);
  drawJaggedTriangle(
    hero.x + shadowReach * 0.45,
    hero.y + shadowReach * 0.35,
    hero.size * 1.02,
    hero.rotation,
    0.12
  );

  fillHex(PALETTE.pink, 255 * visibility);
  drawJaggedTriangle(hero.x, hero.y, hero.size, hero.rotation, 0.1);

  fillHex(PALETTE.white, 110 * visibility);
  drawJaggedTriangle(
    hero.x + hero.size * 0.05,
    hero.y + hero.size * 0.07,
    hero.size * 0.22,
    hero.rotation + 0.2,
    0.24
  );
}

function initializeMicroTriangles() {
  microTriangles = [];

  const spanX = width * 2.8;
  const spanY = height * 3.8;
  const tones = [PALETTE.pink, PALETTE.yellow, PALETTE.blue, PALETTE.teal, PALETTE.white];

  for (let i = 0; i < MICRO_TRIANGLE_COUNT; i += 1) {
    microTriangles.push({
      baseX: random(-spanX, spanX),
      baseY: random(-spanY, spanY),
      size: random(4, 15),
      speed: random(18, 110),
      wave: random(0.24, 1.8),
      drift: random(8, 72),
      phase: random(TWO_PI),
      rotation: random(-PI, PI),
      spin: random(-0.08, 0.08),
      jag: random(0.04, 0.28),
      seed: random(1000),
      alphaScale: random(0.7, 1.15),
      color: tones[Math.floor(random(tones.length))],
    });
  }
}

function initializeCircles() {
  ecosystemCircles = [];
  const tones = ["#FF179A", "#2E64FF", "#FF58C9", "#5A92FF", "#FF2EC0", "#194DDB"];

  for (let i = 0; i < CIRCLE_COUNT; i += 1) {
    const baseNoiseSpeed = random(0.08, 0.22);
    const baseWobble = random(8, 34);

    ecosystemCircles.push({
      id: i,
      x: 0,
      y: 0,
      radius: random(90, 230),
      color: tones[i % tones.length],
      seedX: random(1000),
      seedY: random(1000),
      baseNoiseSpeed,
      baseWobble,
      damage: 0,
      deadThreshold: random(0.86, 0.95),
      dead: false,
      isInitialized: false,
      hitCooldown: 0,
      pendingHits: [],
      cracks: [],
      fragments: [],
      permanentCracks: [],
      deathFxStart: -100,
      deathFxDuration: random(1.35, 2.05),
      deathFxPrimary: PALETTE.yellow,
      deathFxSecondary: PALETTE.white,
    });
  }
}

function initializeSplashPieces() {
  splashPieces = [];

  for (let i = 0; i < 92; i += 1) {
    const points = [];
    const vertexCount = Math.floor(random(5, 9));

    for (let v = 0; v < vertexCount; v += 1) {
      const angle = map(v, 0, vertexCount, 0, TWO_PI) + random(-0.32, 0.32);
      const radius = random(8, 34) * (v % 2 === 0 ? 1.5 : 0.72);
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    const tintRoll = random();
    let tint = PALETTE.black;
    if (tintRoll > 0.62 && tintRoll <= 0.84) {
      tint = PALETTE.pink;
    } else if (tintRoll > 0.84 && tintRoll <= 0.95) {
      tint = PALETTE.yellow;
    } else if (tintRoll > 0.95) {
      tint = PALETTE.white;
    }

    splashPieces.push({
      points,
      angle: random(TWO_PI),
      speed: random(40, 190),
      baseDistance: random(2, 28),
      spin: random(-1.3, 1.3),
      scale: random(0.3, 1.2),
      tint,
    });
  }
}

function initializeBoltTexture() {
  const texSize = 512;
  const texture = createGraphics(texSize, texSize);
  texture.pixelDensity(1);
  texture.background(244, 243, 238);
  texture.noStroke();

  for (let i = 0; i < 1800; i += 1) {
    const x = random(texSize);
    const y = random(texSize);
    const w = random(2, 16);
    const h = random(1, 3.5);
    const shade = random(18, 62);
    texture.fill(shade, shade, shade, random(18, 84));
    texture.rect(x, y, w, h);
  }

  for (let row = 0; row < 42; row += 1) {
    const y = map(row, 0, 41, 10, texSize - 10);
    const runCount = Math.floor(random(16, 32));

    texture.fill(12, 12, 12, random(46, 112));
    for (let i = 0; i < runCount; i += 1) {
      const blockW = random(8, 34);
      const blockX = random(4, texSize - 40);
      texture.rect(blockX, y + random(-2, 2), blockW, random(1.2, 2.6));
    }

    if (row % 5 === 0) {
      texture.fill(0, 0, 0, random(112, 180));
      texture.rect(random(6, texSize - 66), y - 4, random(22, 56), random(8, 14));
    }
  }

  texture.stroke(0, 0, 0, 30);
  texture.strokeWeight(1);
  for (let i = 0; i < 120; i += 1) {
    const y = random(texSize);
    texture.line(0, y, texSize, y + random(-4, 4));
  }

  boltNewsprintTexture = texture;
}

function initializeSoundSystem() {
  soundPlayers = new Map();

  const entries = Object.entries(SOUND_MANIFEST);
  for (let i = 0; i < entries.length; i += 1) {
    const [name, slot] = entries[i];
    const player = new Audio(slot.src);
    player.preload = "auto";
    player.loop = Boolean(slot.loop);
    player.volume = slot.volume;
    soundPlayers.set(name, player);
  }

  if (!soundsInitialized) {
    window.addEventListener("pointerdown", unlockSoundPlayback, { passive: true });
    window.addEventListener("keydown", unlockSoundPlayback, { passive: true });
    soundsInitialized = true;
  }
}

function unlockSoundPlayback() {
  if (soundsUnlocked) {
    return;
  }

  soundsUnlocked = true;

  soundPlayers.forEach((player) => {
    player.load();
  });

  updateSceneAudio();
}

function playSound(name, options = {}) {
  const slot = SOUND_MANIFEST[name];
  const player = soundPlayers.get(name);
  if (!slot || !player || !soundsUnlocked) {
    return false;
  }

  player.volume = options.volume ?? slot.volume;

  if (slot.loop && !options.restart && !player.paused) {
    return true;
  }

  if (!slot.loop || options.restart) {
    player.currentTime = 0;
  }

  const playAttempt = player.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {});
  }

  return true;
}

function stopSound(name, resetPosition = false) {
  const player = soundPlayers.get(name);
  if (!player) {
    return;
  }

  player.pause();
  if (resetPosition) {
    player.currentTime = 0;
  }
}

function setLoopingSound(name, shouldPlay) {
  const slot = SOUND_MANIFEST[name];
  if (!slot || !slot.loop) {
    return;
  }

  if (shouldPlay) {
    playSound(name);
  } else {
    stopSound(name);
  }
}

function updateSceneAudio() {
  const inSplitScene =
    smoothProgress >= SCENE_2_END + 0.002 && smoothProgress < SCENE_3_END + 0.002;
  const splitLocal = smoothStep(SCENE_2_END, SCENE_3_END, smoothProgress);

  if (inSplitScene && !splitSceneWasActive) {
    splitBreakSoundPlayed = false;
    splitTransitionDingPlayed = false;
  }

  if (inSplitScene) {
    setLoopingSound("storm", true);

    if (!splitBreakSoundPlayed && splitLocal >= 0.06) {
      playSound("pasta", { restart: true });
      splitBreakSoundPlayed = true;
    }

    if (!splitTransitionDingPlayed && splitLocal >= 0.78) {
      playSound("ding", { restart: true });
      splitTransitionDingPlayed = true;
    }
  } else {
    setLoopingSound("storm", false);

    if (splitSceneWasActive) {
      splitBreakSoundPlayed = false;
      splitTransitionDingPlayed = false;
    }
  }

  splitSceneWasActive = inSplitScene;
}

function addShake(amount) {
  shakeTrauma = Math.min(1.25, shakeTrauma + amount);
}

function handleCanvasInteraction() {
  unlockSoundPlayback();

  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return false;
  }

  const world = screenToWorld(mouseX, mouseY);
  let anchorX = world.x;
  let anchorY = world.y;
  let targetCircle = null;

  for (let i = 0; i < ecosystemCircles.length; i += 1) {
    const circleData = ecosystemCircles[i];
    const radius = circleData.radius * (1 - circleData.damage * 0.12);
    const dx = world.x - circleData.x;
    const dy = world.y - circleData.y;
    if (dx * dx + dy * dy <= radius * radius) {
      targetCircle = circleData;
      anchorX = circleData.x;
      anchorY = circleData.y;
      break;
    }
  }

  if (targetCircle && !targetCircle.dead) {
    targetCircle.pendingHits.push({
      applyAt: globalTime + 0.08,
      damageAmount: 0.08,
      sceneMix: 1,
      fatal: false,
    });
  }

  spawnInteractionTriangle(anchorX, anchorY, targetCircle ? targetCircle.color : null);
  addShake(targetCircle ? 0.2 : 0.12);
  return false;
}

function screenToWorld(screenX, screenY) {
  const localX = (screenX - width * 0.5) / latestCameraState.zoom;
  const localY = (screenY - height * 0.5) / latestCameraState.zoom;

  return {
    x: localX - latestCameraState.offsetX,
    y: localY - latestCameraState.offsetY,
  };
}

function spawnInteractionTriangle(x, y, preferredColor = null) {
  const tones = [PALETTE.pink, PALETTE.blue, PALETTE.teal, PALETTE.white];
  const angle = random(TWO_PI);
  const speed = random(8.6, 15.4);
  const size = random(18, 42);

  interactionTriangles.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    life: random(30, 54),
    maxLife: random(30, 54),
    rotation: random(-PI, PI),
    spin: random(-0.18, 0.18),
    color: preferredColor || tones[Math.floor(random(tones.length))],
  });

  trimList(interactionTriangles, 140);
}

function updateAndDrawInteractionTriangles(dt) {
  const dtScale = dt * 60;

  for (let i = interactionTriangles.length - 1; i >= 0; i -= 1) {
    const tri = interactionTriangles[i];
    tri.life -= 1.3 * dtScale;

    const lifeMix = constrain(tri.life / tri.maxLife, 0, 1);
    if (lifeMix <= 0) {
      interactionTriangles.splice(i, 1);
      continue;
    }

    tri.x += tri.vx * dtScale;
    tri.y += tri.vy * dtScale;
    tri.vy += 0.04 * dtScale;
    tri.rotation += tri.spin * dtScale;

    fillHex(PALETTE.white, 255 * lifeMix);
    drawJaggedTriangle(
      tri.x + tri.size * 0.2,
      tri.y + tri.size * 0.16,
      tri.size * (0.98 + lifeMix * 0.2),
      tri.rotation,
      0.16
    );

    fillHex(tri.color, 236 * lifeMix);
    drawJaggedTriangle(tri.x, tri.y, tri.size, tri.rotation, 0.14);
  }
}

function drawPunkTextOverlays(scene2Mix, scene3Mix, scene5Mix, scene2Shock) {
  const jitter = shakeTrauma * 24;
  const jitterX = (noise(globalTime * 14.8, 81.1) - 0.5) * jitter;
  const jitterY = (noise(globalTime * 13.7, 29.3) - 0.5) * jitter;

  if (scene2Mix > 0.08) {
    const alpha = constrain(scene2Shock * 1.9 + scene2Mix * 0.54, 0, 1);
    drawPunkLabel(
      "IMPACT",
      width * 0.22 + jitterX,
      height * 0.18 + jitterY,
      82,
      alpha,
      PALETTE.pink,
      PALETTE.white
    );
  }

  if (scene3Mix > 0.1) {
    const alpha = constrain(scene3Mix * 0.96 + shakeTrauma * 0.36, 0, 1);
    drawPunkLabel(
      "RIP APART",
      width * 0.77 - jitterX * 0.62,
      height * 0.22 + jitterY * 0.4,
      68,
      alpha,
      PALETTE.blue,
      PALETTE.white
    );
  }

  if (scene5Mix > 0.06 && circleStressLevel > 0.09) {
    const alpha = constrain(circleStressLevel * 1.25 + shakeTrauma * 0.32, 0, 1);
    drawPunkLabel(
      "SYSTEM PANIC",
      width * 0.5 + jitterX * 0.35,
      height * 0.86 - jitterY * 0.2,
      62,
      alpha,
      PALETTE.black,
      PALETTE.white
    );
  }
}

function drawPunkLabel(label, x, y, size, intensity, paintColor, textColor) {
  if (intensity <= 0.001) {
    return;
  }

  const paintWidth = size * (label.length * 0.56);
  const paintHeight = size * 1.22;
  drawPaintBlob(x, y, paintWidth, paintHeight, paintColor, intensity);

  push();
  translate(x, y);
  rotate((noise(label.length, globalTime * 0.8) - 0.5) * 0.14);
  textAlign(CENTER, CENTER);
  textFont("Impact");
  textSize(size);
  fillHex(textColor, 255 * intensity);
  text(label, 0, 0);
  pop();
}

function drawPaintBlob(x, y, w, h, paintColor, intensity) {
  push();
  translate(x, y);
  rotate((noise(x * 0.0012, y * 0.0014 + globalTime * 0.4) - 0.5) * 0.28);

  fillHex(paintColor, 212 * intensity);
  beginShape();
  const points = 14;
  for (let i = 0; i < points; i += 1) {
    const angle = map(i, 0, points, 0, TWO_PI);
    const radiusX =
      w * 0.5 * (0.72 + noise(i * 0.62 + x * 0.001, globalTime * 0.7) * 0.42);
    const radiusY =
      h * 0.5 * (0.66 + noise(i * 0.57 + y * 0.001, globalTime * 0.7 + 11.3) * 0.44);
    vertex(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY);
  }
  endShape(CLOSE);

  fillHex(PALETTE.black, 72 * intensity);
  rect(0, h * 0.06, w * 0.7, h * 0.15);

  fillHex(PALETTE.white, 86 * intensity);
  rect(-w * 0.2, -h * 0.19, w * 0.24, h * 0.11);
  pop();
}

function drawJaggedTriangle(x, y, size, rotation, jagAmount) {
  const jitter = size * jagAmount;

  push();
  translate(x, y);
  rotate(rotation);

  triangle(
    0 + (noise(size * 0.01, globalTime * 0.6) - 0.5) * jitter,
    -size * 0.58 + (noise(size * 0.02, globalTime * 0.7) - 0.5) * jitter,
    -size * 0.52 + (noise(size * 0.03, globalTime * 0.8) - 0.5) * jitter,
    size * 0.42 + (noise(size * 0.04, globalTime * 0.9) - 0.5) * jitter,
    size * 0.54 + (noise(size * 0.05, globalTime * 1.0) - 0.5) * jitter,
    size * 0.46 + (noise(size * 0.06, globalTime * 1.1) - 0.5) * jitter
  );

  pop();
}

function drawShadowedJaggedTriangle(
  x,
  y,
  size,
  rotation,
  jagAmount,
  fillColor,
  alpha,
  depthScale = 1
) {
  const shadowReach = size * (0.08 + depthScale * 0.05);
  const shadowX = Math.cos(rotation + PI * 0.2) * shadowReach;
  const shadowY = Math.sin(rotation + PI * 0.2) * shadowReach;

  fillHex(PALETTE.white, alpha * 0.92);
  drawJaggedTriangle(x + shadowX * 0.52, y + shadowY * 0.52, size * 1.02, rotation, jagAmount);

  fillHex(PALETTE.yellow, alpha * 0.84);
  drawJaggedTriangle(x + shadowX, y + shadowY, size * 1.02, rotation, jagAmount);

  fillHex(fillColor, alpha);
  drawJaggedTriangle(x, y, size, rotation, jagAmount);
}

function drawImpactFrame(x, y, frameWidth, frameHeight, intensity, highlightColor, shadowColor) {
  if (intensity <= 0.001) {
    return;
  }

  const quake = intensity * (1 + constrain(Math.max(scrollVelocity, 0) * 0.28, 0, 1.5));
  const wobble = Math.sin(globalTime * 46 + x * 0.01) * frameHeight * 0.02 * quake;
  const thickness = Math.max(6, Math.min(frameWidth, frameHeight) * (0.07 + intensity * 0.04));

  push();
  translate(x, y + wobble);
  rotate(Math.sin(globalTime * 36 + y * 0.01) * 0.045 * quake);

  fillHex(shadowColor, 210 * intensity);
  drawFrameBands(frameWidth * 1.08, frameHeight * 1.06, thickness * 1.26);

  fillHex(highlightColor, 240 * intensity);
  drawFrameBands(frameWidth, frameHeight, thickness * 0.86);

  fillHex(shadowColor, 160 * intensity);
  drawFrameBands(frameWidth * 0.86, frameHeight * 0.84, thickness * 0.26);
  pop();
}

function drawMonochromeFlash(intensity) {
  if (intensity <= 0.001) {
    return;
  }

  fillHex(PALETTE.white, 228 + intensity * 24);
  rect(0, 0, width * 4, height * 4);
}

function drawDiagonalImpactBolts(centerX, centerY, travelMix, intensity, anchorSize) {
  if (intensity <= 0.001) {
    return;
  }

  const diagonalAngles = [-PI * 0.25, PI * 0.25, PI * 0.75, -PI * 0.75];
  const maxTravel = Math.min(width, height) * 0.46;

  for (let i = 0; i < diagonalAngles.length; i += 1) {
    const drift = (noise(i * 8.31 + 19.2, globalTime * 0.92) - 0.5) * 0.2;
    const angle = diagonalAngles[i] + drift;
    const startRadius = anchorSize * (0.28 + noise(i * 2.41, globalTime * 0.4) * 0.2);
    const startX = centerX + Math.cos(angle) * startRadius;
    const startY = centerY + Math.sin(angle) * startRadius * 0.9;

    const travel = lerp(anchorSize * 0.35, maxTravel * (0.84 + i * 0.05), travelMix);
    const x = startX + Math.cos(angle) * travel;
    const y = startY + Math.sin(angle) * travel;

    const length =
      anchorSize * (0.86 + noise(i * 3.13 + 44.1, globalTime * 0.8) * 0.4) +
      travel * 0.54;
    const thickness = Math.max(8, anchorSize * (0.076 + i * 0.01));
    const alpha = (220 + intensity * 35) * (0.92 + travelMix * 0.2);

    drawLightningBolt(
      x,
      y,
      angle + HALF_PI * 0.08,
      length,
      thickness,
      alpha,
      PALETTE.yellow,
      200 + i * 37,
      0.95
    );
  }
}

function drawLightningBurst(centerX, centerY, travelMix, intensity, boltCount, boltColor) {
  if (intensity <= 0.001 || boltCount <= 0) {
    return;
  }

  const maxRadius = Math.min(width, height) * (0.26 + travelMix * 1.02);

  for (let i = 0; i < boltCount; i += 1) {
    const k = i / Math.max(1, boltCount - 1);
    const drift = noise(i * 2.17, globalTime * 0.84) - 0.5;
    const punkSkew = (i % 2 === 0 ? -1 : 1) * (0.08 + noise(i * 1.37, globalTime * 0.9) * 0.22);
    const angle = TWO_PI * k + globalTime * 0.26 + drift * 1.05 + punkSkew;
    const reachNoise = 0.78 + noise(i * 0.72 + 32.1, globalTime * 1.1) * 0.68;
    const reach = lerp(18, maxRadius * (0.48 + k * 0.72), travelMix) * reachNoise;
    const x = centerX + Math.cos(angle) * reach;
    const y = centerY + Math.sin(angle) * reach * 0.82;
    const length = (28 + (1 - k) * 98) * (0.74 + intensity * 0.95);
    const thickness = Math.max(4.5, length * (0.085 + noise(i * 0.9, globalTime * 0.9) * 0.08));
    const alpha = (120 + intensity * 150) * (1 - k * 0.55);

    drawLightningBolt(
      x,
      y,
      angle + HALF_PI * (0.1 + punkSkew * 0.4) + drift * 0.22,
      length,
      thickness,
      alpha,
      boltColor,
      i,
      0.5
    );
  }
}

function drawLightningBolt(
  x,
  y,
  angle,
  length,
  thickness,
  alpha,
  boltColor,
  variant = 0,
  textureStrength = 0.6
) {
  push();
  translate(x, y);
  rotate(angle);

  const sway =
    Math.sin(globalTime * 21 + x * 0.013 + y * 0.009 + variant * 0.21) * thickness * 0.18;
  const boltPoints = buildLightningBoltShape(length, thickness, variant, sway);

  fillHex(PALETTE.black, alpha * 0.82);
  drawBoltPolygon(boltPoints, -thickness * 0.56, thickness * 0.16);

  fillHex(PALETTE.pink, alpha * 0.6);
  drawBoltPolygon(boltPoints, -thickness * 0.24, thickness * 0.08);

  fillHex(boltColor, alpha);
  drawBoltPolygon(boltPoints);

  drawBoltNewsprintTexture(
    boltPoints,
    length,
    thickness,
    alpha,
    variant,
    textureStrength
  );

  fillHex(PALETTE.white, alpha * 0.3);
  rect(thickness * 0.18, -length * 0.3, thickness * 0.92, length * 0.08);
  rect(-thickness * 0.22, -length * 0.64, thickness * 0.6, length * 0.07);

  fillHex(PALETTE.black, alpha * 0.22);
  rect(thickness * 0.09, -length * 0.14, thickness * 0.42, length * 0.06);
  rect(-thickness * 0.1, -length * 0.44, thickness * 0.38, length * 0.05);

  pop();
}

function buildLightningBoltShape(length, thickness, variant, sway) {
  const tipSkew = (noise(variant * 2.01 + 40.4, globalTime * 0.78) - 0.5) * thickness * 0.9;
  const shoulder = 1.78 + (noise(variant * 2.67 + 92.1, globalTime * 0.5) - 0.5) * 0.62;
  const foldA = 0.2 + (noise(variant * 1.33 + 15.8, globalTime * 0.62) - 0.5) * 0.09;
  const foldB = 0.54 + (noise(variant * 1.73 + 76.2, globalTime * 0.64) - 0.5) * 0.11;
  const foldC = 0.9 + (noise(variant * 1.93 + 33.4, globalTime * 0.66) - 0.5) * 0.08;

  return [
    { x: -thickness * shoulder, y: thickness * 0.1 + sway * 0.6 },
    { x: thickness * 1.24, y: -length * foldA + sway * 0.2 },
    { x: -thickness * 0.08, y: -length * foldA },
    { x: thickness * (1.05 + shoulder * 0.08), y: -length * foldB },
    { x: thickness * 0.22, y: -length * foldB },
    { x: thickness * 0.66 + tipSkew, y: -length * foldC },
    { x: thickness * 0.14 + tipSkew * 0.55, y: -length },
    { x: -thickness * 0.98, y: -length * (foldB - 0.03) },
    { x: thickness * 0.06, y: -length * (foldB - 0.03) },
  ];
}

function drawBoltPolygon(points, offsetX = 0, offsetY = 0) {
  beginShape();
  for (let i = 0; i < points.length; i += 1) {
    vertex(points[i].x + offsetX, points[i].y + offsetY);
  }
  endShape(CLOSE);
}

function drawBoltNewsprintTexture(points, length, thickness, alpha, variant, textureStrength) {
  if (textureStrength <= 0.001) {
    return;
  }

  const ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.clip();

  if (boltNewsprintTexture && boltNewsprintTexture.width > 0) {
    imageMode(CENTER);
    tint(255, alpha * (0.56 + textureStrength * 0.24));
    const texW = length * (0.5 + textureStrength * 0.46);
    const texH = length * (0.86 + textureStrength * 0.34);
    const driftX = (noise(variant * 0.62, globalTime * 0.44) - 0.5) * thickness * 1.2;
    const driftY = (noise(variant * 0.79 + 11.4, globalTime * 0.44) - 0.5) * thickness * 0.9;
    image(boltNewsprintTexture, driftX, -length * 0.52 + driftY, texW, texH);
    noTint();
  }

  const stripCount = 6;
  for (let i = 0; i < stripCount; i += 1) {
    const k = i / Math.max(1, stripCount - 1);
    const y = -length * (0.16 + k * 0.74);
    const lineWidth =
      thickness * (0.66 + noise(variant * 1.2 + i * 4.1, globalTime * 0.92) * 1.6);
    const lineOffsetX =
      (noise(variant * 2.3 + i * 7.7, globalTime * 0.58) - 0.5) * thickness * 0.68;

    fillHex(PALETTE.black, alpha * (0.16 + textureStrength * 0.24));
    rect(lineOffsetX, y, lineWidth, thickness * 0.15);

    if (i % 2 === 0) {
      fillHex(PALETTE.white, alpha * (0.1 + textureStrength * 0.16));
      rect(
        lineOffsetX - thickness * 0.08,
        y - thickness * 0.12,
        lineWidth * 0.48,
        thickness * 0.09
      );
    }
  }

  ctx.restore();
}

function drawSplitRiftBurst(centerX, centerY, baseSize, rotation, intensity, transitionMix = 0) {
  if (intensity <= 0.001) {
    return;
  }

  const burstCount = Math.floor(10 + intensity * 16);
  const burstReach = baseSize * (0.36 + intensity * 1.04 + transitionMix * 0.22);

  for (let i = 0; i < burstCount; i += 1) {
    const k = i / Math.max(1, burstCount - 1);
    const angle = rotation + TWO_PI * k + (noise(i * 0.73, globalTime * 0.7) - 0.5) * 0.5;
    const reach = burstReach * (0.38 + noise(i * 1.9 + 7.4, globalTime * 0.62) * 0.86);
    const shardX = centerX + Math.cos(angle) * reach;
    const shardY = centerY + Math.sin(angle) * reach;
    const shardSize = baseSize * (0.08 + noise(i * 1.7 + 19.1, globalTime * 0.55) * 0.18);

    fillHex(PALETTE.white, 225 * intensity);
    drawJaggedTriangle(
      shardX + Math.cos(angle + 0.35) * shardSize * 0.14,
      shardY + Math.sin(angle + 0.35) * shardSize * 0.14,
      shardSize * 1.06,
      angle + HALF_PI,
      0.2
    );

    fillHex(PALETTE.pink, 188 * intensity);
    drawJaggedTriangle(shardX, shardY, shardSize, angle + HALF_PI, 0.16);
  }

  fillHex(PALETTE.black, 210 * intensity);
  drawJaggedTriangle(
    centerX,
    centerY,
    baseSize * (0.2 + transitionMix * 0.08),
    rotation,
    0.22
  );

  const patchCount = Math.floor(8 + intensity * 6);
  for (let i = 0; i < patchCount; i += 1) {
    const k = i / Math.max(1, patchCount - 1);
    const angle = rotation + TWO_PI * k;
    const drift = noise(i * 0.9 + 21.4, globalTime * 0.52) - 0.5;
    const reach = burstReach * (0.2 + k * 0.5 + drift * 0.08);
    const x = centerX + Math.cos(angle) * reach;
    const y = centerY + Math.sin(angle) * reach;
    drawNewsprintPatch(
      x,
      y,
      baseSize * (0.12 + noise(i * 1.4 + 4.6, globalTime * 0.65) * 0.08),
      baseSize * 0.04,
      angle + drift * 0.5,
      120 * intensity,
      PALETTE.white
    );
  }
}

function drawSplitSpike(centerX, centerY, angle, length, width, intensity) {
  const wobble = Math.sin(globalTime * 9 + angle * 3.4) * width * 0.22;

  push();
  translate(centerX, centerY);
  rotate(angle);

  fillHex(PALETTE.black, 188 * intensity);
  beginShape();
  vertex(-width * 1.26, wobble);
  vertex(width * 1.36, wobble * 0.5);
  vertex(width * 0.66, -length * 0.36);
  vertex(width * 0.9, -length);
  vertex(-width * 0.68, -length * 0.7);
  vertex(-width * 0.34, -length * 0.26);
  endShape(CLOSE);

  fillHex(PALETTE.pink, 214 * intensity);
  beginShape();
  vertex(-width * 0.84, wobble * 0.8);
  vertex(width * 0.98, wobble * 0.3);
  vertex(width * 0.44, -length * 0.34);
  vertex(width * 0.52, -length * 0.92);
  vertex(-width * 0.5, -length * 0.66);
  vertex(-width * 0.2, -length * 0.26);
  endShape(CLOSE);

  fillHex(PALETTE.yellow, 132 * intensity);
  triangle(
    width * 0.12,
    -length * 0.18,
    width * 0.54,
    -length * 0.62,
    -width * 0.08,
    -length * 0.52
  );

  fillHex(PALETTE.black, 95 * intensity);
  rect(width * 0.1, -length * 0.28, width * 0.32, length * 0.08);
  rect(-width * 0.06, -length * 0.56, width * 0.24, length * 0.06);

  pop();
}

function drawFrameBands(frameWidth, frameHeight, thickness) {
  rect(0, -frameHeight * 0.5, frameWidth, thickness);
  rect(0, frameHeight * 0.5, frameWidth, thickness);
  rect(-frameWidth * 0.5, 0, thickness, frameHeight);
  rect(frameWidth * 0.5, 0, thickness, frameHeight);
}

function drawNewsprintPatch(x, y, patchWidth, patchHeight, rotation, alpha, tintColor) {
  push();
  translate(x, y);
  rotate(rotation);

  fillHex(tintColor, alpha * 0.78);
  rect(0, 0, patchWidth, patchHeight);

  const rowCount = 5;
  for (let r = 0; r < rowCount; r += 1) {
    const k = r / Math.max(1, rowCount - 1);
    const lineY = lerp(-patchHeight * 0.34, patchHeight * 0.34, k);
    const widthNoise = 0.62 + noise(x * 0.013 + r * 3.1, y * 0.011 + globalTime * 0.26) * 0.32;

    fillHex(PALETTE.black, alpha * 0.42);
    rect(
      (noise(r * 11.2, x * 0.009 + y * 0.01) - 0.5) * patchWidth * 0.08,
      lineY,
      patchWidth * widthNoise,
      patchHeight * 0.1
    );
  }

  fillHex(PALETTE.white, alpha * 0.22);
  rect(-patchWidth * 0.22, -patchHeight * 0.22, patchWidth * 0.18, patchHeight * 0.14);
  pop();
}

function drawOutwardNewsprintArrows(
  centerX,
  centerY,
  travelMix,
  intensity,
  baseColor,
  overlayColor,
  extraCount = 0
) {
  if (intensity <= 0.001) {
    return;
  }

  const arrowCount = Math.floor(9 + intensity * 16 + extraCount);
  const maxRadius = Math.min(width, height) * (0.28 + travelMix * 0.72);

  for (let i = 0; i < arrowCount; i += 1) {
    const k = i / Math.max(1, arrowCount - 1);
    const spin = i % 2 === 0 ? -0.16 : 0.16;
    const drift = noise(i * 2.2, globalTime * 0.6) - 0.5;
    const angle = TWO_PI * k + globalTime * 0.16 + drift * 0.35;
    const reach = lerp(26, maxRadius * (0.56 + k * 0.54), travelMix);
    const x = centerX + Math.cos(angle) * reach;
    const y = centerY + Math.sin(angle) * reach * 0.82;
    const size = (12 + (1 - k) * 38) * (0.65 + intensity * 0.75);
    const alpha = (110 + intensity * 160) * (1 - k * 0.64);

    drawShadowedJaggedTriangle(
      x,
      y,
      size,
      angle + spin,
      0.6,
      baseColor,
      alpha,
      1 + intensity * 0.35
    );

    if (i % 3 === 0) {
      const patchRot = angle + HALF_PI * (i % 2 === 0 ? 1 : -1) + drift * 0.3;
      drawNewsprintPatch(
        x + Math.cos(angle) * size * 0.26,
        y + Math.sin(angle) * size * 0.26,
        size * (2.3 + k * 0.35),
        size * 0.7,
        patchRot,
        alpha * 0.65,
        overlayColor
      );
    }
  }
}

function drawCircleDeathBurst(circleData, visibility) {
  const elapsed = globalTime - circleData.deathFxStart;
  if (elapsed < 0) {
    return;
  }

  const lifeMix = constrain(elapsed / circleData.deathFxDuration, 0, 1);
  const activeMix = 1 - lifeMix;
  if (activeMix <= 0.001) {
    return;
  }

  const boltTravel = smoothStep(0.06, 1.0, lifeMix);
  const boltIntensity = activeMix * (0.8 + visibility * 0.5);
  const boltCount = Math.floor(18 + circleData.radius * 0.12);

  drawLightningBurst(
    circleData.x,
    circleData.y,
    boltTravel,
    boltIntensity,
    boltCount,
    PALETTE.yellow
  );
}

function drawSegmentRect(x1, y1, x2, y2, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  push();
  translate((x1 + x2) * 0.5, (y1 + y2) * 0.5);
  rotate(angle);
  rect(0, 0, length, thickness);
  pop();
}

function fillHex(hex, alpha) {
  const swatch = color(hex);
  swatch.setAlpha(alpha);
  fill(swatch);
}

function scene2ImpactPulse(progress) {
  const local = smoothStep(SCENE_1_END, SCENE_2_END, progress);
  const rise = smoothStep(0.36, 0.56, local);
  const decay = 1 - smoothStep(0.58, 0.84, local);
  return constrain(rise * decay, 0, 1);
}

function bandMix(progress, start, end, feather) {
  const fadeIn = smoothStep(start, start + feather, progress);
  const fadeOut = 1 - smoothStep(end - feather, end, progress);
  return constrain(fadeIn * fadeOut, 0, 1);
}

function smoothStep(edge0, edge1, x) {
  const t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function easeOutQuart(t) {
  const inv = 1 - t;
  return 1 - inv * inv * inv * inv;
}

function wrapValue(value, minValue, maxValue) {
  const range = maxValue - minValue;
  let wrapped = (value - minValue) % range;
  if (wrapped < 0) {
    wrapped += range;
  }
  return wrapped + minValue;
}

function trimList(list, maxLength) {
  while (list.length > maxLength) {
    list.shift();
  }
}