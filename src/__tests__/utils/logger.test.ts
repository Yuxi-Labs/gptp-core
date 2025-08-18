// src/__tests__/utils/logger.test.ts

import { describe, it, beforeEach, vi, expect } from 'vitest'
import { logger } from '@/utils/logger'

describe('logger.ts', () => {
    const ORIGINAL_ENV = process.env

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV } // isolate test env
        vi.restoreAllMocks()
    })

    it('should call console.log for info level', () => {
        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
        logger.info('TEST', 'info message', { x: 1 })
        expect(spy).toHaveBeenCalledOnce()
        expect(spy.mock.calls[0][0]).toMatch(/\[GPTP]\[INFO]\[TEST]/)
    })

    it('should call console.warn for warn level', () => {
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        logger.warn('TEST', 'warning here')
        expect(spy).toHaveBeenCalledOnce()
        expect(spy.mock.calls[0][0]).toMatch(/\[GPTP]\[WARN]\[TEST]/)
    })

    it('should call console.error for error level', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        logger.error('TEST', 'uh oh')
        expect(spy).toHaveBeenCalledOnce()
        expect(spy.mock.calls[0][0]).toMatch(/\[GPTP]\[ERROR]\[TEST]/)
    })

    it('should call console.debug for debug level when GPTP_DEBUG=true', () => {
        process.env.GPTP_DEBUG = 'true'
        const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
        logger.debug('TEST', 'debug on')
        expect(spy).toHaveBeenCalledOnce()
        expect(spy.mock.calls[0][0]).toMatch(/\[GPTP]\[DEBUG]\[TEST]/)
    })

    it('should suppress debug logs if GPTP_DEBUG is not set', () => {
        delete process.env.GPTP_DEBUG
        const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
        logger.debug('TEST', 'you should not see this')
        expect(spy).not.toHaveBeenCalled()
    })

    it('should suppress debug logs if GPTP_DEBUG is false', () => {
        process.env.GPTP_DEBUG = 'false'
        const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
        logger.debug('TEST', 'still hidden')
        expect(spy).not.toHaveBeenCalled()
    })
})
