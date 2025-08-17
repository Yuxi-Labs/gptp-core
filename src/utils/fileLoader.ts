// src/engine/fs/index.ts

import fs from 'fs'
import path from 'path'

const GPTP_EXTENSION = '.gptp'

export function isGptpFile(filePath: string): boolean {
    return path.extname(filePath) === GPTP_EXTENSION
}

export function readGptpFile(filePath: string): unknown {
    if (!fs.existsSync(filePath)) {
        throw new Error(`GPTP file not found: ${filePath}`)
    }

    if (!isGptpFile(filePath)) {
        throw new Error(`Expected a .gptp file: ${filePath}`)
    }

    const raw = fs.readFileSync(filePath, 'utf8')
    try {
        return JSON.parse(raw)
    } catch (err) {
        throw new Error(`Invalid JSON in ${filePath}: ${(err as Error).message}`)
    }
}

export function writeGptpFile(filePath: string, data: unknown): void {
    if (!isGptpFile(filePath)) {
        throw new Error(`Expected a .gptp file: ${filePath}`)
    }

    const formatted = JSON.stringify(data, null, 2)
    fs.writeFileSync(filePath, formatted, 'utf8')
}
