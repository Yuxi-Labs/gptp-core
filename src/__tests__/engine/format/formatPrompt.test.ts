// src/__tests__/engine/format/formatPrompt.test.ts

import { describe, it, expect, vi } from 'vitest'
import { formatPrompt } from '@/engine/format/formatPrompt'

describe('formatPrompt', () => {
    const mockPrompt = {
        outputFormat: 'markdown',
        outputSchema: undefined
    } as const;

    const modelOutput = {
        content: 'This is a test response from the model.'
    };

    it('uses the declared outputFormat to format output correctly', () => {
        vi.mock('@/devtools/cli/helpers/formatting/registry', () => ({
            formatters: {
                markdown: (content: string) => `**${content}**`
            }
        }));

        const result = formatPrompt(modelOutput, mockPrompt);

        expect(typeof result).toBe('string');
        expect(result).toContain('**This is a test response from the model.**');
    });

    it('throws an error for unsupported format', () => {
        const badPrompt = {
            outputFormat: 'csv'
        } as unknown as Parameters<typeof formatPrompt>[1];

        vi.mock('@/devtools/cli/helpers/formatting/registry', () => ({
            formatters: {
                markdown: (content: string) => `**${content}**`
            }
        }));

        expect(() => formatPrompt(modelOutput, badPrompt)).toThrowError(
            new Error('Unsupported output format: csv')
        );
    });
});
