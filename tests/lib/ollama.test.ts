import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('getOllamaUrl', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('uses localhost fallback when env not set', async () => {
    delete process.env.OLLAMA_BASE_URL
    const { getOllamaUrl } = await import('@/lib/ollama')
    expect(getOllamaUrl('/api/generate')).toBe(
      'http://localhost:11434/api/generate'
    )
  })

  it('uses env var when set', async () => {
    process.env.OLLAMA_BASE_URL = 'http://myserver:11434'
    const { getOllamaUrl } = await import('@/lib/ollama')
    expect(getOllamaUrl('/api/generate')).toBe(
      'http://myserver:11434/api/generate'
    )
  })

  it('strips trailing slash from base URL', async () => {
    process.env.OLLAMA_BASE_URL = 'http://myserver:11434/'
    const { getOllamaUrl } = await import('@/lib/ollama')
    expect(getOllamaUrl('/api/generate')).toBe(
      'http://myserver:11434/api/generate'
    )
  })
})
