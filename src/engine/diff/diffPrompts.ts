// src/engine/diff/index.ts

import { isEqual } from 'lodash-es'
import { GptpPrompt } from '../../types'

/**
 * Computes a shallow diff between two GPTP prompts.
 * Returns a list of changed top-level keys.
 */
export function diffPromptKeys(a: GptpPrompt, b: GptpPrompt): string[] {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    const changed: string[] = []

    for (const key of keys) {
        const aVal = a[key as keyof GptpPrompt]
        const bVal = b[key as keyof GptpPrompt]

        if (!isEqual(aVal, bVal)) {
            changed.push(key)
        }
    }

    return changed
}

/**
 * Performs a deep diff between two GPTP prompts.
 * Returns a map of changed keys with their `from` and `to` values.
 */
export function diffPromptDeep(a: GptpPrompt, b: GptpPrompt): Record<string, { from: any; to: any }> {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    const diff: Record<string, { from: any; to: any }> = {}

    for (const key of keys) {
        const aVal = a[key as keyof GptpPrompt]
        const bVal = b[key as keyof GptpPrompt]

        if (!isEqual(aVal, bVal)) {
            diff[key] = { from: aVal, to: bVal }
        }
    }

    return diff
}
