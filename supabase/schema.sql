-- ============================================================================
-- VibeCode Editor - Complete Database Schema
-- ============================================================================
-- This schema provides a complete database structure for the VibeCode Editor
-- including user management, playgrounds, templates, chat, and OAuth support.
-- 
-- Run this in the Supabase SQL editor to set up your database.
-- ============================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User role enumeration
create type user_role as enum ('ADMIN', 'USER', 'PREMIUM_USER');

-- Template type enumeration
create type template_type as enum ('REACT', 'NEXTJS', 'EXPRESS', 'VUE', 'HONO', 'ANGULAR');

-- Chat message role enumeration
create type chat_role as enum ('user', 'assistant', 'system');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User profiles table (extends auth.users)
-- Stores additional user information beyond what Supabase Auth provides
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique not null,
  image text,
  role user_role not null default 'USER',
  bio text,
  github_username text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- OAuth accounts table
-- Stores OAuth provider information for users
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_account_id)
);

-- Playgrounds table
-- Stores user code playgrounds/projects
create table if not exists public.playgrounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  template template_type not null default 'REACT',
  is_public boolean not null default false,
  fork_count integer not null default 0,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Template files table
-- Stores the file structure and content for each playground
create table if not exists public.template_files (
  id uuid primary key default gen_random_uuid(),
  playground_id uuid not null unique references public.playgrounds(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Star marks table
-- Tracks which playgrounds users have starred/bookmarked
create table if not exists public.star_marks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playground_id uuid not null references public.playgrounds(id) on delete cascade,
  is_marked boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, playground_id)
);

-- Chat messages table
-- Stores AI chat conversation history
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  playground_id uuid references public.playgrounds(id) on delete cascade,
  role chat_role not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Playground collaborators table
-- Allows multiple users to collaborate on a playground
create table if not exists public.playground_collaborators (
  id uuid primary key default gen_random_uuid(),
  playground_id uuid not null references public.playgrounds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null default 'read', -- 'read', 'write', 'admin'
  created_at timestamptz not null default now(),
  unique (playground_id, user_id)
);

-- Playground versions table
-- Stores version history for playgrounds
create table if not exists public.playground_versions (
  id uuid primary key default gen_random_uuid(),
  playground_id uuid not null references public.playgrounds(id) on delete cascade,
  version_number integer not null,
  content jsonb not null,
  commit_message text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (playground_id, version_number)
);

-- User activity log table
-- Tracks user actions for analytics and debugging
create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User profiles indexes
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_role on public.user_profiles(role);

-- Accounts indexes
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_accounts_provider on public.accounts(provider);

-- Playgrounds indexes
create index if not exists idx_playgrounds_user_id on public.playgrounds(user_id);
create index if not exists idx_playgrounds_template on public.playgrounds(template);
create index if not exists idx_playgrounds_is_public on public.playgrounds(is_public);
create index if not exists idx_playgrounds_created_at on public.playgrounds(created_at desc);

-- Template files indexes
create index if not exists idx_template_files_playground_id on public.template_files(playground_id);

-- Star marks indexes
create index if not exists idx_star_marks_user_id on public.star_marks(user_id);
create index if not exists idx_star_marks_playground_id on public.star_marks(playground_id);

-- Chat messages indexes
create index if not exists idx_chat_messages_user_id on public.chat_messages(user_id);
create index if not exists idx_chat_messages_playground_id on public.chat_messages(playground_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at desc);

-- Playground collaborators indexes
create index if not exists idx_playground_collaborators_playground_id on public.playground_collaborators(playground_id);
create index if not exists idx_playground_collaborators_user_id on public.playground_collaborators(user_id);

-- Playground versions indexes
create index if not exists idx_playground_versions_playground_id on public.playground_versions(playground_id);
create index if not exists idx_playground_versions_created_at on public.playground_versions(created_at desc);

