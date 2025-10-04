import { describe, it, expect, beforeEach, vi } from 'vitest'
import { callAnthropic } from '@/providers/anthropic/anthropicRunner'

describe('providers/anthropic', () => {
	const originalFetch = globalThis.fetch
	const origKey = process.env.ANTHROPIC_API_KEY

	beforeEach(() => {
		vi.restoreAllMocks()
		process.env.ANTHROPIC_API_KEY = 'x'
	})

	it('normalizes content array', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => ({
			ok: true,
			json: async () => ({ content: [{ type: 'text', text: 'Howdy' }] }),
		})) as any)

		const out = await callAnthropic({
			messages: [{ role: 'user', content: 'Hi' }],
			model: 'claude-3', temperature: 0, top_p: 1, max_tokens: 16,
		})
		expect(out.choices[0].message.content).toBe('Howdy')
		globalThis.fetch = originalFetch as any
		process.env.ANTHROPIC_API_KEY = origKey
	})

	it('throws when key missing', async () => {
		process.env.ANTHROPIC_API_KEY = ''
		await expect(callAnthropic({
			messages: [{ role: 'user', content: 'X' }], model: 'claude', temperature: 0, top_p: 1, max_tokens: 8,
		} as any)).rejects.toThrow('Missing ANTHROPIC_API_KEY')
	})
})
