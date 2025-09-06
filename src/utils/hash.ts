import crypto from 'crypto'

export function sha256Hex(data: string | object): string {
    const text = typeof data === 'string' ? data : JSON.stringify(data)
    return crypto.createHash('sha256').update(text).digest('hex')
}
