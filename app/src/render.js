// VICEFRAME Studio — poster renderer.
// One drawing routine powers both the live preview canvas and the PNG
// export, so what the editor shows is exactly what gets downloaded.

import { gradeById } from './grades.js';

const INK = '#14101f';
const PAPER = '#fff6e9';

function drawPhotoInPanel(ctx, image, rect, transform, filter) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rect.tilt * Math.PI) / 180);
  ctx.beginPath();
  ctx.rect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
  ctx.clip();
  ctx.rotate((transform.rotate * Math.PI) / 180);
  const scale = Math.max(rect.w / image.width, rect.h / image.height) * transform.zoom;
  const drawW = image.width * scale;
  const drawH = image.height * scale;
  const dx = -drawW / 2 + transform.panX * rect.w;
  const dy = -drawH / 2 + transform.panY * rect.h;
  ctx.filter = filter;
  ctx.drawImage(image, dx, dy, drawW, drawH);
  ctx.filter = 'none';
  ctx.restore();
}

function strokePanelBorders(ctx, panels, unit) {
  ctx.save();
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = unit * 0.008;
  for (const panelState of panels) {
    const rect = panelState.rectPx;
    ctx.save();
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate((rect.tilt * Math.PI) / 180);
    ctx.strokeRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
    ctx.restore();
  }
  ctx.restore();
}

