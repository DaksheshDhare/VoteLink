/**
 * Utility for mapping well-known Indian political parties to their
 * proper abbreviations, colors, and SVG icon symbols.
 */

interface PartyInfo {
  abbreviation: string;
  color: string;        // Tailwind gradient/bg class
  iconBg: string;       // Background color for the icon circle
  textColor: string;    // Text color for the abbreviation
  symbol: string;       // Unicode/emoji symbol representing the party
}

// Map of known party names (lowercased keywords) to their info
const KNOWN_PARTIES: Record<string, PartyInfo> = {
  'bharatiya janata party': {
    abbreviation: 'BJP',
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    textColor: 'text-white',
    symbol: '🪷',
  },
  'bjp': {
    abbreviation: 'BJP',
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    iconBg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    textColor: 'text-white',
    symbol: '🪷',
  },
  'indian national congress': {
    abbreviation: 'INC',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600',
    textColor: 'text-white',
    symbol: '✋',
  },
  'congress': {
    abbreviation: 'INC',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600',
    textColor: 'text-white',
    symbol: '✋',
  },
  'inc': {
    abbreviation: 'INC',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600',
    textColor: 'text-white',
    symbol: '✋',
  },
  'aam aadmi party': {
    abbreviation: 'AAP',
    color: 'bg-gradient-to-r from-blue-400 to-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-300 to-blue-500',
    textColor: 'text-white',
    symbol: '🧹',
  },
  'aap': {
    abbreviation: 'AAP',
    color: 'bg-gradient-to-r from-blue-400 to-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-300 to-blue-500',
    textColor: 'text-white',
    symbol: '🧹',
  },
  'nationalist congress party': {
    abbreviation: 'NCP',
    color: 'bg-gradient-to-r from-blue-600 to-teal-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-teal-500',
    textColor: 'text-white',
    symbol: '⏰',
  },
  'ncp': {
    abbreviation: 'NCP',
    color: 'bg-gradient-to-r from-blue-600 to-teal-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-teal-500',
    textColor: 'text-white',
    symbol: '⏰',
  },
  'bahujan samaj party': {
    abbreviation: 'BSP',
    color: 'bg-gradient-to-r from-blue-700 to-blue-900',
    iconBg: 'bg-gradient-to-br from-blue-600 to-blue-800',
    textColor: 'text-white',
    symbol: '🐘',
  },
  'bsp': {
    abbreviation: 'BSP',
    color: 'bg-gradient-to-r from-blue-700 to-blue-900',
    iconBg: 'bg-gradient-to-br from-blue-600 to-blue-800',
    textColor: 'text-white',
    symbol: '🐘',
  },
  'samajwadi party': {
    abbreviation: 'SP',
    color: 'bg-gradient-to-r from-red-500 to-green-600',
    iconBg: 'bg-gradient-to-br from-red-500 to-green-500',
    textColor: 'text-white',
    symbol: '🚲',
  },
  'sp': {
    abbreviation: 'SP',
    color: 'bg-gradient-to-r from-red-500 to-green-600',
    iconBg: 'bg-gradient-to-br from-red-500 to-green-500',
    textColor: 'text-white',
    symbol: '🚲',
  },
  'communist party of india': {
    abbreviation: 'CPI',
    color: 'bg-gradient-to-r from-red-600 to-red-700',
    iconBg: 'bg-gradient-to-br from-red-500 to-red-700',
    textColor: 'text-white',
    symbol: '⚒️',
  },
  'cpi': {
    abbreviation: 'CPI',
    color: 'bg-gradient-to-r from-red-600 to-red-700',
    iconBg: 'bg-gradient-to-br from-red-500 to-red-700',
    textColor: 'text-white',
    symbol: '⚒️',
  },
  'communist party of india (marxist)': {
    abbreviation: 'CPI(M)',
    color: 'bg-gradient-to-r from-red-700 to-red-800',
    iconBg: 'bg-gradient-to-br from-red-600 to-red-800',
    textColor: 'text-white',
    symbol: '⚒️',
  },
  'cpim': {
    abbreviation: 'CPI(M)',
    color: 'bg-gradient-to-r from-red-700 to-red-800',
    iconBg: 'bg-gradient-to-br from-red-600 to-red-800',
    textColor: 'text-white',
    symbol: '⚒️',
  },
  'cpi(m)': {
    abbreviation: 'CPI(M)',
    color: 'bg-gradient-to-r from-red-700 to-red-800',
    iconBg: 'bg-gradient-to-br from-red-600 to-red-800',
    textColor: 'text-white',
    symbol: '⚒️',
  },
  'all india trinamool congress': {
    abbreviation: 'TMC',
    color: 'bg-gradient-to-r from-green-500 to-blue-500',
    iconBg: 'bg-gradient-to-br from-green-400 to-blue-500',
    textColor: 'text-white',
    symbol: '🌸',
  },
  'trinamool congress': {
    abbreviation: 'TMC',
    color: 'bg-gradient-to-r from-green-500 to-blue-500',
    iconBg: 'bg-gradient-to-br from-green-400 to-blue-500',
    textColor: 'text-white',
    symbol: '🌸',
  },
  'aitc': {
    abbreviation: 'TMC',
    color: 'bg-gradient-to-r from-green-500 to-blue-500',
    iconBg: 'bg-gradient-to-br from-green-400 to-blue-500',
    textColor: 'text-white',
    symbol: '🌸',
  },
  'tmc': {
    abbreviation: 'TMC',
    color: 'bg-gradient-to-r from-green-500 to-blue-500',
    iconBg: 'bg-gradient-to-br from-green-400 to-blue-500',
    textColor: 'text-white',
    symbol: '🌸',
  },
  'shiv sena': {
    abbreviation: 'SHS',
    color: 'bg-gradient-to-r from-orange-600 to-yellow-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-yellow-500',
    textColor: 'text-white',
    symbol: '🏹',
  },
  'shs': {
    abbreviation: 'SHS',
    color: 'bg-gradient-to-r from-orange-600 to-yellow-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-yellow-500',
    textColor: 'text-white',
    symbol: '🏹',
  },
  'telugu desam party': {
    abbreviation: 'TDP',
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    textColor: 'text-black',
    symbol: '🚜',
  },
  'tdp': {
    abbreviation: 'TDP',
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    textColor: 'text-black',
    symbol: '🚜',
  },
  'janata dal (united)': {
    abbreviation: 'JD(U)',
    color: 'bg-gradient-to-r from-green-600 to-green-700',
    iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
    textColor: 'text-white',
    symbol: '🏳️',
  },
  'jdu': {
    abbreviation: 'JD(U)',
    color: 'bg-gradient-to-r from-green-600 to-green-700',
    iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
    textColor: 'text-white',
    symbol: '🏳️',
  },
  'jd(u)': {
    abbreviation: 'JD(U)',
    color: 'bg-gradient-to-r from-green-600 to-green-700',
    iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
    textColor: 'text-white',
    symbol: '🏳️',
  },
  'dravida munnetra kazhagam': {
    abbreviation: 'DMK',
    color: 'bg-gradient-to-r from-red-600 to-black',
    iconBg: 'bg-gradient-to-br from-red-500 to-gray-900',
    textColor: 'text-white',
    symbol: '☀️',
  },
  'dmk': {
    abbreviation: 'DMK',
    color: 'bg-gradient-to-r from-red-600 to-black',
    iconBg: 'bg-gradient-to-br from-red-500 to-gray-900',
    textColor: 'text-white',
    symbol: '☀️',
  },
  'ysr congress party': {
    abbreviation: 'YSRCP',
    color: 'bg-gradient-to-r from-blue-600 to-blue-800',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700',
    textColor: 'text-white',
    symbol: '⏰',
  },
  'ysrcp': {
    abbreviation: 'YSRCP',
    color: 'bg-gradient-to-r from-blue-600 to-blue-800',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-700',
    textColor: 'text-white',
    symbol: '⏰',
  },
  'rashtriya janata dal': {
    abbreviation: 'RJD',
    color: 'bg-gradient-to-r from-green-600 to-green-800',
    iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
    textColor: 'text-white',
    symbol: '🏮',
  },
  'rjd': {
    abbreviation: 'RJD',
    color: 'bg-gradient-to-r from-green-600 to-green-800',
    iconBg: 'bg-gradient-to-br from-green-500 to-green-700',
    textColor: 'text-white',
    symbol: '🏮',
  },
  'none of the above': {
    abbreviation: 'NOTA',
    color: 'bg-gradient-to-r from-gray-500 to-gray-700',
    iconBg: 'bg-gradient-to-br from-gray-400 to-gray-600',
    textColor: 'text-white',
    symbol: '✖️',
  },
  'nota': {
    abbreviation: 'NOTA',
    color: 'bg-gradient-to-r from-gray-500 to-gray-700',
    iconBg: 'bg-gradient-to-br from-gray-400 to-gray-600',
    textColor: 'text-white',
    symbol: '✖️',
  },
};

