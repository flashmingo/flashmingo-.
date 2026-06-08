#!/bin/bash
# Kenmei Database Setup Script

echo "🚀 Kenmei Database Setup"
echo "========================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found. Please copy .env.example to .env.local and fill in your Supabase credentials."
  exit 1
fi

echo "✅ .env.local found"
echo ""

# Load environment variables
set -a
source .env.local
set +a

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not set in .env.local"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL not set in .env.local"
  exit 1
fi

echo "📊 Running migrations..."
echo ""

# Extract project ID from URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | grep -oP 'https://\K[^.]*')

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Could not extract project ID from SUPABASE_URL"
  exit 1
fi

echo "Project ID: $PROJECT_ID"
echo ""

# Run migrations manually via Supabase REST API
# Note: This script assumes you have supabase-cli installed
# If not, manually run the SQL files in supabase/migrations/ via the Supabase Dashboard

echo "📝 Instructions:"
echo "1. Go to your Supabase Dashboard: https://app.supabase.com"
echo "2. Navigate to SQL Editor"
echo "3. Run the following SQL files in order:"
echo "   - supabase/migrations/001_init_schema.sql"
echo "   - supabase/migrations/002_add_indexes.sql"
echo "   - supabase/migrations/003_rls_policies.sql"
echo ""

# Attempt to use Supabase CLI if available
if command -v supabase &> /dev/null; then
  echo "🔧 Supabase CLI detected. Attempting to push migrations..."
  supabase db push
else
  echo "ℹ️  supabase-cli not installed. Please use the Supabase Dashboard to run the migrations."
  echo ""
  echo "To install supabase-cli: npm install -g supabase"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Enable RLS policies in Supabase Dashboard if needed"
echo "2. Create a test user account via npm run dev"
echo "3. Start the development server: npm run dev"
