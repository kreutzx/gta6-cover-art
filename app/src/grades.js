// VICEFRAME Studio — colour grades.
// A grade is a canvas filter applied while a photo is drawn, plus a wash
// gradient laid over the whole poster and a tint for the caption block.

export const COLOUR_GRADES = [
  {
    id: 'sunset',
    label: 'Vice Sunset',
    imageFilter: 'saturate(1.35) contrast(1.08) sepia(0.22) hue-rotate(-8deg)',
    washTop: 'rgba(255, 94, 58, 0.20)',
    washBottom: 'rgba(64, 12, 92, 0.34)',
    skyGlow: '#ff7a3c',
  },
  {
    id: 'neon',
    label: 'Neon Nights',
    imageFilter: 'saturate(1.6) contrast(1.18) hue-rotate(12deg)',
    washTop: 'rgba(0, 229, 255, 0.16)',
    washBottom: 'rgba(255, 0, 128, 0.30)',
    skyGlow: '#00e5ff',
  },
  {
    id: 'golden',
    label: 'Golden Hour',
    imageFilter: 'saturate(1.15) contrast(1.02) sepia(0.38) brightness(1.05)',
    washTop: 'rgba(255, 190, 64, 0.22)',
    washBottom: 'rgba(120, 60, 8, 0.28)',
    skyGlow: '#ffc440',
  },
  {
    id: 'noir',
    label: 'Midnight Noir',
    imageFilter: 'grayscale(0.85) contrast(1.3) brightness(0.94)',
    washTop: 'rgba(20, 24, 40, 0.25)',
    washBottom: 'rgba(0, 0, 0, 0.45)',
    skyGlow: '#8fa3c7',
  },
  {
    id: 'pastel',
    label: 'Pastel Dream',
    imageFilter: 'saturate(0.9) contrast(0.94) brightness(1.12) sepia(0.12)',
    washTop: 'rgba(255, 183, 220, 0.20)',
    washBottom: 'rgba(140, 160, 255, 0.22)',
    skyGlow: '#ffb7dc',
  },
  {
    id: 'chrome',
    label: 'Chrome Heat',
    imageFilter: 'saturate(1.25) contrast(1.28) brightness(1.03)',
    washTop: 'rgba(160, 220, 255, 0.14)',
    washBottom: 'rgba(30, 10, 60, 0.36)',
    skyGlow: '#a0dcff',
  },
];

export function gradeById(gradeId) {
  return COLOUR_GRADES.find((grade) => grade.id === gradeId) ?? COLOUR_GRADES[0];
}
