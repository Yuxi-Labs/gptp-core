// src/engine/execute/executePrompt.ts

import type { GPTPDocument, GPTPMessage } from '@/types/gptpTypes'
import { interpolateVariables } from '@/utils/interpolation'
import { callOpenAI } from '@/providers/openai/openaiRunner'

export interface ExecutionOptions {
    input: Record<string, any>
    run?: boolean
}

export interface ExecutionResult {
    resolvedMessages: GPTPMessage[]
    modelOutput: string
}

/**
 * Executes a GPTP prompt: resolves variables and optionally calls a model.
 */
export async function executePrompt(
    prompt: GPTPDocument,
    options: ExecutionOptions
): Promise<ExecutionResult> {
    const { input, run = false } = options

    if (!Array.isArray(prompt.messages)) {
        throw new Error('Invalid prompt: "messages" must be an array.')
    }

    const resolvedMessages: GPTPMessage[] = prompt.messages.map((msg) => {
        if (typeof msg.content !== 'string') {
            throw new Error(`Invalid message content for role "${msg.role}". Must be a string.`)
        }

        return {
            role: msg.role,
            content: interpolateVariables(msg.content, input),
        }
    })

    if (!run) {
        return {
            resolvedMessages,
            modelOutput: '',
        }
    }

    const aiResponse = await callOpenAI({
        messages: resolvedMessages,
        model: prompt.params?.model || 'gpt-4',
        temperature: prompt.params?.temperature ?? 0.7,
        top_p: prompt.params?.top_p ?? 1,
        max_tokens: prompt.params?.max_tokens ?? 512,
    })

    const modelOutput =
        aiResponse?.choices?.[0]?.message?.content ?? '[No response from model]'

    return {
        resolvedMessages,
        modelOutput,
    }
}
