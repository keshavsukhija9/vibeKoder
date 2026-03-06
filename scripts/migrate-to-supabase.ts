// ============================================================================
// MongoDB to Supabase Migration Script
// ============================================================================
// This script helps migrate data from MongoDB (Prisma) to Supabase (PostgreSQL)
// 
// Usage:
//   1. Ensure both databases are accessible
//   2. Update connection strings in .env
//   3. Run: npx tsx scripts/migrate-to-supabase.ts
// ============================================================================

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const BATCH_SIZE = 100
const DRY_RUN = process.env.DRY_RUN === 'true' // Set to true to test without writing

// Initialize clients
const prisma = new PrismaClient()
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin access
)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert MongoDB ObjectId to UUID
 * Note: This is a simple conversion. You may want to use a proper UUID generator
 */
function objectIdToUuid(objectId: string): string {
  // Simple approach: pad the ObjectId to create a valid UUID
  // In production, you might want to maintain a mapping table
  const padded = objectId.padEnd(32, '0')
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`
}

/**
 * Log migration progress
 */
function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m'
  }
  const reset = '\x1b[0m'
  console.log(`${colors[type]}${message}${reset}`)
}

/**
 * Sleep utility for rate limiting
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

/**
 * Migrate Users
 */
async function migrateUsers() {
  log('\n📦 Migrating Users...', 'info')
  
  const users = await prisma.user.findMany()
  log(`Found ${users.length} users to migrate`, 'info')
  
  let migrated = 0
  let failed = 0
  
  for (const user of users) {
    try {
      const uuid = objectIdToUuid(user.id)
      
      if (!DRY_RUN) {
        // First, create auth user (if not exists)
        // Note: This requires Supabase Admin API or manual user creation
        // For now, we'll just create the profile
        
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: uuid,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role as any,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString()
          })
        
        if (error) throw error
      }
      
      migrated++
      if (migrated % 10 === 0) {
        log(`  Migrated ${migrated}/${users.length} users...`, 'info')
      }
    } catch (error) {
      failed++
      log(`  Failed to migrate user ${user.email}: ${error}`, 'error')
    }
  }
  
  log(`✅ Users migration complete: ${migrated} migrated, ${failed} failed`, 'success')
  return { migrated, failed }
}

/**
 * Migrate Accounts (OAuth)
 */
async function migrateAccounts() {
  log('\n📦 Migrating OAuth Accounts...', 'info')
  
  const accounts = await prisma.account.findMany()
  log(`Found ${accounts.length} accounts to migrate`, 'info')
  
  let migrated = 0
  let failed = 0
  
  for (const account of accounts) {
    try {
      if (!DRY_RUN) {
        const { error } = await supabase
          .from('accounts')
          .upsert({
            id: objectIdToUuid(account.id),
            user_id: objectIdToUuid(account.userId),
            type: account.type,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            refresh_token: account.refreshToken,
            access_token: account.accessToken,
            expires_at: account.expiresAt ? BigInt(account.expiresAt) : null,
            token_type: account.tokenType,
            scope: account.scope,
            id_token: account.idToken,
            session_state: account.sessionState
          })
        
        if (error) throw error
      }
      
      migrated++
    } catch (error) {
      failed++
      log(`  Failed to migrate account: ${error}`, 'error')
    }
  }
  
  log(`✅ Accounts migration complete: ${migrated} migrated, ${failed} failed`, 'success')
  return { migrated, failed }
}

/**
 * Migrate Playgrounds
 */
async function migratePlaygrounds() {
  log('\n📦 Migrating Playgrounds...', 'info')
  
  const playgrounds = await prisma.playground.findMany()
  log(`Found ${playgrounds.length} playgrounds to migrate`, 'info')
  
  let migrated = 0
  let failed = 0
  
  for (const playground of playgrounds) {
    try {
      if (!DRY_RUN) {
        const { error } = await supabase
          .from('playgrounds')
          .upsert({
            id: objectIdToUuid(playground.id),
            user_id: objectIdToUuid(playground.userId),
            title: playground.title,
            description: playground.description,
            template: playground.template as any,
            is_public: false, // Default to private
            fork_count: 0,
            view_count: 0,
            created_at: playground.createdAt.toISOString(),
            updated_at: playground.updatedAt.toISOString()
          })
        
        if (error) throw error
      }
      
      migrated++
      if (migrated % 10 === 0) {
        log(`  Migrated ${migrated}/${playgrounds.length} playgrounds...`, 'info')
      }
    } catch (error) {
      failed++
      log(`  Failed to migrate playground ${playground.title}: ${error}`, 'error')
    }
  }
  
  log(`✅ Playgrounds migration complete: ${migrated} migrated, ${failed} failed`, 'success')
  return { migrated, failed }
}

/**
 * Migrate Template Files
 */
async function migrateTemplateFiles() {
  log('\n📦 Migrating Template Files...', 'info')
  
  const templateFiles = await prisma.templateFile.findMany()
  log(`Found ${templateFiles.length} template files to migrate`, 'info')
  
  let migrated = 0
  let failed = 0
  
  for (const file of templateFiles) {
    try {
      if (!DRY_RUN) {
        const { error } = await supabase
          .from('template_files')
          .upsert({
            id: objectIdToUuid(file.id),
            playground_id: objectIdToUuid(file.playgroundId),
            content: file.content as any,
            created_at: file.createdAt.toISOString(),
            updated_at: file.updatedAt.toISOString()
          })
        
        if (error) throw error
      }
      
      migrated++
    } catch (error) {
      failed++
      log(`  Failed to migrate template file: ${error}`, 'error')
    }
  }
  
  log(`✅ Template files migration complete: ${migrated} migrated, ${failed} failed`, 'success')
  return { migrated, failed }
}

/**
 * Migrate Star Marks
 */
async function migrateStarMarks() {
  log('\n📦 Migrating Star Marks...', 'info')
  
  const starMarks = await prisma.starMark.findMany()
  log(`Found ${starMarks.length} star marks to migrate`, 'info')
  
  let migrated = 0
  let failed = 0
  
  for (const mark of starMarks) {
    try {
      if (!DRY_RUN) {
        const { error } = await supabase
          .from('star_marks')
          .upsert({
            id: objectIdToUuid(mark.id),
            user_id: objectIdToUuid(mark.userId),
            playground_id: objectIdToUuid(mark.playgroundId),
            is_marked: mark.isMarked,
            created_at: mark.createdAt.toISOString()
          })
        
        if (error) throw error
      }
      
      migrated++
    } catch (error) {
      failed++
      log(`  Failed to migrate star mark: ${error}`, 'error')
    }
  }
  
  log(`✅ Star marks migration complete: ${migrated} migrated, ${failed} failed`, 'success')
  return { migrated, failed }
}

/**
 * Migrate Chat Messages
 */
async function migrateChatMessages() {
  log('\n📦 Migrating Chat Messages...', 'info')
  
  const messages = await prisma.chatMessage.findMany()
  log(`Found ${messages.length} chat messages to migrate`, 'info')
  
  let migrated = 0
  let failed = 0
  
  for (const message of messages) {
    try {
      if (!DRY_RUN) {
        const { error } = await supabase
          .from('chat_messages')
          .upsert({
            id: objectIdToUuid(message.id),
            user_id: objectIdToUuid(message.userId),
            playground_id: null, // MongoDB schema doesn't have this
            role: message.role as any,
            content: message.content,
            metadata: null,
            created_at: message.createdAt.toISOString()
          })
        
        if (error) throw error
      }
      
      migrated++
      if (migrated % 50 === 0) {
        log(`  Migrated ${migrated}/${messages.length} messages...`, 'info')
      }
    } catch (error) {
      failed++
      log(`  Failed to migrate chat message: ${error}`, 'error')
    }
  }
  
  log(`✅ Chat messages migration complete: ${migrated} migrated, ${failed} failed`, 'success')
  return { migrated, failed }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function main() {
  log('🚀 Starting MongoDB to Supabase Migration', 'info')
  log(`Mode: ${DRY_RUN ? 'DRY RUN (no data will be written)' : 'LIVE'}`, 'warn')
  log('=' .repeat(60), 'info')
  
  const startTime = Date.now()
  const results: Record<string, { migrated: number; failed: number }> = {}
  
  try {
    // Run migrations in order (respecting foreign key constraints)
    results.users = await migrateUsers()
    await sleep(1000) // Rate limiting
    
    results.accounts = await migrateAccounts()
    await sleep(1000)
    
    results.playgrounds = await migratePlaygrounds()
    await sleep(1000)
    
    results.templateFiles = await migrateTemplateFiles()
    await sleep(1000)
    
    results.starMarks = await migrateStarMarks()
    await sleep(1000)
    
    results.chatMessages = await migrateChatMessages()
    
    // Summary
    log('\n' + '='.repeat(60), 'info')
    log('📊 Migration Summary', 'info')
    log('='.repeat(60), 'info')
    
    let totalMigrated = 0
    let totalFailed = 0
    
    for (const [entity, stats] of Object.entries(results)) {
      log(`${entity}: ${stats.migrated} migrated, ${stats.failed} failed`, 
        stats.failed > 0 ? 'warn' : 'success')
      totalMigrated += stats.migrated
      totalFailed += stats.failed
    }
    
    log('='.repeat(60), 'info')
    log(`Total: ${totalMigrated} migrated, ${totalFailed} failed`, 
      totalFailed > 0 ? 'warn' : 'success')
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    log(`Duration: ${duration}s`, 'info')
    
    if (DRY_RUN) {
      log('\n⚠️  This was a DRY RUN. No data was actually migrated.', 'warn')
      log('Set DRY_RUN=false to perform the actual migration.', 'warn')
    } else {
      log('\n✅ Migration completed successfully!', 'success')
    }
    
  } catch (error) {
    log(`\n❌ Migration failed: ${error}`, 'error')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// RUN MIGRATION
// ============================================================================

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })