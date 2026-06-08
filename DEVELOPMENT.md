# Kenmei MVP - Development Guide

## Project Setup

### Prerequisites
- Node.js 18+ (use nvm for version management)
- npm or yarn
- Supabase CLI (`npm install -g supabase`)
- Git

### Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase project credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Visit `http://localhost:3000`

### Database Setup

1. **Initialize Supabase Locally (Optional)**
   ```bash
   supabase start
   ```

2. **Run Migrations**
   ```bash
   supabase migration new init_schema
   # Edit the migration file, then:
   supabase db push
   ```

3. **Reset Database**
   ```bash
   supabase db reset
   ```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 3.4 with custom Sakura color palette
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State Management**: React Context (minimal, auth-focused)
- **Database**: PostgreSQL with Row-Level Security

### Project Structure
- `src/app/` - Next.js pages and routes
- `src/components/` - React components by feature
- `src/lib/` - Utility functions and service layers
- `src/styles/` - Global CSS and theme variables
- `src/hooks/` - Custom React hooks
- `supabase/migrations/` - Database migrations
- `supabase/functions/` - Edge Functions (Phase 5+)

### Data Flow

**Authentication**:
1. User submits username + password on signup/login page
2. Server-side function creates pseudonymous email (`username+UUID@kenmei.local`)
3. Supabase Auth creates auth user with email + password
4. Server creates profile record in `profiles` table
5. Supabase JWT stored in httpOnly cookie
6. User redirected to dashboard

**Flashcard Study**:
1. User selects deck and enters study session
2. Flashcards queried from `flashcards` table filtered by `user_card_progress.next_review_at`
3. Cards displayed based on SM-2 algorithm (ease_factor, interval_days)
4. User provides feedback (correct/easy, correct/good, incorrect, etc.)
5. Server-side Edge Function updates SM-2 metrics
6. Session saved to `study_sessions` table

**Authorization**:
- **Layer 1**: Middleware validates JWT on page routes
- **Layer 2**: RLS policies enforce at database layer
- **Layer 3**: Frontend checks permissions for UI visibility (not security)

## Development Workflow

### Phase 1: Project Setup ✅ (Currently Here)
- [x] Next.js 15 initialization
- [x] TypeScript configuration
- [x] Tailwind CSS with Sakura theme
- [x] Supabase connection setup
- [x] Root layouts and landing page
- [x] Utility libraries (auth, permissions, utils)

### Phase 2: Authentication & RBAC (Next)
- [ ] Signup page with role selection
- [ ] Login page with username/password
- [ ] Logout functionality
- [ ] Session management middleware
- [ ] Auth guard layout for protected routes
- [ ] User context hook

### Phase 3: Database & RLS
- [ ] Create database migrations
- [ ] Implement RLS policies
- [ ] Create indexes for performance

### Phase 4: Flashcard CRUD
- [ ] Create deck pages
- [ ] Create flashcard editor
- [ ] Implement image uploads
- [ ] List and display decks

### Phase 5: Study Sessions & SM-2
- [ ] Study session interface
- [ ] SM-2 algorithm implementation
- [ ] Progress tracking
- [ ] Memory growth scoring

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Type Checking
npm run type-check       # Run TypeScript check

# Database
npm run db:push          # Push migrations to Supabase
npm run db:pull          # Pull schema from Supabase
npm run db:reset         # Reset database

# Code Quality
npm run lint             # Run ESLint
```

## Git Workflow

### Branch Naming
- `feat/auth-login` - New features
- `fix/session-timeout` - Bug fixes
- `refactor/db-queries` - Code improvements
- `docs/setup-guide` - Documentation

### Commit Messages
```
feat(auth): implement login with username
fix(flashcards): correct SM-2 calculation
refactor(db): optimize user card progress queries
docs(setup): update environment variable instructions
```

## Security Checklist

- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- [ ] Always validate user permissions server-side
- [ ] Use HTTPS in production
- [ ] Sanitize all user inputs
- [ ] Use parameterized queries (Supabase client handles this)
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting on auth endpoints
- [ ] Use strong password requirements (min 12 chars)
- [ ] Enable MFA for admin accounts (Phase 7)
- [ ] Regularly audit access logs

## Testing Strategy

Each phase includes:
- **Unit Tests**: Utility functions (auth, sm2, permissions)
- **Integration Tests**: API routes and Supabase queries
- **E2E Tests**: User flows (signup, login, create deck, study)

Test files follow pattern: `__tests__/feature.test.ts`

## Deployment

### Vercel (Frontend)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Enable automatic deployments on push to `main`

### Supabase (Backend)
1. Use Supabase dashboard to manage project
2. Database migrations applied via CLI
3. Edge Functions deployed via CLI or dashboard

## Performance Targets

- **Page Load**: < 2 seconds (First Contentful Paint)
- **API Latency**: < 300ms (95th percentile)
- **Auth Endpoints**: < 150ms
- **Study Session Endpoints**: < 150ms
- **Uptime**: 99.9% (Year 1)

## Troubleshooting

**Session not persisting**:
- Check `.env.local` has correct Supabase URL and keys
- Verify cookies are enabled in browser
- Clear browser cache and cookies

**Database connection errors**:
- Verify Supabase project is running
- Check network access to Supabase
- Ensure credentials are correct

**Image uploads failing**:
- Verify storage bucket is configured
- Check file size limit (5MB default)
- Verify MIME type is allowed

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)

## Contact & Support

For questions or issues:
1. Check existing documentation
2. Search GitHub issues
3. Open a new issue with reproduction steps
