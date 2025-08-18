// src/engine/init/initPrompt.ts

import type { GPTPDocument } from '@/types/gptpTypes'

export function initPrompt(options?: {
    title?: string
    description?: string
}): GPTPDocument {
    return {
        $doctype: 'gptp',
        schemaVersion: process.env.GPTP_SCHEMA || '1.2.0',
        promptVersion: '1.0.0',
        title: options?.title || 'My Prompt',
        description: options?.description || 'A new prompt created with gptp init.',
        messages: [
            {
                role: 'user',
                content: 'Hello {{name}}!'
            }
        ],
        variables: {
            name: {
                type: 'string',
                description: 'The name of the user',
                example: 'Alice'
            }
        },
        params: {
            model: 'gpt-4',
            temperature: 0.7
        },
        output_format: 'plain-text'
    }
}
