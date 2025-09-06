import * as fs from 'fs/promises'
import path from 'path'
import { formatOutput } from '@/engine/format/formatPrompt'

type FormatFlags = {
    format?: 'plain-text' | 'markdown' | 'json' | 'html'
    schema?: string
}

function parseFlags(args: string[]): { filePath: string; flags: FormatFlags } {
    const [filePath, ...rest] = args
    const flags: FormatFlags = {}

    for (const arg of rest) {
        const [key, value] = arg.split('=')
        if (key && value !== undefined) {
            const cleanKey = key.replace(/^--/, '')
            if (cleanKey === 'format') flags.format = value as FormatFlags['format']
            if (cleanKey === 'schema') flags.schema = value
        }
    }

    return { filePath, flags }
}

async function run() {
    const [, , ...args] = process.argv
    const { filePath, flags } = parseFlags(args)

    if (!filePath) {
        console.error('Usage: gptp format <output.txt> [--format=json|markdown|html|plain-text] [--schema=output.schema.json]')
        process.exit(1)
    }

    const absPath = path.resolve(filePath)

    let rawText: string
    try {
        rawText = await fs.readFile(absPath, 'utf8')
    } catch (err: any) {
        console.error(`\u274c Failed to read file: ${absPath}\n${err.message}`)
        process.exit(1)
    }

    let parsedOutput: any = rawText
    try {
        parsedOutput = JSON.parse(rawText)
    } catch {
        // Raw is not JSON — treat as plain string
    }

    let outputSchema: any = undefined
    if (flags.schema) {
        const schemaPath = path.resolve(flags.schema)
        try {
            const schemaRaw = await fs.readFile(schemaPath, 'utf8')
            outputSchema = JSON.parse(schemaRaw)
        } catch (err: any) {
            console.error(`\u274c Failed to load schema from ${flags.schema}: ${err.message}`)
            process.exit(1)
        }
    }

    try {
        const result = formatOutput(parsedOutput, {
            outputFormat: flags.format,
            outputSchema,
        })
        console.log(result)
    } catch (err: any) {
        console.error(`\u274c Failed to format output: ${err.message}`)
        process.exit(1)
    }
}

run()
