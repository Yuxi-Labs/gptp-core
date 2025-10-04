export async function callLocal(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
}): Promise<{ choices: { message: { role: 'assistant'; content: string } }[] }> {
    const backend = (process.env.GPTP_LOCAL_BACKEND || 'echo').toLowerCase()

    if (backend === 'lmstudio') {
        // LM Studio usually exposes OpenAI-compatible API on localhost:1234
        const base = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1/chat/completions'
        try {
            const res = await fetch(base, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: opts.signal,
                body: JSON.stringify({
                    model: opts.model || 'LMStudio',
                    messages: opts.messages,
                    temperature: opts.temperature,
                    top_p: opts.top_p,
                    max_tokens: opts.max_tokens,
                }),
            })
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new Error(`LM Studio error: ${res.status} ${res.statusText} ${text}`)
            }
            const data = await res.json()
            const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''
            return { choices: [{ message: { role: 'assistant', content } }] }
        } catch (e) {
            // Fall through to echo if LM Studio is unavailable
        }
    }

    if (backend === 'ollama') {
        // Ollama local API
        const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api/chat'
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: opts.signal,
                body: JSON.stringify({
                    model: opts.model || 'llama3.1',
                    messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
                    options: {
                        temperature: opts.temperature,
                        top_p: opts.top_p,
                        num_predict: opts.max_tokens,
                    },
                    stream: false,
                }),
            })
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new Error(`Ollama error: ${res.status} ${res.statusText} ${text}`)
            }
            const data = await res.json()
            // Ollama returns {message: {role, content}} or a list; normalize
            const content = data?.message?.content ?? data?.choices?.[0]?.message?.content ?? ''
            return { choices: [{ message: { role: 'assistant', content } }] }
        } catch (e) {
            // Fall through to echo if Ollama is unavailable
        }
    }

    // Echo fallback (predictable, offline)
    const lastUser = [...opts.messages].reverse().find((m) => m.role === 'user')
    const content = lastUser ? `LOCAL:${lastUser.content}` : 'LOCAL:OK'
    return { choices: [{ message: { role: 'assistant', content } }] }
}