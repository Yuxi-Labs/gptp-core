import dotenv from 'dotenv'

/**
 * Loads variables from .env file into process.env.
 */
export function loadEnvFile() {
    dotenv.config()
}

/**
 * Manually inject env vars into process.env.
 */
export function loadEnvVars(vars: Record<string, string>) {
    for (const [key, value] of Object.entries(vars)) {
        process.env[key] = value
    }
}

/**
 * Access env var safely. Throws if required but missing.
 */
export function getEnv(
    key: string,
    options?: { required?: boolean; default?: string }
): string | undefined {
    const value = process.env[key] ?? options?.default

    if (options?.required && !value) {
        throw new Error(`Missing required environment variable: ${key}`)
    }

    return value
}
