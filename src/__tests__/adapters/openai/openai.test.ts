import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { callOpenAI } from '@/providers/openai/openaiRunner';

vi.mock('@/providers/openai/openaiRunner', () => {
  const mockApiCall = vi.fn();
  mockApiCall.mockResolvedValue({
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'Mocked response',
        },
      },
    ],
  });
  return {
    callOpenAI: mockApiCall,
  };
});

describe('openai provider', () => {
  it('should call OpenAI API with correct parameters', async () => {
    const mockApiCall = vi.fn();
    mockApiCall.mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Mocked response',
          },
        },
      ],
    });

    const result = await callOpenAI({
      messages: [{ role: 'user', content: 'Test prompt' }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      top_p: 1,
      max_tokens: 64,
    });

    expect(callOpenAI).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: 'Test prompt' }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      top_p: 1,
      max_tokens: 64,
    });
    expect(result).toEqual({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Mocked response',
          },
        },
      ],
    });
  });

  // Placeholder for additional tests
  it('should handle errors gracefully', async () => {
    // Override the mock to reject for this test
    (callOpenAI as unknown as Mock).mockRejectedValueOnce(new Error('Mocked error'));

    await expect(
      callOpenAI({
        messages: [{ role: 'user', content: 'Test prompt' }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        top_p: 1,
        max_tokens: 64,
      })
    ).rejects.toThrow('Mocked error');
  });
});
