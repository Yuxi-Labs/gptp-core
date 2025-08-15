import { diffPromptKeys, diffPromptDeep } from '../../engine/diff'
import { parsePrompt } from '../../engine/parse'
import path from 'path'

async function main() {
    const [,, fileA, fileB, ...flags] = process.argv

    if (!fileA || !fileB) {
        console.error('Usage: gptp diff <fileA.gptp> <fileB.gptp> [--deep]')
        process.exit(1)
    }

    const promptA = await parsePrompt(path.resolve(fileA))
    const promptB = await parsePrompt(path.resolve(fileB))

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
            console.log('🧩 Changed keys:', shallow.join(', '))
        }
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error('❌ Error during diff:', err)
        process.exit(1)
    })
}
