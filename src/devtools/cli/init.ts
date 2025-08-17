import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Scaffold template — full GPTP file structure
const DEFAULT_PROMPT = {
    $doctype: 'gptp',
    schemaVersion: process.env.GPTP_SCHEMA || '1.2.0',
    promptVersion: '1.0.0',
    title: 'My Prompt',
    description: 'A new prompt created with gptp init.',
    messages: [
        {
            role: 'user',
            content: 'Hello {{name}}!'
        }
    ],
    variables: {
        name: {
            type: 'string',
            required: true,
            description: 'The name of the user',
            example: 'Alice'
        }
    },
    params: {
        model: 'gpt-4',
        temperature: 0.7
    },
    output_format: 'plain-text'
}

// Simple CLI flag parser: --key=value
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

    const title = (flags.title as string) || DEFAULT_PROMPT.title
    const description = (flags.description as string) || DEFAULT_PROMPT.description
    const file = (flags.out as string) || 'my-prompt.gptp'
    const overwrite = !!flags.overwrite

    const prompt = {
        ...DEFAULT_PROMPT,
        title,
        description
    }

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

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initPromptCLI()
}
