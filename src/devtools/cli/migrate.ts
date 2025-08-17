import { parsePrompt } from '../../engine/parse'
import { migratePrompt } from '../../engine/migrate'
import { loadSchema } from '../../engine/schema/loadSchema'
import { validatePrompt } from '../../engine/validate/validatePrompt'
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
        console.error('❌ Usage: gptp migrate <file.gptp> [--out=newfile.gptp]')
        process.exit(1)
    }

    const flags = parseFlags(rest)
    const absPath = path.resolve(filePath)

    let prompt
    try {
        prompt = await parsePrompt(absPath)
    } catch (err: any) {
        console.error(`❌ Failed to parse ${filePath}: ${err.message}`)
        process.exit(1)
    }

    if (prompt.schemaVersion === '1.2.0') {
        console.log('✅ Prompt is already at schema version 1.2.0 — no migration needed.')
        process.exit(0)
    }

    const migrated = migratePrompt(prompt)

    // Schema validation after migration (because we like correctness, unlike your lifestyle choices)
    let schema
    try {
        schema = await loadSchema()
    } catch (err: any) {
        console.error(`❌ Failed to load schema: ${err.message}`)
        process.exit(1)
    }

    const result = validatePrompt(migrated, schema)

    if (!result.valid) {
        console.error('❌ Migration produced an invalid prompt. Validation errors:')
        for (const err of result.errors || []) {
            console.error(`  - ${err.instancePath}: ${err.message}`)
        }
        process.exit(1)
    }

    const output = JSON.stringify(migrated, null, 2)

    if (flags.out) {
        const outPath = path.resolve(flags.out)
        try {
            await fs.writeFile(outPath, output, 'utf-8')
            console.log(`✅ Migrated prompt saved to ${flags.out}`)
        } catch (err: any) {
            console.error(`❌ Failed to write file: ${err.message}`)
            process.exit(1)
        }
    } else {
        console.log(output)
    }
}
