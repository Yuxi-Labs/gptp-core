// src/__tests__/engine/init/initPrompt.test.ts

import { describe, it, expect } from 'vitest'
import { initPrompt } from '@/engine/init/initPrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('initPrompt', () => {
    it('creates a valid GPTPDocument with defaults', () => {
        const doc: GPTPDocument = initPrompt()

        expect(doc.$doctype).toBe('gptp')
        expect(doc.schemaVersion).toBe('1.2.0')
        expect(doc.promptVersion).toBeDefined()
        expect(doc.title).toBe('My Prompt')
        expect(doc.messages).toBeInstanceOf(Array)
        expect(doc.messages.length).toBeGreaterThan(0)
        expect(doc.messages[0].role).toBe('user')
    })

    it('accepts title and description overrides', () => {
        const doc = initPrompt({
            title: 'Custom Title',
            description: 'Custom description'
        })

        expect(doc.title).toBe('Custom Title')
        expect(doc.description).toBe('Custom description')
    })
})
