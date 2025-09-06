export async function callMicrosoftAzureOpenAI(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
}): Promise<{
    choices: { message: { role: 'assistant'; content: string } }[]
}> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT // e.g. https://<resource>.openai.azure.com
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || opts.model

    if (!endpoint || !apiKey || !deployment) {
        throw new Error(
            'Missing Azure OpenAI configuration. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT (or provide model as deployment).'
        )
    }

    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(
        deployment
    )}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
        },
        signal: opts.signal,
        body: JSON.stringify({
            messages: opts.messages,
            temperature: opts.temperature,
            top_p: opts.top_p,
            max_tokens: opts.max_tokens,
        }),
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Azure OpenAI error: ${res.status} ${res.statusText} ${text}`)
    }
    const data = await res.json()
    // Azure typically mirrors OpenAI's choices; normalize defensively
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''
    return { choices: [{ message: { role: 'assistant', content } }] }
}