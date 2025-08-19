import { describe, test, expect } from 'vitest';
import { diffPromptKeys } from '@/engine/diff/diffPrompts';
import type { GPTPDocument } from '@/types/gptpTypes';

describe('Diff Prompt Tests', () => {
  const mockPrompt: GPTPDocument = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
    promptVersion: '1.0.0',
    title: 'Test Prompt',
    description: 'A test prompt',
    messages: [{ role: 'user', content: 'Hello' }],
    params: { model: 'gpt-4', temperature: 0.7 }
  };

  test('diffPromptKeys should detect changes in title', () => {
    const result = diffPromptKeys(mockPrompt, { ...mockPrompt, title: 'Updated Title' });
    expect(result).toContain('title');
  });

  test('diffPromptKeys should return empty array for identical prompts', () => {
    const result = diffPromptKeys(mockPrompt, mockPrompt);
    expect(result).toHaveLength(0);
  });
});
