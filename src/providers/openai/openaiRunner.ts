// src/engine/execute/runners/openai.ts

export async function callOpenAI(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
}): Promise<{
    choices: {
        message: {
            role: 'assistant'
            content: string
        }
    }[]
}> {
    if (process.env.MOCK === 'true') {
        return {
            choices: [
                {
                    message: {
                        role: 'assistant',
                        content: `[Mocked response] Received ${opts.messages.length} messages. Model: ${opts.model}`,
                    },
                },
            ],
        }
    }

    // 👇 This is your placeholder for the real API call
    throw new Error('Real OpenAI API call not implemented yet.')
}
