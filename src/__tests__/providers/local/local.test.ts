import { describe, it, expect } from 'vitest'
import { callLocal } from '@/providers/local/localRunner'

describe('providers/local', () => {
	it('echoes last user message with LOCAL: prefix', async () => {
		const out = await callLocal({ messages: [{ role: 'user', content: 'World' }], model: 'local', temperature: 0, top_p: 1, max_tokens: 8 })
		expect(out.choices[0].message.content).toBe('LOCAL:World')
	})
})
