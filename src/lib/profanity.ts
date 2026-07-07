/**
 * FlashMingo — profanity filter for a K–12 setting.
 *
 * Catches common profanity and slurs including simple evasions
 * (leetspeak "sh1t", spacing "f u c k", repeats "shiiit"), while
 * avoiding the Scunthorpe problem — "class", "assignment", "pass",
 * "analysis" must never trip it. We match whole normalized tokens,
 * not substrings, plus a tiny set of always-offensive stems that have
 * no innocent English host.
 *
 * Server-side enforcement is the source of truth; the client imports
 * the same helper for instant feedback.
 */

// Matched as whole normalized tokens (safe against Scunthorpe).
export const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'piss', 'damn',
  'crap', 'cunt', 'slut', 'whore', 'douche', 'jackass', 'prick', 'wanker',
  'bollocks', 'motherfucker', 'bullshit', 'dumbass', 'jerkoff', 'pissed',
  // slurs — always unacceptable in a school product
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'spic',
  'chink', 'kike', 'tranny', 'coon',
];

// Stems so egregious a substring hit is acceptable even inside another
// token (they have no innocent English host, so no false positives).
// NB: "cunt" is deliberately NOT here — it lives inside "Scunthorpe".
const ALWAYS_BLOCK_STEMS = ['fuck', 'nigger', 'faggot', 'motherfuck'];

const WORD_SET = new Set(BAD_WORDS);

const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't',
  '@': 'a', '$': 's', '!': 'i', '|': 'i',
};

/**
 * Lowercase, strip accents, map leetspeak, collapse 3+ repeats → 1
 * (so "shiiit"/"FUUUUCK" normalize to the base word). Doubled letters
 * in real words ("assess", "pass") are left untouched.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[013457@$!|]/g, (c) => LEET_MAP[c] ?? c)
    .replace(/(.)\1{2,}/g, '$1');
}

function tokenize(normalized: string): string[] {
  return normalized.split(/[^a-z]+/).filter(Boolean);
}

export function containsProfanity(input?: string | null): boolean {
  if (!input) return false;
  const normalized = normalize(input);

  // 1. Whole-word matches (+ simple trailing-s plural).
  for (const t of tokenize(normalized)) {
    if (WORD_SET.has(t)) return true;
    if (t.endsWith('s') && WORD_SET.has(t.slice(0, -1))) return true;
  }

  // 2. Spaced-out evasions: "f u c k" → join letters and scan stems.
  const joined = normalized.replace(/[^a-z]/g, '');
  for (const stem of ALWAYS_BLOCK_STEMS) {
    if (joined.includes(stem)) return true;
  }

  return false;
}

/** True if any provided text contains profanity. */
export function checkProfanityPayload(...texts: Array<string | null | undefined>): boolean {
  return texts.some((t) => containsProfanity(t));
}

/**
 * Returns the name of the first field containing profanity, or null.
 * Lets API routes report which field to fix.
 */
export function findProfaneField(
  fields: Record<string, string | null | undefined>,
): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (containsProfanity(value)) return name;
  }
  return null;
}

export const PROFANITY_ERROR =
  'That text contains language that isn’t allowed. Please revise and try again.';
