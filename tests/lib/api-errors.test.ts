import { describe, it, expect } from 'vitest'
import { jsonError, MAX_BODY_BYTES, readJsonBody } from '@/lib/api-errors'

function makeRequest(body: string, contentLength?: number): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (contentLength !== undefined) {
    headers['Content-Length'] = String(contentLength)
  }
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers,
    body,
  })
}

describe('jsonError', () => {
  it('returns NextResponse with correct status', async () => {
    const res = jsonError(400, 'bad_request')
    expect(res.status).toBe(400)
  })

  it('body contains error code', async () => {
    const res = jsonError(422, 'validation_failed', 'missing field')
    const body = await res.json()
    expect(body.error).toBe('validation_failed')
    expect(body.message).toBe('missing field')
  })

  it('body without message only has error key', async () => {
    const res = jsonError(500, 'server_error')
    const body = await res.json()
    expect(body).toHaveProperty('error')
    expect(body).not.toHaveProperty('message')
  })
})

describe('MAX_BODY_BYTES', () => {
  it('is exactly 5MB', () => {
    expect(MAX_BODY_BYTES).toBe(5 * 1024 * 1024)
  })
})

describe('readJsonBody', () => {
  it('parses valid JSON body', async () => {
    const req = makeRequest(JSON.stringify({ query: 'hello' }))
    const result = await readJsonBody(req)
    expect('body' in result && result.body).toEqual({ query: 'hello' })
  })

  it('returns 413 when Content-Length exceeds limit', async () => {
    const req = makeRequest('{}', MAX_BODY_BYTES + 1)
    const result = await readJsonBody(req)
    expect('errorResponse' in result).toBe(true)
    expect((result as { errorResponse: Response }).errorResponse.status).toBe(413)
  })

  it('returns 413 when body size exceeds limit regardless of header', async () => {
    const bigBody = JSON.stringify({ data: 'x'.repeat(MAX_BODY_BYTES + 1) })
    const req = makeRequest(bigBody)
    const result = await readJsonBody(req)
    expect('errorResponse' in result).toBe(true)
    expect((result as { errorResponse: Response }).errorResponse.status).toBe(413)
  })

  it('returns 400 for malformed JSON', async () => {
    const req = makeRequest('{ not valid json }')
    const result = await readJsonBody(req)
    expect('errorResponse' in result).toBe(true)
    expect((result as { errorResponse: Response }).errorResponse.status).toBe(400)
  })

  it('returns 400 for empty body', async () => {
    const req = makeRequest('')
    const result = await readJsonBody(req)
    expect('errorResponse' in result).toBe(true)
    expect((result as { errorResponse: Response }).errorResponse.status).toBe(400)
  })
})
