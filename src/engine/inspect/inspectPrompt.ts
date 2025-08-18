export function getDeclaredVariables(prompt: any): string[] {
    if (!prompt.variables || typeof prompt.variables !== 'object') return [];
    return Object.keys(prompt.variables);
}

export function getRequiredVariables(prompt: any): string[] {
    if (!prompt.variables || typeof prompt.variables !== 'object') return [];
    return Object.entries(prompt.variables)
        .filter(([_, def]: [string, any]) => def.required !== false)
        .map(([key]) => key);
}

export function getMessageRoles(prompt: any): string[] {
    if (!Array.isArray(prompt.messages)) return [];
    const roles: string[] = prompt.messages.map((m: { role: string }) => m.role);
    return [...new Set<string>(roles)];
}

export function summarizePrompt(prompt: any): Record<string, any> {
    return {
        title: prompt.title ?? prompt.name ?? '(untitled)',
        version: prompt.promptVersion ?? prompt.version ?? '(no version)',
        schema: prompt.schemaVersion ?? '(no schema)',
        roles: getMessageRoles(prompt),
        variables: getDeclaredVariables(prompt),
        requiredVars: getRequiredVariables(prompt),
        tags: prompt.metadata?.tags ?? [],
    };
}

/**
 * Inspects the structure of a prompt and returns a human-readable summary.
 */
export function inspectPrompt(prompt: any): string {
    const summary = summarizePrompt(prompt);

    const lines = [
        `📄 Title: ${summary.title} (v${summary.version})`,
        `💬 Messages: ${prompt.messages?.length ?? 0}`,
        `🧑‍🤝‍🧑 Roles: ${summary.roles.join(', ')}`,
        `📦 Variables: ${summary.variables.join(', ') || 'none'}`,
        `🔐 Required: ${summary.requiredVars.join(', ') || 'none'}`,
        `🏷️ Tags: ${summary.tags.join(', ') || 'none'}`,
    ];

    if (prompt.params?.model) {
        lines.push(`🤖 Model: ${prompt.params.model}`);
    }

    if (prompt.output_format) {
        lines.push(`📤 Output Format: ${prompt.output_format}`);
    }

    return lines.filter(Boolean).join('\n');
}
