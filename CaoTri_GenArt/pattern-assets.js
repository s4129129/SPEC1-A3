// Patterned rectangle and chipped patch helpers.

// Stage 2 patterned rectangles.
function drawStageTwoRects() {
  if (stageTwoRects.length === 0) {
    stageTwoRects = buildStageTwoRects();
  }

  push();
  rectMode(CENTER);
  noStroke();

  const shadowScale = getResponsiveScale(0.55, 1);
  for (const rectData of stageTwoRects) {
    const rectPosition = getCorodeScenePoint(rectData.x, rectData.y);
    fill(255, STAGE_TWO_SHADOW_ALPHA);
    rect(
      rectPosition.x + STAGE_TWO_SHADOW_OFFSET_X * shadowScale,
      rectPosition.y + STAGE_TWO_SHADOW_OFFSET_Y * shadowScale,
      rectData.w,
      rectData.h
    );
    drawPatternRect(rectData, rectPosition.x, rectPosition.y);
  }

  pop();
}

function drawPatternRect(rectData, drawX, drawY, rotation) {
  if (!rectData.patternLayer) {
    rectData.patternLayer = buildPatternRectLayer(rectData);
  }

  const drawScale = rectData.scale ? rectData.scale : 1;
  const x = drawX === undefined ? rectData.x : drawX;
  const y = drawY === undefined ? rectData.y : drawY;
  push();
  translate(x, y);
  rotate(rotation || 0);
  scale(drawScale);
  imageMode(CENTER);
  drawPatternRectImage(rectData, x, y);
  pop();
}

function drawPatternRectImage(rectData, drawX, drawY) {
  const waveAlpha = getCorodeWaveAlpha();
  if (waveAlpha <= 0) {
    image(rectData.patternLayer, 0, 0, rectData.w, rectData.h);
    return;
  }

  const sliceCount = CORODE_PATTERN_WOBBLE_SLICES;
  const sourceSliceH = rectData.patternLayer.height / sliceCount;
  const drawSliceH = rectData.h / sliceCount;
  const time = frameCount * CORODE_PATTERN_WOBBLE_SPEED;
  const amplitude = CORODE_PATTERN_WOBBLE_AMPLITUDE * getCorodeWaveAmount(waveAlpha);

  imageMode(CORNER);
  for (let i = 0; i < sliceCount; i += 1) {
    const sourceY = i * sourceSliceH;
    const drawYLocal = -rectData.h * 0.5 + i * drawSliceH;
    const offsetX = sin(
      (drawY + drawYLocal) * CORODE_PATTERN_WOBBLE_FREQUENCY + time
    ) * amplitude;

    image(
      rectData.patternLayer,
      -rectData.w * 0.5 + offsetX,
      drawYLocal,
      rectData.w,
      drawSliceH + 1,
      0,
      sourceY,
      rectData.patternLayer.width,
      sourceSliceH + 1
    );
  }
}

function buildPatternRectLayer(rectData) {
  const { w, h, pattern, colors } = rectData;
  const layerW = max(1, ceil(w));
  const layerH = max(1, ceil(h));
  const layer = createGraphics(layerW, layerH);
  const patternScale = getPatternScale(w, h);

  layer.push();
  layer.translate(layerW * 0.5, layerH * 0.5);
  layer.rectMode(CENTER);
  layer.noStroke();
  const shapePoints = getRectShapePoints(rectData, w, h);
  layer.fill(colors.base);
  drawRectShape(layer, shapePoints);

  layer.drawingContext.save();
  layer.drawingContext.beginPath();
  addRectShapePath(layer.drawingContext, shapePoints);
  layer.drawingContext.clip();

  if (pattern === "STRIPES") {
    const stripeWidth = PATTERN_STRIPE_WIDTH * patternScale;
    const stripeStep = PATTERN_STRIPE_STEP * patternScale;
    const diag = sqrt(w * w + h * h);
    layer.stroke(colors.accentA);
    layer.strokeWeight(stripeWidth);
    layer.strokeCap(SQUARE);
    for (let px = -diag; px <= diag; px += stripeStep) {
      layer.line(px, -diag, px + diag, diag);
    }
  } else if (pattern === "DOTS") {
    layer.noStroke();
    const step = PATTERN_DOT_STEP * patternScale;
    layer.fill(colors.accentA);
    for (let px = -w / 2; px <= w / 2; px += step) {
      for (let py = -h / 2; py <= h / 2; py += step) {
        layer.ellipse(px, py, PATTERN_DOT_SIZE * patternScale, PATTERN_DOT_SIZE * patternScale);
      }
    }
  } else {
    layer.noStroke();
    const cell = PATTERN_CHECKER_CELL * patternScale;
    const squareSize = PATTERN_CHECKER_SIZE * patternScale;
    for (let px = -w / 2; px <= w / 2; px += cell) {
      for (let py = -h / 2; py <= h / 2; py += cell) {
        const isAlt = (floor((px + w / 2) / cell) + floor((py + h / 2) / cell)) % 2 === 0;
        layer.fill(isAlt ? colors.accentA : colors.accentB);
        layer.rect(px + cell * 0.5, py + cell * 0.5, squareSize, squareSize);
      }
    }
  }

  layer.drawingContext.restore();
  layer.pop();
  return layer;
}

