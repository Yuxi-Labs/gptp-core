// src/engine/execute/index.ts

import { GptpPrompt } from '../../types'
import { interpolateVariables } from '../utils/interpolation'
import { callOpenAI } from './runners/openai' // You can stub this first

interface ExecutionOptions {
    input: Record<string, any>
    run?: boolean // If false, only resolves the prompt
}

export interface ExecutionResult {
    resolvedMessages: { role: string; content: string }[]
    modelOutput?: any
}

/**
 * Executes a GPTP prompt: resolves variables and optionally calls a model.
 */
export async function executePrompt(
    prompt: GptpPrompt,
    options: ExecutionOptions
): Promise<ExecutionResult> {
    const { input, run = false } = options

    // Interpolate variables into each message
    const resolvedMessages = prompt.messages.map((msg) => ({
        role: msg.role,
        content: interpolateVariables(msg.content, input)
    }))

    if (!run) {
        return { resolvedMessages }
    }

    const modelOutput = await callOpenAI({
        messages: resolvedMessages,
        model: prompt.params?.model || 'gpt-4',
        temperature: prompt.params?.temperature ?? 0.7,
        top_p: prompt.params?.top_p ?? 1,
        max_tokens: prompt.params?.max_tokens ?? 512
    })

    return {
        resolvedMessages,
        modelOutput
    }
}
