// src/engine/parse/index.ts

import fs from 'fs/promises'
import path from 'path'
import type { GPTPDocument } from '@/types/gptpTypes'

export async function parsePrompt(filePath: string): Promise<GPTPDocument> {
    const absPath = path.resolve(filePath)

    let content: string
    try {
        content = await fs.readFile(absPath, 'utf-8')
    } catch (err: any) {
        throw new Error(`Failed to read file at ${absPath}: ${err.message}`)
    }

    let parsed: unknown
    try {
        parsed = JSON.parse(content)
    } catch (err: any) {
        throw new Error(`Invalid JSON in ${absPath}: ${err.message}`)
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error(`Expected a top-level JSON object in ${absPath}`)
    }

    const requiredFields = ['title', 'description', 'messages']
    for (const field of requiredFields) {
        if (!(field in parsed)) {
            throw new Error(`Missing required field "${field}" in ${absPath}`)
        }
    }

    return parsed as GPTPDocument
}