function getRectShapePoints(rectData, rectWidth, rectHeight) {
  if (!rectData.chipCuts || rectData.chipCuts.length === 0) {
    return [
      { x: -rectWidth / 2, y: -rectHeight / 2 },
      { x: rectWidth / 2, y: -rectHeight / 2 },
      { x: rectWidth / 2, y: rectHeight / 2 },
      { x: -rectWidth / 2, y: rectHeight / 2 },
    ];
  }

  return buildChippedRectPoints(rectWidth, rectHeight, rectData.chipCuts);
}

function buildChippedRectPoints(rectWidth, rectHeight, chipCuts) {
  const halfW = rectWidth * 0.5;
  const halfH = rectHeight * 0.5;
  const points = [];

  appendChippedEdge(points, -halfW, -halfH, halfW, -halfH, "top", chipCuts, rectWidth, rectHeight);
  appendChippedEdge(points, halfW, -halfH, halfW, halfH, "right", chipCuts, rectWidth, rectHeight);
  appendChippedEdge(points, halfW, halfH, -halfW, halfH, "bottom", chipCuts, rectWidth, rectHeight);
  appendChippedEdge(points, -halfW, halfH, -halfW, -halfH, "left", chipCuts, rectWidth, rectHeight);

  return points;
}

function appendChippedEdge(points, startX, startY, endX, endY, edge, chipCuts, rectWidth, rectHeight) {
  const edgeLength = edge === "top" || edge === "bottom" ? rectWidth : rectHeight;
  const cuts = chipCuts
    .filter((chip) => chip.edge === edge)
    .sort((a, b) => a.position - b.position);
  const dx = endX - startX;
  const dy = endY - startY;

  addUniquePoint(points, startX, startY);

  for (const chip of cuts) {
    const halfSpan = chip.width * edgeLength * 0.5;
    const depth = chip.depth * min(rectWidth, rectHeight);
    const startAmount = constrain(chip.position - halfSpan / edgeLength, 0, 1);
    const endAmount = constrain(chip.position + halfSpan / edgeLength, 0, 1);
    const midAmount = (startAmount + endAmount) * 0.5;
    const cutStartX = startX + dx * startAmount;
    const cutStartY = startY + dy * startAmount;
    const cutTipX = startX + dx * midAmount + getChipNormalX(edge) * depth;
    const cutTipY = startY + dy * midAmount + getChipNormalY(edge) * depth;
    const cutEndX = startX + dx * endAmount;
    const cutEndY = startY + dy * endAmount;

    addUniquePoint(points, cutStartX, cutStartY);
    addUniquePoint(points, cutTipX, cutTipY);
    addUniquePoint(points, cutEndX, cutEndY);
  }

  addUniquePoint(points, endX, endY);
}

function addUniquePoint(points, x, y) {
  const lastPoint = points[points.length - 1];
  if (lastPoint && abs(lastPoint.x - x) < 0.001 && abs(lastPoint.y - y) < 0.001) {
    return;
  }

  points.push({ x, y });
}

