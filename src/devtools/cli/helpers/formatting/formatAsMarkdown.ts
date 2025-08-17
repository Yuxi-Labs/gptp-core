// src/devtools/cli/helpers/formatting/formatAsMarkdown.ts

/**
 * formatAsMarkdown
 *
 * Converts model output into valid Markdown syntax.
 * This is not code fencing — it is actual Markdown structure.
 * Output depends on the type of input.
 * - Strings: paragraphs
 * - Objects: definition lists or code blocks
 * - Arrays: bullet lists
 * - Numbers/Booleans/Null: inline values
 */

function escapeMd(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/([*_`~])/g, '\\$1')
        .replace(/^(\s*)([*+-])/gm, '$1\\$2') // escape list markers at line start
}

function formatObjectAsMarkdown(obj: Record<string, any>): string {
    const lines: string[] = []

    for (const [key, value] of Object.entries(obj)) {
        const escapedKey = escapeMd(key)
        const formattedVal =
            typeof value === 'object' && value !== null
                ? '```json\n' + JSON.stringify(value, null, 2) + '\n```'
                : '`' + escapeMd(String(value)) + '`'

        lines.push(`**${escapedKey}**: ${formattedVal}`)
    }

    return lines.join('\n\n')
}

function formatArrayAsMarkdown(arr: any[]): string {
    return arr
        .map((item) => {
            if (typeof item === 'object') {
                return '- ' + '`' + escapeMd(JSON.stringify(item)) + '`'
            }
            return '- ' + escapeMd(String(item))
        })
        .join('\n')
}

export function formatAsMarkdown(raw: any): string {
    if (typeof raw === 'undefined') {
        return '`[undefined]`'
    }

    if (typeof raw === 'string') {
        return escapeMd(raw)
    }

    if (typeof raw === 'number' || typeof raw === 'boolean' || raw === null) {
        return '`' + String(raw) + '`'
    }

    if (Array.isArray(raw)) {
        return formatArrayAsMarkdown(raw)
    }

    if (typeof raw === 'object') {
        return formatObjectAsMarkdown(raw)
    }

    // Fallback
    return '`[unrecognized type]`'
}
