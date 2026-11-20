// VICEFRAME Studio — poster panel layouts.
// Each layout returns panel rectangles in normalised poster coordinates
// (0..1 on both axes) plus an optional tilt in degrees, so the same layout
// works for the live preview and for every export size.

function panelRect(x, y, w, h, tilt = 0) {
  return { x, y, w, h, tilt };
}

function gridOfThreeByThree() {
  const panels = [];
  const step = 1 / 3;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      panels.push(panelRect(col * step, row * step, step, step));
    }
  }
  return panels;
}

function heroPlusTrio() {
  return [
    panelRect(0, 0, 0.62, 1),
    panelRect(0.62, 0, 0.38, 1 / 3),
    panelRect(0.62, 1 / 3, 0.38, 1 / 3),
    panelRect(0.62, 2 / 3, 0.38, 1 / 3),
  ];
}

function tiltedSnapshots() {
  return [
    panelRect(0.03, 0.05, 0.56, 0.62, -4),
    panelRect(0.47, 0.02, 0.5, 0.5, 3),
    panelRect(0.08, 0.55, 0.48, 0.42, 2),
    panelRect(0.52, 0.48, 0.45, 0.5, -3),
  ];
}

function fullBleed() {
  return [panelRect(0, 0, 1, 1)];
}

function splitDuo() {
  return [
    panelRect(0, 0, 0.52, 1, 0),
    panelRect(0.48, 0, 0.52, 1, 0),
  ];
}

function filmStrip() {
  const panels = [];
  const step = 1 / 4;
  for (let i = 0; i < 4; i += 1) {
    panels.push(panelRect(0, i * step, 1, step));
  }
  return panels;
}

export const POSTER_LAYOUTS = [
  { id: 'grid9', label: 'Grid 3 × 3', buildPanels: gridOfThreeByThree },
  { id: 'hero-trio', label: 'Hero + Trio', buildPanels: heroPlusTrio },
  { id: 'tilted', label: 'Tilted Snaps', buildPanels: tiltedSnapshots },
  { id: 'full-bleed', label: 'Full Bleed', buildPanels: fullBleed },
  { id: 'split-duo', label: 'Split Duo', buildPanels: splitDuo },
  { id: 'film-strip', label: 'Film Strip', buildPanels: filmStrip },
];

export function layoutById(layoutId) {
  return POSTER_LAYOUTS.find((layout) => layout.id === layoutId) ?? POSTER_LAYOUTS[0];
}
