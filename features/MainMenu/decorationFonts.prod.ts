import fonts from '@/features/Preferences/data/fonts.prod';

const decorationFontNames = new Set([
  'Zen Maru Gothic',
  'Rampart One',
  'Klee One',
  'Hachi Maru Pop',
  'Yuji Mai',
  'RocknRoll One',
  'Yusei Magic',
  'Mochiy Pop One'
]);

export const decorationFonts = fonts.filter(({ name }) =>
  decorationFontNames.has(name)
);
