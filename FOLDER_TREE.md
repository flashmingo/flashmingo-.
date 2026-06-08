# Kenmei Project Folder Structure

```
kenmei-/
│
├── ROOT FILES
│   ├── .env.example                # Environment variables template
│   ├── .gitignore                  # Git ignore rules
│   ├── AUTHENTICATION.md           # Authentication system documentation
│   ├── DEVELOPMENT.md              # Developer guide (setup, workflow, commands)
│   ├── Documentation.md            # Product specification document
│   ├── README.md                   # Project overview
│   ├── FOLDER_TREE.md              # THIS FILE
│   ├── package.json                # Dependencies & npm scripts
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tailwind.config.ts          # Tailwind CSS theme (Sakura palette)
│   └── postcss.config.js           # PostCSS configuration
│
├── src/
│   │
│   ├── app/                        # Next.js 15 App Router pages & layouts
│   │   │
│   │   ├── ROOT PAGES
│   │   ├── layout.tsx              # Root layout (HTML, fonts, AuthProvider)
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── error.tsx               # Error boundary page
│   │   └── not-found.tsx           # 404 page
│   │
│   │   ├── auth/                   # Authentication pages & routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login page (/auth/login)
│   │   │   ├── signup/
│   │   │   │   └── page.tsx        # Signup page (/auth/signup)
│   │   │   └── logout/
│   │   │       └── route.ts        # Logout API route (POST /api/auth/logout)
│   │   │
│   │   ├── api/                    # API routes (server endpoints)
│   │   │   └── auth/               # Authentication endpoints
│   │   │       ├── signup/
│   │   │       │   └── route.ts    # POST /api/auth/signup
│   │   │       ├── login/
│   │   │       │   └── route.ts    # POST /api/auth/login
│   │   │       └── logout/
│   │   │           └── route.ts    # POST /api/auth/logout
│   │   │
│   │   └── (authenticated)/        # Route group - requires authentication
│   │       ├── layout.tsx          # Auth guard layout (Header, Sidebar, Footer)
│   │       ├── dashboard/
│   │       │   └── page.tsx        # Dashboard (/dashboard) - role-specific
│   │       └── settings/
│   │           └── page.tsx        # Settings page (/settings)
│   │
│   ├── components/                 # Reusable React components
│   │   │
│   │   ├── ui/                     # Base UI components (8 files)
│   │   │   ├── Button.tsx          # Button (variants: primary/secondary/ghost/danger)
│   │   │   ├── Input.tsx           # Text input with label & error
│   │   │   ├── Select.tsx          # Dropdown select with options
│   │   │   ├── Checkbox.tsx        # Checkbox input with label
│   │   │   ├── Card.tsx            # Card container with border/shadow
│   │   │   ├── Alert.tsx           # Alert (type: error/success/warning/info)
│   │   │   ├── Label.tsx           # Form label
│   │   │   └── Loader.tsx          # Spinning loader animation
│   │   │
│   │   ├── auth/                   # Authentication-specific components
│   │   │   ├── LoginForm.tsx       # Login form (username + password)
│   │   │   └── SignupForm.tsx      # Signup form (username/password/confirm/role)
│   │   │
│   │   └── layout/                 # Layout components
│   │       ├── Header.tsx          # Navigation header with user menu
│   │       ├── Sidebar.tsx         # Left navigation sidebar (role-based)
│   │       └── Footer.tsx          # Footer with copyright/links
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Auth context provider & hook
│   │   │                            # - Manages session state
│   │   │                            # - Provides signUp, signIn, signOut
│   │   ├── useUser.ts              # User profile fetching
│   │   │                            # - Fetches and caches user data
│   │   └── useRole.ts              # Role checking helpers
│   │                                # - isStudent, isTeacher, isAdmin
│   │
│   ├── lib/                        # Library & utility code
│   │   ├── types.ts                # TypeScript interfaces
│   │   │                            # - Profile, District, Classroom, Deck, Flashcard
│   │   │                            # - UserCardProgress, StudySession, AuditLog
│   │   │                            # - ApiResponse, PaginatedResponse
│   │   │
│   │   ├── supabaseClient.ts       # Client-side Supabase instance
│   │   │                            # - Initialized with anon key
│   │   │                            # - Safe for browser use
│   │   │
│   │   ├── supabaseServer.ts       # Server-side Supabase instance
│   │   │                            # - Initialized with service role key
│   │   │                            # - Only used in server routes
│   │   │
│   │   ├── auth.ts                 # Authentication helpers
│   │   │                            # - getSession()
│   │   │                            # - getUserProfile()
│   │   │                            # - signUp(), signIn(), signOut()
│   │   │
│   │   ├── permissions.ts          # RBAC permission checks
│   │   │                            # - hasRole(), isStudent(), isTeacher(), isAdmin()
│   │   │                            # - isAccountApproved()
│   │   │                            # - canAccessResource()
│   │   │                            # - getAccessibleRoutes()
│   │   │
│   │   └── utils.ts                # Utility functions
│   │                                # - isValidPassword(), isValidUsername()
│   │                                # - sanitizeUsername()
│   │                                # - getUsernameFeedback(), getPasswordStrengthFeedback()
│   │                                # - generateClassroomCode()
│   │                                # - formatDate(), formatDateTime(), formatDuration()
│   │                                # - debounce(), getGreeting()
│   │
│   ├── styles/                     # Global CSS
│   │   ├── globals.css             # Global resets & typography
│   │   │                            # - Font imports (Montserrat, Open Sans)
│   │   │                            # - Element resets
│   │   │                            # - Scrollbar styling
│   │   │
│   │   └── theme.css               # CSS variables (design system)
│   │                                # - Sakura color palette
│   │                                # - Spacing variables
│   │                                # - Typography scales
│   │
│   └── middleware.ts               # Next.js middleware
│                                    # - Session validation on protected routes
│                                    # - JWT verification
│                                    # - Token refresh logic
│                                    # - Redirect to /auth/login if unauthorized
│
├── supabase/                       # Supabase configuration
│   ├── config.json                 # Supabase project settings
│   │                                # - Auth settings
│   │                                # - Storage bucket config
│   │                                # - Database port/host
│   │
│   └── migrations/                 # SQL migrations (Phase 3)
│       └── [to be created]
│
└── public/                         # Static assets (created by Next.js)
    └── [images, fonts, icons]
```

