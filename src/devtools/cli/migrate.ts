import { parsePrompt } from '../../engine/parse'
import { migratePrompt } from '../../engine/migrate'
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

export async function migratePromptCLI() {
    const [, , filePath, ...rest] = process.argv
    if (!filePath) {
        console.error('Usage: gptp migrate <file.gptp> [--out=newfile.gptp]')
        process.exit(1)
    }

    const flags = parseFlags(rest)
    const absPath = path.resolve(filePath)

    let prompt = await parsePrompt(absPath)

    const schemaVersion = prompt.schemaVersion
    if (schemaVersion === '1.2.0') {
        console.log('✅ Prompt is already at schema version 1.2.0 — no migration needed.')
        process.exit(0)
    }

    const migrated = migratePrompt(prompt)
    const output = JSON.stringify(migrated, null, 2)

    if (flags.out) {
        const outPath = path.resolve(flags.out)
        await fs.writeFile(outPath, output, 'utf-8')
        console.log(`✅ Migrated prompt saved to ${flags.out}`)
    } else {
        console.log(output)
    }
}
