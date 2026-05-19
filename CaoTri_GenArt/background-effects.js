// Background texture, smoke, and star helpers.

function initReferencePatternBackdrop() {
  const layer = createGraphics(
    ceil(width * REFERENCE_PATTERN_LAYER_SCALE),
    ceil(height * REFERENCE_PATTERN_LAYER_SCALE)
  );
  const radius = sqrt(layer.width * layer.width + layer.height * layer.height) * 0.5;
  buildBackgroundGrainLayer(layer);

  const sampleCount = min(
    REFERENCE_PATTERN_MAX_POINTS,
    floor(layer.width * layer.height * 0.006)
  );
  layer.strokeWeight(1);
  layer.stroke(255, (30 / 100) * 255);

  for (let i = 0; i < sampleCount; i += 1) {
    const pointRadius = formula(1, radius).value;
    const angle = random(TWO_PI);
    const pointX = layer.width * 0.5 + cos(angle) * pointRadius;
    const pointY = layer.height * 0.5 + sin(angle) * pointRadius;

    layer.point(pointX, pointY);
  }

  return layer;
}

function drawReferencePatternBackdrop() {
  if (!referencePatternNoiseLayer) {
    return;
  }

  push();
  tint(255, REFERENCE_PATTERN_BACKDROP_ALPHA);
  image(referencePatternNoiseLayer, 0, 0, width, height);
  pop();
}

function formula(power, radius) {
  return {
    value: pow(random(), power) * radius,
  };
}

function buildBackgroundGrainLayer(layer) {
  layer.clear();
  layer.noStroke();
  const layerW = layer.width;
  const layerH = layer.height;

  const cloudCount = min(REFERENCE_PATTERN_MAX_CLOUDS, floor(layerW * layerH * 0.000025));
  for (let i = 0; i < cloudCount; i += 1) {
    layer.fill(255, 255, 255, random(2, 8));
    drawSineWaveBlob(
      layer,
      random(layerW),
      random(layerH),
      random(max(14, layerW * 0.02), max(52, layerW * 0.16))
    );
  }

  layer.stroke(255, 255, 255, 12);
  layer.strokeWeight(1);
  const scratchCount = min(REFERENCE_PATTERN_MAX_SCRATCHES, floor(layerW * layerH * 0.00008));
  for (let i = 0; i < scratchCount; i += 1) {
    const x = random(layerW);
    const y = random(layerH);
    const length = random(8, 34);
    const angle = random(TWO_PI);
    layer.line(x, y, x + cos(angle) * length, y + sin(angle) * length);
  }

  const cellCount = min(REFERENCE_PATTERN_MAX_CELLS, floor(layerW * layerH * 0.000006));
  for (let i = 0; i < cellCount; i += 1) {
    const rng = () => random();
    drawCellSineGrainPattern(
      layer,
      random(layerW),
      random(layerH),
      random(max(18, layerW * 0.015), max(42, layerW * 0.08)),
      rng,
      random(8, 22)
    );
  }
}

function drawSineWaveBlob(layer, centerX, centerY, radius) {
  const lobeA = floor(random(3, 9));
  const lobeB = floor(random(7, 15));
  const phaseA = random(TWO_PI);
  const phaseB = random(TWO_PI);
  const stretchX = random(0.75, 1.3);
  const stretchY = random(0.75, 1.3);

  layer.beginShape();
  for (let angle = 0; angle <= TWO_PI + 0.001; angle += 0.18) {
    const wobble = 1
      + sin(angle * lobeA + phaseA) * 0.2
      + sin(angle * lobeB + phaseB) * 0.08;
    layer.vertex(
      centerX + cos(angle) * radius * wobble * stretchX,
      centerY + sin(angle) * radius * wobble * stretchY
    );
  }
  layer.endShape(CLOSE);
}

function drawCellSineGrainPattern(layer, centerX, centerY, radius, rng, alpha) {
  const randRange = (minValue, maxValue) => minValue + rng() * (maxValue - minValue);

  const lobeA = floor(randRange(2, 8.999));
  const lobeB = floor(randRange(4, 12.999));
  const lobeC = floor(randRange(7, 18.999));

  const ampA = randRange(0.06, 0.22);
  const ampB = randRange(0.03, 0.14);
  const ampC = randRange(0.02, 0.1);

  const phaseA = randRange(0, TWO_PI);
  const phaseB = randRange(0, TWO_PI);
  const phaseC = randRange(0, TWO_PI);

  const stretchX = randRange(0.72, 1.34);
  const stretchY = randRange(0.72, 1.34);

  const pointCount = floor(radius * radius * 0.22);
  layer.stroke(255, 255, 255, alpha * 0.4);

  for (let i = 0; i < pointCount; i += 1) {
    const angle = randRange(0, TWO_PI);
    const distance = randRange(0, radius);
    const wobble = 1
      + sin(angle * lobeA + phaseA) * ampA
      + sin(angle * lobeB + phaseB) * ampB
      + sin(angle * lobeC + phaseC) * ampC;
    const px = centerX + cos(angle) * distance * wobble * stretchX;
    const py = centerY + sin(angle) * distance * wobble * stretchY;
    layer.point(px, py);
  }
}

function buildSmokeLayer() {
  const layer = createGraphics(
    ceil((width + SMOKE_PADDING * 2) * SMOKE_LAYER_SCALE),
    ceil((height + SMOKE_PADDING * 2) * SMOKE_LAYER_SCALE)
  );
  layer.noStroke();
  layer.loadPixels();

  const w = layer.width;
  const h = layer.height;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const n = noise(x * SMOKE_SCALE / SMOKE_LAYER_SCALE, y * SMOKE_SCALE / SMOKE_LAYER_SCALE);
      const shade = 120 + n * 80;
      const index = (x + y * w) * 4;
      layer.pixels[index] = shade;
      layer.pixels[index + 1] = shade;
      layer.pixels[index + 2] = shade;
      layer.pixels[index + 3] = 255;
    }
  }

  layer.updatePixels();
  return layer;
}

function drawSmokeBackground() {
  if (!smokeLayer) {
    return;
  }

  const offsetX = smokeOffset.x;
  const offsetY = smokeOffset.y;
  const scaledPadding = SMOKE_PADDING * SMOKE_LAYER_SCALE;
  const sourceW = width * SMOKE_LAYER_SCALE;
  const sourceH = height * SMOKE_LAYER_SCALE;

  push();
  const phaseBlend = SCROLL_PHASES > 1
    ? getContinuousPhase() / (SCROLL_PHASES - 1)
    : 1;
  let smokeAlpha = lerp(SMOKE_ALPHA_MIN, SMOKE_ALPHA_MAX, phaseBlend);
  if (scrollPhase === FINAL_PHASE) {
    smokeAlpha = lerp(smokeAlpha, SMOKE_PATCHED_ALPHA_MIN, getPatchedRatio());
  }
  tint(255, smokeAlpha);
  image(
    smokeLayer,
    0,
    0,
    width,
    height,
    scaledPadding + offsetX * SMOKE_LAYER_SCALE,
    scaledPadding + offsetY * SMOKE_LAYER_SCALE,
    sourceW,
    sourceH
  );
  pop();
}

