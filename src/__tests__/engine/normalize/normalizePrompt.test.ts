// src/__tests__/engine/normalize/normalizePrompt.test.ts

import { describe, it, expect } from 'vitest'
import { normalizePrompt } from '@/engine/normalize/normalizePrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('normalizePrompt', () => {
    it('fills in missing optional fields with defaults', () => {
        const prompt: GPTPDocument = {
            $doctype: 'gptp',
            schemaVersion: '1.2.0',
            promptVersion: '1.0.0',
            title: 'Normalize Me',
            description: 'Testing normalization',
            messages: [{ role: 'user', content: 'Hey' }]
        }

        const normalized = normalizePrompt(prompt)
        expect(normalized.variables).toBeDefined()
        expect(normalized.params).toBeDefined()
    })
})
