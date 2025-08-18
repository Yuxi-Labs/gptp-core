// src/__tests__/utils/profiles.test.ts

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { loadProfile } from '@/utils/profiles'

const PROFILE_DIR = path.resolve('.gptp', 'profiles')
const PROFILE_FILE = (name: string) => path.join(PROFILE_DIR, `${name}.json`)

beforeEach(async () => {
    await fs.mkdir(PROFILE_DIR, { recursive: true })
    process.env = {} // isolate each test’s env
})

afterEach(async () => {
    await fs.rm('.gptp', { recursive: true, force: true })
})

describe('loadProfile()', () => {
    it('loads and parses a valid profile', async () => {
        const data = {
            env: { TEST_KEY: 'loaded' },
            defaults: { model: 'gpt-4' },
        }
        await fs.writeFile(PROFILE_FILE('default'), JSON.stringify(data))

        const profile = await loadProfile('default')
        expect(profile.name).toBe('default')
        expect(profile.defaults?.model).toBe('gpt-4')
        expect(process.env.TEST_KEY).toBe('loaded')
    })

    it('throws if profile file is missing', async () => {
        await expect(loadProfile('ghost')).rejects.toThrow(/Unable to load profile "ghost"/)
    })

    it('throws if profile JSON is invalid', async () => {
        await fs.writeFile(PROFILE_FILE('broken'), '{not: valid', 'utf8')
        await expect(loadProfile('broken')).rejects.toThrow(/contains invalid JSON/)
    })

    it('preserves provided name even if JSON is empty', async () => {
        await fs.writeFile(PROFILE_FILE('empty'), '{}')
        const result = await loadProfile('empty')
        expect(result.name).toBe('empty')
    })

    it('skips env injection if no env block is present', async () => {
        await fs.writeFile(PROFILE_FILE('minimal'), JSON.stringify({ defaults: { temperature: 0.9 } }))
        const result = await loadProfile('minimal')
        expect(result.defaults?.temperature).toBe(0.9)
        expect(process.env).not.toHaveProperty('SOMETHING')
    })

    it('loads default profile if no name provided', async () => {
        await fs.writeFile(PROFILE_FILE('default'), JSON.stringify({ defaults: { temperature: 1 } }))
        const profile = await loadProfile()
        expect(profile.name).toBe('default')
        expect(profile.defaults?.temperature).toBe(1)
    })
})
