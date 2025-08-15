import { parsePrompt } from '../../engine/parse'
import { normalizePrompt } from '../../engine/normalize'
import { diffPromptDeep } from '../../engine/diff'
import fs from 'fs/promises'
import path from 'path'

function parseFlags(args: string[]): Record<string, string> {
    const flags: Record<string, string> = {}
    for (const arg of args) {
        const [key, value] = arg.split('=')
        if (key && value !== undefined) {
            flags[key.replace(/^--/, '')] = value
        }
    }
    return flags
}

export async function normalizePromptCLI() {
    const [, , filePath, ...rest] = process.argv
    if (!filePath) {
        console.error('Usage: gptp normalize <file.gptp> [--out=out.gptp] [--diff]')
        process.exit(1)
    }

    const flags = parseFlags(rest)
    const absPath = path.resolve(filePath)

    const original = await parsePrompt(absPath)
    const normalized = normalizePrompt(original)

    if (flags.diff) {
        const diff = diffPromptDeep(original, normalized)
        if (Object.keys(diff).length === 0) {
            console.log('✅ Prompt is already normalized.')
        } else {
            console.log('🔍 Normalization changes:')
            for (const key in diff) {
                console.log(`\n  🔑 ${key} changed:`)
                console.log(`    - from: ${JSON.stringify(diff[key].from, null, 2)}`)
                console.log(`    + to:   ${JSON.stringify(diff[key].to, null, 2)}`)
            }
        }
        process.exit(0)
    }

    const output = JSON.stringify(normalized, null, 2)

    if (flags.out) {
        const outPath = path.resolve(flags.out)
        await fs.writeFile(outPath, output, 'utf-8')
        console.log(`✅ Normalized prompt written to ${flags.out}`)
    } else {
        console.log(output)
    }
}
