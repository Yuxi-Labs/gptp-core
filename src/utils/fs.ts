import { readFile } from 'fs/promises'

export async function readJsonFile(path: string): Promise<any> {
    const raw = await readFile(path, 'utf-8')
    return JSON.parse(raw)
}
