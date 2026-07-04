import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/demo-request — public (allowlisted in middleware).
 *
 * Persists every submission to the demo_requests table, then optionally
 * notifies the team via Resend when RESEND_API_KEY + DEMO_NOTIFY_EMAIL
 * are configured. Email failure never fails the request — the lead is
 * already stored.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 200) : '';
    const school = typeof body?.school === 'string' ? body.school.trim().slice(0, 200) : '';
    const useCase = typeof body?.useCase === 'string' ? body.useCase.trim().slice(0, 2000) : '';

    if (!name || !email || !school) {
      return NextResponse.json({ error: 'Name, email, and school are required.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('demo_requests')
      .insert({ name, email, school, use_case: useCase || null });

    if (dbError) {
      console.error('demo_requests insert failed:', dbError.message);
      return NextResponse.json(
        { error: 'Unable to submit your request right now. Please email us directly.' },
        { status: 500 },
      );
    }

    // Best-effort team notification — lead is already saved.
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.DEMO_NOTIFY_EMAIL;
    if (resendKey && notifyEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.DEMO_FROM_EMAIL ?? 'FlashMingo <onboarding@resend.dev>',
            to: [notifyEmail],
            reply_to: email,
            subject: `Demo request — ${school}`,
            text: [
              `Name:   ${name}`,
              `Email:  ${email}`,
              `School: ${school}`,
              '',
              useCase ? `Use case:\n${useCase}` : '(No use case provided)',
            ].join('\n'),
          }),
        });
      } catch (mailError) {
        console.error('Demo notification email failed:', mailError);
      }
    }

    return NextResponse.json({ success: true, message: 'Demo request received.' });
  } catch {
    return NextResponse.json({ error: 'Unable to process demo request.' }, { status: 500 });
  }
}
