// src/engine/format/index.ts

import { formatters } from '@/devtools/cli/helpers/formatting/registry'

type SupportedFormat = keyof typeof formatters

export interface FormatOptions {
    outputFormat?: SupportedFormat
    outputSchema?: any
}

/**
 * Formats the model output according to the prompt's declared output format.
 */
export function formatOutput(rawOutput: any, options: FormatOptions): string {
    const { outputFormat = 'plain-text' } = options

    try {
        // Before accessing formatters with outputFormat, add a check to ensure it's a valid string
        if (!outputFormat) {
            throw new Error('Output format is not defined')
        }

        // Assuming outputFormat is defined by now, use a type assertion to safely index
        const key = outputFormat as keyof typeof formatters
        const formatter = formatters[key]

        if (!formatter) {
            throw new Error(`Unsupported output format: ${outputFormat}`)
        }

        // Extract content if rawOutput is an object with a content property
        const outputContent =
            typeof rawOutput === 'object' && rawOutput.content ? rawOutput.content : rawOutput

        return formatter(outputContent)
    } catch (error) {
        console.error('Error formatting output:', error)
        return '[error formatting output]'
    }
}

/**
 * Formats the output of a prompt according to the prompt's own declared format.
 */
export function formatPrompt(
    rawOutput: any,
    prompt: { outputFormat?: SupportedFormat; outputSchema?: any }
): string {
    const { outputFormat, outputSchema } = prompt

    // Resolve formatter and validate support
    const key = outputFormat as keyof typeof formatters
    const formatter = formatters[key]
    if (!formatter) {
        throw new Error(`Unsupported output format: ${outputFormat}`)
    }

    // Normalize output content similar to formatOutput
    const outputContent =
        typeof rawOutput === 'object' && rawOutput && 'content' in rawOutput
            ? (rawOutput as any).content
            : rawOutput

    return formatter(outputContent)
}
