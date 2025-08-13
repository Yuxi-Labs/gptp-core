import fs from 'fs'
import path from 'path'

/**
 * Resolves a string like "${env:MY_VAR}" to process.env.MY_VAR.
 * If not found, optionally loads from a local .env file (not required).
 */
export function resolveEnvVars(input: string, envFilePath?: string): string {
    const envRegex = /\$\{env:([A-Z0-9_]+)\}/gi
    let resolved = input

    // Optional: Load .env file manually (if not already loaded via dotenv)
    const envFile = envFilePath ?? path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envFile)) {
        const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
        for (const line of lines) {
            const [key, val] = line.split('=')
            if (key && !(key in process.env)) {
                process.env[key.trim()] = val?.trim()
            }
        }
    }

    resolved = resolved.replace(envRegex, (_, varName) => {
        const value = process.env[varName]
        if (!value) {
            throw new Error(`Missing environment variable: ${varName}`)
        }
        return value
    })

    return resolved
}
