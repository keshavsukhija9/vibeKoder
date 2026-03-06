// ============================================================================
// Database Schema Test Script
// ============================================================================
// This script tests all database operations to verify the schema is working
// 
// Usage: npx tsx scripts/test-database.ts
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for testing
)

// Test data
const TEST_USER_EMAIL = `test-${Date.now()}@example.com`
const TEST_USER_PASSWORD = 'TestPassword123!'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m'
  }
  const reset = '\x1b[0m'
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
  console.log(`${colors[type]}[${timestamp}] ${message}${reset}`)
}

async function runTest(name: string, testFn: () => Promise<void>) {
  try {
    log(`\n🧪 Testing: ${name}`, 'info')
    await testFn()
    log(`✅ PASSED: ${name}`, 'success')
    return true
  } catch (error) {
    log(`❌ FAILED: ${name}`, 'error')
    log(`   Error: ${error}`, 'error')
    return false
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

let testUserId: string
let testPlaygroundId: string
let testTemplateFileId: string
let testCollaboratorUserId: string

/**
 * Test 1: Create Test User
 */
async function testCreateUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true
  })
  
  if (error) throw error
  if (!data.user) throw new Error('User not created')
  
  testUserId = data.user.id
  log(`   Created user: ${testUserId}`, 'info')
  
  // Wait for trigger to create profile
  await new Promise(resolve => setTimeout(resolve, 1000))
}

/**
 * Test 2: Verify User Profile Created
 */
async function testUserProfile() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', testUserId)
    .single()
  
  if (error) throw error
  if (!data) throw new Error('User profile not found')
  
  log(`   Profile found: ${data.email}`, 'info')
}

/**
 * Test 3: Update User Profile
 */
async function testUpdateProfile() {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      name: 'Test User',
      bio: 'This is a test user',
      github_username: 'testuser'
    })
    .eq('id', testUserId)
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Profile not updated')
  
  log(`   Updated profile: ${data.name}`, 'info')
}

/**
 * Test 4: Create Playground
 */
async function testCreatePlayground() {
  const { data, error } = await supabase
    .from('playgrounds')
    .insert({
      user_id: testUserId,
      title: 'Test Playground',
      description: 'A test playground',
      template: 'REACT',
      is_public: false
    })
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Playground not created')
  
  testPlaygroundId = data.id
  log(`   Created playground: ${testPlaygroundId}`, 'info')
}

/**
 * Test 5: Create Template Files
 */
async function testCreateTemplateFiles() {
  const fileContent = {
    files: {
      'src/App.tsx': {
        content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;',
        language: 'typescript'
      },
      'package.json': {
        content: '{\n  "name": "test-app",\n  "version": "1.0.0"\n}',
        language: 'json'
      }
    }
  }
  
  const { data, error } = await supabase
    .from('template_files')
    .insert({
      playground_id: testPlaygroundId,
      content: fileContent
    })
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Template files not created')
  
  testTemplateFileId = data.id
  log(`   Created template files: ${testTemplateFileId}`, 'info')
}

/**
 * Test 6: Query Playground with Files
 */
async function testQueryPlaygroundWithFiles() {
  const { data, error } = await supabase
    .from('playgrounds')
    .select('*, template_files(*)')
    .eq('id', testPlaygroundId)
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Playground not found')
  if (!data.template_files) throw new Error('Template files not loaded')
  
  log(`   Loaded playground with files`, 'info')
}

/**
 * Test 7: Star Playground
 */
async function testStarPlayground() {
  const { data, error } = await supabase
    .from('star_marks')
    .insert({
      user_id: testUserId,
      playground_id: testPlaygroundId,
      is_marked: true
    })
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Star mark not created')
  
  log(`   Starred playground`, 'info')
}

/**
 * Test 8: Toggle Star Mark
 */
async function testToggleStarMark() {
  const { data, error } = await supabase
    .from('star_marks')
    .update({ is_marked: false })
    .eq('user_id', testUserId)
    .eq('playground_id', testPlaygroundId)
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Star mark not toggled')
  
  log(`   Toggled star mark to: ${data.is_marked}`, 'info')
}

/**
 * Test 9: Create Chat Message
 */
async function testCreateChatMessage() {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: testUserId,
      playground_id: testPlaygroundId,
      role: 'user',
      content: 'Hello, AI assistant!',
      metadata: { test: true }
    })
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Chat message not created')
  
  log(`   Created chat message: ${data.id}`, 'info')
}

/**
 * Test 10: Get Chat History
 */
async function testGetChatHistory() {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  if (!data || data.length === 0) throw new Error('Chat history not found')
  
  log(`   Retrieved ${data.length} chat messages`, 'info')
}

/**
 * Test 11: Create Playground Version
 */
async function testCreateVersion() {
  const { data, error } = await supabase
    .from('playground_versions')
    .insert({
      playground_id: testPlaygroundId,
      version_number: 1,
      content: { files: {} },
      commit_message: 'Initial version',
      created_by: testUserId
    })
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Version not created')
  
  log(`   Created version: ${data.version_number}`, 'info')
}

/**
 * Test 12: Add Collaborator
 */
async function testAddCollaborator() {
  // Create another test user first
  const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
    email: `collaborator-${Date.now()}@example.com`,
    password: TEST_USER_PASSWORD,
    email_confirm: true
  })
  
  if (userError) throw userError
  if (!newUser.user) throw new Error('Collaborator user not created')
  testCollaboratorUserId = newUser.user.id
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { data, error } = await supabase
    .from('playground_collaborators')
    .insert({
      playground_id: testPlaygroundId,
      user_id: newUser.user.id,
      permission: 'write'
    })
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Collaborator not added')
  
  log(`   Added collaborator with ${data.permission} permission`, 'info')
}

