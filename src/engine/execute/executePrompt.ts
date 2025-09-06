// src/engine/execute/executePrompt.ts

import type { GPTPDocument, GPTPMessage } from '@/types/gptpTypes'
import { renderPrompt } from '@/engine/render/renderPrompt'
import { validatePrompt } from '@/engine/validate/validatePrompt'
import { resolveSecrets } from '@/runtime/secrets'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { selectProvider, mapParams } from '@/engine/execute/providerRouter'

export interface ExecutionOptions {
    input: Record<string, any>
    run?: boolean
    signal?: AbortSignal
    timeoutMs?: number
    validate?: boolean
    retry?: {
        retries?: number
        baseDelayMs?: number
        maxDelayMs?: number
        jitter?: boolean
    }
    lockfilePath?: string
}

export interface ExecutionResult {
    resolvedMessages: GPTPMessage[]
    modelOutput: string
    renderedPromptHash?: string
    variablesHash?: string
}

/**
 * Executes a GPTP prompt: resolves variables and optionally calls a model.
 */
export async function executePrompt(
    prompt: GPTPDocument,
    options: ExecutionOptions
): Promise<ExecutionResult> {
    const { input, run = false, signal, timeoutMs, validate = false, retry, lockfilePath } = options

    if (!Array.isArray(prompt.messages)) {
        throw new Error('Invalid prompt: "messages" must be an array.')
    }

    // Resolve provider secrets from env:KEY references; warn on inline secrets
    resolveSecrets(prompt, { injectStandardEnv: true })

    // Optional validation (off by default to avoid network fetch in typical unit tests)
    if (validate) {
        const validation = await validatePrompt(prompt)
        if (!validation.valid) {
            throw new Error(`Prompt validation failed: ${validation.errors?.[0]?.message || 'Unknown error'}`)
        }
    }

    // Deterministic render with single-pass interpolation and hashes
    const { renderedMessages: resolvedMessages, renderedPromptHash, variablesHash } = renderPrompt(
        prompt,
        input
    )

    if (!run) {
    return { resolvedMessages, modelOutput: '', renderedPromptHash, variablesHash }
    }

    // Optional timeout handling
    let controller: AbortController | undefined
    let timeoutId: NodeJS.Timeout | undefined
    let effectiveSignal: AbortSignal | undefined = signal
    if (timeoutMs && !signal) {
        controller = new AbortController()
        effectiveSignal = controller.signal
        timeoutId = setTimeout(() => controller?.abort(), timeoutMs)
    }

    const retries = Math.max(0, retry?.retries ?? 0)
    const baseDelay = Math.max(0, retry?.baseDelayMs ?? 250)
    const maxDelay = Math.max(baseDelay, retry?.maxDelayMs ?? 4000)
    const useJitter = !!retry?.jitter

    let lastError: unknown
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const { call, type, name } = selectProvider(prompt)
            const mapped = mapParams(prompt.params)
            const aiResponse = await call({
                messages: resolvedMessages,
                model: mapped.model,
                temperature: mapped.temperature,
                top_p: mapped.top_p,
                max_tokens: mapped.max_tokens,
                signal: effectiveSignal,
            })

            const modelOutput =
                aiResponse?.choices?.[0]?.message?.content ?? '[No response from model]'

            // Optional lockfile write
            if (lockfilePath) {
                await writeLockfile(lockfilePath, {
                    timestamp: new Date().toISOString(),
                    provider: { type, name },
                    model: mapped.model,
                    params: {
                        temperature: mapped.temperature,
                        top_p: mapped.top_p,
                        max_tokens: mapped.max_tokens,
                    },
                    hashes: { renderedPromptHash, variablesHash },
                    output: modelOutput,
                })
            }

            return { resolvedMessages, modelOutput, renderedPromptHash, variablesHash }
        } catch (err) {
            // If aborted, do not retry
            if (effectiveSignal?.aborted) {
                throw err
            }
            lastError = err
            if (attempt < retries) {
                const expBackoff = Math.min(maxDelay, baseDelay * Math.pow(2, attempt))
                const delay = useJitter ? Math.floor(Math.random() * expBackoff) : expBackoff
                await delayMs(delay)
                continue
            } else {
                throw err
            }
        }
    }

    // should never get here
    throw lastError instanceof Error ? lastError : new Error('Unknown execution error')

    async function writeLockfile(file: string, payload: any) {
        const dir = path.dirname(file)
        await fs.mkdir(dir, { recursive: true })
        const content = JSON.stringify(payload, null, 2)
        await fs.writeFile(file, content, 'utf-8')
    }

    function delayMs(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