function drawSunRays(ctx, width, height, glowColour) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = glowColour;
  const cx = width * 0.5;
  const cy = height * 0.34;
  const radius = Math.max(width, height) * 0.95;
  for (let i = 0; i < 12; i += 1) {
    const a0 = (i / 12) * Math.PI * 2;
    const a1 = a0 + 0.16;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawPalmSilhouette(ctx, x, y, size, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip * size, size);
  ctx.fillStyle = 'rgba(10, 8, 24, 0.88)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -34, 16, -58);
  ctx.lineTo(21, -57);
  ctx.quadraticCurveTo(12, -32, 9, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(10, 8, 24, 0.88)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const fronds = [
    [-30, -66], [-16, -76], [2, -80], [20, -74], [32, -60], [-38, -50],
  ];
  for (const [fx, fy] of fronds) {
    ctx.beginPath();
    ctx.moveTo(18, -58);
    ctx.quadraticCurveTo(18 + fx * 0.5, -58 + (fy + 58) * 0.6 - 8, 18 + fx, fy + 14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHalftoneDots(ctx, width, height, unit) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 246, 233, 0.20)';
  const gap = unit * 0.045;
  const radius = unit * 0.008;
  for (let y = gap; y < height; y += gap) {
    for (let x = gap; x < width; x += gap) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawFilmGrain(ctx, width, height, unit) {
  ctx.save();
  const seed = 1234567;
  let value = seed;
  const next = () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
  const dots = Math.floor(unit * 2.4);
  for (let i = 0; i < dots; i += 1) {
    const alpha = next() * 0.09;
    ctx.fillStyle = next() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(next() * width, next() * height, unit * 0.0022, unit * 0.0022);
  }
  ctx.restore();
}

function drawVignette(ctx, width, height) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.78,
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(5,2,16,0.52)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawRibbonBanner(ctx, width, height, unit) {
  const bannerH = unit * 0.075;
  const y = height * 0.045;
  ctx.save();
  ctx.fillStyle = '#e91e63';
  ctx.beginPath();
  ctx.moveTo(width * 0.16, y);
  ctx.lineTo(width * 0.84, y);
  ctx.lineTo(width * 0.80, y + bannerH / 2);
  ctx.lineTo(width * 0.84, y + bannerH);
  ctx.lineTo(width * 0.16, y + bannerH);
  ctx.lineTo(width * 0.20, y + bannerH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.font = `700 ${unit * 0.034}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ VICEFRAME ORIGINAL POSTER ★', width / 2, y + bannerH / 2 + unit * 0.002);
  ctx.restore();
}

function drawStarMeter(ctx, width, height, unit, rating) {
  const size = unit * 0.045;
  const gap = unit * 0.014;
  const totalW = size * 5 + gap * 4;
  const startX = width / 2 - totalW / 2;
  const y = height - unit * 0.205;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px sans-serif`;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < rating ? '#ffd740' : 'rgba(255,255,255,0.35)';
    ctx.fillText('★', startX + size / 2 + i * (size + gap), y);
  }
  ctx.restore();
}

function drawCaptionBlock(ctx, width, height, unit, state) {
  const title = (state.title || 'UNTITLED').toUpperCase();
  ctx.save();
  ctx.textAlign = 'center';
  let titleSize = unit * 0.105;
  ctx.font = `${titleSize}px Anton, sans-serif`;
  const maxW = width * 0.92;
  while (ctx.measureText(title).width > maxW && titleSize > unit * 0.03) {
    titleSize *= 0.92;
    ctx.font = `${titleSize}px Anton, sans-serif`;
  }
  const titleY = height - unit * 0.115;
  ctx.lineWidth = unit * 0.016;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.strokeText(title, width / 2, titleY);
  const gradient = ctx.createLinearGradient(0, titleY - titleSize / 2, 0, titleY + titleSize / 2);
  gradient.addColorStop(0, '#ffe082');
  gradient.addColorStop(0.55, '#ff7043');
  gradient.addColorStop(1, '#e91e63');
  ctx.fillStyle = gradient;
  ctx.fillText(title, width / 2, titleY);
  if (state.subtitle) {
    ctx.font = `${unit * 0.042}px Pacifico, cursive`;
    ctx.fillStyle = PAPER;
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = unit * 0.012;
    ctx.fillText(state.subtitle, width / 2, height - unit * 0.048);
  }
  ctx.restore();
}

export function renderPoster(ctx, width, height, state, photos) {
  const unit = Math.min(width, height);
  const grade = gradeById(state.gradeId);
  ctx.save();
  ctx.fillStyle = '#1a0b2e';
  ctx.fillRect(0, 0, width, height);

  for (const panelState of state.panels) {
    panelState.rectPx = {
      x: panelState.rect.x * width,
      y: panelState.rect.y * height,
      w: panelState.rect.w * width,
      h: panelState.rect.h * height,
      tilt: panelState.rect.tilt,
    };
  }

  if (state.dressing.rays) drawSunRays(ctx, width, height, grade.skyGlow);

  for (const panelState of state.panels) {
    const image = photos[panelState.photoIndex];
    if (image) {
      drawPhotoInPanel(ctx, image, panelState.rectPx, panelState, grade.imageFilter);
    } else {
      ctx.fillStyle = '#2d1b4e';
      ctx.fillRect(panelState.rectPx.x, panelState.rectPx.y, panelState.rectPx.w, panelState.rectPx.h);
    }
  }

  const wash = ctx.createLinearGradient(0, 0, 0, height);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  strokePanelBorders(ctx, state.panels, unit);
  if (state.dressing.halftone) drawHalftoneDots(ctx, width, height, unit);
  if (state.dressing.palms) {
    drawPalmSilhouette(ctx, width * 0.055, height * 0.99, unit * 0.0035, 1);
    drawPalmSilhouette(ctx, width * 0.945, height * 0.99, unit * 0.003, -1);
  }
  if (state.dressing.grain) drawFilmGrain(ctx, width, height, unit);
  if (state.dressing.vignette) drawVignette(ctx, width, height);
  if (state.dressing.ribbon) drawRibbonBanner(ctx, width, height, unit);
  if (state.dressing.stars) drawStarMeter(ctx, width, height, unit, state.starRating);
  drawCaptionBlock(ctx, width, height, unit, state);
  ctx.restore();
}

export function highlightSelectedPanel(ctx, width, height, state) {
  const panelState = state.panels[state.selectedPanel];
  if (!panelState || !panelState.rectPx) return;
  const rect = panelState.rectPx;
  ctx.save();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.006);
  ctx.setLineDash([14, 8]);
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.rotate((rect.tilt * Math.PI) / 180);
  ctx.strokeRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
  ctx.restore();
}
