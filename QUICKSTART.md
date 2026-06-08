# Kenmei - Quick Start Guide

## TL;DR - Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd /Users/namansoni/kenmei-
npm install
```

### 2. Create Supabase Tables
Go to **Supabase Dashboard → SQL Editor** and run:
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'administrator')),
  account_status text NOT NULL DEFAULT 'pending',
  leaderboard_opt_in boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX profiles_username_idx ON profiles(username);

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
```

### 3. Configure Environment
```bash
# Copy template
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local
```

**Fill in these from Supabase Dashboard → Settings → API:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Development Server
```bash
npm run dev
```

**Output:**
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
```

### 5. Test Registration
1. Open http://localhost:3000
2. Click "Get Started"
3. Fill signup form:
   - **Username**: `testuser123`
   - **Password**: `TestPass123!@`
   - **Confirm**: `TestPass123!@`
   - **Account Type**: `Student`
   - ✓ Check Terms
4. Click "Create Account"
5. Should redirect to dashboard

### 6. Test Login
1. Click "Logout" (top-right user menu)
2. Click "Sign In"
3. Enter same credentials
4. Should redirect to dashboard

---

## Folder Structure (High-Level)

```
kenmei-/
├── src/
│   ├── app/              # Pages & API routes
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks (useAuth, useUser, useRole)
│   ├── lib/              # Utilities & Supabase clients
│   ├── styles/           # CSS (globals, theme)
│   └── middleware.ts     # Session validation
├── supabase/             # Supabase config
├── AUTHENTICATION.md     # How auth works
├── DEVELOPMENT.md        # Developer guide
├── FOLDER_TREE.md        # Detailed folder structure
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── tailwind.config.ts    # Tailwind theme
```

---

## Authentication Flow (Summary)

### Signup
```
User fills signup form →
POST /api/auth/signup →
Server generates pseudonymous email (user+random@kenmei.local) →
Creates Supabase auth user →
Creates profiles entry (pending approval) →
Redirects to /dashboard
```

### Login
```
User enters username + password →
POST /api/auth/login →
Server looks up username in profiles table →
Finds corresponding auth user email →
Calls Supabase signInWithPassword →
Sets httpOnly session cookies →
Redirects to /dashboard
```

### Session
```
Every request to /dashboard (protected route) →
Middleware validates JWT in cookies →
If valid, allows access →
If invalid, redirects to /auth/login
```

---

## Key Features

✅ **Username-based authentication** (no email required)  
✅ **Pseudonymous emails** (Ohio SB 29 compliant)  
✅ **Role-based access** (Student, Teacher, Administrator)  
✅ **httpOnly session cookies** (XSS-safe)  
✅ **Automatic token refresh** (7-day expiry)  
✅ **Audit logging** (all auth events tracked)  
✅ **Form validation** (client + server)  
✅ **Password strength** (12+ chars, mixed case, number, special char)  

---

## Admin Accounts

⚠️ **Important**: Administrators cannot be created via public signup.

**To create an admin account:**

```sql
-- Option 1: Direct Supabase Auth signup (then update profile)
-- 1. Create auth user via Supabase Dashboard
-- 2. Update profile role:
UPDATE profiles SET role = 'administrator' WHERE username = 'admin_user';

-- Option 2: Via database seeding (Phase 3)
-- Admin provisioning workflow TBA
```

---

## Verification Checklist

### Basic Flow
- [ ] Signup page loads (/auth/signup)
- [ ] Signup accepts valid credentials
- [ ] Dashboard shows after signup
- [ ] Logout clears session
- [ ] Login page loads (/auth/login)
- [ ] Login accepts valid credentials
- [ ] Dashboard shows after login

### Validation
- [ ] Short username rejected
- [ ] Weak password rejected
- [ ] Password mismatch rejected
- [ ] Duplicate username rejected
- [ ] Invalid credentials on login rejected

### Role-Based
- [ ] Student account shows student UI
- [ ] Teacher account shows teacher UI
- [ ] Dashboard shows role-specific cards
- [ ] Sidebar shows role-specific navigation

### Security
- [ ] Session persists on refresh
- [ ] Session persists on page navigation
- [ ] Logout redirects to home
- [ ] Protected routes block unauthenticated access
- [ ] Cookies are httpOnly (DevTools → Application → Cookies)

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | Check `.env.local` exists & has correct values |
| `profiles table does not exist` | Run SQL in Step 2 above |
| Signup works but login fails | Verify `profiles` table has the user |
| Session doesn't persist | Check cookies in DevTools |
| Can't access /dashboard | Verify middleware.ts exists & is loaded |

---

## Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Database (Phase 3+)
npm run db:push
npm run db:pull
npm run db:reset
```

---

## What's Next?

**Phase 3**: Database schema & RLS policies  
**Phase 4**: Flashcard CRUD & classrooms  
**Phase 5**: Study sessions & SM-2 algorithm  
**Phase 6**: AI features, password reset, OAuth  
**Phase 7**: Admin dashboard, analytics, MFA  

See `DEVELOPMENT.md` for detailed roadmap.

---

**Last Updated**: 2026-06-08  
**Phase**: 2 (Auth & RBAC complete)
