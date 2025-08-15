// src/engine/execute/runners/openai.ts

export async function callOpenAI({
                                     messages,
                                     model,
                                     temperature,
                                     top_p,
                                     max_tokens
                                 }: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
}) {
    // TODO: real implementation
    return {
        mock: true,
        messages,
        model
    }
}
