// src/engine/format/index.ts

type SupportedFormat = 'markdown' | 'json' | 'html' | 'plain-text';

export interface FormatOptions {
    outputFormat?: SupportedFormat;
    outputSchema?: any;
}

/**
 * Formats the model output according to the prompt's declared output format.
 */
export function formatOutput(rawOutput: any, options: FormatOptions): string {
    const { outputFormat = 'plain-text' } = options;

    switch (outputFormat) {
        case 'json':
            return JSON.stringify(rawOutput, null, 2);

        case 'html':
            return `<pre>${escapeHtml(
                typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput, null, 2)
            )}</pre>`;

        case 'markdown':
            return typeof rawOutput === 'string'
                ? rawOutput
                : '```json\n' + JSON.stringify(rawOutput, null, 2) + '\n```';

        case 'plain-text':
        default:
            return typeof rawOutput === 'string'
                ? rawOutput
                : JSON.stringify(rawOutput);
    }
}

/**
 * Formats the output of a prompt according to the prompt's own declared format.
 */
export function formatPrompt(rawOutput: any, prompt: { outputFormat?: SupportedFormat; outputSchema?: any }): string {
    return formatOutput(rawOutput, {
        outputFormat: prompt.outputFormat,
        outputSchema: prompt.outputSchema,
    });
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
