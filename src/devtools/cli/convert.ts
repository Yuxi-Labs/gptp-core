// src/bin/convert.ts (or wherever this is located)

import * as fs from 'fs/promises'
import path from 'path'
import { parsePrompt } from '@/engine/parse/parsePrompt'
import { convertPrompt } from '@/engine/convert/convertPrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

function parseFlags(args: string[]) {
    const flags: Record<string, string> = {}
    for (const arg of args) {
        const [key, value] = arg.split('=')
        if (key?.startsWith('--') && value !== undefined) {
            flags[key.slice(2)] = value
        }
    }
    return flags
}

async function run() {
    const [, , inputFile, ...restArgs] = process.argv

    if (!inputFile) {
        console.error('Usage: gptp convert <file> --to=format [--out=outfile]')
        process.exit(1)
    }

    const flags = parseFlags(restArgs)

    const to = flags.to
    const out = flags.out

    if (!to) {
        console.error('❌ Missing --to flag. Please specify a target format (e.g., prompt.md, raw).')
        process.exit(1)
    }

    const supportedFormats = ['prompt.md', 'raw', 'agent']
    if (!supportedFormats.includes(to)) {
        console.error(`❌ Unsupported format: ${to}. Supported formats are: ${supportedFormats.join(', ')}.`)
        process.exit(1)
    }

    const absInput = path.resolve(inputFile)
    let converted: string

    try {
        if (path.extname(inputFile) === '.gptp') {
            const parsed = await parsePrompt(absInput)
            converted = convertPrompt(parsed, to)
        } else {
            const raw = await fs.readFile(absInput, 'utf-8')
            const parsed: GPTPDocument = JSON.parse(raw)
            converted = convertPrompt(parsed, to)
        }
    } catch (err: any) {
        console.error(`❌ Failed to convert: ${err.message}. Please ensure the input file is valid and the format is correct.`)
        process.exit(1)
    }

    if (out) {
        const absOut = path.resolve(out)
        await fs.writeFile(absOut, converted, 'utf-8')
        console.log(`✅ Converted file saved to ${out}`)
    } else {
        console.log(converted)
    }
}

run()
