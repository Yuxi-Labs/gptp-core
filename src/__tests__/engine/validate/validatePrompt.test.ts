// src/__tests__/engine/validate/validatePrompt.test.ts

import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import 'dotenv/config'


import { validatePrompt } from '@/engine/validate/validatePrompt'
import { GPTPDocument } from '@/types/gptpTypes'

const FIXTURE_PATH = path.resolve('src/__tests__/fixtures/validate/valid/valid-validate.gptp')

describe('validatePrompt (FULL validation - valid prompt)', () => {
    let prompt: GPTPDocument

    beforeAll(async () => {
        const raw = await fs.readFile(FIXTURE_PATH, 'utf-8')
        prompt = JSON.parse(raw)
    })

    it('should validate without errors', async () => {
        const result = await validatePrompt(prompt)
        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
        expect(result.data).toBeDefined()
    })

    it('should include all required top-level fields', () => {
        const requiredFields = [
            '$doctype',
            'schemaVersion',
            'promptVersion',
            'title',
            'description',
            'messages'
        ]

        for (const field of requiredFields) {
            expect(prompt).toHaveProperty(field)
        }
    })

    it('should have a valid messages array with proper structure', () => {
        expect(Array.isArray(prompt.messages)).toBe(true)
        expect(prompt.messages.length).toBeGreaterThan(0)

        for (const msg of prompt.messages) {
            expect(['system', 'user', 'assistant']).toContain(msg.role)
            expect(typeof msg.content).toBe('string')
            expect(msg.content.length).toBeGreaterThan(0)
        }
    })

    it('should define variables correctly if present', () => {
        if (prompt.variables) {
            for (const [key, variable] of Object.entries(prompt.variables)) {
                expect(variable).toHaveProperty('type')
                expect(typeof variable.type).toBe('string')
                expect(['string', 'number', 'integer', 'boolean', 'array', 'object']).toContain(variable.type)
            }
        }
    })

    it('should match exact schemaVersion and $doctype', () => {
        expect(prompt.schemaVersion).toBe('1.2.0')
        expect(prompt.$doctype).toMatch(/^gptp$/i)
    })

    it('should include optional metadata sections if present', () => {
        if (prompt.metadata) {
            expect(typeof prompt.metadata).toBe('object')
            if (prompt.metadata.tags) {
                expect(Array.isArray(prompt.metadata.tags)).toBe(true)
            }
        }
    })

    it('should include params if defined and they must be of correct types', () => {
        if (prompt.params) {
            expect(typeof prompt.params).toBe('object')
            if (prompt.params.temperature !== undefined) {
                expect(typeof prompt.params.temperature).toBe('number')
            }
        }
    })

    it('should include tools if present, and each should have a name', () => {
        if (prompt.tools) {
            for (const tool of prompt.tools) {
                expect(tool).toHaveProperty('name')
                expect(typeof tool.name).toBe('string')
            }
        }
    })

    it('should validate vision section if defined', () => {
        if (prompt.vision) {
            expect(typeof prompt.vision.allow_images).toBe('boolean')
            if (prompt.vision.inputs) {
                for (const input of prompt.vision.inputs) {
                    expect(typeof input.name).toBe('string')
                    expect(typeof input.media_type).toBe('string')
                }
            }
        }
    })

    it('should not throw when validating a real GPTPDocument', async () => {
        await expect(validatePrompt(prompt)).resolves.toBeDefined()
    })
})
