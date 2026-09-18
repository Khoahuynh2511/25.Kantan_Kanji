const fontNames = [
  'Zen Maru Gothic',
  'Noto Sans JP',
  'Rampart One',
  'Zen Kurenaido',
  'Klee One',
  'Dot Gothic 16',
  'Kiwi Maru',
  'Potta One',
  'Hachi Maru Pop',
  'Yuji Mai',
  'RocknRoll One',
  'Reggae One',
  'Stick',
  'M PLUS Rounded 1c',
  'M PLUS 1',
  'Yusei Magic',
  'Dela Gothic One',
  'New Tegomin',
  'Kosugi Maru',
  'Hina Mincho',
  'Shippori Mincho',
  'Kaisei Decol',
  'Mochiy Pop One',
  'Yuji Boku',
  'Kaisei HarunoUmi',
  'Sawarabi Gothic',
  'Zen Old Mincho',
  'Sawarabi Mincho',
  'Zen Antique',
  'Kaisei Tokumin',
  'Yuji Syuku',
  'WDXL Lubrifont JP N',
  'Murecho',
  'Kaisei Opti',
  'BIZ UDMincho',
  'Shippori Antique'
] as const;

const fontClassNames: Record<(typeof fontNames)[number], string> = {
  'Zen Maru Gothic': 'font-zen-maru-gothic',
  'Noto Sans JP': 'font-noto-sans-jp',
  'Rampart One': 'font-rampart-one',
  'Zen Kurenaido': 'font-zen-kurenaido',
  'Klee One': 'font-klee-one',
  'Dot Gothic 16': 'font-dot-gothic-16',
  'Kiwi Maru': 'font-kiwi-maru',
  'Potta One': 'font-potta-one',
  'Hachi Maru Pop': 'font-hachi-maru-pop',
  'Yuji Mai': 'font-yuji-mai',
  'RocknRoll One': 'font-rocknroll-one',
  'Reggae One': 'font-reggae-one',
  Stick: 'font-stick',
  'M PLUS Rounded 1c': 'font-m-plus-rounded-1c',
  'M PLUS 1': 'font-m-plus-1',
  'Yusei Magic': 'font-yusei-magic',
  'Dela Gothic One': 'font-dela-gothic-one',
  'New Tegomin': 'font-new-tegomin',
  'Kosugi Maru': 'font-kosugi-maru',
  'Hina Mincho': 'font-hina-mincho',
  'Shippori Mincho': 'font-shippori-mincho',
  'Kaisei Decol': 'font-kaisei-decol',
  'Mochiy Pop One': 'font-mochiy-pop-one',
  'Yuji Boku': 'font-yuji-boku',
  'Kaisei HarunoUmi': 'font-kaisei-harunoumi',
  'Sawarabi Gothic': 'font-sawarabi-gothic',
  'Zen Old Mincho': 'font-zen-old-mincho',
  'Sawarabi Mincho': 'font-sawarabi-mincho',
  'Zen Antique': 'font-zen-antique',
  'Kaisei Tokumin': 'font-kaisei-tokumin',
  'Yuji Syuku': 'font-yuji-syuku',
  'WDXL Lubrifont JP N': 'font-wdxl-lubrifont-jp-n',
  Murecho: 'font-murecho',
  'Kaisei Opti': 'font-kaisei-opti',
  'BIZ UDMincho': 'font-biz-udmincho',
  'Shippori Antique': 'font-shippori-antique'
};

const fonts = fontNames.map(name => ({
  name,
  font: { className: fontClassNames[name] }
}));

// Fetch fonts in the browser so a temporary Google Fonts outage cannot block
// the production build.
export const googleFontsStylesheetUrl =
  'https://fonts.googleapis.com/css2?' +
  fontNames
    .map(
      name => `family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400`
    )
    .join('&') +
  '&display=swap';

export default fonts;
