// src/engine/schema/loadSchema.ts

import * as fs from 'fs/promises'
import path from 'path'
import { getEnv } from '@/utils/env'
import { logger } from '@/utils/logger'

const DEFAULT_CACHE_PATH = path.resolve('.gptp/cache/gptp.schema.json')

export async function schemaLoader(customCachePath?: string): Promise<object> {
    const localPath = getEnv('GPTP_SCHEMA_LOCAL')
    const remoteUrl = getEnv('GPTP_SCHEMA_URL')
    const cachePath = customCachePath ?? DEFAULT_CACHE_PATH

    // Prefer an explicit local schema path for offline/dev workflows
    if (localPath) {
        try {
            const text = await fs.readFile(localPath, 'utf8')
            logger.info('[schema]', `📄 Loaded local schema from: ${localPath}`)
            return JSON.parse(text)
        } catch (err) {
            logger.warn('[schema]', `⚠️ Failed to read local schema at ${localPath}: ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    // If no remote URL is provided, try to use the cached schema
    if (!remoteUrl) {
        logger.info('[schema]', '🌐 GPTP_SCHEMA_URL not set; attempting to use cached schema...')
        try {
            const cached = await fs.readFile(cachePath, 'utf8')
            logger.info('[schema]', `📦 Loaded cached schema from: ${cachePath}`)
            return JSON.parse(cached)
        } catch (cacheErr) {
            logger.error('[schema]', '❌ No cached schema available and no remote URL configured.')
            throw new Error('Failed to load schema: set GPTP_SCHEMA_LOCAL or GPTP_SCHEMA_URL, or add a cached schema at .gptp/cache/gptp.schema.json.')
        }
    }

    logger.info('[schema]', `📡 Fetching schema from: ${remoteUrl}`)

    try {
        const response = await fetch(remoteUrl, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)

        const schema = await response.json()
        logger.info('[schema]', '✅ Remote schema loaded successfully. Caching...')
        await fs.mkdir(path.dirname(cachePath), { recursive: true })
        await fs.writeFile(cachePath, JSON.stringify(schema, null, 2), 'utf8')
        return schema
    } catch (err) {
        logger.warn('[schema]', `⚠️ Remote fetch failed: ${err instanceof Error ? err.message : String(err)}`)
        logger.info('[schema]', '🔁 Attempting to load cached schema instead...')

        try {
            const cached = await fs.readFile(cachePath, 'utf8')
            logger.warn('[schema]', '⚠️ Using cached schema — remote is unreachable')
            return JSON.parse(cached)
        } catch (cacheErr) {
            logger.error('[schema]', '❌ No cached schema available. Cannot continue.')
            throw new Error('Failed to load schema: Provide GPTP_SCHEMA_LOCAL or ensure remote is reachable and cache exists.')
        }
    }
}