-- User activity log indexes
create index if not exists idx_user_activity_log_user_id on public.user_activity_log(user_id);
create index if not exists idx_user_activity_log_created_at on public.user_activity_log(created_at desc);
create index if not exists idx_user_activity_log_action on public.user_activity_log(action);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_profiles (id, email, name, image)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Function to increment playground view count
create or replace function public.increment_playground_views(playground_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.playgrounds
  set view_count = view_count + 1
  where id = playground_uuid;
end;
$$;

-- Function to get user's starred playgrounds
create or replace function public.get_starred_playgrounds(user_uuid uuid)
returns table (
  id uuid,
  title text,
  description text,
  template template_type,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select p.id, p.title, p.description, p.template, p.created_at, p.updated_at
  from public.playgrounds p
  inner join public.star_marks sm on p.id = sm.playground_id
  where sm.user_id = user_uuid and sm.is_marked = true
  order by sm.created_at desc;
end;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on user_profiles
drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

-- Trigger to update updated_at on accounts
drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
before update on public.accounts
for each row execute procedure public.set_updated_at();

-- Trigger to update updated_at on playgrounds
drop trigger if exists set_playgrounds_updated_at on public.playgrounds;
create trigger set_playgrounds_updated_at
before update on public.playgrounds
for each row execute procedure public.set_updated_at();

-- Trigger to update updated_at on template_files
drop trigger if exists set_template_files_updated_at on public.template_files;
create trigger set_template_files_updated_at
before update on public.template_files
for each row execute procedure public.set_updated_at();

-- Trigger to create user profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.playgrounds enable row level security;
alter table public.template_files enable row level security;
alter table public.star_marks enable row level security;
alter table public.chat_messages enable row level security;
alter table public.playground_collaborators enable row level security;
alter table public.playground_versions enable row level security;
alter table public.user_activity_log enable row level security;

-- User profiles policies
create policy "Users can view all profiles"
on public.user_profiles
for select
using (true);

create policy "Users can update own profile"
on public.user_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert own profile"
on public.user_profiles
for insert
with check (auth.uid() = id);

-- Accounts policies
create policy "Users can view own accounts"
on public.accounts
for select
using (auth.uid() = user_id);

create policy "Users can insert own accounts"
on public.accounts
for insert
with check (auth.uid() = user_id);

create policy "Users can update own accounts"
on public.accounts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own accounts"
on public.accounts
for delete
using (auth.uid() = user_id);

-- Playgrounds policies
create policy "Users can view own playgrounds"
on public.playgrounds
for select
using (auth.uid() = user_id);

create policy "Users can view public playgrounds"
on public.playgrounds
for select
using (is_public = true);

create policy "Collaborators can view shared playgrounds"
on public.playgrounds
for select
using (
  exists (
    select 1 from public.playground_collaborators pc
    where pc.playground_id = id and pc.user_id = auth.uid()
  )
);

create policy "Users can insert own playgrounds"
on public.playgrounds
for insert
with check (auth.uid() = user_id);

create policy "Users can update own playgrounds"
on public.playgrounds
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Collaborators with write permission can update playgrounds"
on public.playgrounds
for update
using (
  exists (
    select 1 from public.playground_collaborators pc
    where pc.playground_id = id 
    and pc.user_id = auth.uid() 
    and pc.permission in ('write', 'admin')
  )
);

create policy "Users can delete own playgrounds"
on public.playgrounds
for delete
using (auth.uid() = user_id);

-- Template files policies
create policy "Template files follow playground ownership"
on public.template_files
for all
using (
  exists (
    select 1 from public.playgrounds p
    where p.id = playground_id 
    and (
      p.user_id = auth.uid() 
      or p.is_public = true
      or exists (
        select 1 from public.playground_collaborators pc
        where pc.playground_id = p.id and pc.user_id = auth.uid()
      )
    )
  )
)
with check (
  exists (
    select 1 from public.playgrounds p
    where p.id = playground_id 
    and (
      p.user_id = auth.uid()
      or exists (
        select 1 from public.playground_collaborators pc
        where pc.playground_id = p.id 
        and pc.user_id = auth.uid() 
        and pc.permission in ('write', 'admin')
      )
    )
  )
);

-- Star marks policies
create policy "Users can view own star marks"
on public.star_marks
for select
using (auth.uid() = user_id);

create policy "Users can insert own star marks"
on public.star_marks
for insert
with check (auth.uid() = user_id);

create policy "Users can update own star marks"
on public.star_marks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own star marks"
on public.star_marks
for delete
using (auth.uid() = user_id);

-- Chat messages policies
create policy "Users can view own chat messages"
on public.chat_messages
for select
using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
on public.chat_messages
for insert
with check (auth.uid() = user_id);

create policy "Users can delete own chat messages"
on public.chat_messages
for delete
using (auth.uid() = user_id);

-- Playground collaborators policies
create policy "Users can view collaborators of their playgrounds"
on public.playground_collaborators
for select
using (
  exists (
    select 1 from public.playgrounds p
    where p.id = playground_id and p.user_id = auth.uid()
  )
  or user_id = auth.uid()
);

create policy "Playground owners can manage collaborators"
on public.playground_collaborators
for all
using (
  exists (
    select 1 from public.playgrounds p
    where p.id = playground_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.playgrounds p
    where p.id = playground_id and p.user_id = auth.uid()
  )
);

-- Playground versions policies
create policy "Users can view versions of accessible playgrounds"
on public.playground_versions
for select
using (
  exists (
    select 1 from public.playgrounds p
    where p.id = playground_id 
    and (
      p.user_id = auth.uid() 
      or p.is_public = true
      or exists (
        select 1 from public.playground_collaborators pc
        where pc.playground_id = p.id and pc.user_id = auth.uid()
      )
    )
  )
);

create policy "Users can create versions for their playgrounds"
on public.playground_versions
for insert
with check (
  auth.uid() = created_by
  and exists (
    select 1 from public.playgrounds p
    where p.id = playground_id 
    and (
      p.user_id = auth.uid()
      or exists (
        select 1 from public.playground_collaborators pc
        where pc.playground_id = p.id 
        and pc.user_id = auth.uid() 
        and pc.permission in ('write', 'admin')
      )
    )
  )
);

-- User activity log policies
create policy "Users can view own activity log"
on public.user_activity_log
for select
using (auth.uid() = user_id);

create policy "Users can insert own activity log"
on public.user_activity_log
for insert
with check (auth.uid() = user_id);

-- Admins can view all activity logs
create policy "Admins can view all activity logs"
on public.user_activity_log
for select
using (
  exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'ADMIN'
  )
);

-- ============================================================================
-- INITIAL DATA / SEED (Optional)
-- ============================================================================

-- You can add seed data here if needed
-- For example, creating a default admin user or sample templates

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on schema
grant usage on schema public to anon, authenticated;

-- Grant access to tables
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.user_profiles is 'Extended user profile information';
comment on table public.accounts is 'OAuth provider accounts for users';
comment on table public.playgrounds is 'User code playgrounds/projects';
comment on table public.template_files is 'File structure and content for playgrounds';
comment on table public.star_marks is 'User bookmarks/stars for playgrounds';
comment on table public.chat_messages is 'AI chat conversation history';
comment on table public.playground_collaborators is 'Collaboration permissions for playgrounds';
comment on table public.playground_versions is 'Version history for playgrounds';
comment on table public.user_activity_log is 'User action tracking for analytics';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
