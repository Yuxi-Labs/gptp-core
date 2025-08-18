// src/__tests__/utils/schemaLoader.test.ts

import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { schemaLoader } from '@/utils/schemaLoader'
import * as env from '@/utils/env'
import * as logger from '@/utils/logger'

const TEST_CACHE_PATH = path.resolve('REPO/BUILD/schema.test.cache.json')
const MOCK_SCHEMA = { title: 'Mock Schema' }

describe('schemaLoader()', () => {
    beforeEach(() => {
        // 🧼 Reset env + spies
        vi.restoreAllMocks()
        vi.spyOn(env, 'getEnv').mockImplementation((key) => {
            if (key === 'GPTP_SCHEMA_URL') return 'https://fake-schema.test/schema.json'
            return undefined
        })

        // 🧪 Mock logger
        vi.spyOn(logger, 'logger', 'get').mockReturnValue({
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        })
    })

    afterEach(async () => {
        await fs.rm(TEST_CACHE_PATH, { force: true }).catch(() => {})
    })

    it('loads schema from remote and caches it', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => MOCK_SCHEMA,
        }))

        const result = await schemaLoader(TEST_CACHE_PATH)
        expect(result).toEqual(MOCK_SCHEMA)

        const cached = JSON.parse(await fs.readFile(TEST_CACHE_PATH, 'utf8'))
        expect(cached).toEqual(MOCK_SCHEMA)
    })

    it('falls back to cache if remote fetch fails', async () => {
        await fs.mkdir(path.dirname(TEST_CACHE_PATH), { recursive: true })
        await fs.writeFile(TEST_CACHE_PATH, JSON.stringify({ cached: true }), 'utf8')

        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('remote down')))

        const result = await schemaLoader(TEST_CACHE_PATH)
        expect(result).toEqual({ cached: true })
    })

    it('throws if both remote and cache fail', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
        await fs.rm(TEST_CACHE_PATH, { force: true }).catch(() => {})

        await expect(schemaLoader(TEST_CACHE_PATH)).rejects.toThrow(/Failed to load schema/)
    })

    it('throws if GPTP_SCHEMA_URL is not set', async () => {
        vi.spyOn(env, 'getEnv').mockReturnValue(undefined)

        await expect(schemaLoader(TEST_CACHE_PATH)).rejects.toThrow(/not defined in environment/)
    })
})
