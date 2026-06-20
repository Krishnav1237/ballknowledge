/**
 * Maps country names (as they appear in match/team data) to ISO 3166-1 alpha-2 codes.
 * Used with flagcdn.com: https://flagcdn.com/w40/{code}.png
 */
export const COUNTRY_CODES: Record<string, string> = {
  // Americas – CONCACAF
  'usa': 'us', 'united states': 'us', 'america': 'us',
  'mexico': 'mx',
  'canada': 'ca',
  'honduras': 'hn',
  'panama': 'pa',
  'costa rica': 'cr',
  'jamaica': 'jm',
  'el salvador': 'sv',
  'trinidad and tobago': 'tt', 'trinidad': 'tt',
  'haiti': 'ht',
  'guatemala': 'gt',
  'cuba': 'cu',
  'curaçao': 'cw', 'curacao': 'cw',

  // Americas – CONMEBOL
  'argentina': 'ar',
  'brazil': 'br', 'brasil': 'br',
  'uruguay': 'uy',
  'colombia': 'co',
  'ecuador': 'ec',
  'venezuela': 've',
  'chile': 'cl',
  'bolivia': 'bo',
  'peru': 'pe',
  'paraguay': 'py',

  // Europe – UEFA
  'france': 'fr',
  'england': 'gb-eng',
  'germany': 'de', 'deutschland': 'de',
  'spain': 'es', 'españa': 'es',
  'portugal': 'pt',
  'netherlands': 'nl', 'holland': 'nl',
  'belgium': 'be',
  'italy': 'it',
  'croatia': 'hr',
  'bosnia and herzegovina': 'ba', 'bosnia': 'ba',
  'switzerland': 'ch',
  'serbia': 'rs',
  'austria': 'at',
  'denmark': 'dk',
  'poland': 'pl',
  'scotland': 'gb-sct',
  'wales': 'gb-wls',
  'northern ireland': 'gb-nir',
  'albania': 'al',
  'czech republic': 'cz', 'czechia': 'cz',
  'hungary': 'hu',
  'slovakia': 'sk',
  'slovenia': 'si',
  'turkey': 'tr', 'türkiye': 'tr',
  'ukraine': 'ua',
  'romania': 'ro',
  'georgia': 'ge',
  'greece': 'gr',
  'sweden': 'se',
  'norway': 'no',
  'finland': 'fi',
  'russia': 'ru',
  'iceland': 'is',
  'ireland': 'ie', 'republic of ireland': 'ie',

  // Africa – CAF
  'morocco': 'ma',
  'nigeria': 'ng',
  'senegal': 'sn',
  'ghana': 'gh',
  'south africa': 'za',
  'egypt': 'eg',
  'cameroon': 'cm',
  'mali': 'ml',
  'ivory coast': 'ci', "cote d'ivoire": 'ci', 'cote divoire': 'ci',
  'tunisia': 'tn',
  'algeria': 'dz',
  'angola': 'ao',
  'tanzania': 'tz',
  'democratic republic of congo': 'cd', 'democratic republic of the congo': 'cd', 'dr congo': 'cd', 'drc': 'cd',
  'kenya': 'ke',
  'ethiopia': 'et',
  'zimbabwe': 'zw',
  'zambia': 'zm',
  'cape verde': 'cv',
  'guinea': 'gn',
  'mozambique': 'mz',
  'gabon': 'ga',
  'benin': 'bj',
  'equatorial guinea': 'gq',
  'south sudan': 'ss',
  'uganda': 'ug',
  'burkina faso': 'bf',
  'liberia': 'lr',
  'namibia': 'na',
  'comoros': 'km',

  // Asia – AFC
  'japan': 'jp',
  'south korea': 'kr', 'korea republic': 'kr', 'korea': 'kr',
  'saudi arabia': 'sa', 'ksa': 'sa',
  'iran': 'ir', 'ir iran': 'ir',
  'australia': 'au',
  'china': 'cn', "china pr": 'cn',
  'qatar': 'qa',
  'indonesia': 'id',
  'bahrain': 'bh',
  'jordan': 'jo',
  'uzbekistan': 'uz',
  'iraq': 'iq',
  'united arab emirates': 'ae', 'uae': 'ae',
  'north korea': 'kp', 'dpr korea': 'kp',
  'india': 'in',
  'thailand': 'th',
  'vietnam': 'vn',
  'malaysia': 'my',
  'philippines': 'ph',
  'tajikistan': 'tj',
  'kyrgyzstan': 'kg',
  'oman': 'om',
  'kuwait': 'kw',
  'syria': 'sy',
  'lebanon': 'lb',
  'myanmar': 'mm',
  'palestine': 'ps',

  // Oceania – OFC
  'new zealand': 'nz',
  'fiji': 'fj',
  'papua new guinea': 'pg',
  'solomon islands': 'sb',
  'tahiti': 'pf',
  'vanuatu': 'vu',
};

/**
 * Resolves any country name variant to an ISO-3166-1 alpha-2 code.
 * Returns null if not found (caller should fall back to emoji or placeholder).
 */
export function getCountryCode(countryName: string): string | null {
  if (!countryName) return null;
  const lower = countryName.trim().toLowerCase();

  // Direct match
  if (COUNTRY_CODES[lower]) return COUNTRY_CODES[lower];

  // Partial / substring match — iterate keys
  for (const [key, code] of Object.entries(COUNTRY_CODES)) {
    if (lower.includes(key) || key.includes(lower)) return code;
  }

  return null;
}

/**
 * Returns a flagcdn.com image URL for the given country name.
 * Size options: 20, 40, 80, 160 (px width).
 */
export function getFlagUrl(countryName: string, width: 20 | 40 | 80 | 160 = 40): string {
  const code = getCountryCode(countryName);
  if (!code) return '';
  return `https://flagcdn.com/w${width}/${code}.png`;
}
