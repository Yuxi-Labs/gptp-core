// src/__tests__/utils/env.test.ts
import * as envUtils from '@/utils/env'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const DUMMY_KEY   = 'DUMMY_ENV_VAR'
const DUMMY_VALUE = 'dummy_value'

// ────────────────────────────────────────────────────────────
// 🛡️  Single, absolute sandbox location (no back-tracking)
//     <root>/REPO/BUILD/test.env
// ────────────────────────────────────────────────────────────
const SANDBOX_DIR   = path.join(process.cwd(), 'REPO', 'BUILD')
const TEST_ENV_PATH = path.join(SANDBOX_DIR, 'test.env')

describe('env.ts - environment utility', () => {
    const originalEnv = { ...process.env }

    beforeEach(() => {
        process.env = { ...originalEnv }
        fs.mkdirSync(SANDBOX_DIR, { recursive: true })      // ensure dir exists
    })

    afterEach(() => {
        process.env = { ...originalEnv }
        vi.restoreAllMocks()
        if (fs.existsSync(TEST_ENV_PATH)) fs.unlinkSync(TEST_ENV_PATH) // clean up
    })

    it('injects provided env vars into process.env', () => {
        envUtils.loadEnvVars({ [DUMMY_KEY]: DUMMY_VALUE })
        expect(process.env[DUMMY_KEY]).toBe(DUMMY_VALUE)
    })

    it('returns existing value from process.env', () => {
        process.env.OPTIONAL_VAR = 'hello'
        expect(envUtils.getEnv('OPTIONAL_VAR')).toBe('hello')
    })

    it('returns undefined if env var is missing and not required', () => {
        delete process.env.OPTIONAL_VAR
        expect(envUtils.getEnv('OPTIONAL_VAR')).toBeUndefined()
    })

    it('throws if env var is required but missing', () => {
        delete process.env.REQUIRED_VAR
        expect(() =>
            envUtils.getEnv('REQUIRED_VAR', { required: true })
        ).toThrow('Missing required environment variable: REQUIRED_VAR')
    })

    it('returns default value if env var is missing', () => {
        delete process.env.DEFAULTED_VAR
        expect(
            envUtils.getEnv('DEFAULTED_VAR', { default: 'fallback' })
        ).toBe('fallback')
    })

    it('prefers actual env var over default', () => {
        process.env.DEFAULTED_VAR = 'real_value'
        expect(
            envUtils.getEnv('DEFAULTED_VAR', { default: 'fallback' })
        ).toBe('real_value')
    })

    it('calls dotenv.config when loadEnvFile is used', () => {
        const spy = vi.spyOn(dotenv, 'config')
        envUtils.loadEnvFile()
        expect(spy).toHaveBeenCalled()
    })

    it('loads values from sandbox .env file into process.env', () => {
        fs.writeFileSync(TEST_ENV_PATH, 'TEST_KEY=loaded_value\n', 'utf8')
        dotenv.config({ path: TEST_ENV_PATH })
        expect(process.env.TEST_KEY).toBe('loaded_value')
    })
})
