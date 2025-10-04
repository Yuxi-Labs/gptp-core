import { describe, it, expect, beforeEach, vi } from 'vitest'
import { callMicrosoftAzureOpenAI } from '@/providers/microsoft/microsoftAzureOpenaiRunner'

describe('providers/microsoft', () => {
	const originalFetch = globalThis.fetch
	const env = { ...process.env }

	beforeEach(() => {
		vi.restoreAllMocks()
		process.env.AZURE_OPENAI_ENDPOINT = 'https://xyz.openai.azure.com'
		process.env.AZURE_OPENAI_API_KEY = 'k'
		process.env.AZURE_OPENAI_DEPLOYMENT = 'my-deploy'
	})

	it('returns content', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => ({
			ok: true,
			json: async () => ({ choices: [{ message: { role: 'assistant', content: 'Hi from Azure' } }] }),
		})) as any)
		const res = await callMicrosoftAzureOpenAI({ messages: [{ role: 'user', content: 'Hi' }], model: 'my-deploy', temperature: 0, top_p: 1, max_tokens: 16 })
		expect(res.choices[0].message.content).toBe('Hi from Azure')
		globalThis.fetch = originalFetch as any
		process.env = env
	})

	it('validates env', async () => {
		process.env.AZURE_OPENAI_ENDPOINT = ''
		await expect(callMicrosoftAzureOpenAI({ messages: [], model: 'm', temperature: 0, top_p: 1, max_tokens: 1 } as any)).rejects.toThrow('Missing Azure OpenAI configuration')
	})
})
