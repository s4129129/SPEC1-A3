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

let globalTime = 0;
let rawProgress = 0;
let smoothProgress = 0;
let previousRawProgress = 0;
let scrollVelocity = 0;

let microTriangles = [];
let ecosystemCircles = [];
let splashPieces = [];

function setup() {
  ensureScrollSpace();

  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("art-stage");
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeMicroTriangles();
  initializeCircles();
}

function draw() {
  const dt = constrain(deltaTime / 1000, 1 / 200, 1 / 25);
  globalTime += dt;

  updateScrollProgress(dt);

  background(PALETTE.black);

  const hero = computeHeroState();
  const camera = computeCameraState(hero);

  const scene1Mix = bandMix(smoothProgress, 0.0, 0.24, 0.06);
  const scene2Mix = bandMix(smoothProgress, 0.18, 0.44, 0.06);
  const scene3Mix = bandMix(smoothProgress, 0.38, 0.7, 0.08);
  const scene4Mix = bandMix(smoothProgress, 0.58, 0.9, 0.08);
  const scene5Mix = smoothStep(0.8, 1.0, smoothProgress);
  const scene2Shock = scene2ImpactPulse(smoothProgress);

  push();
  translate(width * 0.5, height * 0.5);

  const shake =
    (scene2Mix * 0.52 + scene2Shock * 2.9 + scene5Mix * 0.6) *
    (0.42 + constrain(Math.max(scrollVelocity, 0) * 0.3, 0, 3.2));
  translate(
    Math.sin(globalTime * 49.0) * shake,
    Math.cos(globalTime * 39.0) * shake
  );

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
    drawSceneTwoSplash(scene2Mix, lineState);
  }

  if (scene3Mix > 0.001) {
    drawSceneThreeRecursive(hero, scene3Mix);
  }

  drawHeroTriangle(hero, scene1Mix, scene2Mix, scene3Mix);

  pop();
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
  const lineOffsets = [-30, 0, 32];

  for (let i = 0; i < lineOffsets.length; i += 1) {
    const offset = lineOffsets[i];
    const layerY = lineY + offset * (1 - impact * 0.24) + jolt;
    const layerThickness = thickness * (1 - Math.abs(offset) * 0.0036);
    const layerGap = tearGap * (1 + Math.abs(offset) * 0.012);
    const alpha = (255 - Math.abs(offset) * 3.4) * scene2Mix;

    fillHex(PALETTE.white, alpha);
    rect(-layerGap * 0.5 - totalSpan * 0.5, layerY, totalSpan, layerThickness);
    rect(layerGap * 0.5 + totalSpan * 0.5, layerY, totalSpan, layerThickness);

    fillHex(PALETTE.yellow, alpha * 0.75);
    drawJaggedTriangle(
      -layerGap * 0.5,
      layerY,
      layerThickness * (0.42 + impact * 0.95),
      -PI * 0.06,
      0.78
    );
    drawJaggedTriangle(
      layerGap * 0.5,
      layerY,
      layerThickness * (0.42 + impact * 0.95),
      PI * 1.06,
      0.78
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

function drawSceneTwoSplash(scene2Mix, lineState) {
  const impact = lineState.impact;

  if (impact <= 0.001) {
    return;
  }

  const centerY = lineState.lineY;
  const shockScale =
    1 +
    lineState.dropKick * 3.0 +
    lineState.eject * 1.4 +
    constrain(Math.max(scrollVelocity, 0) * 3.8, 0, 5.5);

  for (let i = 0; i < splashPieces.length; i += 1) {
    const piece = splashPieces[i];
    const travel = piece.baseDistance + impact * piece.speed * shockScale;
    const x = Math.cos(piece.angle) * travel;
    const y =
      centerY +
      Math.sin(piece.angle) * travel * (0.55 + impact * 0.9) +
      lineState.dropKick * height * 0.08;
    const scaleFactor = piece.scale * (0.4 + impact * 1.5);
    const rotation = piece.spin * impact * 2.6 + globalTime * piece.spin * 0.55;

    push();
    translate(x, y);
    rotate(rotation);
    fillHex(piece.tint, (1 - impact * 0.32) * 255 * scene2Mix);

    beginShape();
    for (let p = 0; p < piece.points.length; p += 1) {
      const point = piece.points[p];
      vertex(point.x * scaleFactor, point.y * scaleFactor);
    }
    endShape(CLOSE);
    pop();
  }

  const vectorCount = Math.floor(18 + impact * 34);
  for (let i = 0; i < vectorCount; i += 1) {
    const k = i / Math.max(1, vectorCount - 1);
    const angle = TWO_PI * k + globalTime * 0.35;
    const reach = impact * impact * width * (0.4 + k * 0.4) * (0.6 + lineState.dropKick * 1.4);
    const x = Math.cos(angle) * reach;
    const y = centerY + Math.sin(angle) * reach;
    const size = (10 + impact * 42) * (0.7 + (1 - k) * 0.8);

    const tint = i % 4 === 0 ? PALETTE.pink : i % 3 === 0 ? PALETTE.yellow : PALETTE.white;
    fillHex(tint, 220 * scene2Mix * (1 - k * 0.6));
    drawJaggedTriangle(x, y, size, angle, 0.55);

    fillHex(PALETTE.black, 190 * scene2Mix * (1 - k * 0.5));
    rect(x * 0.78, centerY + (y - centerY) * 0.78, size * 1.6, size * 0.18);
  }
}

function drawSceneThreeRecursive(hero, scene3Mix) {
  if (smoothProgress < SCENE_2_END + 0.002) {
    return;
  }

  const local = smoothStep(SCENE_2_END, SCENE_3_END, smoothProgress);
  const depthFloat = local * 7.8;
  const settledDepth = Math.floor(depthFloat);
  const splitMix = depthFloat - settledDepth;

  const rootY = 0;
  const rootSize = hero.size * (0.95 + local * 0.06);
  const rootRotation = hero.rotation + Math.sin(globalTime * 1.1) * 0.02;

  const shards = [];
  collectFracturePieces(
    0,
    rootY,
    rootSize,
    rootRotation,
    0,
    settledDepth,
    splitMix,
    0,
    shards
  );

  const tones = [PALETTE.pink, PALETTE.yellow, PALETTE.blue, PALETTE.teal, PALETTE.white];

  for (let i = 0; i < shards.length; i += 1) {
    const shard = shards[i];

    const centerPull = constrain(local * shard.depth * 0.022, 0, 0.18);
    const drawX = lerp(shard.x, 0, centerPull);
    const drawY = lerp(shard.y, rootY, centerPull * 1.1);

    const shade = tones[(shard.depth + (shard.side > 0 ? 1 : 0)) % tones.length];
    const alpha = 255;
    fillHex(shade, alpha);

    if (shard.side === 0) {
      drawJaggedTriangle(drawX, drawY, shard.size, shard.rotation, 0.08);
    } else {
      drawFractureHalf(drawX, drawY, shard.size, shard.rotation, shard.side, 0.14);
      fillHex(PALETTE.black, 255);
      drawSegmentRect(
        drawX + Math.cos(shard.rotation + HALF_PI) * shard.side * shard.size * 0.02,
        drawY - shard.size * 0.34,
        drawX + Math.cos(shard.rotation + HALF_PI) * shard.side * shard.size * 0.02,
        drawY + shard.size * 0.21,
        shard.size * 0.028
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
  settledDepth,
  splitMix,
  side,
  output
) {
  if (size < 3) {
    return;
  }

  if (depth > settledDepth) {
    return;
  }

  if (depth === settledDepth) {
    if (splitMix <= 0.001) {
      output.push({ x, y, size, rotation, depth, side });
      return;
    }

    const childSize = size * 0.62;
    const splitAxis = rotation + (depth % 2 === 0 ? HALF_PI : 0);
    const spread = Math.max(size * 0.14, size * (0.34 - depth * 0.018));
    const offsetX = Math.cos(splitAxis) * spread * splitMix;
    const offsetY = Math.sin(splitAxis) * spread * splitMix * 0.36;
    const twist = (0.16 + depth * 0.014) * splitMix;

    output.push({
      x: x - offsetX,
      y: y - offsetY,
      size: childSize,
      rotation: rotation - twist,
      depth: depth + 1,
      side: -1,
    });

    output.push({
      x: x + offsetX,
      y: y + offsetY,
      size: childSize,
      rotation: rotation + twist,
      depth: depth + 1,
      side: 1,
    });

    return;
  }

  const childSize = size * 0.62;
  const splitAxis = rotation + (depth % 2 === 0 ? HALF_PI : 0);
  const spread = Math.max(size * 0.14, size * (0.34 - depth * 0.018));
  const offsetX = Math.cos(splitAxis) * spread;
  const offsetY = Math.sin(splitAxis) * spread * 0.36;
  const twist = 0.16 + depth * 0.014;

  collectFracturePieces(
    x - offsetX,
    y - offsetY,
    childSize,
    rotation - twist,
    depth + 1,
    settledDepth,
    splitMix,
    -1,
    output
  );

  collectFracturePieces(
    x + offsetX,
    y + offsetY,
    childSize,
    rotation + twist,
    depth + 1,
    settledDepth,
    splitMix,
    1,
    output
  );
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

    fillHex(circleData.color, alpha);
    circle(circleData.x, circleData.y, radius * 2);

    if (circleData.dead) {
      fillHex(PALETTE.black, 80 + visibility * 40);
      circle(circleData.x, circleData.y, radius * 1.72);
    }

    updateAndDrawCircleFragments(circleData, dtScale);
    updateAndDrawCircleCracks(circleData, dtScale);
    drawPermanentCircleCracks(circleData);
  }
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

  circleData.dead = true;
  circleData.damage = 1;
  circleData.hitCooldown = 0;
  circleData.pendingHits = [];
  circleData.permanentCracks = [];

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

  for (let i = 0; i < CIRCLE_COUNT; i += 1) {
    const baseNoiseSpeed = random(0.08, 0.22);
    const baseWobble = random(8, 34);

    ecosystemCircles.push({
      id: i,
      x: 0,
      y: 0,
      radius: random(90, 230),
      color: i % 2 === 0 ? PALETTE.white : PALETTE.teal,
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