// src/__tests__/engine/migrate/migratePrompt.test.ts

import { describe, it, expect } from 'vitest'
import { migratePrompt } from '@/engine/migrate/migratePrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('migratePrompt', () => {
    it('upgrades schemaVersion if outdated', () => {
        const oldPrompt = {
            $doctype: 'gptp',
            schemaVersion: '1.0.0',
            promptVersion: '0.9.0',
            title: 'Old Prompt',
            description: 'This needs migration',
            messages: [{ role: 'user', content: 'Hi' }]
        } as GPTPDocument

        const migrated = migratePrompt(oldPrompt)
        expect(migrated.schemaVersion).toBe('1.2.0')
    })
})
