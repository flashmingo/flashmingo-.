// Simple profanity checker used to prevent offensive deck names/descriptions.
// This is intentionally small and easy to extend — adjust `BAD_WORDS` as needed.
export const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap', 'whore'
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[\p{P}\p{S}\d_]+/gu, ' ') // strip punctuation, symbols, numbers
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsProfanity(input?: string | null) {
  if (!input) return false;
  const norm = normalize(input);
  const tokens = norm.split(' ');
  for (const bad of BAD_WORDS) {
    if (tokens.includes(bad)) return true;
    // also catch words that contain the bad word as substring
    for (const t of tokens) if (t.includes(bad)) return true;
  }
  return false;
}

export function checkProfanityPayload(...texts: Array<string | null | undefined>) {
  for (const t of texts) if (containsProfanity(t)) return true;
  return false;
}
