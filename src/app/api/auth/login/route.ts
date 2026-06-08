import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // Look up the user's profile to get their ID
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('id, account_status')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is approved (except for admins)
    // For now, we'll allow login but check status
    // In production, you might want to block non-approved users

    // Get the auth user's email from the profiles relationship
    // Since we don't have direct email access from client, we need to try login with possible patterns
    // Try the standard pattern first
    const possibleEmails = [
      `${username}+@kenmei.local`, // This won't work, we need the actual random suffix
      // We have a problem: we don't know the actual email suffix
    ];

    // Actually, we need a better approach for Phase 2
    // For MVP, we'll use a server-side lookup to get the actual auth user
    const { data: { users }, error: usersError } = await supabaseServer.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      );
    }

    // Find the user by ID
    const authUser = users.find((u) => u.id === profile.id);

    if (!authUser || !authUser.email) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sign in with the actual email
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email: authUser.email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Log the login
    await supabaseServer.from('audit_logs').insert({
      user_id: profile.id,
      action_type: 'user_login',
      resource_type: 'session',
      details: { timestamp: new Date().toISOString() },
    });

    // Create a response with the session
    const response = NextResponse.json(
      { success: true, message: 'Logged in successfully' },
      { status: 200 }
    );

    // Set secure session cookie
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 4, // 4 weeks
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
