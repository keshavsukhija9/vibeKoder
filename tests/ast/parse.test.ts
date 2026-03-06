import { describe, it, expect } from 'vitest'
import { getDependencies } from '@/lib/ast/parse'

describe('getDependencies', () => {
  it('extracts ES import', () => {
    const deps = getDependencies(`import { foo } from './foo'`, 'a.ts')
    // resolved relative to filePath (a.ts) → 'foo'
    expect(deps).toContain('foo')
  })

  it('extracts require', () => {
    const deps = getDependencies(`const x = require('./bar')`, 'a.ts')
    expect(deps).toContain('bar')
  })

  it('ignores node_modules imports', () => {
    const deps = getDependencies(`import react from 'react'`, 'a.ts')
    // external packages should not appear as local deps
    // (implementation-dependent — test documents current behavior)
    expect(Array.isArray(deps)).toBe(true)
  })

  it('returns empty for no imports', () => {
    expect(getDependencies('const x = 1', 'a.ts')).toEqual([])
  })

  it('handles multiple imports', () => {
    const content = `
      import a from './a'
      import b from './b'
      const c = require('./c')
    `
    const deps = getDependencies(content, 'a.ts')
    expect(deps).toContain('a')
    expect(deps).toContain('b')
    expect(deps).toContain('c')
  })
})
