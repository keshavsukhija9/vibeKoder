# Database Setup Guide - VibeCode Editor

This guide will help you set up the Supabase database for the VibeCode Editor project.

## 📋 Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Node.js 18+ installed
- Basic understanding of PostgreSQL

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name**: VibeCode Editor (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project" and wait for setup to complete (~2 minutes)

### Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 4: Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open [`supabase/schema.sql`](./supabase/schema.sql) in your code editor
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click "Run" (or press Cmd/Ctrl + Enter)
7. Wait for completion (~10-30 seconds)

### Step 5: Verify Setup

Run this query in the SQL Editor to verify all tables were created:

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 9 tables:
- ✅ accounts
- ✅ chat_messages
- ✅ playground_collaborators
- ✅ playground_versions
- ✅ playgrounds
- ✅ star_marks
- ✅ template_files
- ✅ user_activity_log
- ✅ user_profiles

### Step 6: Enable Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable the providers you want to use:
   - **Email** (enabled by default)
   - **Google OAuth** (recommended)
   - **GitHub OAuth** (recommended)
3. Configure each provider with your OAuth credentials

### Step 7: Test the Connection

Run your Next.js app:
```bash
npm run dev
```

Try signing up/in to verify the database connection works!

## 🔧 Advanced Setup

### Custom Domain (Optional)

If you want to use a custom domain for your Supabase project:

1. Go to **Settings** → **Custom Domains**
2. Follow the instructions to add your domain
3. Update `NEXT_PUBLIC_SUPABASE_URL` in `.env`

### Database Backups

Supabase automatically backs up your database daily. To configure:

1. Go to **Settings** → **Database**
2. Under "Backups", configure your retention period
3. You can also trigger manual backups

### Performance Optimization

For better performance with large datasets:

```sql
-- Add additional indexes for frequently queried columns
CREATE INDEX idx_playgrounds_title ON playgrounds USING gin(to_tsvector('english', title));
CREATE INDEX idx_playgrounds_description ON playgrounds USING gin(to_tsvector('english', description));

-- Analyze tables for query optimization
ANALYZE playgrounds;
ANALYZE template_files;
ANALYZE chat_messages;
```

### Connection Pooling

For production, enable connection pooling:

1. Go to **Settings** → **Database**
2. Under "Connection pooling", enable it
3. Use the pooler connection string for your application

## 🔄 Migration from MongoDB

If you're migrating from the MongoDB/Prisma setup:

### Option 1: Automated Migration Script

```bash
# Set to dry run first to test
DRY_RUN=true npx tsx scripts/migrate-to-supabase.ts

# Run actual migration
DRY_RUN=false npx tsx scripts/migrate-to-supabase.ts
```

### Option 2: Manual Migration

1. Export data from MongoDB:
```bash
mongoexport --uri="your-mongodb-uri" --collection=users --out=users.json
mongoexport --uri="your-mongodb-uri" --collection=playgrounds --out=playgrounds.json
# ... repeat for other collections
```

2. Transform and import to Supabase using the helper functions in `lib/supabase/helpers.ts`

## 📊 Database Schema Overview

### Core Entities

```
User Profiles → Playgrounds → Template Files
     ↓              ↓              ↓
  Accounts    Star Marks    Collaborators
     ↓              ↓              ↓
Chat Messages  Versions    Activity Log
```

### Key Features

- **Row Level Security (RLS)**: All tables have RLS policies
- **Automatic Timestamps**: `created_at` and `updated_at` auto-managed
- **Soft Deletes**: Cascade deletes configured
- **Full-Text Search**: Ready for search functionality
- **JSONB Storage**: Flexible file content storage
- **Version Control**: Built-in versioning system

## 🔒 Security Best Practices

### 1. Never Expose Service Role Key

```typescript
// ❌ WRONG - Never use in client-side code
const supabase = createClient(url, serviceRoleKey)

// ✅ CORRECT - Use anon key in client
const supabase = createClient(url, anonKey)
```

### 2. Always Use RLS Policies

All tables have RLS enabled. Never disable it:

```sql
-- ❌ WRONG
ALTER TABLE playgrounds DISABLE ROW LEVEL SECURITY;

-- ✅ CORRECT - Add proper policies instead
CREATE POLICY "policy_name" ON playgrounds ...
```

### 3. Validate User Input

```typescript
// Always validate and sanitize user input
const { data, error } = await supabase
  .from('playgrounds')
  .insert({
    title: sanitize(userInput.title),
    description: sanitize(userInput.description)
  })
```

### 4. Use Prepared Statements

Supabase client automatically uses prepared statements, but be careful with raw SQL:

```typescript
// ✅ CORRECT - Parameterized query
const { data } = await supabase.rpc('my_function', { 
  user_id: userId 
})

// ❌ WRONG - SQL injection risk
const { data } = await supabase.rpc('raw_query', {
  query: `SELECT * FROM users WHERE id = '${userId}'`
})
```

## 🐛 Troubleshooting

### Issue: "relation does not exist"

**Solution**: The schema wasn't run properly. Re-run the schema.sql file.

### Issue: "permission denied for table"

**Solution**: Check RLS policies. You might need to add a policy for your use case.

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Add missing policy
CREATE POLICY "policy_name" ON your_table FOR SELECT USING (true);
```

### Issue: "duplicate key value violates unique constraint"

**Solution**: You're trying to insert a record that already exists. Use `upsert` instead:

```typescript
const { data, error } = await supabase
  .from('playgrounds')
  .upsert({ id: existingId, ...updates })
```

### Issue: Slow queries

**Solution**: Add indexes for frequently queried columns:

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Add index
CREATE INDEX idx_name ON table_name(column_name);
```

### Issue: Connection timeout

**Solution**: Enable connection pooling in Supabase settings and use the pooler URL.

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Schema](./supabase/README.md)
- [TypeScript Types](./lib/supabase/types.ts)
- [Helper Functions](./lib/supabase/helpers.ts)

## 🆘 Getting Help

If you encounter issues:

1. Check the [Supabase Discord](https://discord.supabase.com)
2. Search [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
3. Review the [troubleshooting section](#-troubleshooting) above
4. Check your browser console for error messages
5. Verify your environment variables are correct

## 🎯 Next Steps

After setting up the database:

1. ✅ Configure authentication providers
2. ✅ Test user registration and login
3. ✅ Create your first playground
4. ✅ Test file operations
5. ✅ Enable AI chat features
6. ✅ Set up monitoring and analytics

## 📝 Maintenance

### Regular Tasks

- **Weekly**: Review slow queries and add indexes
- **Monthly**: Check database size and optimize
- **Quarterly**: Review and update RLS policies
- **Yearly**: Audit user data and clean up inactive accounts

### Monitoring

Set up monitoring in Supabase dashboard:

1. Go to **Reports** → **Database**
2. Monitor:
   - Query performance
   - Connection count
   - Database size
   - Cache hit rate

### Backups

Verify backups are working:

1. Go to **Settings** → **Database** → **Backups**
2. Test restore process periodically
3. Download critical backups locally

---

**Need help?** Open an issue on GitHub or reach out to the community!