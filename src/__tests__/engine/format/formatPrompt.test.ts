// src/__tests__/engine/format/formatPrompt.test.ts

import { describe, it, expect } from 'vitest'
import { formatPrompt } from '@/engine/format/formatPrompt'

describe('formatPrompt', () => {
    const mockPrompt = {
        outputFormat: 'markdown',
        outputSchema: undefined
    } as const // 👈 this keeps 'markdown' literal, not widened to string

    const modelOutput = {
        content: 'This is a test response from the model.'
    }

    it('uses the declared outputFormat to format output correctly', () => {
        const result = formatPrompt(modelOutput, mockPrompt)

        expect(typeof result).toBe('string')
        expect(result).toContain('This is a test response')
    })

    it('throws an error for unsupported format', () => {
        const badPrompt = {
            outputFormat: 'csv'
        } as unknown as Parameters<typeof formatPrompt>[1] // 🛑 intentionally wrong

        expect(() => formatPrompt(modelOutput, badPrompt)).toThrow(
            /Unsupported output format/
        )
    })
})
