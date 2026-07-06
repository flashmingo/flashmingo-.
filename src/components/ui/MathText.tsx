import React, { useMemo } from 'react';

/**
 * Renders flashcard text with lightweight math typography:
 *   v_0^2        →  v₀² (real <sub>/<sup> elements)
 *   x_{max}      →  x with "max" subscripted
 *   sqrt(2gh)    →  √(2gh)
 *   theta, pi…   →  θ, π (word-boundary Greek)
 *   a * b        →  a · b
 *   ->, <=, >=   →  →, ≤, ≥
 *
 * No LaTeX engine, no bundle cost — just honest typography for the ASCII
 * math that AI generation and quick typing produce.
 */

const SYMBOL_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bsqrt\(/g, '√('],
  [/\+\/-|\+-/g, '±'],
  [/<=/g, '≤'],
  [/>=/g, '≥'],
  [/!=/g, '≠'],
  [/->/g, '→'],
  [/ \* /g, ' · '],
  // Greek — word-boundary so "pin"/"theta" in prose don't collide
  [/\btheta\b/g, 'θ'],
  [/\bTheta\b/g, 'Θ'],
  [/\balpha\b/g, 'α'],
  [/\bbeta\b/g, 'β'],
  [/\bgamma\b/g, 'γ'],
  [/\bdelta\b/g, 'δ'],
  [/\bDelta\b/g, 'Δ'],
  [/\blambda\b/g, 'λ'],
  [/\bmu\b/g, 'μ'],
  [/\bpi\b/g, 'π'],
  [/\bsigma\b/g, 'σ'],
  [/\bomega\b/g, 'ω'],
  [/\bOmega\b/g, 'Ω'],
  [/\bphi\b/g, 'φ'],
];

/**
 * `_0`, `^2`, `_{max}`, `^{-1}` after an identifier/closing bracket.
 * Single-char form only fires when the token ends there, so prose like
 * `snake_case` or `__init__` (CS decks) is left untouched — use braces
 * for multi-char scripts.
 */
const SUB_SUP_RE = /(?<=[A-Za-zθΘαβγδΔλμπσωΩφ0-9)\]])([_^])(?:\{([^}]{1,12})\}|([A-Za-z0-9+\-])(?![A-Za-z0-9]))/g;

export function formatMathSymbols(text: string): string {
  let out = text;
  for (const [re, replacement] of SYMBOL_REPLACEMENTS) out = out.replace(re, replacement);
  return out;
}

function parseMathText(raw: string): React.ReactNode[] {
  const text = formatMathSymbols(raw);
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const m of text.matchAll(SUB_SUP_RE)) {
    const index = m.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const content = m[2] ?? m[3] ?? '';
    nodes.push(
      m[1] === '_'
        ? <sub key={key++}>{content}</sub>
        : <sup key={key++}>{content}</sup>,
    );
    last = index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function MathText({ children, className }: { children: string; className?: string }) {
  const nodes = useMemo(() => parseMathText(children), [children]);
  return <span className={className}>{nodes}</span>;
}
