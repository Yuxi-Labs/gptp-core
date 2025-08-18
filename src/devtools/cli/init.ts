// src/devtools/cli/init.ts

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { initPrompt } from '@/engine/init/initPrompt'

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function parseFlags(args: string[]) {
    const flags: Record<string, string | boolean> = {}
    for (const arg of args) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=')
            flags[key] = value !== undefined ? value : true
        }
    }
    return flags
}

export async function initPromptCLI() {
    const [, , ...args] = process.argv
    const flags = parseFlags(args)

    const file = (flags.out as string) || 'my-prompt.gptp'
    const overwrite = !!flags.overwrite

    const prompt = initPrompt({
        title: flags.title as string,
        description: flags.description as string
    })

    const absPath = path.resolve(file)

    try {
        await fs.access(absPath)
        if (!overwrite) {
            console.error(`❌ File already exists: ${file}`)
            console.error(`   Use --overwrite to overwrite it.`)
            process.exit(1)
        }
    } catch {
        // File doesn't exist, proceed
    }

    try {
        await fs.writeFile(absPath, JSON.stringify(prompt, null, 2), 'utf-8')
        console.log(`✅ Created prompt at ${file}`)
    } catch (err: any) {
        console.error(`❌ Failed to write file: ${err.message}`)
        process.exit(1)
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initPromptCLI()
}
