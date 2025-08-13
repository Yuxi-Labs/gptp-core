import fs from 'fs'
import path from 'path'
import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'

import { resolveEnvVars } from '../utils/env'
import { readJsonFile } from '../utils/fs'

const ajv = new Ajv({ allErrors: true, strict: true })
addFormats(ajv)

export interface ValidationResult {
    valid: boolean
    errors: ErrorObject[] | null
    extraDiagnostics: string[]
}

export async function validateGPTP(filePath: string): Promise<ValidationResult> {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)

    const schemaUrl = data.$schema
    if (!schemaUrl || typeof schemaUrl !== 'string') {
        return {
            valid: false,
            errors: [],
            extraDiagnostics: ['Missing or invalid $schema field']
        }
    }

    const schemaPath = localSchemaPath(schemaUrl)
    const schema = await readJsonFile(schemaPath)
    const validate = ajv.compile(schema)

    const valid = validate(data)
    const errors = validate.errors ?? []

    const extraDiagnostics = runOpinionatedChecks(data)

    return { valid: valid && extraDiagnostics.length === 0, errors, extraDiagnostics }
}

// Map $schema URL to local file path
function localSchemaPath(schemaUrl: string): string {
    if (schemaUrl.includes('gptp.schema.json')) {
        return path.resolve(__dirname, '../../../schema/gptp.schema.json')
    }
    throw new Error(`Unsupported $schema: ${schemaUrl}`)
}

// Add any custom logic checks here
function runOpinionatedChecks(doc: any): string[] {
    const problems: string[] = []

    if (Array.isArray(doc.messages)) {
        if (doc.messages.length === 0) {
            problems.push('messages[] is empty')
        }

        const roles = new Set()
        for (const msg of doc.messages) {
            if (msg.role && roles.has(msg.role)) {
                problems.push(`Duplicate role: ${msg.role}`)
            }
            if (msg.role) roles.add(msg.role)
            if (!msg.content || msg.content.trim() === '') {
                problems.push(`Empty message content for role: ${msg.role || 'unknown'}`)
            }
        }
    }

    return problems
}
