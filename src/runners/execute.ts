import { resolveEnvVars } from '../utils/env'

export interface ExecutionOptions {
    provider: 'openai'
    model: string
    messages: any[]
    apiKey: string
    temperature?: number
    seed?: number
    stream?: boolean
}

export async function executePrompt(options: ExecutionOptions): Promise<string> {
    if (options.provider === 'openai') {
        return executeOpenAI(options)
    }

    throw new Error(`Unsupported provider: ${options.provider}`)
}

async function executeOpenAI(opts: ExecutionOptions): Promise<string> {
    const apiUrl = 'https://api.openai.com/v1/chat/completions'

    const payload: Record<string, any> = {
        model: opts.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.7
    }

    if (opts.seed !== undefined) {
        payload.seed = opts.seed
    }

    if (opts.stream) {
        payload.stream = true
        throw new Error('Streaming not yet implemented')
    }

    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${resolveEnvVars(opts.apiKey)}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`OpenAI API error: ${res.status} ${res.statusText}\n${errorText}`)
    }

    const json = await res.json()

    if (!json.choices || !json.choices[0]?.message?.content) {
        throw new Error('Unexpected OpenAI response structure')
    }

    return json.choices[0].message.content
}
