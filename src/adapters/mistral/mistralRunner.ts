export async function callMistral(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
}): Promise<{
    choices: { message: { role: 'assistant'; content: string } }[]
}> {
    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) throw new Error('Missing MISTRAL_API_KEY')

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        signal: opts.signal,
        body: JSON.stringify({
            model: opts.model || 'mistral-large-latest',
            messages: opts.messages,
            temperature: opts.temperature,
            top_p: opts.top_p,
            max_tokens: opts.max_tokens,
        }),
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Mistral error: ${res.status} ${res.statusText} ${text}`)
    }
    const data = await res.json()
    // If already OpenAI-like, return. Else, normalize from 'output' fields.
    if (data?.choices?.[0]?.message?.content) return data
    const content = data?.output || data?.message || ''
    return { choices: [{ message: { role: 'assistant', content } }] }
}