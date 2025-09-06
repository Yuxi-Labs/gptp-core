// src/devtools/cli/diff.ts

import { diffPromptKeys, diffPromptDeep } from '@/engine/diff/diffPrompts'
import { parsePrompt } from '@/engine/parse/parsePrompt'
import path from 'path'
import * as fs from 'fs/promises'

async function main() {
    const [, , fileA, fileB, ...flags] = process.argv

    if (!fileA || !fileB) {
        console.error('Usage: gptp diff <fileA.gptp> <fileB.gptp> [--deep]')
        process.exit(1)
    }

    const absFileA = path.resolve(fileA)
    const absFileB = path.resolve(fileB)

    try {
        await fs.access(absFileA)
        await fs.access(absFileB)
    } catch {
        console.error('❌ One or both files do not exist. Please check the file paths and try again.')
        process.exit(1)
    }

    const promptA = await parsePrompt(absFileA)
    const promptB = await parsePrompt(absFileB)

    const isDeep = flags.includes('--deep')

    if (isDeep) {
        const deep = diffPromptDeep(promptA, promptB)
        if (Object.keys(deep).length === 0) {
            console.log('✅ No differences found.')
        } else {
            console.log('🔍 Deep differences:')
            for (const key in deep) {
                const { from, to } = deep[key]
                console.log(`\n  🔑 ${key} changed:`)
                console.log(`    - from: ${JSON.stringify(from, null, 2)}`)
                console.log(`    + to:   ${JSON.stringify(to, null, 2)}`)
            }
        }
    } else {
        const shallow = diffPromptKeys(promptA, promptB)
        if (shallow.length === 0) {
            console.log('✅ No differences at top level.')
        } else {
            console.log('🧾 Changed keys:', shallow.join(', '))
        }
    }
}

main().catch(err => {
    console.error('❌ Error during diff:', err.message)
    process.exit(1)
})
