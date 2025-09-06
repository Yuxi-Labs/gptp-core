import { describe, test, expect } from 'vitest';
import * as fs from 'fs/promises';
import path from 'path';
import { parsePrompt, normalizePrompt, executePrompt, formatPrompt } from '@/api/engine';
import type { GPTPDocument } from '@/types/gptpTypes';

describe('API Engine Tests', () => {
  const mockPrompt: GPTPDocument = {
    $doctype: 'gptp',
    schemaVersion: '1.2.0',
    promptVersion: '1.0.0',
    title: 'Test Prompt',
    description: 'A test prompt',
    messages: [{ role: 'user', content: 'Hello' }],
    params: { model: 'gpt-4', temperature: 0.7 }
  };

  test('parsePrompt should parse correctly', async () => {
    const tmpPath = path.resolve('REPO/BUILD/api_engine_input.json');
    const promptDoc = {
      title: 'API Engine Input',
      description: 'A simple prompt for API engine test',
      messages: [{ role: 'user', content: 'Hello' }],
    };

    await fs.mkdir(path.dirname(tmpPath), { recursive: true });
    await fs.writeFile(tmpPath, JSON.stringify(promptDoc), 'utf8');

    try {
      const result = await parsePrompt(tmpPath);
      expect(result).toBeDefined();
      expect(result.title).toBe('API Engine Input');
    } finally {
      await fs.rm(tmpPath, { force: true }).catch(() => {});
    }
  });

  test('normalizePrompt should normalize correctly', () => {
    const result = normalizePrompt(mockPrompt);
    expect(result).toBeDefined();
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
});
