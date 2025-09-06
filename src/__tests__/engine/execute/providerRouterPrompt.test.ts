import { describe, it, expect } from 'vitest'
import { selectProvider, mapParams } from '@/engine/execute/providerRouter'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('provider router', () => {
  it('defaults to openai when no connections configured', () => {
    const prompt: GPTPDocument = {
      $doctype: 'gptp',
      schemaVersion: '1.2.0',
      promptVersion: '1.0.0',
      title: 't',
      description: 'd',
      messages: [{ role: 'user', content: 'hi' }],
    }
    const sel = selectProvider(prompt)
    expect(sel.type).toBe('openai')
    expect(typeof sel.call).toBe('function')
  })

  it('selects configured provider by active name and type', () => {
    const prompt: GPTPDocument = {
      $doctype: 'gptp',
      schemaVersion: '1.2.0',
      promptVersion: '1.0.0',
      title: 't',
      description: 'd',
      messages: [{ role: 'user', content: 'hi' }],
      connections: {
        active: 'myAnthropic',
        providers: {
          myAnthropic: { type: 'anthropic' },
        },
      },
    }
    const sel = selectProvider(prompt)
    expect(sel.type).toBe('anthropic')
    expect(typeof sel.call).toBe('function')
  })

  it('maps params with sensible defaults', () => {
    const mapped = mapParams(undefined)
    expect(mapped.model).toBeTruthy()
    expect(typeof mapped.temperature).toBe('number')
    expect(typeof mapped.top_p).toBe('number')
    expect(typeof mapped.max_tokens).toBe('number')
  })
})
