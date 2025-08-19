// src/engine/parse/index.ts

import * as fs from 'fs/promises'
import path from 'path'
import type { GPTPDocument } from '@/types/gptpTypes'

export async function parsePrompt(filePath: string): Promise<GPTPDocument> {
    const absPath = path.resolve(filePath)

    let content: string
    try {
        content = await fs.readFile(absPath, 'utf-8')
    } catch (err: any) {
        throw new Error(`Failed to read file at ${absPath}: ${err.message}. Please ensure the file exists and is accessible.`)
    }

    let parsed: unknown
    try {
        parsed = JSON.parse(content)
    } catch (err: any) {
        throw new Error(`Invalid JSON in ${absPath}: ${err.message}. Please ensure the file contains valid JSON syntax.`)
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`Expected a top-level JSON object in ${absPath}. Please ensure the file starts with '{' and ends with '}'.`)
    }

    const requiredFields = ['title', 'description', 'messages']
    for (const field of requiredFields) {
        if (!(field in parsed)) {
            throw new Error(`Missing required field "${field}" in ${absPath}. Please ensure all required fields are present.`)
        }
    }

    const { messages } = parsed as GPTPDocument
    if (!Array.isArray(messages) || !messages.every(msg => typeof msg === 'object' && 'role' in msg && 'content' in msg)) {
        throw new Error(`Invalid 'messages' field in ${absPath}. Each message must be an object with 'role' and 'content' properties.`)
    }

    return parsed as GPTPDocument
}