function getChipNormalX(edge) {
  if (edge === "right") {
    return -1;
  }
  if (edge === "left") {
    return 1;
  }
  return 0;
}

function getChipNormalY(edge) {
  if (edge === "top") {
    return 1;
  }
  if (edge === "bottom") {
    return -1;
  }
  return 0;
}

function drawRectShape(target, points) {
  if (!target) {
    beginShape();
    for (const point of points) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
    return;
  }

  target.beginShape();
  for (const point of points) {
    target.vertex(point.x, point.y);
  }
  target.endShape(CLOSE);
}

function addRectShapePath(context, points) {
  if (points.length === 0) {
    return;
  }

  context.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    context.lineTo(points[i].x, points[i].y);
  }
  context.closePath();
}

function getPatternScale(rectWidth, rectHeight) {
  const minSide = min(rectWidth, rectHeight);
  const scale = minSide / STAGE_TWO_RECT_MIN;
  return constrain(scale, 0.5, 1);
}

function buildStageTwoRects() {
  const rects = [];
  const scaleValue = getResponsiveScale(0.45, 1);
  const margin = isPhoneLayout() ? 18 : 40 * scaleValue;
  const patterns = ["STRIPES", "DOTS", "CHECKER"];
  const rectCount = isPhoneLayout() ? max(4, floor(STAGE_TWO_RECT_COUNT * 0.62)) : STAGE_TWO_RECT_COUNT;
  const rectMin = STAGE_TWO_RECT_MIN * scaleValue;
  const rectMax = min(STAGE_TWO_RECT_MAX * scaleValue, width * (isPhoneLayout() ? 0.36 : 0.28));
  const circleRadius = getCircleSize() * 0.5;
  const circleCenter = { x: width / 2, y: height / 2 };
  const maxAttempts = rectCount * 90;
  let attempts = 0;

  while (rects.length < rectCount && attempts < maxAttempts) {
    attempts += 1;
    const w = random(rectMin, max(rectMin + 1, rectMax));
    const h = random(rectMin * 0.7, max(rectMin * 0.8, rectMax * 0.85));
    const minX = margin + w / 2;
    const maxX = width - margin - w / 2;
    const minY = margin + h / 2;
    const maxY = height - margin - h / 2;
    const x = random(minX, max(minX, maxX));
    const y = random(minY, max(minY, maxY));
    const rectRadius = sqrt((w * 0.5) ** 2 + (h * 0.5) ** 2);
    const minDistance = circleRadius + rectRadius + 18 * scaleValue;
    const distance = dist(x, y, circleCenter.x, circleCenter.y);

    if (distance < minDistance) {
      continue;
    }

    let overlaps = false;
    for (const existing of rects) {
      const dx = abs(x - existing.x);
      const dy = abs(y - existing.y);
      const gapX = (w + existing.w) * 0.5 + 14 * scaleValue;
      const gapY = (h + existing.h) * 0.5 + 14 * scaleValue;
      if (dx < gapX && dy < gapY) {
        overlaps = true;
        break;
      }
    }

    if (overlaps) {
      continue;
    }

    const rectData = {
      x,
      y,
      w,
      h,
      pattern: random(patterns),
      colors: pickStageTwoColors(),
    };
    rectData.patternLayer = buildPatternRectLayer(rectData);
    rects.push(rectData);
  }

  return rects;
}

function pickStageTwoColors() {
  const base = random(STAGE_TWO_COLORS);
  let accentA = random(STAGE_TWO_COLORS);
  while (accentA === base) {
    accentA = random(STAGE_TWO_COLORS);
  }

  let accentB = random(STAGE_TWO_COLORS);
  while (accentB === base || accentB === accentA) {
    accentB = random(STAGE_TWO_COLORS);
  }

  return { base, accentA, accentB };
}

function drawPatternRectShadow(rectData, x, y, scaleValue, rotation) {
  const shapePoints = getRectShapePoints(rectData, rectData.w, rectData.h);
  push();
  translate(x, y);
  rotate(rotation || 0);
  scale(scaleValue);
  drawRectShape(null, shapePoints);
  pop();
}

