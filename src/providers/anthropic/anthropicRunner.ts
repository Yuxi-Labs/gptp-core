export async function callAnthropic(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
}): Promise<{
    choices: { message: { role: 'assistant'; content: string } }[]
}> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY')

    // Anthropic expects system separately
    let system: string | undefined
    const messages = [] as Array<{ role: 'user' | 'assistant'; content: string }>
    for (const m of opts.messages) {
        if (m.role === 'system') system = (system ? system + '\n' : '') + m.content
        else if (m.role === 'user' || m.role === 'assistant') messages.push(m as any)
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        signal: opts.signal,
        body: JSON.stringify({
            model: opts.model || 'claude-3-5-sonnet-20240620',
            system,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            temperature: opts.temperature,
            top_p: opts.top_p,
            max_tokens: opts.max_tokens,
        }),
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Anthropic error: ${res.status} ${res.statusText} ${text}`)
    }
    const data = await res.json()
    const text = Array.isArray(data?.content)
        ? data.content.map((c: any) => (c?.type === 'text' ? c.text : '')).join('\n').trim()
        : ''
    return { choices: [{ message: { role: 'assistant', content: text } }] }
}