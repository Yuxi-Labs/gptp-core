import path from 'path'
import {
    parsePrompt,
    normalizePrompt,
    executePrompt,
    formatPrompt,
    loadProfile,
} from '../../engine'

import { loadEnvFile } from '../../engine/utils/env'
import { validatePrompt } from '../../engine/validate/validatePrompt'
import { loadSchema } from '../../engine/schema/loadSchema'
import type { GptpPrompt } from '../../types'

loadEnvFile()

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

function validateRequiredInputs(prompt: GptpPrompt, input: Record<string, any>) {
    const variables = prompt.variables || {}

    for (const [key, def] of Object.entries(variables)) {
        if (def.required && input[key] === undefined) {
            console.error(`❌ Missing required input: "${key}"`)
            process.exit(1)
        }
    }
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

    // 🧠 Now with validation that works
    const schema = await loadSchema()
    const isValid = validatePrompt(parsedPrompt, schema)
    if (!isValid) {
        console.error('❌ Prompt failed schema validation.')
        process.exit(1)
    }

    const normalized: GptpPrompt = normalizePrompt(parsedPrompt)
    validateRequiredInputs(normalized, input)

    await loadProfile('default') // for future dreams and delusions

    const result = await executePrompt(normalized, {
        input,
        run: true,
    })

    if (typeof result.modelOutput !== 'string') {
        console.error('❌ Error: modelOutput is not a string.')
        process.exit(1)
    }

    const output = formatPrompt(result.modelOutput, {
        outputFormat: normalized.output_format || 'plain-text',
        outputSchema: normalized.output_schema,
    })

    console.log('=== Model Output ===\n')
    console.log(output)
}

run()
