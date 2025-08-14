import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

export async function loadSchema(schemaRef: string): Promise<any> {
    if (schemaRef.startsWith('http://') || schemaRef.startsWith('https://')) {
        const res = await fetch(schemaRef)
        if (!res.ok) {
            throw new Error(`Failed to fetch schema: ${schemaRef} → ${res.status} ${res.statusText}`)
        }
        return await res.json()
    }

    // optional: treat as a real file path if someone insists
    const resolved = path.resolve(schemaRef)
    if (!fs.existsSync(resolved)) {
        throw new Error(`Schema file not found: ${resolved}`)
    }

    const raw = fs.readFileSync(resolved, 'utf-8')
    return JSON.parse(raw)
}
