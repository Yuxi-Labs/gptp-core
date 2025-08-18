// src/engine/normalize/normalizePrompt.ts

import { cloneDeep } from 'lodash-es'
import type { GPTPDocument } from '@/types/gptpTypes'

export function normalizePrompt(input: GPTPDocument): GPTPDocument {
    const prompt = cloneDeep(input)

    // Inject system message if missing
    if (prompt.system) {
        const hasSystem = prompt.messages.some(msg => msg.role === 'system')
        if (!hasSystem) {
            prompt.messages.unshift({ role: 'system', content: prompt.system })
        }
    }

    // Default schema version
    if (!prompt.schemaVersion) {
        prompt.schemaVersion = '1.2.0'
    }

    // Default prompt version
    if (!prompt.promptVersion) {
        prompt.promptVersion = '1.0.0'
    }

    // Default output_format
    if (!prompt.output_format) {
        prompt.output_format = 'plain-text'
    }

    // Default output_schema
    if (!prompt.output_schema) {
        prompt.output_schema = {}
    }

    // Default metadata
    if (!prompt.metadata) {
        prompt.metadata = {}
    }

    // Default variables
    if (!prompt.variables) {
        prompt.variables = {}
    }

    // Default tools
    if (!prompt.tools) {
        prompt.tools = []
    }

    // Default vision
    if (!prompt.vision) {
        prompt.vision = { allow_images: false }
    } else if (typeof prompt.vision.allow_images !== 'boolean') {
        prompt.vision.allow_images = false
    }

    // Default params
    if (!prompt.params) {
        prompt.params = {}
    }
    if (!prompt.params.model) {
        prompt.params.model = 'gpt-4'
    }
    if (prompt.params.temperature === undefined) {
        prompt.params.temperature = 0.7
    }
    if (prompt.params.top_p === undefined) {
        prompt.params.top_p = 1
    }
    if (prompt.params.max_tokens === undefined) {
        prompt.params.max_tokens = 512
    }

    return prompt
}
