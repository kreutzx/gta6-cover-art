// VICEFRAME Studio — deterministic screenshot scenes.
// Opening the app with ?shot=<scene> applies a named setup (sample photos,
// layout, grade and caption) so screenshots are perfectly reproducible.
// The scene names mirror the definitions in the repository's shots.json.

export const SHOT_SCENES = {
  'cover-landscape': {
    photos: ['samples/neon-boulevard.jpg', 'samples/palm-pier.jpg', 'samples/sunset-strip.jpg'],
    layoutId: 'hero-trio',
    gradeId: 'sunset',
    title: 'MIDNIGHT RUNNERS',
    subtitle: 'one last ride down Ocean Drive',
    starRating: 5,
  },
  editor: {
    photos: ['samples/palm-pier.jpg', 'samples/neon-boulevard.jpg'],
    layoutId: 'grid9',
    gradeId: 'neon',
    title: 'PALM CITY HEAT',
    subtitle: 'neon hearts, chrome wheels',
    starRating: 4,
  },
  'cover-portrait': {
    photos: ['samples/sunset-strip.jpg', 'samples/palm-pier.jpg', 'samples/neon-boulevard.jpg'],
    layoutId: 'tilted',
    gradeId: 'neon',
    title: 'VICE BLOOM',
    subtitle: 'petals after midnight',
    starRating: 5,
  },
  'cover-square': {
    photos: ['samples/palm-pier.jpg', 'samples/sunset-strip.jpg', 'samples/neon-boulevard.jpg'],
    layoutId: 'grid9',
    gradeId: 'golden',
    title: 'TWO SHORES',
    subtitle: 'a tale of twin tides',
    starRating: 4,
  },
};

export function sceneFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('shot');
  if (!name) return null;
  const scene = SHOT_SCENES[name];
  if (!scene) return null;
  return { name, ...scene };
}
