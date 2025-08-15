// src/engine/diff/index.ts

import { isEqual } from 'lodash';
import { GptpPrompt } from '../../types';

/**
 * Computes a shallow diff between two GPTP prompts.
 * Returns a list of changed top-level keys.
 */
export function diffPromptKeys(a: GptpPrompt, b: GptpPrompt): string[] {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const changed: string[] = [];

    for (const key of keys) {
        if (!isEqual(a[key as keyof GptpPrompt], b[key as keyof GptpPrompt])) {
            changed.push(key);
        }
    }

    return changed;
}

/**
 * Deep diff (optional): returns a record of changes for debugging or migration tools.
 */
export function diffPromptDeep(a: GptpPrompt, b: GptpPrompt): Record<string, { from: any; to: any }> {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const result: Record<string, { from: any; to: any }> = {};

    for (const key of keys) {
        const valA = a[key as keyof GptpPrompt];
        const valB = b[key as keyof GptpPrompt];

        if (!isEqual(valA, valB)) {
            result[key] = { from: valA, to: valB };
        }
    }

    return result;
}
