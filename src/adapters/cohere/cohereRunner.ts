export async function callCohere(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
}): Promise<{
    choices: { message: { role: 'assistant'; content: string } }[]
}> {
    const apiKey = process.env.COHERE_API_KEY
    if (!apiKey) throw new Error('Missing COHERE_API_KEY')

    const res = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        signal: opts.signal,
        body: JSON.stringify({
            model: opts.model || 'command-r-plus',
            messages: opts.messages,
            temperature: opts.temperature,
            p: opts.top_p,
            max_tokens: opts.max_tokens,
        }),
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Cohere error: ${res.status} ${res.statusText} ${text}`)
    }
    const data = await res.json()
    const content = data?.text ?? data?.message?.content ?? data?.generations?.[0]?.text ?? ''
    return { choices: [{ message: { role: 'assistant', content } }] }
}