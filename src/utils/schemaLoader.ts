// src/engine/schema/loadSchema.ts

import fs from 'fs/promises'
import path from 'path'
import { getEnv, loadEnvFile } from '@/utils/env'
import { logger } from '@/utils/logger'

// 🔐 Load environment variables from `.env` before using them
loadEnvFile()

const CACHE_PATH = path.resolve('.gptp/cache/gptp.schema.json')

// Load schema from remote (preferred), fallback to cache only if remote fails
export async function schemaLoader(): Promise<object> {
    const remoteUrl = getEnv('GPTP_SCHEMA_URL')
    if (!remoteUrl) {
        logger.error('[schema] ❌ GPTP_SCHEMA_URL not set')
        throw new Error('GPTP_SCHEMA_URL not defined in environment')
    }

    logger.info(`[schema] 📡 Fetching schema from: ${remoteUrl}`)

    try {
        const response = await fetch(remoteUrl, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)

        const schema = await response.json()
        logger.info('[schema] ✅ Remote schema loaded successfully. Caching...')
        await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true })
        await fs.writeFile(CACHE_PATH, JSON.stringify(schema, null, 2), 'utf8')
        return schema
    } catch (err) {
        logger.warn(`[schema] ⚠️ Remote fetch failed: ${err instanceof Error ? err.message : String(err)}`)
        logger.info('[schema] 🔁 Attempting to load cached schema instead...')

        try {
            const cached = await fs.readFile(CACHE_PATH, 'utf8')
            logger.warn('[schema] ⚠️ Using cached schema — remote is unreachable')
            return JSON.parse(cached)
        } catch (cacheErr) {
            logger.error('[schema] ❌ No cached schema available. Cannot continue.')
            throw new Error('Failed to load schema: Remote unreachable and no local cache present.')
        }
    }
}
