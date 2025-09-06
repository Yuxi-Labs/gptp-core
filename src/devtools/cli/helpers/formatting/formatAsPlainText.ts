// src/devtools/cli/helpers/formatting/formatAsPlainText.ts

import chalk from 'chalk'

/**
 * formatAsPlainText
 *
 * Converts model output into styled plain text for terminal display.
 * Automatically uses colors for different types, but only if running in a TTY.
 */

export function formatAsPlainText(raw: any): string {
    const isTTY = process.stdout.isTTY

    if (raw === null || raw === undefined) {
        return isTTY ? chalk.gray('[null/undefined]') : '[null/undefined]'
    }

    try {
        if (typeof raw === 'string') {
            return isTTY ? chalk.white(raw) : raw
        }

        if (typeof raw === 'number' || typeof raw === 'boolean') {
            const base = String(raw)
            return isTTY ? chalk.cyan(base) : base
        }

        const formatted = JSON.stringify(raw, null, 2)

        if (!isTTY) return formatted

        // Colorize line-by-line (basic beautification)
        return formatted
            .split('\n')
            .map(line => {
                if (/^\s*{/.test(line) || /^\s*}/.test(line)) return chalk.gray(line)
                if (/^\s*"/.test(line)) return chalk.green(line)
                if (/:\s*".*"/.test(line)) return chalk.white(line)
                if (/:\s*\d/.test(line)) return chalk.cyan(line)
                return chalk.white(line)
            })
            .join('\n')
    } catch (error) {
        console.error('Error formatting as plain text:', error)
        return isTTY ? chalk.red('[error formatting output]') : '[error formatting output]'
    }
}
