import type { GPTPDocument } from '@/types/gptpTypes'
import { logger } from '@/utils/logger'

export type SecretIssueType = 'missing-env' | 'inline-secret' | 'invalid-ref'

export interface SecretIssue {
    type: SecretIssueType
    where: string
    message: string
}

export interface ResolveSecretsOptions {
    /**
     * If true, attempt to also populate standard provider env vars
     * (e.g., OPENAI_API_KEY) from referenced env keys when possible.
     */
    injectStandardEnv?: boolean
    /** When true, throws on missing env values referenced via env:KEY. */
    strictMissing?: boolean
}

export interface ResolveSecretsResult {
    issues: SecretIssue[]
}

const STANDARD_ENV_BY_PROVIDER_TYPE: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    cohere: 'COHERE_API_KEY',
    microsoft: 'AZURE_OPENAI_API_KEY',
}

export function resolveSecrets(
    prompt: GPTPDocument,
    options: ResolveSecretsOptions = {}
): ResolveSecretsResult {
    const issues: SecretIssue[] = []
    const { injectStandardEnv = true, strictMissing = false } = options

    const connections = prompt.connections?.providers || {}
    for (const [providerName, providerCfg] of Object.entries(connections)) {
        if (!providerCfg) continue
        const whereBase = `connections.providers.${providerName}.api_key`
        const apiKey = providerCfg.api_key
        if (typeof apiKey !== 'string' || apiKey.length === 0) continue

    const envMatch = parseEnvRef(apiKey)
    if (envMatch && envMatch.envKey) {
            const { envKey } = envMatch
            const value = process.env[envKey]
            if (!value) {
                const msg = `Missing env var ${envKey} for ${whereBase}`
                issues.push({ type: 'missing-env', where: whereBase, message: msg })
                logger.warn('[secrets]', msg)
                if (strictMissing) throw new Error(msg)
            }

            if (injectStandardEnv) {
                const canonical = canonicalEnvKey(providerCfg.type || providerName)
                if (canonical && value && !process.env[canonical]) {
                    process.env[canonical] = value
                }
            }
        } else if (apiKey.startsWith('env:')) {
            const msg = `Invalid env reference at ${whereBase}. Expected env:NAME`
            issues.push({ type: 'invalid-ref', where: whereBase, message: msg })
            logger.warn('[secrets]', msg)
        } else {
            // Inline secret detected
            const msg = `Inline secrets in .gptp are discouraged (${whereBase}). Use env:YOUR_KEY and set it via environment.`
            issues.push({ type: 'inline-secret', where: whereBase, message: msg })
            logger.warn('[secrets]', msg)
        }
    }

    // Optional: treat top-level secrets as a list of required env keys
    const topSecrets = prompt.secrets
    if (Array.isArray(topSecrets)) {
        for (const entry of topSecrets) {
            if (typeof entry !== 'string') continue
            const envRef = parseEnvRef(entry)
            const key = envRef ? envRef.envKey : entry
            if (!process.env[key]) {
                const msg = `Missing env var ${key} (declared in secrets[])`
                issues.push({ type: 'missing-env', where: 'secrets', message: msg })
                logger.warn('[secrets]', msg)
                if (strictMissing) throw new Error(msg)
            }
        }
    }

    return { issues }
}

function parseEnvRef(value: string): { envKey: string } | null {
    if (!value.startsWith('env:')) return null
    const envKey = value.slice(4).trim()
    if (!envKey) return null
    return { envKey }
}

function canonicalEnvKey(typeOrName: string | undefined): string | undefined {
    if (!typeOrName) return undefined
    const key = typeOrName.toLowerCase()
    return STANDARD_ENV_BY_PROVIDER_TYPE[key]
}
