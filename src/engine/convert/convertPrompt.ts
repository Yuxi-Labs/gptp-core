// src/engine/convert/convertPrompt.ts
import type { GPTPDocument } from '@/types/gptpTypes'

export function convertPrompt(prompt: GPTPDocument, format: string): string {
    switch (format) {
        case 'prompt.md':
            return `# ${prompt.title}\n\n${prompt.description}\n\n` +
                prompt.messages.map(
                    m => `### ${m.role}\n\n${m.content}`
                ).join('\n\n')

        case 'prompt':
        case 'agent':
            return prompt.messages
                .map(m => `${m.role.toUpperCase()}: ${m.content}`)
                .join('\n\n')

        case 'raw':
            return JSON.stringify(prompt, null, 2)

        default:
            throw new Error(`Unsupported target format: ${format}`)
    }
}