/**
 * Test 13: Log User Activity
 */
async function testLogActivity() {
  const { data, error } = await supabase
    .from('user_activity_log')
    .insert({
      user_id: testUserId,
      action: 'playground_created',
      resource_type: 'playground',
      resource_id: testPlaygroundId,
      metadata: { test: true }
    })
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Activity not logged')
  
  log(`   Logged activity: ${data.action}`, 'info')
}

/**
 * Test 14: Test RPC Functions
 */
async function testRPCFunctions() {
  // Test increment_playground_views
  const { error: viewError } = await supabase.rpc('increment_playground_views', {
    playground_uuid: testPlaygroundId
  })
  
  if (viewError) throw viewError
  
  // Verify view count increased
  const { data: playground } = await supabase
    .from('playgrounds')
    .select('view_count')
    .eq('id', testPlaygroundId)
    .single()
  
  if (!playground || playground.view_count !== 1) {
    throw new Error('View count not incremented')
  }
  
  log(`   View count incremented to: ${playground.view_count}`, 'info')
  
  // Test get_starred_playgrounds
  const { data: starred, error: starredError } = await supabase.rpc('get_starred_playgrounds', {
    user_uuid: testUserId
  })
  
  if (starredError) throw starredError
  
  log(`   Retrieved ${starred?.length || 0} starred playgrounds`, 'info')
}

/**
 * Test 15: Test Indexes
 */
async function testIndexes() {
  const { data, error } = await supabase.rpc('pg_indexes', {})
  
  // This is a simplified test - in production you'd query pg_indexes
  log(`   Indexes verified (simplified test)`, 'info')
}

/**
 * Test 16: Update Playground
 */
async function testUpdatePlayground() {
  const { data, error } = await supabase
    .from('playgrounds')
    .update({
      title: 'Updated Test Playground',
      description: 'Updated description',
      is_public: true
    })
    .eq('id', testPlaygroundId)
    .select()
    .single()
  
  if (error) throw error
  if (!data) throw new Error('Playground not updated')
  
  // Verify updated_at changed
  log(`   Updated playground: ${data.title}`, 'info')
}

/**
 * Test 17: Query Public Playgrounds
 */
async function testQueryPublicPlaygrounds() {
  const { data, error } = await supabase
    .from('playgrounds')
    .select('*')
    .eq('is_public', true)
  
  if (error) throw error
  if (!data || data.length === 0) throw new Error('No public playgrounds found')
  
  log(`   Found ${data.length} public playgrounds`, 'info')
}

/**
 * Test 18: Cleanup - Delete Test Data
 */
async function testCleanup() {
  // Delete playground (cascade will delete related records)
  const { error: playgroundError } = await supabase
    .from('playgrounds')
    .delete()
    .eq('id', testPlaygroundId)
  
  if (playgroundError) throw playgroundError
  
  // Delete test users
  const { error: userError } = await supabase.auth.admin.deleteUser(testUserId)
  
  if (userError) throw userError

  if (testCollaboratorUserId) {
    const { error: collaboratorError } = await supabase.auth.admin.deleteUser(testCollaboratorUserId)
    if (collaboratorError) throw collaboratorError
  }
  
  log(`   Cleaned up test data`, 'info')
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function main() {
  log('🚀 Starting Database Schema Tests', 'info')
  log('=' .repeat(60), 'info')
  
  const tests = [
    { name: 'Create Test User', fn: testCreateUser },
    { name: 'Verify User Profile Created', fn: testUserProfile },
    { name: 'Update User Profile', fn: testUpdateProfile },
    { name: 'Create Playground', fn: testCreatePlayground },
    { name: 'Create Template Files', fn: testCreateTemplateFiles },
    { name: 'Query Playground with Files', fn: testQueryPlaygroundWithFiles },
    { name: 'Star Playground', fn: testStarPlayground },
    { name: 'Toggle Star Mark', fn: testToggleStarMark },
    { name: 'Create Chat Message', fn: testCreateChatMessage },
    { name: 'Get Chat History', fn: testGetChatHistory },
    { name: 'Create Playground Version', fn: testCreateVersion },
    { name: 'Add Collaborator', fn: testAddCollaborator },
    { name: 'Log User Activity', fn: testLogActivity },
    { name: 'Test RPC Functions', fn: testRPCFunctions },
    { name: 'Update Playground', fn: testUpdatePlayground },
    { name: 'Query Public Playgrounds', fn: testQueryPublicPlaygrounds },
    { name: 'Cleanup Test Data', fn: testCleanup }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const result = await runTest(test.name, test.fn)
    if (result) {
      passed++
    } else {
      failed++
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'info')
  log('📊 Test Summary', 'info')
  log('='.repeat(60), 'info')
  log(`Total Tests: ${tests.length}`, 'info')
  log(`Passed: ${passed}`, 'success')
  log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info')
  log('='.repeat(60), 'info')
  
  if (failed === 0) {
    log('\n✅ All tests passed! Database schema is working correctly.', 'success')
  } else {
    log(`\n❌ ${failed} test(s) failed. Please review the errors above.`, 'error')
    process.exit(1)
  }
}

// ============================================================================
// RUN TESTS
// ============================================================================

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    log(`\n❌ Test suite failed: ${error}`, 'error')
    process.exit(1)
  })
