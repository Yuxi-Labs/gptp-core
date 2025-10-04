import { describe, it, expect, beforeEach, vi } from 'vitest'
import { callOpenAI } from '@/providers/openai/openaiRunner'

describe('providers/openai', () => {
	const originalFetch = globalThis.fetch
	const originalKey = process.env.OPENAI_API_KEY

	beforeEach(() => {
		vi.restoreAllMocks()
		process.env.OPENAI_API_KEY = 'test-key'
	})

	it('returns assistant content from mocked API', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => ({
			ok: true,
			json: async () => ({ choices: [{ message: { role: 'assistant', content: 'Hello!' } }] }),
		})) as any)

		const res = await callOpenAI({
			messages: [{ role: 'user', content: 'Hi' }],
			model: 'gpt-4o', temperature: 0.1, top_p: 1, max_tokens: 16,
		})
		expect(res.choices[0].message.content).toBe('Hello!')
		globalThis.fetch = originalFetch as any
		process.env.OPENAI_API_KEY = originalKey
	})

	it('throws when API key missing', async () => {
		process.env.OPENAI_API_KEY = ''
		await expect(callOpenAI({
			messages: [{ role: 'user', content: 'Hi' }],
			model: 'gpt-4o', temperature: 0.1, top_p: 1, max_tokens: 16,
		} as any)).rejects.toThrow('Missing OPENAI_API_KEY')
	})
})
