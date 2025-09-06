export async function callLocal(opts: {
    messages: { role: string; content: string }[];
    model: string;
    temperature: number;
    top_p: number;
    max_tokens: number;
}): Promise<any> {
    // Placeholder for real execution
    throw new Error('Local execution not implemented yet.');
}