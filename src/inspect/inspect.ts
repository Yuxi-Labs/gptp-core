import fs from 'fs'

export interface InspectionResult {
    name: string
    version: string
    schema: string
    variables: string[]
    parameters: string[]
    provider: string | null
    messages: number
    tests: number
    hasOutputContract: boolean
}

export function inspectGPTP(filePath: string): InspectionResult {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)

    const name = data.name ?? '(unnamed)'
    const version = data.version ?? '(no version)'
    const schema = data.$schema ?? '(no schema)'

    const variables = Object.keys(data.variables ?? {})
    const parameters = Object.keys(data.parameters ?? {})
    const provider = extractProvider(data)
    const messages = Array.isArray(data.messages) ? data.messages.length : 0
    const tests = Array.isArray(data.tests) ? data.tests.length : 0
    const hasOutputContract = typeof data.output_contract === 'object'

    return {
        name,
        version,
        schema,
        variables,
        parameters,
        provider,
        messages,
        tests,
        hasOutputContract
    }
}

function extractProvider(data: any): string | null {
    const metadata = data.metadata ?? {}
    if (typeof metadata.provider === 'string') return metadata.provider
    if (typeof metadata.target === 'string') return metadata.target
    return null
}
