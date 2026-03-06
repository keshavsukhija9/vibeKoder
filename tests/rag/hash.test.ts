import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, rmSync, mkdirSync } from 'fs'
import path from 'path'

// point the DB and hash path to a temp dir for tests
process.env.VIBECODER_LANCEDB_PATH = path.join(
  process.cwd(), 'tests', '.tmp', 'lancedb'
)

import { hashContent } from '@/lib/rag/server'

describe('hashContent', () => {
  it('returns 16-char hex string', () => {
    const h = hashContent('hello world')
    expect(h).toHaveLength(16)
    expect(h).toMatch(/^[a-f0-9]+$/)
  })

  it('same content produces same hash', () => {
    expect(hashContent('abc')).toBe(hashContent('abc'))
  })

  it('different content produces different hash', () => {
    expect(hashContent('abc')).not.toBe(hashContent('xyz'))
  })

  it('empty string hashes without throwing', () => {
    expect(() => hashContent('')).not.toThrow()
  })
})
