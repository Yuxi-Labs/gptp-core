// src/engine/diff/index.ts

import { isEqual } from 'lodash-es'
import type { GPTPDocument } from '@/types/gptpTypes'

/**
 * Computes a shallow diff between two GPTP prompts.
 * Returns a list of changed top-level keys.
 */
export function diffPromptKeys(a: GPTPDocument, b: GPTPDocument): string[] {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    const changed: string[] = []

    for (const key of keys) {
        const aVal = a[key as keyof GPTPDocument]
        const bVal = b[key as keyof GPTPDocument]

        if (!isEqual(aVal, bVal)) {
            changed.push(key)
        }
    }

    return changed
}

/**
 * Performs a recursive diff between two GPTP documents.
 * Returns a map of changed key paths with their `from` and `to` values.
 */
export function diffPromptDeep(
    a: Record<string, any>,
    b: Record<string, any>,
    pathPrefix = ''
): Record<string, { from: any; to: any }> {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    const diff: Record<string, { from: any; to: any }> = {}

    for (const key of keys) {
        const aVal = a[key]
        const bVal = b[key]
        const path = pathPrefix ? `${pathPrefix}.${key}` : key

        const bothObjects =
            aVal && bVal && typeof aVal === 'object' && typeof bVal === 'object' &&
            !Array.isArray(aVal) && !Array.isArray(bVal)

        if (bothObjects) {
            const nested = diffPromptDeep(aVal, bVal, path)
            Object.assign(diff, nested)
        } else if (!isEqual(aVal, bVal)) {
            diff[path] = { from: aVal, to: bVal }
        }
    }

    return diff
}
