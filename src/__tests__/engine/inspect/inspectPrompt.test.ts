// src/__tests__/engine/inspect/inspectPrompt.test.ts

import { describe, it, expect } from 'vitest'
import { inspectPrompt } from '@/engine/inspect/inspectPrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('inspectPrompt', () => {
    const prompt: GPTPDocument = {
        $doctype: 'gptp',
        schemaVersion: '1.2.0',
        promptVersion: '1.0.0',
        title: 'Inspect This',
        description: 'Test inspection output',
        messages: [
            { role: 'user', content: 'How are you?' },
            { role: 'assistant', content: 'I am good, thanks!' }
        ],
        params: {
            model: 'gpt-4',
            temperature: 0.5
        },
        output_format: 'plain-text'
    }

    it('returns summary string with title and message count', () => {
        const result = inspectPrompt(prompt)
        expect(typeof result).toBe('string')
        expect(result).toContain('Inspect This')
        expect(result).toMatch(/2 message/)
    })

    it('includes model and format details', () => {
        const result = inspectPrompt(prompt)
        expect(result).toContain('gpt-4')
        expect(result).toContain('plain-text')
    })
})
