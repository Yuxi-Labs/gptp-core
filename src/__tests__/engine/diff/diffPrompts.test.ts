// src/__tests__/engine/diff/diffPrompts.test.ts

import { describe, it, expect } from 'vitest'
import { diffPromptDeep } from '@/engine/diff/diffPrompts'

function normalizeDiff(
    diffObj: Record<string, { from: any; to: any }>
): Array<{ path: string; before: any; after: any }> {
    return Object.entries(diffObj).map(([path, { from, to }]) => ({
        path,
        before: from,
        after: to
    }))
}

describe('diffPromptDeep', () => {
    const basePrompt = {
        title: 'My Title',
        description: 'My description',
        messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' }
        ]
    }

    it('returns no diff if documents are identical', () => {
        const result = normalizeDiff(diffPromptDeep(basePrompt, basePrompt))
        expect(result).toEqual([])
    })

    it('detects change in title', () => {
        const modified = { ...basePrompt, title: 'New Title' }
        const result = normalizeDiff(diffPromptDeep(basePrompt, modified))
        expect(result).toContainEqual({
            path: 'title',
            before: 'My Title',
            after: 'New Title'
        })
    })

    it('detects added message', () => {
        const modified = {
            ...basePrompt,
            messages: [...basePrompt.messages, { role: 'user', content: 'Extra' }]
        }
        const result = normalizeDiff(diffPromptDeep(basePrompt, modified))
        expect(result.some(diff => diff.path.startsWith('messages'))).toBe(true)
    })

    it('detects removed property', () => {
        const { description, ...modified } = basePrompt

        const result = normalizeDiff(diffPromptDeep(basePrompt, modified))
        expect(result).toContainEqual({
            path: 'description',
            before: 'My description',
            after: undefined
        })
    })


    it('detects deeply nested diffs', () => {
        const original = {
            ...basePrompt,
            metadata: {
                created_by: 'alice'
            }
        }
        const modified = {
            ...basePrompt,
            metadata: {
                created_by: 'bob'
            }
        }
        const result = normalizeDiff(diffPromptDeep(original, modified))
        expect(result).toContainEqual({
            path: 'metadata.created_by',
            before: 'alice',
            after: 'bob'
        })
    })
})
