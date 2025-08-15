// src/devtools/cli/execute.ts

import path from 'path'

import {
    parsePrompt,
    normalizePrompt,
    executePrompt,
    formatPrompt,
    loadProfile,
} from '../../engine'

import type { GptpPrompt } from '../../types'

type ExecutionResult = {
    modelOutput: string
    [key: string]: any
}

// Parses CLI input like: name=Bob mood=confused
function parseInputArgs(args: string[]): Record<string, any> {
    const input: Record<string, any> = {}

    for (const arg of args) {
        const [key, value] = arg.split('=')
        if (key && value !== undefined) {
            input[key] = value
        }
    }

    return input
}

export async function run(): Promise<void> {
    const [, , filePath, ...restArgs] = process.argv

    if (!filePath) {
        console.error('Usage: gptp execute <prompt.gptp> [key=value ...]')
        process.exit(1)
    }

    const absPath = path.resolve(filePath)
    const input = parseInputArgs(restArgs)

    const parsedPrompt = await parsePrompt(absPath)
    const normalized: GptpPrompt = normalizePrompt(parsedPrompt)

    await loadProfile('default') // future use

    const result: ExecutionResult = await executePrompt(normalized, {
        input,
        run: true,
    })

    if (typeof result.modelOutput !== 'string') {
        console.error('❌ Error: modelOutput is not a string.')
        process.exit(1)
    }

    const output = formatPrompt(result.modelOutput, normalized)

    console.log('=== Model Output ===\n')
    console.log(output)
}

run()
