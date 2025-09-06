import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolveSecrets } from '@/runtime/secrets'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('resolveSecrets', () => {
  const prev = { ...process.env }
  beforeEach(() => {
    process.env = { ...prev }
  })
  afterEach(() => {
    process.env = { ...prev }
  })

  it('flags inline secrets and prefers env:KEY', () => {
    const doc: GPTPDocument = {
      $doctype: 'gptp',
      schemaVersion: '1.2.0',
      promptVersion: '1.0.0',
      title: 't',
      description: 'd',
      messages: [{ role: 'user', content: 'hi' }],
      connections: {
        providers: {
          openai: { type: 'openai', api_key: 'sk-inline' },
          anthropic: { type: 'anthropic', api_key: 'env:ANTHROPIC_API_KEY' },
        }
      }
    }

    const res = resolveSecrets(doc)
    const inline = res.issues.find(i => i.type === 'inline-secret')
    const missing = res.issues.find(i => i.type === 'missing-env')
    expect(inline).toBeTruthy()
    expect(missing?.message).toMatch(/ANTHROPIC_API_KEY/)
  })

  it('injects canonical env for provider when env ref is present', () => {
    const doc: GPTPDocument = {
      $doctype: 'gptp',
      schemaVersion: '1.2.0',
      promptVersion: '1.0.0',
      title: 't',
      description: 'd',
      messages: [{ role: 'user', content: 'hi' }],
      connections: {
        providers: {
          anthropic: { type: 'anthropic', api_key: 'env:ANTHROPIC_API_KEY' },
        }
      }
    }

    process.env.ANTHROPIC_API_KEY = 'secret'
    const res = resolveSecrets(doc, { injectStandardEnv: true })
    expect(res.issues.length).toBe(0)
    expect(process.env.ANTHROPIC_API_KEY).toBe('secret')
  })
})
