// src/__tests__/utils/schemaLoader.test.ts

import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { schemaLoader } from '@/utils/schemaLoader'
import * as env from '@/utils/env'
import * as logger from '@/utils/logger'
import fetch, { Response } from 'node-fetch'

vi.mock('node-fetch')

const CACHE_PATH = path.resolve('.gptp/cache/gptp.schema.json')
const MOCK_SCHEMA = { title: 'Mock Schema' }

describe('schemaLoader()', () => {
    beforeEach(() => {
        vi.mocked(fetch).mockClear()

        vi.spyOn(logger, 'logger', 'get').mockReturnValue({
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn()
        })

        vi.spyOn(env, 'getEnv').mockImplementation((key) => {
            if (key === 'GPTP_SCHEMA_URL') return 'https://fake-schema.test/schema.json'
            return undefined
        })
    })

    afterEach(async () => {
        await fs.rm('.gptp', { recursive: true, force: true }).catch(() => {})
    })

    it('loads schema from remote and caches it', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => MOCK_SCHEMA
        } as Response)

        const result = await schemaLoader()
        expect(result).toEqual(MOCK_SCHEMA)

        const cached = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'))
        expect(cached).toEqual(MOCK_SCHEMA)
    })

    it('falls back to cache if remote fetch fails', async () => {
        const cachedData = { cached: true }
        await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true })
        await fs.writeFile(CACHE_PATH, JSON.stringify(cachedData), 'utf8')

        vi.mocked(fetch).mockRejectedValue(new Error('Remote down'))

        const result = await schemaLoader()
        expect(result).toEqual(cachedData)
    })

    it('throws if both remote and cache fail', async () => {
        vi.mocked(fetch).mockRejectedValue(new Error('Offline'))

        await fs.rm(CACHE_PATH, { force: true }).catch(() => {})

        await expect(schemaLoader()).rejects.toThrow(/Failed to load schema/)
    })

    it('throws if GPTP_SCHEMA_URL is not set', async () => {
        vi.spyOn(env, 'getEnv').mockReturnValue(undefined)

        await expect(schemaLoader()).rejects.toThrow(/not defined in environment/)
    })
})
