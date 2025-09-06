export async function callLocal(opts: {
    messages: { role: string; content: string }[]
    model: string
    temperature: number
    top_p: number
    max_tokens: number
    signal?: AbortSignal
}): Promise<{ choices: { message: { role: 'assistant'; content: string } }[] }> {
    // Minimal local mock: echo last user content to keep pipeline functional without network
    const lastUser = [...opts.messages].reverse().find((m) => m.role === 'user')
    const content = lastUser ? `LOCAL:${lastUser.content}` : 'LOCAL:OK'
    return { choices: [{ message: { role: 'assistant', content } }] }
}