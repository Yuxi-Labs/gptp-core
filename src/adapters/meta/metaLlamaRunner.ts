export async function callMetaLlama(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
}): Promise<{
    choices: { message: { role: 'assistant'; content: string } }[]
}> {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.META_LLAMA_API_KEY
    if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY (or META_LLAMA_API_KEY)')

    const model = opts.model || 'meta-llama/llama-3.1-70b-instruct'
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        signal: opts.signal,
        body: JSON.stringify({
            model,
            messages: opts.messages,
            temperature: opts.temperature,
            top_p: opts.top_p,
            max_tokens: opts.max_tokens,
        }),
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Meta Llama (OpenRouter) error: ${res.status} ${res.statusText} ${text}`)
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''
    return { choices: [{ message: { role: 'assistant', content } }] }
}