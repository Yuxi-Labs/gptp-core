// src/__tests__/engine/convert/convertFormat.test.ts

import { describe, it, expect } from 'vitest'
import { convertPrompt } from '@/engine/convert/convertPrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

const samplePrompt: GPTPDocument = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
    promptVersion: '1.0.0',
    title: 'Test Prompt',
    description: 'A sample prompt for testing',
    messages: [
        { role: 'user', content: 'Who are you?' },
        { role: 'assistant', content: 'I am a helpful assistant.' }
    ]
}

describe('convertPrompt', () => {
    it('converts to Microsoft .prompt.md format', () => {
        const result = convertPrompt(samplePrompt, 'prompt.md')
        expect(result).toMatch(/^# Test Prompt/)
        expect(result).toContain('### user')
        expect(result).toContain('### assistant')
        expect(result).toContain('I am a helpful assistant.')
    })

    it('converts to Humanloop .prompt format', () => {
        const result = convertPrompt(samplePrompt, 'prompt')
        expect(result).toMatch(/USER: Who are you\?\n\nASSISTANT: I am a helpful assistant\./)
    })

    it('converts to Anthropic .agent format (alias of .prompt)', () => {
        const result = convertPrompt(samplePrompt, 'agent')
        expect(result).toBe(convertPrompt(samplePrompt, 'prompt'))
    })

    it('converts to raw JSON format', () => {
        const result = convertPrompt(samplePrompt, 'raw')
        const parsed = JSON.parse(result)
        expect(parsed).toHaveProperty('messages')
        expect(parsed.messages.length).toBe(2)
    })

    it('throws for unsupported formats', () => {
        expect(() => convertPrompt(samplePrompt, 'banana')).toThrow(/Unsupported target format/)
    })
})
