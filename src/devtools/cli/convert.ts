import fs from 'fs/promises'
import path from 'path'
import { parsePrompt } from '../../engine/parse'
import { convertToFormat } from '../../engine/convert/convertToFormat'
import { convertFromFormat } from '../../engine/convert/convertFromFormat'

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
        console.error('❌ Missing --to flag. Please specify a target format.')
        process.exit(1)
    }

    const absInput = path.resolve(inputFile)
    const inputRaw = await fs.readFile(absInput, 'utf-8')

    let converted: string

    try {
        if (path.extname(inputFile) === '.gptp') {
            const parsed = await parsePrompt(absInput)
            converted = convertToFormat(parsed, to)
        } else {
            converted = convertFromFormat(inputRaw, to)
        }
    } catch (err: any) {
        console.error(`❌ Failed to convert: ${err.message}`)
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
