// src/engine/normalize/index.ts

import { cloneDeep } from 'lodash'
import type { GptpPrompt } from '../../types'

export function normalizePrompt(input: GptpPrompt): GptpPrompt {
    const prompt = cloneDeep(input)

    // Inject system into messages if not already present
    if (prompt.system) {
        const hasSystemMessage = prompt.messages.some(m => m.role === 'system')
        if (!hasSystemMessage) {
            prompt.messages = [
                { role: 'system', content: prompt.system },
                ...prompt.messages
            ]
        }
    }

    // Default schema version if missing
    if (!prompt.schemaVersion) {
        prompt.schemaVersion = '1.2.0'
    }

    // Default prompt version
    if (!prompt.promptVersion) {
        prompt.promptVersion = '1.0.0'
    }

    // Default metadata block
    if (!prompt.metadata) {
        prompt.metadata = {}
    }

    return prompt
}
