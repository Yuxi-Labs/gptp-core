// src/devtools/capture/printCodebase.ts
//
// Dump every non-ignored file in the repo to stdout **or** a single text file.
//
// • Skips dot-files / dot-dirs automatically.
// • Obeys .gitignore rules (plus some hard-coded extras).
// • Accepts BOTH “--out file.txt” and “--out=file.txt”.

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import ignore, { Ignore } from 'ignore'

/* ------------------------------------------------------------------ */
/*  Paths & constants                                                 */
/* ------------------------------------------------------------------ */

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const ROOT       = path.resolve(__dirname, '../../..')

/* ------------------------------------------------------------------ */
/*  CLI flag parsing (--out file OR --out=file)                       */
/* ------------------------------------------------------------------ */

let OUTPUT_FILE: string | null = null
for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]

    // --out file.txt  ↴
    if (arg === '--out' && process.argv[i + 1]) {
        OUTPUT_FILE = path.resolve(ROOT, process.argv[i + 1])
        break
    }

    // --out=file.txt  ↴
    if (arg.startsWith('--out=')) {
        OUTPUT_FILE = path.resolve(
            ROOT,
            arg.slice('--out='.length) || 'codebase.txt'
        )
        break
    }
}

/* ------------------------------------------------------------------ */
/*  Initialise ignore instance                                        */
/* ------------------------------------------------------------------ */

const ig: Ignore = ignore()

async function loadGitignore(): Promise<void> {
    try {
        const raw = await fs.readFile(path.join(ROOT, '.gitignore'), 'utf8')
        ig.add(raw)
    } catch {
        console.warn('⚠️  No .gitignore found or it could not be read')
    }

    /* Always-skip list */
    ig.add([
        '.git/',
        '.idea/',
        '.vscode/',
        'node_modules/',
        'dist/',
        '*.log',
        'package-lock.json',
    ])
}

/* ------------------------------------------------------------------ */
/*  Recursive file walk                                               */
/* ------------------------------------------------------------------ */

async function walk(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
        /* Skip dot-files / dot-dirs immediately */
        if (entry.name.startsWith('.')) continue

        const abs  = path.join(dir, entry.name)
        const rel  = path.relative(ROOT, abs)
        const posixRel = rel.split(path.sep).join(path.posix.sep)

        /* Trailing “/” for dirs so patterns like node_modules/ match */
        const testPath = entry.isDirectory() ? `${posixRel}/` : posixRel
        if (ig.ignores(testPath)) continue

        if (entry.isDirectory()) {
            files.push(...(await walk(abs)))
        } else {
            files.push(abs)
        }
    }

    return files
}

/* ------------------------------------------------------------------ */
/*  Dump gathered files                                               */
/* ------------------------------------------------------------------ */

async function dump(files: string[]): Promise<void> {
    const chunks: string[] = []

    for (const file of files) {
        const rel = path.relative(ROOT, file)
        let text: string

        try {
            text = await fs.readFile(file, 'utf8')
        } catch {
            text = '[Failed to read file]'
        }

        chunks.push(`\n=== ${rel} ===\n${text}`)
    }

    const output = chunks.join('\n')

    if (OUTPUT_FILE) {
        await fs.writeFile(OUTPUT_FILE, output, 'utf8')
        console.log(`✅ Codebase written to ${OUTPUT_FILE}`)
    } else {
        console.log(output)
    }
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

async function main() {
    await loadGitignore()
    const files = await walk(ROOT)
    await dump(files)
}

main().catch(err => {
    console.error('❌ Failed to print codebase:', err)
    process.exit(1)
})
