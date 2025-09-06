import { describe, it, expect } from 'vitest'
import { normalizePrompt } from '@/engine/normalize/normalizePrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('normalizePrompt', () => {
    it('fills in missing optional fields with defaults', () => {
        const minimalPrompt: GPTPDocument = {
            $doctype: 'gptp',
            schemaVersion: '1.2.0',
            promptVersion: '1.0.0',
            title: 'Test Prompt',
            description: 'A minimal test prompt',
            messages: [
                {
                    role: 'user',
                    content: 'Hello?',
                },
            ],
        }

        const normalized = normalizePrompt(minimalPrompt)

        // ✅ Now you can assert default values were filled
        expect(normalized.variables).toEqual({})
        expect(normalized.metadata).toEqual({})
        expect(normalized.tools).toEqual([])
        expect(normalized.vision).toEqual({ allow_images: false })
        expect(normalized.output_format).toBe('plain-text')
        expect(normalized.params).toEqual({
            model: 'gpt-4',
            temperature: 0.7,
            top_p: 1,
            max_tokens: 512,
        })
    })
})
