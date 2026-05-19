// Corode phase wave displacement helpers.

function getCorodeWaveAlpha() {
  return getSceneAlpha(1);
}

function getCorodeWaveAmount(alphaValue) {
  if (alphaValue <= 0) {
    return 0;
  }

  return constrain(CORODE_WAVE_BASE + sin(frameCount * CORODE_WAVE_TIME_SPEED) * CORODE_WAVE_DRIFT, 0, 1)
    * alphaValue;
}

function displaceCorodePoint(x, y, alphaValue) {
  const wave = getCorodeWaveAmount(alphaValue);
  if (wave <= 0) {
    return { x, y };
  }

  let px = x;
  let py = y;
  const t = frameCount / 60;
  const ease = wave * wave * 0.5 + wave * 0.5;
  const scaleValue = getResponsiveScale(0.58, 1);

  px += sin(py * 0.0095 + t * 1.1) * ease * CORODE_WAVE_X_AMPLITUDE * scaleValue;
  py += cos(px * 0.0095 + t * 0.65) * ease * CORODE_WAVE_Y_AMPLITUDE * scaleValue;
  px += (py / height - 0.5) * ease * CORODE_WAVE_SHEAR_X * scaleValue;
  py += (px / width - 0.5) * ease * CORODE_WAVE_SHEAR_Y * scaleValue;

  const dx = px - mouseX;
  const dy = py - mouseY;
  const distance = sqrt(dx * dx + dy * dy);
  const mouseRadius = CORODE_WAVE_MOUSE_RADIUS * scaleValue;
  if (corodeMouseHasMoved && distance < mouseRadius && distance > 0.001) {
    const force = (1 - distance / mouseRadius) * CORODE_WAVE_MOUSE_FORCE * scaleValue * alphaValue;
    px += (dx / distance) * force;
    py += (dy / distance) * force;
  }

  return { x: px, y: py };
}

function getCorodeScenePoint(x, y) {
  const alphaValue = getCorodeWaveAlpha();
  if (alphaValue <= 0) {
    return { x, y };
  }

  const displaced = displaceCorodePoint(x, y + currentSceneDrawOffsetY, alphaValue);
  return {
    x: displaced.x,
    y: displaced.y - currentSceneDrawOffsetY,
  };
}

function setCorodeShapeSpace(originX, originY, scaleValue) {
  corodeShapeOriginX = originX;
  corodeShapeOriginY = originY;
  corodeShapeScale = scaleValue;
}

function resetCorodeShapeSpace() {
  corodeShapeOriginX = 0;
  corodeShapeOriginY = 0;
  corodeShapeScale = 1;
}

function vertexWithCorodeWave(x, y) {
  const alphaValue = getCorodeWaveAlpha();
  if (alphaValue <= 0) {
    vertex(x, y);
    return;
  }

  const screenX = corodeShapeOriginX + x * corodeShapeScale;
  const screenY = corodeShapeOriginY + y * corodeShapeScale;
  const displaced = displaceCorodePoint(screenX, screenY, alphaValue);
  vertex(
    (displaced.x - corodeShapeOriginX) / corodeShapeScale,
    (displaced.y - corodeShapeOriginY) / corodeShapeScale
  );
}

function drawEllipseWithCorodeWave(x, y, ellipseW, ellipseH) {
  const alphaValue = getCorodeWaveAlpha();
  if (alphaValue <= 0) {
    ellipse(x, y, ellipseW, ellipseH);
    return;
  }

  beginShape();
  for (let angle = 0; angle <= TWO_PI + 0.001; angle += 0.16) {
    vertexWithCorodeWave(
      x + cos(angle) * ellipseW * 0.5,
      y + sin(angle) * ellipseH * 0.5
    );
  }
  endShape(CLOSE);
}

