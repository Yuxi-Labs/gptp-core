import fs from 'fs'
import { isDeepStrictEqual } from 'util'

export interface DiffResult {
    changed: boolean
    addedKeys: string[]
    removedKeys: string[]
    changedKeys: string[]
}

export function diffGPTPFiles(aPath: string, bPath: string): Record<string, DiffResult> {
    const a = JSON.parse(fs.readFileSync(aPath, 'utf-8'))
    const b = JSON.parse(fs.readFileSync(bPath, 'utf-8'))

    const sectionsToCompare = [
        'variables',
        'parameters',
        'messages',
        'output_contract',
        'tests'
    ]

    const diff: Record<string, DiffResult> = {}

    for (const key of sectionsToCompare) {
        const aVal = a[key] ?? {}
        const bVal = b[key] ?? {}

        if (isDeepStrictEqual(aVal, bVal)) {
            diff[key] = {
                changed: false,
                addedKeys: [],
                removedKeys: [],
                changedKeys: []
            }
            continue
        }

        const addedKeys: string[] = []
        const removedKeys: string[] = []
        const changedKeys: string[] = []

        if (Array.isArray(aVal) && Array.isArray(bVal)) {
            // Special case for `messages` or `tests`: compare by index
            const maxLen = Math.max(aVal.length, bVal.length)
            for (let i = 0; i < maxLen; i++) {
                if (!isDeepStrictEqual(aVal[i], bVal[i])) {
                    changedKeys.push(`#${i}`)
                }
            }
        } else if (typeof aVal === 'object' && typeof bVal === 'object') {
            const aKeys = new Set(Object.keys(aVal))
            const bKeys = new Set(Object.keys(bVal))

            for (const key of aKeys) {
                if (!bKeys.has(key)) removedKeys.push(key)
                else if (!isDeepStrictEqual(aVal[key], bVal[key])) changedKeys.push(key)
            }
            for (const key of bKeys) {
                if (!aKeys.has(key)) addedKeys.push(key)
            }
        }

        diff[key] = {
            changed: true,
            addedKeys,
            removedKeys,
            changedKeys
        }
    }

    return diff
}
