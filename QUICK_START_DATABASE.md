# 🚀 Quick Start - Database Setup (5 Minutes)

Get your VibeCode Editor database up and running in 5 minutes!

## Step 1: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com) → Sign in → "New Project"
2. Fill in:
   - Name: `vibecode-editor`
   - Password: (choose a strong password)
   - Region: (closest to you)
3. Click "Create new project" → Wait ~2 minutes

## Step 2: Get Credentials (1 min)

1. In Supabase dashboard → **Settings** → **API**
2. Copy these 3 values:
   - Project URL
   - anon public key
   - service_role key

## Step 3: Configure Environment (30 sec)

Create `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Step 4: Run Schema (1 min)

1. Supabase dashboard → **SQL Editor** → "New Query"
2. Copy entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Paste → Click "Run" → Wait ~10 seconds

## Step 5: Verify (30 sec)

Run this in SQL Editor:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Should see 9 tables:
- accounts
- chat_messages
- playground_collaborators
- playground_versions
- playgrounds
- star_marks
- template_files
- user_activity_log
- user_profiles

## ✅ Done!

Start your app:

```bash
npm run dev
```

---

## 📚 Next Steps

- [Full Setup Guide](./SETUP_DATABASE.md) - Detailed instructions
- [Schema Documentation](./supabase/README.md) - Complete reference
- [Helper Functions](./lib/supabase/helpers.ts) - Ready-to-use functions
- [TypeScript Types](./lib/supabase/types.ts) - Type definitions

## 🆘 Troubleshooting

**Issue**: Schema won't run  
**Fix**: Make sure you copied the ENTIRE schema.sql file

**Issue**: Can't connect from app  
**Fix**: Double-check your .env file has correct values

**Issue**: Tables not showing  
**Fix**: Refresh the Supabase dashboard page

---

**Need help?** Check [SETUP_DATABASE.md](./SETUP_DATABASE.md) for detailed troubleshooting.