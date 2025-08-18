// src/__tests__/engine/execute/executePrompt.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { executePrompt } from '@/engine/execute/executePrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

describe('executePrompt', () => {
    let basePrompt: GPTPDocument
    const prevEnv = { ...process.env }

    beforeEach(() => {
        // minimal valid GPTP prompt that matches your schema/types
        basePrompt = {
            $doctype: 'gptp',
            schemaVersion: '1.2.0',
            promptVersion: '1.0.0',
            title: 'Exec Test',
            description: 'Execute engine tests',
            messages: [
                { role: 'user', content: 'Hello {{name}}!' }
            ],
            params: {
                model: 'gpt-4',
                temperature: 0.7,
                top_p: 1,
                max_tokens: 64
            }
        }

        // default: no mocking unless a test opts in
        delete process.env.MOCK
    })

    afterEach(() => {
        // restore env in case other tests depend on it
        process.env = { ...prevEnv }
    })

    it('resolves variables and does NOT call the model when run=false (dry run)', async () => {
        const result = await executePrompt(basePrompt, {
            input: { name: 'Alice' },
            run: false
        })

        expect(result.resolvedMessages).toHaveLength(1)
        expect(result.resolvedMessages[0]).toEqual({
            role: 'user',
            content: 'Hello Alice!'
        })
        expect(result.modelOutput).toBe('') // dry-run returns empty string
    })

    it('calls the model when run=true and returns mocked content if MOCK=true', async () => {
        process.env.MOCK = 'true' // triggers mocked OpenAI runner

        const result = await executePrompt(basePrompt, {
            input: { name: 'Bob' },
            run: true
        })

        // interpolation happened before the call
        expect(result.resolvedMessages[0].content).toBe('Hello Bob!')

        // mocked OpenAI response shape from src/providers/openai/openaiRunner.ts
        expect(result.modelOutput).toContain('[Mocked response]')
        expect(result.modelOutput).toContain('Model: gpt-4')
    })

    it('throws for prompts without a messages array', async () => {
        // @ts-expect-error intentionally breaking the shape for the test
        const badPrompt: GPTPDocument = { ...basePrompt, messages: undefined }

        await expect(executePrompt(badPrompt, { input: {}, run: false }))
            .rejects.toThrow(/"messages" must be an array/i)
    })

    it('throws if a message has non-string content', async () => {
        const badPrompt = {
            ...basePrompt,
            messages: [{ role: 'user', content: 123 }]
        } as unknown as GPTPDocument

        await expect(executePrompt(badPrompt, { input: {}, run: false }))
            .rejects.toThrow(/Invalid message content/i)
    })

})
