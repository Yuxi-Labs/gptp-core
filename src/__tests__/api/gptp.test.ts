import { describe, test, expect } from 'vitest';
import { diffPromptKeys, executePrompt, formatPrompt, inspectPrompt } from '@/api/gptp';
import type { GPTPDocument } from '@/types/gptpTypes';

describe('API GPTP Tests', () => {
  const mockPrompt: GPTPDocument = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
    promptVersion: '1.0.0',
    title: 'Test Prompt',
    description: 'A test prompt',
    messages: [{ role: 'user', content: 'Hello' }],
    params: { model: 'gpt-4', temperature: 0.7 }
  };

  test('diffPromptKeys should diff correctly', () => {
    const result = diffPromptKeys(mockPrompt, { ...mockPrompt, title: 'Updated Title' });
    expect(result).toContain('title');
  });

  test('executePrompt should execute correctly', async () => {
    const result = await executePrompt(mockPrompt, { input: {}, run: false });
    expect(result).toBeDefined();
  });

  test('formatPrompt should format correctly', () => {
    const formatOptions = { outputFormat: 'markdown' as const };
    const result = formatPrompt('output', formatOptions);
    expect(result).toBeDefined();
  });

  test('inspectPrompt should inspect correctly', () => {
    const result = inspectPrompt(mockPrompt);
    expect(result).toContain('Test Prompt');
  });
});
