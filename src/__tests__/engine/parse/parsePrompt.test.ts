// src/__tests__/engine/parse/parsePrompt.test.ts

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual<typeof import('fs/promises')>('fs/promises');
  return {
    ...actual,
    default: actual,
  };
});

import { describe, beforeAll, afterAll, it, expect } from 'vitest'
import { writeFile, rm, mkdir } from 'fs/promises'
import path from 'path'
import { parsePrompt } from '@/engine/parse/parsePrompt'
import type { GPTPDocument } from '@/types/gptpTypes'
import { vi } from 'vitest'

const TEST_DIR = path.resolve('.gptp/tests')

const validPrompt: GPTPDocument = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
    promptVersion: '1.0.0',
    title: 'Parse Me',
    description: 'This is a test',
    messages: [{ role: 'user', content: 'Hello' }]
}

describe('parsePrompt', () => {
    const testFile = path.join(TEST_DIR, 'valid.gptp')

    beforeAll(async () => {
        await mkdir(TEST_DIR, { recursive: true })
        await writeFile(testFile, JSON.stringify(validPrompt, null, 2), 'utf-8')
    })

    afterAll(async () => {
        await rm(TEST_DIR, { recursive: true, force: true })
    })

    it('parses a valid GPTP file', async () => {
        const parsed = await parsePrompt(testFile)
        expect(parsed.title).toBe(validPrompt.title)
        expect(parsed.messages[0].content).toBe('Hello')
    })

    it('throws on bad JSON', async () => {
        const badFile = path.join(TEST_DIR, 'bad.gptp')
        await writeFile(badFile, '{ bad json', 'utf-8')

        await expect(parsePrompt(badFile)).rejects.toThrow(/Invalid JSON/)
    })

    it('throws when required fields are missing', async () => {
        const incomplete = {
            title: 'Has title',
            messages: [{ role: 'user', content: 'Still here' }]
            // description is missing
        }
        const file = path.join(TEST_DIR, 'incomplete.gptp')
        await writeFile(file, JSON.stringify(incomplete, null, 2), 'utf-8')

        await expect(parsePrompt(file)).rejects.toThrow(/Missing required field "description"/i)
    })

    it('throws if file is missing', async () => {
        const missing = path.join(TEST_DIR, 'does-not-exist.gptp')
        await expect(parsePrompt(missing)).rejects.toThrow(/Failed to read file/)
    })

    it('throws on empty file', async () => {
        const emptyFile = path.join(TEST_DIR, 'empty.gptp')
        await writeFile(emptyFile, '', 'utf-8')

        await expect(parsePrompt(emptyFile)).rejects.toThrow(/Invalid JSON/)
    })

    it('throws on invalid messages structure', async () => {
        const invalidMessages = {
            title: 'Invalid Messages',
            description: 'This is a test',
            messages: [{ role: 'user' }] // Missing 'content'
        }
        const file = path.join(TEST_DIR, 'invalid-messages.gptp')
        await writeFile(file, JSON.stringify(invalidMessages, null, 2), 'utf-8')

        await expect(parsePrompt(file)).rejects.toThrow(/Invalid 'messages' field/)
    })
})
