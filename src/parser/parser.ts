export interface InjectOptions {
    variables: Record<string, any>
    parameters?: Record<string, any>
}

export function injectVariablesIntoMessages(messages: any[], options: InjectOptions): any[] {
    return messages.map(msg => {
        const rendered = { ...msg }

        if (typeof msg.content === 'string') {
            rendered.content = injectText(msg.content, options)
        }

        return rendered
    })
}

const VAR_REGEX = /\${{\s*([\w.-]+)\s*}}/g

function injectText(text: string, { variables, parameters }: InjectOptions): string {
    return text.replace(VAR_REGEX, (_, key: string) => {
        if (key in variables) return String(variables[key])
        if (parameters && key in parameters) return String(parameters[key])
        throw new Error(`Unresolved variable: ${{ key }}`)
    })
}
