import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatMathSymbols } from '@/components/ui/MathText';
import { containsProfanity, PROFANITY_ERROR } from '@/lib/profanity';
import { isAccountApproved, APPROVAL_REQUIRED_ERROR } from '@/lib/approval';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert educator who creates high-quality flashcard decks.
Given a topic description, generate clear, concise flashcards following these rules:

CARD QUALITY
- One atomic fact or skill per card — never bundle two ideas
- Front: a focused question (max 150 chars). Vary the stems: "Why…", "When…",
  "How…", "What happens if…", direct terms — not every card should start
  "What is the concept of…"
- Back: the answer first, in one or two short sentences (max 300 chars).
  Lead with the answer, then add context only if essential
- Prefer questions that test understanding or application over pure recall
  where the topic allows
- Progress from fundamental to advanced across the deck

MATH & SCIENCE NOTATION
- Write equations in clean mathematical notation, never programmer syntax
- Use Unicode: superscripts (v² not v^2), subscripts (v₀ not v_0),
  Greek letters (θ, π, Δ, ω — not "theta"), × or · for multiplication
  (never *), √ for roots, ≤ ≥ ≠ ± → as needed
- Example: "R = (v₀² · sin 2θ) / g" — NOT "R = (v_0^2) * sin(2*theta) / g"
- Define every symbol the first time it appears on a card's back
- Keep fractions inline with a slash: (a + b) / 2

OUTPUT
- Return ONLY valid JSON, no markdown, no explanation`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const cardCount = Math.min(Math.max(parseInt(body.card_count) || 10, 5), 30);

  if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  if (description.length > 1000) return NextResponse.json({ error: 'Description too long (max 1000 chars)' }, { status: 400 });
  if (containsProfanity(description)) {
    return NextResponse.json({ error: PROFANITY_ERROR }, { status: 400 });
  }
  if (!(await isAccountApproved(supabase, user.id))) {
    return NextResponse.json({ error: APPROVAL_REQUIRED_ERROR }, { status: 403 });
  }

  const userPrompt = `Create exactly ${cardCount} flashcards for the following topic:

"${description}"

Return a JSON object in this exact format:
{
  "deck_name": "A concise, descriptive deck title (max 60 chars)",
  "deck_description": "A one-sentence summary of what this deck covers (max 120 chars)",
  "cards": [
    { "front": "Question or term here", "back": "Answer or definition here" }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      // 70B follows the notation/quality rules far more reliably than 8B;
      // still on Groq's free tier, just lower rate limits.
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI');

    const parsed = JSON.parse(raw);

    if (!parsed.deck_name || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
      throw new Error('Invalid AI response structure');
    }

    // Validate and sanitise cards
    const cards = parsed.cards
      .filter((c: { front?: unknown; back?: unknown }) => c.front && c.back)
      .map((c: { front: string; back: string }, i: number) => ({
        // Normalise any ASCII math the model slipped through (theta → θ, * → ·)
        front: formatMathSymbols(String(c.front)).slice(0, 2000),
        back: formatMathSymbols(String(c.back)).slice(0, 2000),
        sort_order: i,
      }));

    return NextResponse.json({
      data: {
        deck_name: String(parsed.deck_name).slice(0, 100),
        deck_description: String(parsed.deck_description ?? '').slice(0, 500),
        cards,
      },
    });
  } catch (err) {
    console.error('[ai/generate-deck]', err);
    return NextResponse.json(
      { error: 'Failed to generate deck. Please try again.' },
      { status: 500 }
    );
  }
}