## File Count Summary

| Category | Count | Files |
|----------|-------|-------|
| **Pages** | 8 | layout, page, error, not-found, login, signup, dashboard, settings |
| **API Routes** | 3 | signup, login, logout |
| **Components** | 14 | 8 UI + 2 Auth + 3 Layout + 1 Sidebar |
| **Hooks** | 3 | useAuth, useUser, useRole |
| **Library** | 6 | types, supabaseClient, supabaseServer, auth, permissions, utils |
| **Styles** | 2 | globals.css, theme.css |
| **Config** | 6 | tsconfig, tailwind, postcss, supabase/config.json, .env.example, .gitignore |
| **Docs** | 4 | README, DEVELOPMENT, Documentation, AUTHENTICATION |
| **Middleware** | 1 | middleware.ts |
| **Total** | ~46 | Phases 1-2 complete |

## Key Paths Reference

### Authentication Flows
```
Landing Page     → http://localhost:3000/
  ↓ (Get Started)
Signup Page      → http://localhost:3000/auth/signup
  ↓ (Submit)
Signup API       → POST /api/auth/signup
  ↓ (Success)
Dashboard        → http://localhost:3000/dashboard

Landing Page     → http://localhost:3000/
  ↓ (Sign In)
Login Page       → http://localhost:3000/auth/login
  ↓ (Submit)
Login API        → POST /api/auth/login
  ↓ (Success)
Dashboard        → http://localhost:3000/dashboard
```

### Protected Routes (Require Auth)
```
/dashboard/          → Role-based dashboard
/settings/           → User settings
/decks/              → Flashcard decks (Phase 4)
/study/              → Study sessions (Phase 5)
/classrooms/         → Teacher classrooms (Phase 4)
```

### Public Routes (No Auth Required)
```
/                    → Landing page
/auth/login          → Login page
/auth/signup         → Signup page
/auth/logout         → Logout endpoint
```

## Import Aliases

All imports use path aliases defined in `tsconfig.json`:

```typescript
// Instead of relative imports:
import Component from '../../../components/ui/Button';

// Use aliases:
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { supabaseClient } from '@/lib/supabaseClient';
import { Profile } from '@/lib/types';
```

## Database Schema Reference (Phase 2)

### Tables Created

| Table | Purpose | Columns |
|-------|---------|---------|
| `profiles` | User accounts & roles | id, username, role, account_status, leaderboard_opt_in, created_at, updated_at |
| `audit_logs` | Activity tracking | id, user_id, action_type, resource_type, resource_id, details, timestamp |

### Tables to Create (Phase 3)

| Table | Purpose |
|-------|---------|
| `districts` | School district organization |
| `classrooms` | Teacher-managed classrooms |
| `student_classroom_memberships` | Student enrollment |
| `decks` | Flashcard collections |
| `flashcards` | Individual flashcards |
| `user_card_progress` | SM-2 spaced repetition data |
| `study_sessions` | Study activity logs |

## Environment Variables

### Required (In `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key
NEXT_PUBLIC_APP_URL               # Application base URL
```

### Optional
```
OPENAI_API_KEY                    # For AI features (Phase 5+)
```

## Build & Run Commands

```bash
# Development
npm run dev              # Start dev server on :3000

# Build
npm run build            # Compile for production
npm start                # Run production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types

# Database (Phase 3+)
npm run db:push          # Push migrations
npm run db:pull          # Pull schema
npm run db:reset         # Reset database
```

---

**Last Updated**: 2026-06-08  
**Phase**: 2 (Auth & RBAC complete)  
**Next Phase**: 3 (Database & RLS)
