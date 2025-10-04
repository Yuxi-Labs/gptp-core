import { describe, it, expect, beforeEach, vi } from 'vitest'
import { callCohere } from '@/providers/cohere/cohereRunner'

describe('providers/cohere', () => {
	const originalFetch = globalThis.fetch
	const origKey = process.env.COHERE_API_KEY

	beforeEach(() => {
		vi.restoreAllMocks()
		process.env.COHERE_API_KEY = 'x'
	})

	it('normalizes text fields', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ text: 'ok' }) })) as any)
		const out = await callCohere({ messages: [{ role: 'user', content: 'hi' }], model: 'command', temperature: 0, top_p: 1, max_tokens: 8 })
		expect(out.choices[0].message.content).toBe('ok')
		globalThis.fetch = originalFetch as any
		process.env.COHERE_API_KEY = origKey
	})

	it('requires key', async () => {
		process.env.COHERE_API_KEY = ''
		await expect(callCohere({ messages: [], model: 'm', temperature: 0, top_p: 1, max_tokens: 1 } as any)).rejects.toThrow('Missing COHERE_API_KEY')
	})
})
