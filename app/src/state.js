// VICEFRAME Studio — editor state, panel transforms and undo history.

import { layoutById } from './layouts.js';

export function makePanelTransform(photoIndex) {
  return { photoIndex, panX: 0, panY: 0, zoom: 1, rotate: 0 };
}

export function createStudioState() {
  return {
    layoutId: 'hero-trio',
    gradeId: 'sunset',
    title: 'MIDNIGHT RUNNERS',
    subtitle: 'one last ride down Ocean Drive',
    selectedPanel: 0,
    starRating: 5,
    dressing: {
      ribbon: true,
      stars: true,
      rays: true,
      palms: true,
      halftone: false,
      grain: true,
      vignette: true,
    },
    panels: [],
    photoCount: 0,
  };
}

export function rebuildPanelsForLayout(state) {
  const layout = layoutById(state.layoutId);
  const geometry = layout.buildPanels();
  const previous = state.panels;
  state.panels = geometry.map((rect, index) => {
    const kept = previous[index];
    const transform = kept
      ? { photoIndex: kept.photoIndex, panX: kept.panX, panY: kept.panY, zoom: kept.zoom, rotate: kept.rotate }
      : makePanelTransform(index);
    return {
      rect,
      ...transform,
      photoIndex: state.photoCount > 0 ? transform.photoIndex % state.photoCount : 0,
    };
  });
  if (state.selectedPanel >= state.panels.length) state.selectedPanel = 0;
  return state;
}

export function assignPhotosRoundRobin(state) {
  state.panels.forEach((panelState, index) => {
    panelState.photoIndex = state.photoCount > 0 ? index % state.photoCount : 0;
  });
}

export function snapshotState(state) {
  return JSON.stringify({
    layoutId: state.layoutId,
    gradeId: state.gradeId,
    title: state.title,
    subtitle: state.subtitle,
    selectedPanel: state.selectedPanel,
    starRating: state.starRating,
    dressing: { ...state.dressing },
    panels: state.panels.map((panelState) => ({
      photoIndex: panelState.photoIndex,
      panX: panelState.panX,
      panY: panelState.panY,
      zoom: panelState.zoom,
      rotate: panelState.rotate,
    })),
    photoCount: state.photoCount,
  });
}

export function restoreState(state, snapshot) {
  const data = JSON.parse(snapshot);
  state.layoutId = data.layoutId;
  state.gradeId = data.gradeId;
  state.title = data.title;
  state.subtitle = data.subtitle;
  state.selectedPanel = data.selectedPanel;
  state.starRating = data.starRating;
  state.dressing = { ...data.dressing };
  state.photoCount = data.photoCount;
  rebuildPanelsForLayout(state);
  data.panels.forEach((saved, index) => {
    if (state.panels[index]) Object.assign(state.panels[index], saved);
  });
  return state;
}

export class EditHistory {
  constructor(limit = 60) {
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
  }

  record(state) {
    this.undoStack.push(snapshotState(state));
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack.length = 0;
  }

  undo(state) {
    if (this.undoStack.length === 0) return false;
    this.redoStack.push(snapshotState(state));
    restoreState(state, this.undoStack.pop());
    return true;
  }

  redo(state) {
    if (this.redoStack.length === 0) return false;
    this.undoStack.push(snapshotState(state));
    restoreState(state, this.redoStack.pop());
    return true;
  }
}
