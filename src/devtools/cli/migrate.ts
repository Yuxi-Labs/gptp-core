// src/bin/migrate.ts

import fs from 'fs/promises'
import path from 'path'
import { parsePrompt } from '@/engine/parse/parsePrompt'
import { migratePrompt } from '@/engine/migrate/migratePrompt'
import { schemaLoader } from '@/utils/schemaLoader'
import { validatePrompt } from '@/engine/validate/validatePrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

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
    const [, , filePath, ...restArgs] = process.argv

    if (!filePath) {
        console.error('❌ Usage: gptp migrate <file.gptp> [--out=newfile.gptp]')
        process.exit(1)
    }

    const flags = parseFlags(restArgs)
    const absPath = path.resolve(filePath)

    let prompt: GPTPDocument
    try {
        prompt = await parsePrompt(absPath)
    } catch (err: any) {
        console.error(`❌ Failed to parse "${filePath}": ${err.message}`)
        process.exit(1)
    }

    if (prompt.schemaVersion === '1.2.0') {
        console.log('✅ Prompt is already at schema version 1.2.0 — no migration needed.')
        process.exit(0)
    }

    const migrated = migratePrompt(prompt)

    // Validate against current schema
    let schema: object
    try {
        schema = await schemaLoader()
    } catch (err: any) {
        console.error(`❌ Failed to load schema: ${err.message}`)
        process.exit(1)
    }

    const result = await validatePrompt(migrated, schema) // ✅ make this `await`

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
            console.error(`❌ Failed to write output file: ${err.message}`)
            process.exit(1)
        }
    } else {
        console.log(output)
    }
}
