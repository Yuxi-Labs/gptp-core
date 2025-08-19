// src/engine/schema/loadSchema.ts

import * as fs from 'fs/promises'
import path from 'path'
import { getEnv } from '@/utils/env'
import { logger } from '@/utils/logger'

const DEFAULT_CACHE_PATH = path.resolve('.gptp/cache/gptp.schema.json')

export async function schemaLoader(customCachePath?: string): Promise<object> {
    const remoteUrl = getEnv('GPTP_SCHEMA_URL')
    if (!remoteUrl) {
        logger.error('[schema]', '❌ GPTP_SCHEMA_URL not set')
        throw new Error('GPTP_SCHEMA_URL not defined in environment')
    }

    const cachePath = customCachePath ?? DEFAULT_CACHE_PATH

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
            throw new Error('Failed to load schema: Remote unreachable and no local cache present.')
        }
    }
}
