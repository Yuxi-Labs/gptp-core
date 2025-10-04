import { describe, it, expect, beforeEach, vi } from 'vitest'
import { callMistral } from '@/providers/mistral/mistralRunner'

describe('providers/mistral', () => {
	const originalFetch = globalThis.fetch
	const origKey = process.env.MISTRAL_API_KEY

	beforeEach(() => {
		vi.restoreAllMocks()
		process.env.MISTRAL_API_KEY = 'x'
	})

	it('returns normalized content', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ output: 'hey' }) })) as any)
		const res = await callMistral({ messages: [{ role: 'user', content: 'Hi' }], model: 'm', temperature: 0, top_p: 1, max_tokens: 8 })
		expect(res.choices[0].message.content).toBe('hey')
		globalThis.fetch = originalFetch as any
		process.env.MISTRAL_API_KEY = origKey
	})

	it('requires key', async () => {
		process.env.MISTRAL_API_KEY = ''
		await expect(callMistral({ messages: [], model: 'm', temperature: 0, top_p: 1, max_tokens: 1 } as any)).rejects.toThrow('Missing MISTRAL_API_KEY')
	})
})
