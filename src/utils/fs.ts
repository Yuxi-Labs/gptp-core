import fs from 'fs/promises'

export async function readJsonFile(path: string): Promise<any> {
    const raw = await fs.readFile(path, 'utf-8')
    return JSON.parse(raw)
}
