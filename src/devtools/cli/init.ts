import fs from 'fs/promises'
import path from 'path'

const DEFAULT_PROMPT = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
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

function parseFlags(args: string[]) {
    const flags: Record<string, string> = {}
    for (const arg of args) {
        const [key, value] = arg.split('=')
        if (key && value !== undefined) {
            flags[key.replace(/^--/, '')] = value
        }
    }
    return flags
}

export async function initPromptCLI() {
    const [, , ...args] = process.argv
    const flags = parseFlags(args)

    const title = flags.title || 'My Prompt'
    const description = flags.description || 'A new prompt created with gptp init.'
    const file = flags.out || 'my-prompt.gptp'

    const prompt = {
        ...DEFAULT_PROMPT,
        title,
        description
    }

    const absPath = path.resolve(file)

    try {
        await fs.access(absPath)
        console.error(`❌ File already exists: ${file}`)
        process.exit(1)
    } catch {
        // It's fine. File doesn't exist.
    }

    try {
        await fs.writeFile(absPath, JSON.stringify(prompt, null, 2), 'utf-8')
        console.log(`✅ Created prompt at ${file}`)
    } catch (err: any) {
        console.error(`❌ Failed to write file: ${err.message}`)
        process.exit(1)
    }
}
