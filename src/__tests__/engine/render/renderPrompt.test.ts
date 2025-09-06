import { describe, it, expect } from 'vitest'
import { renderPrompt } from '@/engine/render/renderPrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('renderPrompt', () => {
  const base: GPTPDocument = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
    promptVersion: '1.0.0',
    title: 'Render',
    description: 'test',
    system: 'You are helpful.',
    messages: [
      { role: 'user', content: 'Hello {{name}}' },
      { role: 'assistant', content: 'Hi there.' },
    ],
  }

  it('prepends system when not present and interpolates once', () => {
    const { renderedMessages } = renderPrompt(base, { name: 'Alice' })
    expect(renderedMessages[0]).toEqual({ role: 'system', content: 'You are helpful.' })
    expect(renderedMessages[1]).toEqual({ role: 'user', content: 'Hello Alice' })
    expect(renderedMessages[2]).toEqual({ role: 'assistant', content: 'Hi there.' })
  })

  it('emits stable hashes for same input and different variablesHash for different inputs', () => {
    const a = renderPrompt(base, { name: 'Bob' })
    const b = renderPrompt(base, { name: 'Bob' })
    const c = renderPrompt(base, { name: 'Eve' })

    expect(a.renderedPromptHash).toMatch(/^[a-f0-9]{64}$/)
    expect(a.variablesHash).toMatch(/^[a-f0-9]{64}$/)
    expect(a.renderedPromptHash).toBe(b.renderedPromptHash)
    expect(a.variablesHash).toBe(b.variablesHash)
    expect(a.variablesHash).not.toBe(c.variablesHash)
  })
})
