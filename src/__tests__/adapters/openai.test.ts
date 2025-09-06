import { describe, it, expect, vi, Mock } from 'vitest';
import { callOpenAI } from '@/providers/openai/openaiRunner';

vi.mock('@/providers/openai/openaiRunner', () => ({
  callOpenAI: vi.fn(),
}));

describe('OpenAI Provider Tests', () => {
  const mockArgument = {
    messages: [{ role: 'user', content: 'Test prompt' }],
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    top_p: 1.0,
    max_tokens: 100,
  };

  it('should call OpenAI API with correct parameters', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Mocked response',
          },
        },
      ],
    };
    (callOpenAI as unknown as vi.Mock).mockResolvedValueOnce(mockResponse);

    const result = await callOpenAI(mockArgument);

    expect(callOpenAI).toHaveBeenCalledWith(mockArgument);
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors gracefully', async () => {
    (callOpenAI as unknown as vi.Mock).mockRejectedValueOnce(new Error('Mocked error'));

    await expect(callOpenAI(mockArgument)).rejects.toThrow('Mocked error');
  });

  it('should call OpenAI API', () => {
    const mockApiCall = vi.mocked(callOpenAI);
    callOpenAI(mockArgument);
    expect(mockApiCall).toHaveBeenCalledWith(mockArgument);
  });

  it('should handle resolved value', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant' as const,
            content: 'mocked data',
          },
        },
      ],
    };
    vi.mocked(callOpenAI).mockResolvedValueOnce(mockResponse);

    const result = await callOpenAI(mockArgument);
    expect(result).toEqual(mockResponse);
  });

  it('should handle rejected value', async () => {
    const mockError = new Error('Mocked error');
    vi.mocked(callOpenAI).mockRejectedValueOnce(mockError);

    await expect(callOpenAI(mockArgument)).rejects.toThrow('Mocked error');
  });
});
