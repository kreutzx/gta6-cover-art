// VICEFRAME Studio — editor wiring.
// Loads photos locally (FileReader only, nothing is uploaded), keeps the
// preview canvas in sync with the studio state, and exports PNG posters
// at 1080x1080, 1080x1350 and 1920x1080.

import { POSTER_LAYOUTS } from './layouts.js';
import { COLOUR_GRADES } from './grades.js';
import {
  createStudioState, rebuildPanelsForLayout, assignPhotosRoundRobin, EditHistory,
} from './state.js';
import { renderPoster, highlightSelectedPanel } from './render.js';
import { sceneFromUrl } from './scenes.js';

const EXPORT_SIZES = [
  { id: 'square', label: 'Square 1080 × 1080', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait 1080 × 1350', width: 1080, height: 1350 },
  { id: 'wide', label: 'Wide 1920 × 1080', width: 1920, height: 1080 },
];

const SAMPLE_PHOTOS = [
  { src: 'samples/neon-boulevard.jpg', label: 'Neon Boulevard sample' },
  { src: 'samples/palm-pier.jpg', label: 'Palm Pier sample' },
  { src: 'samples/sunset-strip.jpg', label: 'Sunset Strip sample' },
];

const state = createStudioState();
const history = new EditHistory();
const photos = [];

const elements = {};
function grabElements() {
  const ids = [
    'previewCanvas', 'photoInput', 'sampleRow', 'layoutSelect', 'gradeSelect',
    'titleInput', 'subtitleInput', 'panelSelect', 'photoAssignSelect',
    'panXRange', 'panYRange', 'zoomRange', 'rotateRange', 'starRange',
    'undoButton', 'redoButton', 'shuffleButton', 'exportSizeSelect',
    'exportButton', 'statusLine',
  ];
  for (const id of ids) elements[id] = document.getElementById(id);
  elements.dressingBoxes = document.querySelectorAll('[data-dressing]');
}

function setStatus(message) {
  elements.statusLine.textContent = message;
}

function drawPreview() {
  const canvas = elements.previewCanvas;
  const ctx = canvas.getContext('2d');
  renderPoster(ctx, canvas.width, canvas.height, state, photos);
  highlightSelectedPanel(ctx, canvas.width, canvas.height, state);
}

function refreshControls() {
  elements.layoutSelect.value = state.layoutId;
  elements.gradeSelect.value = state.gradeId;
  elements.titleInput.value = state.title;
  elements.subtitleInput.value = state.subtitle;
  elements.starRange.value = String(state.starRating);
  for (const box of elements.dressingBoxes) {
    box.checked = Boolean(state.dressing[box.dataset.dressing]);
  }
  elements.panelSelect.innerHTML = state.panels
    .map((_, index) => `<option value="${index}">Panel ${index + 1}</option>`)
    .join('');
  elements.panelSelect.value = String(state.selectedPanel);
  elements.photoAssignSelect.innerHTML = photos
    .map((_, index) => `<option value="${index}">Photo ${index + 1}</option>`)
    .join('');
  const panelState = state.panels[state.selectedPanel];
  if (panelState) {
    elements.photoAssignSelect.value = String(panelState.photoIndex);
    elements.panXRange.value = String(panelState.panX);
    elements.panYRange.value = String(panelState.panY);
    elements.zoomRange.value = String(panelState.zoom);
    elements.rotateRange.value = String(panelState.rotate);
  }
  elements.undoButton.disabled = history.undoStack.length === 0;
  elements.redoButton.disabled = history.redoStack.length === 0;
}

function refresh() {
  drawPreview();
  refreshControls();
}

function commit(mutator, statusMessage) {
  history.record(state);
  mutator();
  refresh();
  if (statusMessage) setStatus(statusMessage);
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function addPhotoFromFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const image = await loadImageFromUrl(dataUrl);
  photos.push(image);
  state.photoCount = photos.length;
}

async function addSamplePhoto(src) {
  const image = await loadImageFromUrl(src);
  photos.push(image);
  state.photoCount = photos.length;
}

function bindControls() {
  elements.photoInput.addEventListener('change', async () => {
    const files = [...elements.photoInput.files];
    if (files.length === 0) return;
    history.record(state);
    for (const file of files) await addPhotoFromFile(file);
    assignPhotosRoundRobin(state);
    refresh();
    setStatus(`${photos.length} photo(s) loaded locally — nothing was uploaded.`);
  });

  for (const sample of SAMPLE_PHOTOS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = sample.label;
    button.addEventListener('click', async () => {
      history.record(state);
      await addSamplePhoto(sample.src);
      assignPhotosRoundRobin(state);
      refresh();
      setStatus(`Sample added: ${sample.label}.`);
    });
    elements.sampleRow.appendChild(button);
  }

  elements.layoutSelect.addEventListener('change', () => {
    commit(() => {
      state.layoutId = elements.layoutSelect.value;
      rebuildPanelsForLayout(state);
    }, 'Layout applied.');
  });

  elements.gradeSelect.addEventListener('change', () => {
    commit(() => { state.gradeId = elements.gradeSelect.value; }, 'Colour grade applied.');
  });

  elements.titleInput.addEventListener('input', () => {
    state.title = elements.titleInput.value;
    drawPreview();
  });
  elements.titleInput.addEventListener('change', () => history.record(state));
  elements.subtitleInput.addEventListener('input', () => {
    state.subtitle = elements.subtitleInput.value;
    drawPreview();
  });
  elements.subtitleInput.addEventListener('change', () => history.record(state));

  elements.panelSelect.addEventListener('change', () => {
    state.selectedPanel = Number(elements.panelSelect.value);
    refresh();
  });

  elements.photoAssignSelect.addEventListener('change', () => {
    commit(() => {
      state.panels[state.selectedPanel].photoIndex = Number(elements.photoAssignSelect.value);
    });
  });

  const bindTransform = (element, key, parse) => {
    element.addEventListener('input', () => {
      const panelState = state.panels[state.selectedPanel];
      if (panelState) panelState[key] = parse(element.value);
      drawPreview();
    });
    element.addEventListener('change', () => history.record(state));
  };
  bindTransform(elements.panXRange, 'panX', Number);
  bindTransform(elements.panYRange, 'panY', Number);
  bindTransform(elements.zoomRange, 'zoom', Number);
  bindTransform(elements.rotateRange, 'rotate', Number);

  elements.starRange.addEventListener('input', () => {
    state.starRating = Number(elements.starRange.value);
    drawPreview();
  });
  elements.starRange.addEventListener('change', () => history.record(state));

  for (const box of elements.dressingBoxes) {
    box.addEventListener('change', () => {
      commit(() => { state.dressing[box.dataset.dressing] = box.checked; });
    });
  }

  elements.undoButton.addEventListener('click', () => {
    if (history.undo(state)) refresh();
    setStatus('Undone.');
  });
  elements.redoButton.addEventListener('click', () => {
    if (history.redo(state)) refresh();
    setStatus('Redone.');
  });

  elements.shuffleButton.addEventListener('click', () => {
    commit(() => {
      const pick = (list) => list[Math.floor(Math.random() * list.length)];
      state.layoutId = pick(POSTER_LAYOUTS).id;
      state.gradeId = pick(COLOUR_GRADES).id;
      rebuildPanelsForLayout(state);
      state.panels.forEach((panelState) => {
        panelState.photoIndex = photos.length > 0 ? Math.floor(Math.random() * photos.length) : 0;
        panelState.zoom = 1 + Math.random() * 0.5;
        panelState.rotate = Math.round((Math.random() - 0.5) * 10);
      });
    }, 'Shuffled layout, grade and panels.');
  });

  elements.previewCanvas.addEventListener('pointerdown', (event) => {
    const rect = elements.previewCanvas.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    const hit = state.panels.findIndex((panelState) => {
      const r = panelState.rect;
      return nx >= r.x && nx <= r.x + r.w && ny >= r.y && ny <= r.y + r.h;
    });
    if (hit >= 0) {
      state.selectedPanel = hit;
      refresh();
    }
  });

  elements.exportButton.addEventListener('click', () => {
    const size = EXPORT_SIZES.find((s) => s.id === elements.exportSizeSelect.value) ?? EXPORT_SIZES[0];
    exportPosterPng(size.width, size.height);
  });
}

export function exportPosterPng(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  renderPoster(ctx, width, height, state, photos);
  canvas.toBlob((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `viceframe-cover-${width}x${height}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    setStatus(`Exported PNG at ${width} × ${height}.`);
  }, 'image/png');
  return canvas;
}

function exportPosterDataUrl(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  renderPoster(canvas.getContext('2d'), width, height, state, photos);
  return canvas.toDataURL('image/png');
}

async function applyShotScene() {
  const scene = sceneFromUrl();
  if (!scene) return false;
  for (const src of scene.photos) await addSamplePhoto(src);
  state.layoutId = scene.layoutId;
  state.gradeId = scene.gradeId;
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  state.starRating = scene.starRating;
  rebuildPanelsForLayout(state);
  assignPhotosRoundRobin(state);
  return true;
}

async function bootStudio() {
  grabElements();
  for (const layout of POSTER_LAYOUTS) {
    const option = document.createElement('option');
    option.value = layout.id;
    option.textContent = layout.label;
    elements.layoutSelect.appendChild(option);
  }
  for (const grade of COLOUR_GRADES) {
    const option = document.createElement('option');
    option.value = grade.id;
    option.textContent = grade.label;
    elements.gradeSelect.appendChild(option);
  }
  for (const size of EXPORT_SIZES) {
    const option = document.createElement('option');
    option.value = size.id;
    option.textContent = size.label;
    elements.exportSizeSelect.appendChild(option);
  }
  bindControls();
  rebuildPanelsForLayout(state);
  const hadScene = await applyShotScene();
  if (!hadScene) {
    await addSamplePhoto(SAMPLE_PHOTOS[1].src);
    rebuildPanelsForLayout(state);
    assignPhotosRoundRobin(state);
  }
  await document.fonts.ready;
  refresh();
  setStatus('Ready — load your own photos or remix the samples.');
  window.VICEFRAME = {
    ready: true,
    state,
    exportPosterDataUrl,
    exportPosterPng,
  };
  document.body.dataset.ready = 'true';
}

bootStudio();
