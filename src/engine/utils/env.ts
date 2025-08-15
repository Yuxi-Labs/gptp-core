// src/engine/utils/env.ts

/**
 * Loads a set of environment variables into process.env.
 * Later calls will override existing values.
 */
export function loadEnvVars(vars: Record<string, string>) {
    for (const [key, value] of Object.entries(vars)) {
        process.env[key] = value;
    }
}

/**
 * Utility to safely access environment variables.
 * Throws if required and missing.
 */
export function getEnv(key: string, options?: { required?: boolean; default?: string }): string | undefined {
    const value = process.env[key] ?? options?.default;

    if (options?.required && !value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
}
