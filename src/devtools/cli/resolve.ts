// src/devtools/cli/resolve.ts
import path from 'path'
import fs from 'fs/promises'
import { parsePrompt } from '@/engine/parse/parsePrompt'
import { normalizePrompt } from '@/engine/normalize/normalizePrompt'
import type { GPTPDocument } from '@/types/gptpTypes'

type Flags = {
    out?: string
    normalize?: 'true' | 'false'
    keepExtends?: 'true' | 'false'
}

function parseFlags(args: string[]): Flags {
    const flags: Flags = {}
    for (const arg of args) {
        const [k, v] = arg.split('=')
        if (!k?.startsWith('--')) continue
        const key = k.slice(2) as keyof Flags
        ;(flags as any)[key] = v ?? 'true'
    }
    return flags
}

/**
 * Deep merge:
 * - Objects: recursive merge
 * - Arrays: concatenate (parent first, then child)
 * - Scalars: child overrides parent
 */
function deepMerge<T = any>(parent: T, child: T): T {
    if (Array.isArray(parent) && Array.isArray(child)) {
        return [...parent, ...child] as unknown as T
    }

    if (
        parent &&
        child &&
        typeof parent === 'object' &&
        typeof child === 'object' &&
        !Array.isArray(parent) &&
        !Array.isArray(child)
    ) {
        const out: any = { ...parent }
        for (const key of Object.keys(child as any)) {
            const pv = (parent as any)[key]
            const cv = (child as any)[key]
            out[key] = pv === undefined ? cv : deepMerge(pv, cv)
        }
        return out
    }

    // Scalars or mismatched types -> child wins
    return child
}

/**
 * Resolve a prompt file with support for `extends`.
 * - Loads the base chain recursively
 * - Applies deepMerge at each step (base <- child)
 * - Removes `extends` in the final output by default
 */
async function resolveExtendsFromFile(
    filePath: string,
    seen: Set<string> = new Set()
): Promise<{ resolved: GPTPDocument; tree: string[] }> {
    const abs = path.resolve(filePath)
    if (seen.has(abs)) {
        throw new Error(`Cycle detected while resolving extends: ${abs}`)
    }
    seen.add(abs)

    const prompt = await parsePrompt(abs)
    const tree = [abs]

    const rel = (prompt as any).extends as string | undefined
    if (!rel) {
        return { resolved: prompt as GPTPDocument, tree }
    }

    const basePath = path.resolve(path.dirname(abs), rel)
    const { resolved: baseResolved, tree: baseTree } = await resolveExtendsFromFile(basePath, seen)

    // Merge: base <- child
    const merged = deepMerge<GPTPDocument>(baseResolved, prompt as GPTPDocument)

    // Drop extends in merged so the result is standalone
    delete (merged as any).extends

    return { resolved: merged, tree: [...baseTree, abs] }
}

export async function resolveCLI() {
    const [, , fileArg, ...rest] = process.argv
    if (!fileArg) {
        console.error('Usage: gptp resolve <file.gptp> [--out=out.gptp] [--normalize] [--keepExtends=false]')
        process.exit(1)
    }

    const flags = parseFlags(rest)
    const { resolved, tree } = await resolveExtendsFromFile(fileArg)

    let finalPrompt: GPTPDocument = resolved

    // By default we drop `extends`. If user insists, put it back (not recommended).
    if (flags.keepExtends === 'true') {
        // noop — resolved already had extends removed; we won't re-add since it’s ambiguous after merge.
        // Intentionally ignored for safety.
    }

    if (flags.normalize === 'true') {
        finalPrompt = normalizePrompt(finalPrompt)
    }

    const output = JSON.stringify(finalPrompt, null, 2)

    if (flags.out) {
        const outPath = path.resolve(flags.out)
        await fs.writeFile(outPath, output, 'utf8')
        console.log('✅ Resolved prompt written to', flags.out)
        console.log('📦 Resolution chain:')
        for (const p of tree) console.log('  -', p)
    } else {
        console.log(output)
    }
}

if (require.main === module) {
    resolveCLI().catch((err) => {
        console.error('❌ resolve failed:', err instanceof Error ? err.message : String(err))
        process.exit(1)
    })
}
