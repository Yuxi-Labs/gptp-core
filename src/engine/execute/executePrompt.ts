// src/engine/execute/index.ts

import { GptpPrompt } from '../../types'
import { interpolateVariables } from '../utils/interpolation'
import { callOpenAI } from './runners/openai'

interface ExecutionOptions {
    input: Record<string, any>
    run?: boolean
}

export interface ExecutionResult {
    resolvedMessages: { role: string; content: string }[]
    modelOutput: string
}

/**
 * Executes a GPTP prompt: resolves variables and optionally calls a model.
 */
export async function executePrompt(
    prompt: GptpPrompt,
    options: ExecutionOptions
): Promise<ExecutionResult> {
    const { input, run = false } = options

    if (!prompt.messages || !Array.isArray(prompt.messages)) {
        throw new Error('Invalid prompt: "messages" must be an array.')
    }

    const resolvedMessages = prompt.messages.map((msg) => {
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
            modelOutput: '', // dry run fallback
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
