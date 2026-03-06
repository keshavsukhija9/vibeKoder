import { describe, it, expect } from 'vitest'
import { chunkFile, chunkFiles } from '@/lib/rag/chunk'

describe('chunkFile', () => {
  it('returns empty array for empty content', () => {
    expect(chunkFile({ path: 'a.ts', content: '' })).toEqual([])
  })

  it('single chunk for content under 40 lines', () => {
    const content = Array(20).fill('const x = 1').join('\n')
    const chunks = chunkFile({ path: 'a.ts', content })
    expect(chunks).toHaveLength(1)
    expect(chunks[0].filePath).toBe('a.ts')
  })

  it('produces overlapping chunks for content over 40 lines', () => {
    const content = Array(100).fill('const x = 1').join('\n')
    const chunks = chunkFile({ path: 'a.ts', content })
    expect(chunks.length).toBeGreaterThan(1)
    // verify overlap: last line of chunk N appears in chunk N+1
    const c0lines = chunks[0].content.split('\n')
    const c1lines = chunks[1].content.split('\n')
    const overlap = c0lines.slice(-8)
    const c1start = c1lines.slice(0, 8)
    expect(overlap).toEqual(c1start)
  })

  it('respects maxChunksPerFile', () => {
    const content = Array(500).fill('const x = 1').join('\n')
    const chunks = chunkFile({ path: 'a.ts', content }, 40, 8, { maxChunks: 3 })
    expect(chunks.length).toBeLessThanOrEqual(3)
  })
})

describe('chunkFiles', () => {
  it('processes multiple files', () => {
    const files = [
      { path: 'a.ts', content: Array(50).fill('x').join('\n') },
      { path: 'b.ts', content: Array(50).fill('y').join('\n') },
    ]
    const chunks = chunkFiles(files)
    const paths = [...new Set(chunks.map((c) => c.filePath))]
    expect(paths).toContain('a.ts')
    expect(paths).toContain('b.ts')
  })

  it('applies maxChunksPerFile across all files', () => {
    const files = Array(5).fill(null).map((_, i) => ({
      path: `file${i}.ts`,
      content: Array(200).fill('x').join('\n'),
    }))
    const chunks = chunkFiles(files, 2)
    const perFile = files.map((f) =>
      chunks.filter((c) => c.filePath === f.path).length
    )
    perFile.forEach((count) => expect(count).toBeLessThanOrEqual(2))
  })
})
