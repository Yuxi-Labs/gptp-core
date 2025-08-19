import { describe, test, expect } from 'vitest';
import { convertPrompt } from '@/engine/convert/convertPrompt';
import type { GPTPDocument } from '@/types/gptpTypes';

describe('Convert Prompt Tests', () => {
  const mockPrompt: GPTPDocument = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
    promptVersion: '1.0.0',
    title: 'Test Prompt',
    description: 'A test prompt',
    messages: [{ role: 'user', content: 'Hello' }],
    params: { model: 'gpt-4', temperature: 0.7 }
  };

  test('convertPrompt should convert to markdown format', () => {
    const result = convertPrompt(mockPrompt, 'prompt.md');
    expect(result).toContain('# Test Prompt');
  });

  test('convertPrompt should throw error for unsupported format', () => {
    expect(() => convertPrompt(mockPrompt, 'unsupported')).toThrow(/Unsupported target format/);
  });
});
