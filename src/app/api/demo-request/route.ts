import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const school = typeof body?.school === 'string' ? body.school.trim() : '';
    const useCase = typeof body?.useCase === 'string' ? body.useCase.trim() : '';

    if (!name || !email || !school) {
      return NextResponse.json({ error: 'Name, email, and school are required.' }, { status: 400 });
    }

    // This is a lightweight compliance-safe placeholder that acknowledges the request.
    // In production, replace this with your email delivery integration.
    console.info('Demo request received', { name, email, school, useCase });

    return NextResponse.json({ success: true, message: 'Demo request received.' });
  } catch {
    return NextResponse.json({ error: 'Unable to process demo request.' }, { status: 500 });
  }
}
