import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert educator who creates high-quality flashcard decks.
Given a topic description, generate clear, concise flashcards following these rules:
- Front: a focused question, term, or concept (max 150 chars)
- Back: a clear, complete answer or definition (max 300 chars)
- Cover the most important concepts for the topic
- Progress from fundamental to advanced
- Avoid overly long or complex answers — keep them digestible
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
      model: 'llama-3.1-8b-instant',
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
        front: String(c.front).slice(0, 2000),
        back: String(c.back).slice(0, 2000),
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
