# VibeCode Editor - Database Schema Documentation

## Overview

This directory contains the complete database schema for the VibeCode Editor application. The schema is designed for **Supabase (PostgreSQL)** and includes comprehensive features for user management, code playgrounds, collaboration, version control, and AI chat integration.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Schema Overview](#schema-overview)
- [Tables](#tables)
- [Security](#security)
- [Functions](#functions)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## 🚀 Quick Start

### 1. Set Up Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project credentials to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Run the Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of [`schema.sql`](./schema.sql)
4. Paste and execute the SQL

### 3. Verify Installation

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `accounts`
- `chat_messages`
- `playground_collaborators`
- `playground_versions`
- `playgrounds`
- `star_marks`
- `template_files`
- `user_activity_log`
- `user_profiles`

## 📊 Schema Overview

### Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
└────────┬────────┘
         │
         ├──────────────────────────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                   ┌─────────────────┐
│ user_profiles   │                   │    accounts     │
│                 │                   │   (OAuth)       │
└────────┬────────┘                   └─────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────────┐
│ playgrounds  │ │ star_marks  │ │  chat    │ │   activity   │
│              │ │             │ │ messages │ │     log      │
└──────┬───────┘ └─────────────┘ └──────────┘ └──────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  template    │ │  collab  │ │ versions │ │   ...    │
│    files     │ │  orators │ │          │ │          │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
```

## 📁 Tables

### Core Tables

#### 1. `user_profiles`
Extended user information beyond Supabase Auth.

**Columns:**
- `id` (uuid, PK) - References auth.users
- `name` (text) - User's display name
- `email` (text, unique) - User's email
- `image` (text) - Profile picture URL
- `role` (user_role) - ADMIN | USER | PREMIUM_USER
- `bio` (text) - User biography
- `github_username` (text) - GitHub username
- `website` (text) - Personal website
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Indexes:**
- `idx_user_profiles_email`
- `idx_user_profiles_role`

#### 2. `accounts`
OAuth provider accounts for authentication.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `type` (text) - Account type
- `provider` (text) - OAuth provider (google, github, etc.)
- `provider_account_id` (text) - Provider's user ID
- `refresh_token` (text)
- `access_token` (text)
- `expires_at` (bigint)
- `token_type` (text)
- `scope` (text)
- `id_token` (text)
- `session_state` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Unique Constraint:** `(provider, provider_account_id)`

#### 3. `playgrounds`
User code projects/playgrounds.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `title` (text) - Project title
- `description` (text) - Project description
- `template` (template_type) - REACT | NEXTJS | EXPRESS | VUE | HONO | ANGULAR
- `is_public` (boolean) - Public visibility
- `fork_count` (integer) - Number of forks
- `view_count` (integer) - View counter
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Indexes:**
- `idx_playgrounds_user_id`
- `idx_playgrounds_template`
- `idx_playgrounds_is_public`
- `idx_playgrounds_created_at`

#### 4. `template_files`
File structure and content for playgrounds.

**Columns:**
- `id` (uuid, PK)
- `playground_id` (uuid, FK → playgrounds, unique)
- `content` (jsonb) - File tree structure
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Content Structure:**
```json
{
  "files": {
    "src/App.tsx": {
      "content": "...",
      "language": "typescript"
    },
    "package.json": {
      "content": "...",
      "language": "json"
    }
  }
}
```

#### 5. `star_marks`
User bookmarks/favorites for playgrounds.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `playground_id` (uuid, FK → playgrounds)
- `is_marked` (boolean)
- `created_at` (timestamptz)

**Unique Constraint:** `(user_id, playground_id)`

#### 6. `chat_messages`
AI chat conversation history.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `playground_id` (uuid, FK → playgrounds, nullable)
- `role` (chat_role) - user | assistant | system
- `content` (text) - Message content
- `metadata` (jsonb) - Additional data
- `created_at` (timestamptz)

**Indexes:**
- `idx_chat_messages_user_id`
- `idx_chat_messages_playground_id`
- `idx_chat_messages_created_at`

### Advanced Tables

#### 7. `playground_collaborators`
Multi-user collaboration on playgrounds.

**Columns:**
- `id` (uuid, PK)
- `playground_id` (uuid, FK → playgrounds)
- `user_id` (uuid, FK → auth.users)
- `permission` (text) - read | write | admin
- `created_at` (timestamptz)

**Unique Constraint:** `(playground_id, user_id)`

#### 8. `playground_versions`
Version control for playgrounds.

**Columns:**
- `id` (uuid, PK)
- `playground_id` (uuid, FK → playgrounds)
- `version_number` (integer)
- `content` (jsonb) - Snapshot of files
- `commit_message` (text)
- `created_by` (uuid, FK → auth.users)
- `created_at` (timestamptz)

**Unique Constraint:** `(playground_id, version_number)`

#### 9. `user_activity_log`
User action tracking for analytics.

**Columns:**
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `action` (text) - Action type
- `resource_type` (text) - Resource affected
- `resource_id` (uuid) - Resource ID
- `metadata` (jsonb) - Additional context
- `ip_address` (inet) - User IP
- `user_agent` (text) - Browser info
- `created_at` (timestamptz)

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

#### User Profiles
- ✅ Anyone can view profiles (public)
- ✅ Users can update their own profile
- ✅ Users can insert their own profile

#### Playgrounds
- ✅ Users can view their own playgrounds
- ✅ Anyone can view public playgrounds
- ✅ Collaborators can view shared playgrounds
- ✅ Users can create/update/delete their own playgrounds
- ✅ Collaborators with write permission can update

#### Template Files
- ✅ Follow playground access rules
- ✅ Respect collaboration permissions

#### Star Marks
- ✅ Users can only manage their own stars

#### Chat Messages
- ✅ Users can only view/create/delete their own messages

#### Collaborators
- ✅ Playground owners can manage collaborators
- ✅ Collaborators can view other collaborators

#### Activity Log
- ✅ Users can view their own activity
- ✅ Admins can view all activity

### Authentication

The schema integrates with Supabase Auth:
- Automatic user profile creation on signup
- OAuth support via accounts table
- Role-based access control (ADMIN, USER, PREMIUM_USER)

## ⚙️ Functions

### `set_updated_at()`
Automatically updates `updated_at` timestamp on row updates.

### `handle_new_user()`
Creates user profile automatically when a new user signs up.

**Trigger:** `on_auth_user_created`

### `increment_playground_views(playground_uuid)`
Increments view count for a playground.

**Usage:**
```sql
SELECT increment_playground_views('playground-uuid-here');
```

### `get_starred_playgrounds(user_uuid)`
Returns all playgrounds starred by a user.

**Usage:**
```sql
SELECT * FROM get_starred_playgrounds('user-uuid-here');
```

## 🔄 Migration Guide

### From MongoDB (Prisma) to Supabase

If you're migrating from the MongoDB schema:

1. **Export Data:**
```bash
# Export from MongoDB
mongodump --uri="your-mongodb-uri" --out=./backup
```

2. **Transform Data:**
   - Convert MongoDB ObjectIds to UUIDs
   - Transform nested documents to JSONB
   - Map enum values

3. **Import to Supabase:**
```typescript
// Example migration script
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Migrate users
for (const user of mongoUsers) {
  await supabase.from('user_profiles').insert({
    id: user._id, // Convert to UUID
    name: user.name,
    email: user.email,
    role: user.role
  })
}
```

### Schema Updates

To update the schema:

1. Create a new migration file:
```sql
-- migrations/001_add_new_feature.sql
ALTER TABLE playgrounds ADD COLUMN new_field text;
```

2. Run in Supabase SQL Editor
3. Update TypeScript types in `lib/supabase/types.ts`

## 📝 Best Practices

### 1. Always Use RLS
Never disable RLS on tables. If you need service-level access, use the service role key.

### 2. Use Transactions
For multi-table operations:
```typescript
const { data, error } = await supabase.rpc('create_playground_with_files', {
  playground_data: {...},
  files_data: {...}
})
```

### 3. Index Optimization
Add indexes for frequently queried columns:
```sql
CREATE INDEX idx_custom ON table_name(column_name);
```

### 4. JSONB Queries
Use JSONB operators for efficient queries:
```sql
SELECT * FROM template_files 
WHERE content @> '{"files": {"src/App.tsx": {}}}';
```

### 5. Pagination
Always paginate large result sets:
```typescript
const { data } = await supabase
  .from('playgrounds')
  .select('*')
  .range(0, 9) // First 10 items
```

### 6. Activity Logging
Log important user actions:
```typescript
await supabase.from('user_activity_log').insert({
  user_id: userId,
  action: 'playground_created',
  resource_type: 'playground',
  resource_id: playgroundId,
  metadata: { template: 'REACT' }
})
```

## 🔧 Troubleshooting

### Common Issues

**Issue:** RLS policies blocking queries
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'playgrounds';

-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-uuid';
```

**Issue:** Slow queries
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM playgrounds WHERE user_id = 'uuid';

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_name ON table(column);
```

**Issue:** Trigger not firing
```sql
-- Check triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%updated_at%';

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name...
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [TypeScript Types](../lib/supabase/types.ts)

## 🤝 Contributing

When adding new features:

1. Update `schema.sql`
2. Update `types.ts`
3. Update this README
4. Test RLS policies
5. Add migration notes

## 📄 License

This schema is part of the VibeCode Editor project.