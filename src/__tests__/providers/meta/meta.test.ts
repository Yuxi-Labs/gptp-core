import { describe, it, expect, beforeEach, vi } from 'vitest'
import { callMetaLlama } from '@/providers/meta/metaLlamaRunner'

describe('providers/meta', () => {
	const originalFetch = globalThis.fetch
	const env = { ...process.env }

	beforeEach(() => {
		vi.restoreAllMocks()
		process.env.OPENROUTER_API_KEY = 'x'
	})

	it('uses OpenRouter and returns content', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ choices: [{ message: { role: 'assistant', content: 'meta-ok' } }] }) })) as any)
		const res = await callMetaLlama({ messages: [{ role: 'user', content: 'hi' }], model: 'meta-llama/llama-3', temperature: 0, top_p: 1, max_tokens: 8 })
		expect(res.choices[0].message.content).toBe('meta-ok')
		globalThis.fetch = originalFetch as any
		process.env = env
	})

	it('requires key', async () => {
		process.env.OPENROUTER_API_KEY = ''
		process.env.META_LLAMA_API_KEY = ''
		await expect(callMetaLlama({ messages: [], model: 'm', temperature: 0, top_p: 1, max_tokens: 1 } as any)).rejects.toThrow('Missing OPENROUTER_API_KEY')
	})
})