// Words to skip when generating abbreviations
const SKIP_WORDS = new Set(['of', 'the', 'and', 'for', 'in', 'a', 'an', 'to']);

/**
 * Look up party info by name. Tries exact match first, then partial matches.
 */
export function getPartyInfo(partyName: string): PartyInfo | null {
  const normalized = partyName.toLowerCase().trim();

  // Direct match
  if (KNOWN_PARTIES[normalized]) {
    return KNOWN_PARTIES[normalized];
  }

  // Try matching without parenthetical content
  const withoutParens = normalized.replace(/\s*\(.*?\)\s*/g, '').trim();
  if (KNOWN_PARTIES[withoutParens]) {
    return KNOWN_PARTIES[withoutParens];
  }

  // Try partial match - check if any known party name is contained in the input
  for (const [key, info] of Object.entries(KNOWN_PARTIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return info;
    }
  }

  return null;
}

/**
 * Get a proper abbreviation for a party name.
 * Uses known party mapping first, then generates a smart abbreviation.
 */
export function getPartyAbbreviation(partyName: string): string {
  const info = getPartyInfo(partyName);
  if (info) return info.abbreviation;

  // Extract text inside parentheses as abbreviation if available
  const parenMatch = partyName.match(/\(([A-Z][A-Za-z()]*)\)/);
  if (parenMatch) return parenMatch[1];

  // Generate abbreviation from significant words (skip common words)
  const words = partyName.split(/\s+/).filter(w => !SKIP_WORDS.has(w.toLowerCase()));
  const abbr = words.map(w => w[0]?.toUpperCase()).filter(Boolean).join('');

  // Limit to 4 characters max
  return abbr.slice(0, 4);
}

/**
 * Get the icon background class for a party
 */
export function getPartyIconBg(partyName: string): string {
  const info = getPartyInfo(partyName);
  return info?.iconBg || 'bg-gradient-to-br from-indigo-400 to-purple-500';
}

/**
 * Get the text color class for the party icon
 */
export function getPartyTextColor(partyName: string): string {
  const info = getPartyInfo(partyName);
  return info?.textColor || 'text-white';
}

/**
 * Get a symbol/emoji for a party
 */
export function getPartySymbol(partyName: string): string {
  const info = getPartyInfo(partyName);
  return info?.symbol || '🏛️';
}

/**
 * Get the party color gradient class
 */
export function getPartyColor(partyName: string): string {
  const info = getPartyInfo(partyName);
  return info?.color || 'bg-gradient-to-r from-indigo-500 to-purple-600';
}
