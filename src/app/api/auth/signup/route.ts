import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';
import { isValidPassword, isValidUsername, sanitizeUsername } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    // Validate input
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Only student and teacher roles are available for signup. Administrator accounts must be created through the provisioning workflow.' },
        { status: 400 }
      );
    }

    // Validate username format
    const sanitized = sanitizeUsername(username);
    if (!isValidUsername(sanitized)) {
      return NextResponse.json(
        { error: 'Username must be 3-50 characters (alphanumeric, underscore, hyphen only)' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('username', sanitized)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Generate pseudonymous email
    const randomSuffix = Math.random().toString(36).substring(2, 11);
    const pseudoEmail = `${sanitized}+${randomSuffix}@kenmei.local`;

    // Create auth user
    const { data: authData, error: authError } = await supabaseServer.auth.signUp({
      email: pseudoEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Create profile
    // All newly created accounts start as 'pending' and require admin approval
    const accountStatus = 'pending';
    const { error: profileError } = await supabaseServer
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: sanitized,
        role,
        account_status: accountStatus,
        leaderboard_opt_in: true,
      });

    if (profileError) {
      // Attempt to delete the auth user if profile creation fails
      await supabaseServer.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 400 }
      );
    }

    // Log the signup in audit logs
    await supabaseServer.from('audit_logs').insert({
      user_id: authData.user.id,
      action_type: 'user_signup',
      resource_type: 'profile',
      resource_id: authData.user.id,
      details: { role, username: sanitized },
    });

    return NextResponse.json(
      { 
        success: true,
        message: `Account created. ${role === 'administrator' ? 'Welcome!' : 'Awaiting admin approval.'}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
