import fs from 'fs'
import path from 'path'
import { resolveEnvVars } from '../utils/env'

export interface Profile {
    provider: string
    model: string
    apiKey: string
    temperature?: number
    seed?: number
    baseUrl?: string
    [key: string]: any
}

export function loadProfile(profileName: string = 'default'): Profile {
    const profilesDir = path.resolve(process.cwd(), '.gptp/profiles')
    const profilePath = path.join(profilesDir, `${profileName}.json`)

    if (!fs.existsSync(profilePath)) {
        throw new Error(`Profile not found: ${profilePath}`)
    }

    const raw = fs.readFileSync(profilePath, 'utf-8')
    const parsed = JSON.parse(raw)

    // Resolve any `${env:...}` placeholders in all string fields (1 level deep)
    for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === 'string') {
            parsed[key] = resolveEnvVars(val)
        }
    }

    return parsed as Profile
}
