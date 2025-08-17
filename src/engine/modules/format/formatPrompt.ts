// src/engine/format/index.ts

import { formatters } from '../../devtools/cli/helpers/formatting/registry'

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

    const formatter = formatters[outputFormat]
    if (!formatter) {
        throw new Error(`Unsupported output format: ${outputFormat}`)
    }

    return formatter(rawOutput)
}

/**
 * Formats the output of a prompt according to the prompt's own declared format.
 */
export function formatPrompt(
    rawOutput: any,
    prompt: { outputFormat?: SupportedFormat; outputSchema?: any }
): string {
    return formatOutput(rawOutput, {
        outputFormat: prompt.outputFormat,
        outputSchema: prompt.outputSchema,
    })
}
