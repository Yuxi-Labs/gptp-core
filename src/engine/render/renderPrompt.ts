import type { GPTPDocument, GPTPMessage } from '@/types/gptpTypes'
import { interpolate } from '@/utils/interpolation'
import { sha256Hex } from '@/utils/hash'

export interface RenderResult {
    renderedMessages: GPTPMessage[]
    renderedPromptHash: string
    variablesHash: string
}

/**
 * Deterministic render: single-pass interpolation on message content.
 * - No double-rendering (only one interpolate pass per message)
 * - If prompt.system exists and no system message, insert at the top
 * - Emits renderedPromptHash and variablesHash
 */
export function renderPrompt(prompt: GPTPDocument, variables: Record<string, unknown>): RenderResult {
    const messages: GPTPMessage[] = []

    // Insert system message first if defined and not already present
    const hasSystem = prompt.messages.some((m) => m.role === 'system')
    if (prompt.system && !hasSystem) {
        messages.push({ role: 'system', content: prompt.system })
    }

    for (const msg of prompt.messages) {
        if (typeof msg.content !== 'string') {
            throw new Error(`Invalid message content for role "${msg.role}". Must be a string.`)
        }
        // Single pass interpolation
        const rendered = interpolate(msg.content, variables)
        messages.push({ role: msg.role, content: rendered })
    }

    const renderedPromptHash = sha256Hex({
        messages,
        model: prompt.params?.model,
        of: prompt.output_format,
    })
    const variablesHash = sha256Hex(variables)

    return { renderedMessages: messages, renderedPromptHash, variablesHash }
}
