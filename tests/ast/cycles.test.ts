import { describe, it, expect } from 'vitest'
import { findCycles } from '@/lib/ast/cycles'
import type { DependencyNode } from '@/lib/ast/types'

function graph(entries: [string, string[]][]): Map<string, DependencyNode> {
  const m = new Map<string, DependencyNode>()
  for (const [key, deps] of entries) {
    m.set(key, { path: key, dependencies: deps })
  }
  return m
}

describe('findCycles', () => {
  it('returns empty for acyclic graph', () => {
    const g = graph([
      ['a', ['b']],
      ['b', ['c']],
      ['c', []],
    ])
    expect(findCycles(g)).toEqual([])
  })

  it('detects direct cycle a → b → a', () => {
    const g = graph([
      ['a', ['b']],
      ['b', ['a']],
    ])
    const cycles = findCycles(g)
    expect(cycles.length).toBeGreaterThan(0)
    const flat = cycles.flat()
    expect(flat).toContain('a')
    expect(flat).toContain('b')
  })

  it('detects indirect cycle a → b → c → a', () => {
    const g = graph([
      ['a', ['b']],
      ['b', ['c']],
      ['c', ['a']],
    ])
    const cycles = findCycles(g)
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('handles self-referencing node', () => {
    const g = graph([['a', ['a']]])
    const cycles = findCycles(g)
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('handles empty graph', () => {
    expect(findCycles(new Map())).toEqual([])
  })

  it('handles disconnected graph with one cycle', () => {
    const g = graph([
      ['a', ['b']],
      ['b', ['a']],
      ['c', ['d']],
      ['d', []],
    ])
    const cycles = findCycles(g)
    expect(cycles.length).toBe(1)
  })
})
