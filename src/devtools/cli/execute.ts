// src/devtools/cli/execute.ts

import path from 'path'
import { parsePrompt } from '@/engine/parse/parsePrompt'
import { executePrompt } from '@/engine/execute/executePrompt'
import { formatPrompt } from '@/engine/format/formatPrompt'
import { validatePrompt } from '@/engine/validate/validatePrompt'
import { loadEnvFile } from '@/utils/env'
import { loadProfile } from '@/utils/profiles'
import type { GPTPDocument } from '@/types/gptpTypes'

// Optional: placeholder normalizePrompt
function normalizePrompt(prompt: GPTPDocument): GPTPDocument {
    // You can add normalization logic here as needed
    return prompt
}

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

function validateRequiredInputs(prompt: GPTPDocument, input: Record<string, any>) {
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

    const validation = await validatePrompt(parsedPrompt)
    if (!validation.valid) {
        console.error('❌ Prompt failed validation:')
        for (const err of validation.errors) {
            console.error(`- ${err.instancePath}: ${err.message}`)
        }
        process.exit(1)
    }

    const normalized = normalizePrompt(parsedPrompt)
    validateRequiredInputs(normalized, input)

    try {
        await loadProfile('default')
    } catch {
        console.warn('⚠️ No profile found. Proceeding with default settings.')
    }

    const result = await executePrompt(normalized, {
        input,
        run: true,
    })

    if (typeof result.modelOutput !== 'string') {
        console.error('❌ Error: modelOutput is not a string.')
        process.exit(1)
    }

    console.log('=== Model Output ===\n')
    console.log(result.modelOutput)
}

run()
