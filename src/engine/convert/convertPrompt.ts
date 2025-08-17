import type { GptpPrompt } from '../../types'

export function convertPrompt(prompt: GptpPrompt, format: string): string {
    switch (format) {
        case 'prompt.md': {
            const lines = prompt.messages.map(
                m => `### ${m.role}\n\n${m.content}`
            ).join('\n\n')

            return `# ${prompt.title}\n\n${prompt.description}\n\n${lines}`
        }

        case 'prompt': // Humanloop style?
        case 'agent': {
            const lines = prompt.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`)
            return lines.join('\n\n')
        }

        default:
            throw new Error(`Unsupported target format: ${format}`)
    }
}
