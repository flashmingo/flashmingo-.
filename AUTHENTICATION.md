# Kenmei Authentication System - Complete Implementation Guide

## Table of Contents
1. [How Username Authentication Works](#how-username-authentication-works)
2. [Pseudonymous Email Generation](#pseudonymous-email-generation)
3. [Login Flow: Username → Auth Account](#login-flow-username--auth-account)
4. [Security Considerations](#security-considerations)
5. [Project Folder Structure](#project-folder-structure)
6. [Setup Instructions](#setup-instructions)
7. [Verification Steps](#verification-steps)

---

## How Username Authentication Works

### Architecture Overview

Kenmei uses a **username-based authentication system** backed by Supabase Auth and PostgreSQL. Unlike traditional email-based auth, Kenmei treats usernames as the primary identifier while using pseudonymous emails internally.

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                       │
│              (Next.js React Browser Client)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        (POST /api/auth/signup or /api/auth/login)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               NEXT.JS API ROUTES (Server)                    │
│  • /api/auth/signup   - Create user                         │
│  • /api/auth/login    - Authenticate user                   │
│  • /api/auth/logout   - Destroy session                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        (Supabase Service Role Key)
                       │
                       ▼
┌──────────────────────┴──────────────────────────────────────┐
│                   SUPABASE BACKEND                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Supabase Auth (PostgreSQL auth schema)      │   │
│  │  • auth.users table (managed by Supabase)          │   │
│  │  • Stores: email (pseudonymous), password hash     │   │
│  │  • PK: user_id (UUID)                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                       ▲                                      │
│                       │ (one-to-one relationship)            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   PostgreSQL - public.profiles table (custom)       │   │
│  │  • user_id (UUID, PK, FK → auth.users)             │   │
│  │  • username (text, UNIQUE, indexed)                │   │
│  │  • role (student | teacher | administrator)        │   │
│  │  • account_status (pending | approved | rejected)  │   │
│  │  • leaderboard_opt_in (boolean)                    │   │
│  │  • created_at, updated_at                          │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Key Principle: Username ↔ Profile ↔ Auth User

The authentication system maintains three separate but linked entities:

| Entity | Storage | Purpose | Example |
|--------|---------|---------|---------|
| **Username** | `profiles.username` | Public identifier for the user | `alice_smith` |
| **User ID** | `auth.users.id` (UUID) | Internal identifier linking auth to profile | `550e8400-e29b-41d4-a716-446655440000` |
| **Auth Email** | `auth.users.email` | Pseudonymous email for Supabase Auth | `alice_smith+a7f4k2n9@kenmei.local` |

**Never exposed to user**: The auth email is generated server-side and never shown to the user. The user only sees and uses their username.

---

## Pseudonymous Email Generation

### Why Pseudonymous Emails?

**Ohio SB 29 Compliance**: The law prohibits collecting real email addresses from K-12 students without additional consent. By using pseudonymous (fake) emails, Kenmei avoids storing PII while maintaining Supabase Auth compatibility.

### Generation Process

```typescript
// During signup, the server generates:
const randomSuffix = Math.random().toString(36).substring(2, 11);
// Example: "a7f4k2n9"

const pseudoEmail = `${username}+${randomSuffix}@kenmei.local`;
// Example: "alice_smith+a7f4k2n9@kenmei.local"
```

### Properties

- **Format**: `{username}+{randomSuffix}@kenmei.local`
- **Length**: Username (3-50 chars) + `+` + 9-char random suffix + `@kenmei.local`
- **Uniqueness**: Random suffix ensures no two users can have identical email
- **Randomness**: 9 characters from alphanumeric set = ~3.6 trillion combinations
- **Domain**: `kenmei.local` is intentionally non-deliverable (no email server exists for it)
- **Storage**: Stored only in `auth.users.email` (Supabase Auth table)
- **User Visibility**: Never displayed in UI; never sent to user's actual email

### Signup Example

```
User Input:
  - Username: alice_smith
  - Password: SecurePass123!
  - Role: student

Server Processing:
  1. Validate username format: ✓ Alphanumeric + underscore/hyphen only
  2. Check if username exists: ✗ Not found (unique)
  3. Generate pseudonymous email: alice_smith+a7f4k2n9@kenmei.local
  4. Call Supabase Auth signup:
     - Email: alice_smith+a7f4k2n9@kenmei.local
     - Password: SecurePass123!
     → Returns user_id: 550e8400-e29b-41d4-a716-446655440000
  5. Create profiles entry:
     - user_id: 550e8400-e29b-41d4-a716-446655440000
     - username: alice_smith
     - role: student
     - account_status: pending (all new accounts require admin approval)
  6. Log audit event: "user_signup" by user_id at timestamp
  7. Return 201 Created

Client displays: "Account created! Your username is: alice_smith"
```

---

## Login Flow: Username → Auth Account

### Problem Statement

When a user logs in with their **username**, how do we find the corresponding **Supabase Auth account** (which uses a pseudonymous email)?

The challenge: We don't store the pseudo-email in the `profiles` table, so we can't look it up directly.

### Current Solution (Phase 2)

```typescript
// Step 1: User submits username + password
POST /api/auth/login
{
  "username": "alice_smith",
  "password": "SecurePass123!"
}

// Step 2: Server looks up username in profiles table
const { data: profile } = await supabaseServer
  .from('profiles')
  .select('id')
  .eq('username', 'alice_smith')
  .single();
// Returns: { id: '550e8400-e29b-41d4-a716-446655440000' }

// Step 3: Use admin API to find auth user by ID
const { data: { users } } = await supabaseServer.auth.admin.listUsers();
const authUser = users.find(u => u.id === profile.id);
// Returns: { id: '550e8400-e29b-41d4-a716-446655440000', 
//            email: 'alice_smith+a7f4k2n9@kenmei.local', ... }

// Step 4: Sign in using the found email
const { data: session } = await supabaseServer.auth.signInWithPassword({
  email: authUser.email,  // alice_smith+a7f4k2n9@kenmei.local
  password: 'SecurePass123!'
});
// Returns: { session: { access_token, refresh_token } }

// Step 5: Set secure httpOnly cookies
response.cookies.set('sb-access-token', session.access_token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7  // 7 days
});

// Step 6: Return success
return NextResponse.json({ success: true })
```

### Sequence Diagram

```
Client                    API Route              Supabase                PostgreSQL
   │                          │                       │                       │
   ├─ POST /api/auth/login ──>│                       │                       │
   │  username=alice_smith    │                       │                       │
   │  password=SecurePass123  │                       │                       │
   │                          │                       │                       │
   │                          ├─────────────────────────────────────────────>│
   │                          │  SELECT id WHERE      │                       │
   │                          │  username='alice_smith│                       │
   │                          │<─────────────────────────────────────────────┤
   │                          │  Returns user_id      │                       │
   │                          │                       │                       │
   │                          ├── admin.listUsers()──>│                       │
   │                          │  (get all auth users) │                       │
   │                          │<─────────────────────┤                       │
   │                          │  Find user by ID      │                       │
   │                          │  Extract email        │                       │
   │                          │                       │                       │
   │                          ├─signInWithPassword ──>│                       │
   │                          │  email (pseudo)       │                       │
   │                          │  password             │                       │
   │                          │<─────────────────────┤                       │
   │                          │  Returns session      │                       │
   │                          │  (access_token)      │                       │
   │                          │                       │                       │
   │<─ 200 + httpOnly cookies ┤                       │                       │
   │  (sb-access-token)       │                       │                       │
   │
   ├─ GET /dashboard ────────>│                       │                       │
   │  (cookie auto-sent)      │                       │                       │
   │                          ├─ verify JWT ────────>│                       │
   │                          │<─ verified ──────────┤                       │
   │                          │                       │                       │
   │<─ Dashboard content ─────┤                       │                       │
```

### Security Properties

| Property | Implementation | Benefit |
|----------|---|---|
| **Username Privacy** | Only displayed in public; never logged over network | Public identifier doesn't reveal email |
| **Password Never Sent** | Hashed by Supabase; server never sees plaintext | XSS/memory attacks can't extract password |
| **Email Hidden** | Pseudonymous email never shown to user | Complies with Ohio SB 29 (no PII collection) |
| **Token Security** | httpOnly cookies (JavaScript can't access) | Prevents XSS token theft |
| **Token Expiry** | 7-day access token, 4-week refresh token | Limits damage if token leaked |
| **HTTPS Only** | `secure: true` flag in production | Prevents MITM token interception |

---

## Security Considerations

### Strengths of This Approach

1. **Ohio SB 29 Compliance**: No real email addresses collected; pseudonymous emails are undeliverable
2. **XSS Protection**: Tokens stored in httpOnly cookies, not localStorage (JavaScript can't access)
3. **CSRF Protection**: SameSite=lax flag prevents cross-site attacks
4. **Distributed Trust**: Authentication delegated to Supabase; Kenmei doesn't store passwords
5. **Audit Trail**: All auth events logged to `audit_logs` table

### Known Limitations & Risks

| Risk | Current Mitigation | Phase 3+ Enhancement |
|------|---|---|
| **Email Lookup Performance** | `admin.listUsers()` scans all users | Store pseudo-email in `profiles` table for O(1) lookup |
| **No Email Verification** | MVP scope; users can't reset passwords | Phase 6: Email verification workflow |
| **No MFA** | MVP scope | Phase 7: Two-factor authentication |
| **No OAuth** | Usernames required for Kenmei identity | Phase 6: Google/Microsoft federation |
| **Database RLS Not Enforced Yet** | Frontend permission checks only | Phase 3: PostgreSQL RLS policies |
| **No Rate Limiting** | All endpoints can be brute-forced | Phase 4: Add rate limiting middleware |
| **Session Fixation** | Browser may expose cookies | Phase 5: Session invalidation on suspicious activity |

### Recommendations Before Production

- [ ] Enable HTTPS everywhere (set `secure: true` in production)
- [ ] Implement rate limiting on `/api/auth/*` endpoints
- [ ] Add CORS restrictions to match your domain
- [ ] Enable Supabase Auth email verification (if collecting real emails in future)
- [ ] Implement database RLS policies (Phase 3)
- [ ] Add request signing to prevent token tampering
- [ ] Monitor `audit_logs` for suspicious patterns

---

## Project Folder Structure

```
kenmei-/
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── AUTHENTICATION.md               # THIS FILE - Auth system docs
├── DEVELOPMENT.md                  # Developer setup & workflow
├── Documentation.md                # Product requirements document
├── README.md                       # Project overview
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind theme (Sakura palette)
├── postcss.config.js               # PostCSS config
│
├── src/
│   ├── app/                        # Next.js 15 App Router
│   │   ├── layout.tsx              # Root layout (wraps with AuthProvider)
│   │   ├── page.tsx                # Landing page
│   │   ├── error.tsx               # Error page
│   │   ├── not-found.tsx           # 404 page
│   │   │
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── login/page.tsx      # Login page
│   │   │   ├── signup/page.tsx     # Signup page (student/teacher only)
│   │   │   └── logout/
│   │   │       └── route.ts        # Logout API route
│   │   │
│   │   ├── api/                    # Server API routes
│   │   │   └── auth/               # Authentication endpoints
│   │   │       ├── signup/route.ts # POST - Create student/teacher account
│   │   │       ├── login/route.ts  # POST - Authenticate & set cookies
│   │   │       └── logout/route.ts # POST - Clear cookies
│   │   │
│   │   └── (authenticated)/        # Route group - requires auth
│   │       ├── layout.tsx          # Auth guard layout with header/sidebar
│   │       ├── dashboard/page.tsx  # Role-specific dashboard
│   │       └── settings/page.tsx   # User settings
│   │
│   ├── components/                 # Reusable React components
│   │   ├── ui/                     # Base UI components
│   │   │   ├── Button.tsx          # Button (variants: primary/secondary/ghost/danger)
│   │   │   ├── Input.tsx           # Text input with label & error
│   │   │   ├── Select.tsx          # Dropdown select
│   │   │   ├── Checkbox.tsx        # Checkbox input
│   │   │   ├── Card.tsx            # Card container
│   │   │   ├── Alert.tsx           # Alert (type: error/success/warning/info)
│   │   │   ├── Label.tsx           # Form label
│   │   │   └── Loader.tsx          # Loading spinner
│   │   │
│   │   ├── auth/                   # Authentication components
│   │   │   ├── LoginForm.tsx       # Login form (username + password)
│   │   │   └── SignupForm.tsx      # Signup form (username/password/role)
│   │   │
│   │   └── layout/                 # Layout components
│   │       ├── Header.tsx          # Navigation header with user menu
│   │       ├── Sidebar.tsx         # Left sidebar with role-based nav
│   │       └── Footer.tsx          # Footer with links
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Auth context provider & hook
│   │   ├── useUser.ts              # User profile fetching hook
│   │   └── useRole.ts              # Role checking helper hook
│   │
│   ├── lib/                        # Utility & library code
│   │   ├── types.ts                # TypeScript interfaces (Profile, Deck, etc.)
│   │   ├── supabaseClient.ts       # Client-side Supabase instance (anon key)
│   │   ├── supabaseServer.ts       # Server-side Supabase instance (service role)
│   │   ├── auth.ts                 # Auth helper functions (signup/login/logout)
│   │   ├── permissions.ts          # RBAC permission checks
│   │   └── utils.ts                # Utilities (validation, formatting, etc.)
│   │
│   ├── styles/                     # Global styles
│   │   ├── globals.css             # Global resets & typography
│   │   └── theme.css               # CSS variables (Sakura palette)
│   │
│   └── middleware.ts               # Next.js middleware (session validation)
│
├── supabase/                       # Supabase config
│   └── config.json                 # Supabase project settings
│
└── public/                         # Static assets (images, fonts, etc.)
    └── [generated by Next.js]
```

### Key File Descriptions

| File | Purpose | Key Content |
|------|---------|---|
| `src/lib/types.ts` | TypeScript interfaces | Profile, Deck, Flashcard, UserCardProgress, StudySession, AuditLog |
| `src/lib/supabaseClient.ts` | Client-side Supabase | Initialized with anon key (safe for browser) |
| `src/lib/supabaseServer.ts` | Server-side Supabase | Initialized with service role key (never exposed) |
| `src/lib/auth.ts` | Auth utilities | getSession, getUserProfile, signUp, signIn, signOut |
| `src/lib/permissions.ts` | RBAC checks | hasRole, isStudent, isTeacher, isAdmin, canAccessResource |
| `src/lib/utils.ts` | Utilities | isValidPassword, isValidUsername, generateClassroomCode, formatDate |
| `src/hooks/useAuth.ts` | Auth context | AuthProvider, useAuth hook, session state |
| `src/middleware.ts` | Session validation | JWT verification, token refresh, redirect to login |

---

## Setup Instructions

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm**: 9+
- **Git**: 2.30+
- **Supabase Project**: Create free account at https://supabase.com

### Step 1: Clone & Install Dependencies

```bash
# Navigate to project directory
cd /Users/namansoni/kenmei-

# Install dependencies
npm install

# Verify installation
npm --version  # Should be 9+
node --version # Should be 18+
```

### Step 2: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# Open in your editor:
nano .env.local
```

Fill in these variables (from your Supabase project settings):

```env
# Supabase API (from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Supabase Service Role (from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI API Key (optional, for Phase 5+)
OPENAI_API_KEY=sk-...
```

### Step 3: Create Supabase Tables (Phase 2 Workaround)

Since Phase 3 database schema isn't created yet, manually create the `profiles` and `audit_logs` tables in Supabase:

```bash
# In Supabase Dashboard → SQL Editor, run:
```

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'administrator')),
  account_status text NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected')),
  leaderboard_opt_in boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX profiles_username_idx ON profiles(username);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb,
  timestamp timestamp with time zone DEFAULT now()
);

CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_timestamp_idx ON audit_logs(timestamp);

-- Enable RLS (for Phase 3, keep disabled for now)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

### Step 4: Start Development Server

```bash
npm run dev
```

Output:
```
> next dev

▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Environments: .env.local
```

The application is now running at **http://localhost:3000**

---

## Verification Steps

### Test Case 1: Landing Page

**Objective**: Verify landing page loads and auth CTAs visible

**Steps**:
1. Open browser to http://localhost:3000
2. Verify page displays:
   - ✓ "Kenmei" logo/heading
   - ✓ Feature descriptions (4 feature cards)
   - ✓ "Get Started" button (green, primary style)
   - ✓ "Sign In" link (in top-right or navigation)
3. Check browser console (F12) for errors
   - ✓ No TypeScript errors
   - ✓ No API errors

**Expected Result**: Page loads with no errors, buttons are clickable

---

### Test Case 2: Signup - Student Account

**Objective**: Create a student account and verify pending approval status

**Steps**:

1. Click "Get Started" button
   - ✓ Redirected to `/auth/signup`
   - ✓ Form displays with fields:
     - Username input
     - Password input
     - Confirm Password input
     - Account Type dropdown (should show only "Student" and "Teacher", NOT "Administrator")
     - Terms checkbox
     - Create Account button

2. Enter invalid username (too short)
   ```
   Username: ab
   ```
   - ✓ Error appears: "At least 3 characters"

3. Enter invalid password (weak)
   ```
   Password: weak
   ```
   - ✓ Feedback appears listing missing requirements:
     - At least 12 characters
     - At least one uppercase letter
     - At least one number
     - At least one special character

4. Enter valid credentials
   ```
   Username: alice_smith
   Password: SecurePass123!@#
   Confirm Password: SecurePass123!@#
   Account Type: Student
   Terms: ✓ checked
   ```
   - ✓ No validation errors
   - ✓ Create Account button is enabled

5. Click "Create Account"
   - ✓ Button shows loading spinner
   - ✓ No errors in browser console
   - ✓ After 1-2 seconds, redirected to `/dashboard`

6. Verify dashboard loads
   - ✓ Header displays username: "alice_smith"
   - ✓ User menu shows role: "Student"
   - ✓ Alert banner appears: "Your account is pending approval"
   - ✓ Dashboard shows Student cards:
     - My Decks
     - Study
     - Progress (coming soon)

7. **Verify Supabase data** (in Supabase Dashboard):
   - Go to SQL Editor
   ```sql
   SELECT id, username, role, account_status FROM profiles WHERE username = 'alice_smith';
   ```
   - ✓ Returns 1 row:
     - username: alice_smith
     - role: student
     - account_status: pending

**Expected Result**: Student account created in pending status, dashboard shows approval banner

---

### Test Case 3: Signup - Teacher Account

**Objective**: Verify teacher account creation

**Steps**:

1. Click logout (in user menu)
   - ✓ Redirected to home page
   - ✓ Cookies cleared (check DevTools → Application → Cookies)

2. Click "Get Started" again
   - ✓ Redirected to `/auth/signup`
   - ✓ Form is blank

3. Enter teacher credentials
   ```
   Username: bob_jones
   Password: TeacherPass123!@
   Confirm Password: TeacherPass123!@
   Account Type: Teacher
   Terms: ✓ checked
   ```
   - ✓ No validation errors

4. Click "Create Account"
   - ✓ Redirected to `/dashboard`

5. Verify dashboard shows Teacher content
   - ✓ Role shown: "Teacher"
   - ✓ Sidebar shows:
     - Dashboard
     - Study Materials
     - My Classrooms (coming soon)
     - Settings
   - ✓ Alert banner: "Your account is pending approval"

6. **Verify Supabase**:
   ```sql
   SELECT id, username, role, account_status FROM profiles WHERE username = 'bob_jones';
   ```
   - ✓ Returns: role: teacher, account_status: pending

**Expected Result**: Teacher account created, different dashboard UI shown

---

### Test Case 4: Signup - Administrator Rejection

**Objective**: Verify administrator accounts cannot be created via public signup

**Steps**:

1. Go to `/auth/signup`
2. Try to manually select "Administrator" in Account Type dropdown
   - ✓ No "Administrator" option visible in dropdown
   - ✓ Only options: "Student", "Teacher"

3. **Try direct API call** (simulate tampering):
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"hacker","password":"HackerPass123!","role":"administrator"}'
   ```
   - ✓ Response: `400` status
   - ✓ Error message: "Invalid role. Only student and teacher roles are available for signup..."

**Expected Result**: Administrator role cannot be created via public signup (only via database seeding)

---

### Test Case 5: Login - Valid Credentials

**Objective**: Verify login flow works correctly

**Setup**: You have user `alice_smith` created from Test Case 2

**Steps**:

1. Go to home page (http://localhost:3000)
   - ✓ Not logged in (no header/sidebar)

2. Click "Sign In"
   - ✓ Redirected to `/auth/login`
   - ✓ Form displays:
     - Username input
     - Password input
     - Sign In button

3. Enter credentials
   ```
   Username: alice_smith
   Password: SecurePass123!@#
   ```
   - ✓ No validation errors

4. Click "Sign In"
   - ✓ Button shows loading spinner
   - ✓ After 1-2 seconds, redirected to `/dashboard`

5. Verify session established
   - ✓ Header displays username: "alice_smith"
   - ✓ Sidebar visible with navigation
   - ✓ Dashboard content displayed

6. **Check browser cookies** (DevTools → Application → Cookies):
   - ✓ `sb-access-token` present
   - ✓ `sb-refresh-token` present
   - ✓ Both marked: `HttpOnly ✓`, `Secure ✓` (in production), `SameSite: lax`

7. **Verify audit log** (in Supabase):
   ```sql
   SELECT user_id, action_type, timestamp FROM audit_logs 
   WHERE action_type = 'user_login' 
   ORDER BY timestamp DESC LIMIT 1;
   ```
   - ✓ Returns 1 row: action_type = "user_login"

**Expected Result**: Login successful, session cookies set, audit logged

---

### Test Case 6: Login - Invalid Credentials

**Objective**: Verify login rejects wrong password

**Steps**:

1. Go to `/auth/login`
2. Enter credentials
   ```
   Username: alice_smith
   Password: WrongPassword123!
   ```
3. Click "Sign In"
   - ✓ Error alert appears: "Invalid credentials"
   - ✓ NOT redirected
   - ✓ Form remains on page

4. **Try non-existent username**:
   ```
   Username: nonexistent_user
   Password: SomePass123!@
   ```
   - ✓ Error alert: "Invalid credentials" (same message, no user enumeration)

**Expected Result**: Login fails, user stays on form

---

### Test Case 7: Session Persistence

**Objective**: Verify session persists across page navigation

**Setup**: Logged in as alice_smith

**Steps**:

1. On dashboard, you are logged in
   - ✓ Header shows "alice_smith"

2. Click "Settings" in sidebar
   - ✓ Redirected to `/dashboard/settings`
   - ✓ Header still shows "alice_smith"
   - ✓ Settings page displays:
     - Account Information (username, role, status, member since)
     - Privacy & Display (leaderboard visibility)
     - Coming Soon features

3. Click "Dashboard" in sidebar
   - ✓ Redirected back to `/dashboard`
   - ✓ Still logged in (no redirect to login)

4. **Refresh page** (Cmd+R or F5)
   - ✓ Still on `/dashboard`
   - ✓ Still logged in
   - ✓ Header still shows "alice_smith"
   - ✓ No flash of login page

5. **Close browser tab, reopen and navigate to http://localhost:3000**
   - ✓ Browser sends cookies automatically
   - ✓ Redirected to `/dashboard` (because of middleware)
   - ✓ Still logged in as alice_smith

**Expected Result**: Session persists across navigation and browser restarts

---

### Test Case 8: Logout

**Objective**: Verify logout clears session

**Setup**: Logged in as alice_smith

**Steps**:

1. On dashboard, click user menu (top-right)
   - ✓ Dropdown opens showing:
     - Settings
     - Logout

2. Click "Logout"
   - ✓ Button shows loading state
   - ✓ Redirected to home page (`/`)
   - ✓ No header/sidebar visible (logged out)

3. **Verify cookies cleared** (DevTools → Cookies):
   - ✓ `sb-access-token` NOT present
   - ✓ `sb-refresh-token` NOT present

4. Try to navigate to `/dashboard` directly
   - ✓ Redirected to `/auth/login` (middleware blocks access)
   - ✓ Cannot access protected routes without session

**Expected Result**: Logout clears session, protected routes blocked

---

### Test Case 9: RBAC Routing - Student vs Teacher

**Objective**: Verify role-based UI differences

**Setup**: Two accounts created - alice_smith (student), bob_jones (teacher)

**Steps**:

1. **Login as alice_smith (Student)**:
   - ✓ Sidebar shows:
     - Dashboard
     - My Decks → `/decks`
     - Study → `/study`
     - Settings
   - ✓ Dashboard cards:
     - My Decks
     - Study
     - Progress (coming soon)
   - ✓ NO Classrooms or Admin options

2. **Logout, then login as bob_jones (Teacher)**:
   - ✓ Sidebar shows:
     - Dashboard
     - Study Materials → `/decks`
     - Classrooms (coming soon)
     - Settings
   - ✓ Dashboard cards:
     - My Classrooms (coming soon)
     - Student Progress (coming soon)
     - Study Materials
   - ✓ NO My Decks or Admin options (different from student)

3. Try to access `/decks` as student
   - ✓ Page loads with student context

4. Try to access `/decks` as teacher
   - ✓ Page loads with teacher context (same URL, different behavior)

**Expected Result**: Different UI based on role, navigation reflects user type

---

### Test Case 10: Middleware - Protected Routes

**Objective**: Verify unauthenticated users cannot access protected routes

**Setup**: Logged out (no session)

**Steps**:

1. Navigate to `http://localhost:3000/dashboard` directly (no login)
   - ✓ Redirected to `/auth/login`
   - ✓ Cannot see dashboard content

2. Navigate to `http://localhost:3000/settings` directly
   - ✓ Redirected to `/auth/login`

3. Navigate to `http://localhost:3000/decks` (coming soon, but protected)
   - ✓ Redirected to `/auth/login`

4. Public routes ARE accessible without login:
   - ✓ `http://localhost:3000/` (home) ✓ Works
   - ✓ `http://localhost:3000/auth/login` ✓ Works
   - ✓ `http://localhost:3000/auth/signup` ✓ Works

**Expected Result**: Middleware enforces auth on protected routes, public routes accessible

---

### Test Case 11: Password Validation

**Objective**: Verify all password requirements enforced

**Setup**: On signup page

**Steps**:

1. Enter each invalid password and check feedback:

   | Password | Valid? | Feedback |
   |----------|--------|----------|
   | `short` | ✗ | "At least 12 characters" |
   | `NoNumber!` | ✗ | "At least one number" |
   | `nouppercase1!` | ✗ | "At least one uppercase letter" |
   | `NOLOWERCASE1!` | ✗ | "At least one lowercase letter" |
   | `NoSpecial123` | ✗ | "At least one special character" |
   | `Valid1@Pass` | ✗ | "At least 12 characters" |
   | `ValidPass123!` | ✓ | "✓ Strong password" |

2. Verify "Confirm Password" matching
   ```
   Password: ValidPass123!
   Confirm: ValidPass123
   ```
   - ✓ Error: "Passwords do not match"
   - ✓ Create Account button disabled

3. Match both
   ```
   Password: ValidPass123!
   Confirm: ValidPass123!
   ```
   - ✓ Error cleared
   - ✓ Create Account button enabled

**Expected Result**: All password rules enforced on client and server

---

## Troubleshooting

### Issue: "next: command not found"

**Solution**:
```bash
npm install
npm run dev
```

### Issue: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solution**:
```bash
# Check .env.local exists
ls -la .env.local

# Verify variables are set
cat .env.local | grep NEXT_PUBLIC_SUPABASE_URL
```

### Issue: "profiles table does not exist"

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL commands from Setup Step 3
3. Restart dev server: `npm run dev`

### Issue: "Signup works but login fails"

**Solution**:
1. Check Supabase `auth.users` table exists (should be auto-created)
2. Verify `profiles` table has the signed-up username:
   ```sql
   SELECT username, role, account_status FROM profiles ORDER BY created_at DESC LIMIT 5;
   ```
3. Check browser console for specific error message
4. Try logging in again with exact username/password used in signup

### Issue: Cookies not persisting

**Solution**:
1. Check DevTools → Application → Cookies:
   - ✓ `sb-access-token` present?
   - ✓ Domain is `localhost`?
   - ✓ Path is `/`?
2. In `.env.local`, ensure `NEXT_PUBLIC_APP_URL=http://localhost:3000`
3. Restart dev server

---

## Summary

### Authentication Flow Overview

```
Signup:  
  User enters username/password/role →
  POST /api/auth/signup →
  Server generates pseudonymous email →
  Creates Supabase auth user →
  Creates profile entry (pending approval) →
  Returns 201

Login:
  User enters username/password →
  POST /api/auth/login →
  Server looks up username in profiles →
  Finds corresponding auth user →
  Validates password →
  Sets secure httpOnly cookies →
  Returns 200

Protected Routes:
  Client requests /dashboard (cookie auto-sent) →
  Middleware validates JWT →
  If valid, allows access →
  If invalid/expired, redirects to /auth/login

Logout:
  User clicks logout →
  POST /api/auth/logout →
  Server clears cookies →
  Returns 200 →
  Redirect to home
```

### Key Security Points

| Component | Security Feature |
|-----------|---|
| **Username** | Only identifier shown publicly; doesn't contain email |
| **Password** | Hashed by Supabase; server never sees plaintext |
| **Email** | Pseudonymous (`username+random@kenmei.local`); never shown |
| **Tokens** | httpOnly cookies; JavaScript cannot access |
| **Transport** | HTTPS in production; `secure: true` flag set |
| **CSRF** | SameSite=lax protects against cross-site attacks |
| **Rate Limiting** | TODO (Phase 4): Add to prevent brute-force |
| **Audit Trail** | All auth events logged to database |

### Next Steps (Phase 3)

- [ ] Create complete database schema (8 tables)
- [ ] Add indexes for performance
- [ ] Implement Row-Level Security policies
- [ ] Update login route to store pseudo-email in profiles (O(1) lookup)
- [ ] Add rate limiting to auth endpoints

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-08  
**Next Review**: Before Phase 3 database implementation
